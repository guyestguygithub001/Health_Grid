
          function selectTriagePatient(id, name, age, gender) {
            document.getElementById('triageEmptyState').style.display = 'none';
            document.getElementById('triageFormContainer').style.display = 'flex';
            document.getElementById('triagePatientName').innerText = name;
            document.getElementById('triagePatientDetails').innerText = `${id} • ${age} • ${gender}`;
            document.getElementById('vitalsForm').reset();
            
            // Reset priority UI
            document.querySelector('input[value="routine"]').checked = true;
          }
          
          function cancelTriage() {
            document.getElementById('triageFormContainer').style.display = 'none';
            document.getElementById('triageEmptyState').style.display = 'flex';
          }
          
          function submitVitals(e) {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const ogText = btn.innerText;
            btn.innerText = 'Saving...';
            btn.style.opacity = '0.7';
            setTimeout(() => {
              btn.innerText = 'Dispatched!';
              btn.style.background = '#3b82f6';
              setTimeout(() => {
                btn.innerText = ogText;
                btn.style.background = '#10b981';
                btn.style.opacity = '1';
                cancelTriage();
                alert('Vitals saved successfully. Patient moved to physician queue.');
              }, 1500);
            }, 800);
          }
        