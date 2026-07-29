import re

def update_html():
    with open('public/command.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Regex to find finalizeEncounter definition
    pattern = r"finalizeEncounter\s*=\s*async\s*function\s*\(\s*e\s*\)\s*\{.*?(?:fetchLivePharma\(\);)?\s*\}"
    
    new_func = """finalizeEncounter = async function(e) {
      e.preventDefault();
      const encId = document.getElementById('consultEncId').innerText;
      const patientId = document.getElementById('consultPatId').innerText.replace('Patient ID: ', '');
      const notes = document.getElementById('consultNotes').value;
      const icd = document.getElementById('consultIcd').value;
      const meds = document.getElementById('consultMeds').value;
      
      const labOrders = [];
      if (document.getElementById('orderLab').checked) labOrders.push("Routine Labs");
      if (document.getElementById('orderScan').checked) labOrders.push("Radiology Scan");
      
      const prescriptions = [];
      if (document.getElementById('orderPharmacy').checked || meds.trim() !== '') {
          prescriptions.push(meds.trim() || "General Prescription");
      }

      // Close the encounter and dispatch all module integration data centrally
      try {
        const payload = {
            patientId: patientId,
            facilityId: window.currentFacilityId || "FAC-PLSH",
            unit: "OPD",
            chiefComplaint: "General Consultation", // Typically passed from triage
            vitals: {}, // From triage
            assessment: notes,
            icd11Code: icd,
            status: "Closed",
            labOrders: labOrders,
            prescriptions: prescriptions
        };
        const token = localStorage.getItem('ehr_admin_token') || sessionStorage.getItem('ehr_admin_token');
        const res = await fetch('/api/v2/encounters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        
        if(res.ok) {
            let msg = `Encounter ${encId} finalized securely!\nICD-11 diagnosis and notes logged.`;
            if (labOrders.length > 0 || prescriptions.length > 0) {
              msg += `\n\nOrders Generated:`;
              labOrders.forEach(o => msg += `\n- Lab Request Sent: ${o}`);
              prescriptions.forEach(o => msg += `\n- E-Prescription Sent: ${o}`);
            }
            alert(msg);
        } else {
            alert('Failed to finalize encounter on server.');
        }
      } catch (err) {
        console.error("Encounter finalization failed:", err);
      }
      
      e.target.reset();
      document.getElementById('consultationPanel').style.display = 'none';
      document.getElementById('consultationEmpty').style.display = 'flex';
      fetchLiveEncounters();
      if(typeof fetchLiveLabs === 'function') fetchLiveLabs();
      if(typeof fetchLiveWards === 'function') fetchLiveWards();
    }"""
    
    html = re.sub(pattern, new_func, html, flags=re.DOTALL)
    
    with open('public/command.html', 'w', encoding='utf-8') as f:
        f.write(html)

update_html()
