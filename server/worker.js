const { Worker, Queue } = require('bullmq');
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL;
let connection;

if (redisUrl) {
    connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
} else {
    // BullMQ requires a real Redis connection, so if we don't have one (local mock), we exit gracefully
    console.warn("[Worker] No REDIS_URL provided. BullMQ requires real Redis. Dunning worker sleeping in mock mode.");
    process.exit(0);
}

console.log("[Worker] Dunning Engine & Queue Processor Started.");

const dunningQueue = new Queue('dunning-retries', { connection });

// Process failed payments
const worker = new Worker('dunning-retries', async job => {
    const { patientId, amount, retryAttempt, originalInvoiceId } = job.data;
    
    console.log(`[Dunning Engine] Processing retry attempt ${retryAttempt} for invoice ${originalInvoiceId} ($${amount})...`);
    
    // Simulate payment gateway call (Stripe mock)
    const success = Math.random() > 0.5; // 50% chance of success on retry

    if (success) {
        console.log(`[Dunning Engine] ✅ SUCCESS: Invoice ${originalInvoiceId} recovered!`);
        // In a real app, we'd update the DB here and send a success email.
    } else {
        console.log(`[Dunning Engine] ❌ FAILED: Retry ${retryAttempt} failed for invoice ${originalInvoiceId}.`);
        
        if (retryAttempt < 3) {
            // Schedule the next retry
            const nextDelay = retryAttempt === 1 ? 3 * 24 * 60 * 60 * 1000 : // 3 days
                              5 * 24 * 60 * 60 * 1000; // 5 days

            await dunningQueue.add('retry-payment', {
                patientId, amount, retryAttempt: retryAttempt + 1, originalInvoiceId
            }, { delay: nextDelay });
            
            console.log(`[Dunning Engine] Scheduled retry ${retryAttempt + 1} for ${originalInvoiceId}`);
        } else {
            console.log(`[Dunning Engine] 🛑 FINAL FAILURE: Invoice ${originalInvoiceId} marked as UNRECOVERABLE. Dispute/Refund workflow engaged.`);
            // Trigger final warning email to patient, log dispute.
        }
    }
}, { connection });

worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job.id} failed with error ${err.message}`);
});
