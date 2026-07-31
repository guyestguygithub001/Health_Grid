import re

filepath = r'C:\Users\HP\Documents\Web E - Profile for the Boys\plateau-ehr\public\command.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

js_pattern = r'(    // ── EHR: Billing \(GET /api/billing\))'

js_injection = r"""
    // ── EHR: Billing Logic

    function openGenerateInvoiceModal() {
      document.getElementById('invoiceGeneratorModal').style.display = 'flex';
    }

    function closeInvoiceModal() {
      document.getElementById('invoiceGeneratorModal').style.display = 'none';
      document.getElementById('invPatient').value = '';
      document.getElementById('invAmount').value = '';
    }

    async function submitNewInvoice() {
      const patientId = document.getElementById('invPatient').value;
      const service = document.getElementById('invService').value;
      const amount = parseFloat(document.getElementById('invAmount').value);

      try {
        const res = await fetch(`/api/billing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId, service, amount, status: 'Unpaid' })
        });
        if (res.ok) {
          closeInvoiceModal();
          fetchLiveBilling(); // Refresh the table
        } else {
          document.getElementById('billingErrorAlert').style.display = 'flex';
          document.getElementById('billingErrorAlert').querySelector('span').innerText = '⚠️ Failed to save invoice.';
        }
      } catch (err) {
        document.getElementById('billingErrorAlert').style.display = 'flex';
        document.getElementById('billingErrorAlert').querySelector('span').innerText = '⚠️ Network error creating invoice.';
      }
    }

    function openRealInvoice(id, patient, service, amount) {
      // Basic fallback if not passed directly (simulate passing from the row)
      if (!patient) patient = "Unknown Patient";
      if (!service) service = "Medical Service";
      if (!amount) amount = "0";

      document.getElementById('riId').innerText = `#${id}`;
      document.getElementById('riPatient').innerText = patient;
      document.getElementById('riService').innerText = service;
      document.getElementById('riAmount').innerText = `₦${parseFloat(amount).toLocaleString()}`;
      document.getElementById('riDate').innerText = `Date: ${new Date().toISOString().split('T')[0]}`;
      
      document.getElementById('payBtn').style.display = 'inline-block';
      document.getElementById('payStatus').style.display = 'none';

      switchEhrView('realInvoiceView');
    }

    function simulatePayment() {
      const payBtn = document.getElementById('payBtn');
      payBtn.innerText = 'Processing...';
      payBtn.disabled = true;
      
      setTimeout(() => {
        payBtn.style.display = 'none';
        payBtn.disabled = false;
        payBtn.innerText = 'Initialize Live Payment 💳';
        
        document.getElementById('payStatus').style.display = 'block';
        
        // In a real app we'd PUT/PATCH the bill status here. For now we just mock the success view.
      }, 1500);
    }

\1"""

if re.search(js_pattern, content):
    content = re.sub(js_pattern, js_injection, content)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("JS logic injected successfully.")
else:
    print("Could not find JS logic injection point.")
