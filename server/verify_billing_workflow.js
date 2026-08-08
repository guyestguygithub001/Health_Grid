const { spawn } = require('child_process');

const testBillingFlow = async () => {
  console.log('--- Starting Server ---');
  const server = spawn('node', ['server/server.js'], { env: { ...process.env, JWT_SECRET: 'testsecret' } });
  
  server.stdout.on('data', d => console.log('SERVER:', d.toString().trim()));
  server.stderr.on('data', d => console.error('SERVER ERR:', d.toString().trim()));

  // Wait for server to start
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('\n--- Starting Billing API Test ---');
  let billId;

  try {
    // 1. Create Invoice
    console.log('1. Testing POST /api/v2/billing (Create Invoice)');
    console.log('Creating new bill...');
    const createRes = await fetch('http://127.0.0.1:8082/api/v2/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: "TEST-PATIENT-1",
        service: "Consultation (GOPD)",
        amount: 2500,
        payer: "NHIA",
        description: "General Outpatient Consultation"
      })
    });
    
    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error('CREATE ERROR TEXT:', errText);
      throw new Error('Create failed');
    }
    const createdBill = await createRes.json();
    console.log('Created Bill:', createdBill);
    
    const createData = createdBill;
    if (createData.id) {
      billId = createData.id;
      console.log('Success: Invoice Created ->', billId);
    } else {
      console.error('Failed to create invoice:', createData);
      throw new Error('Missing ID');
    }

    // 2. Fetch Billing Metrics
    console.log('\n2. Testing GET /api/v2/billing/metrics');
    const metricsRes = await fetch('http://127.0.0.1:8082/api/v2/billing/metrics');
    console.log('Metrics Response Status:', metricsRes.status);
    const metricsData = await metricsRes.json();
    console.log('Metrics:', metricsData);

    // 3. Mark as Paid
    console.log('\n3. Testing POST /api/v2/billing/status (Receive Payment)');
    const payRes = await fetch('http://127.0.0.1:8082/api/v2/billing/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: billId,
        status: 'Paid'
      })
    });
    console.log('Pay Response Status:', payRes.status);
    if (payRes.ok) {
      console.log('Success: Invoice Paid');
    } else {
      console.error('Failed to pay invoice:', await payRes.text());
    }

    // 4. Mark as Claimed
    console.log('\n4. Testing POST /api/v2/billing/status (Submit Claim)');
    const claimRes = await fetch('http://127.0.0.1:8082/api/v2/billing/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: billId,
        status: 'Claimed',
        insurer: 'NHIA'
      })
    });
    console.log('Claim Response Status:', claimRes.status);
    if (claimRes.ok) {
      console.log('Success: Invoice Claimed');
    } else {
      console.error('Failed to claim invoice:', await claimRes.text());
    }
  } catch(e) {
      console.error('TEST FAILED:', e);
  } finally {
      server.kill();
      process.exit(0);
  }
};

testBillingFlow();
