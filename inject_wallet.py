import re

with open('public/portal.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add Privacy Policy Overlay
overlay = """
  <!-- Privacy Policy Overlay -->
  <div id="privacyOverlay" style="position:fixed; inset:0; background:rgba(15, 23, 42, 0.95); backdrop-filter:blur(10px); z-index:99999; display:flex; align-items:center; justify-content:center; flex-direction:column; color:white; text-align:center; transition: opacity 0.5s ease-out;">
    <div style="font-size:48px; margin-bottom:20px;">🛡️</div>
    <h2 style="font-size:32px; font-weight:800; margin-bottom:12px;">Health Grid Privacy Policy</h2>
    <p style="font-size:18px; max-width:600px; color:#cbd5e1; line-height:1.6;">
      By continuing, you agree to our strict data privacy policies.<br>
      <span style="color:#f87171; font-weight:700;">Note: All fiat wallet deposits are final. No Refunds.</span>
    </p>
  </div>

  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const overlay = document.getElementById("privacyOverlay");
      if (overlay) {
        setTimeout(() => {
          overlay.style.opacity = "0";
          setTimeout(() => overlay.style.display = "none", 500);
        }, 2000);
      }
      
      // Load wallet balance
      setTimeout(loadWalletBalance, 500);
    });

    let currentPatientId = sessionStorage.getItem('patient_id') || 'PT-1721568285523';
    
    async function loadWalletBalance() {
      // In a real app we'd fetch the patient object to get balance.
      // Mocking fetch of patient object:
      try {
        const res = await fetch('/api/v2/mpi/search?q=' + currentPatientId);
        const data = await res.json();
        if(data.success && data.patients && data.patients.length > 0) {
          const balance = data.patients[0].walletBalance || 0.00;
          document.getElementById('walletBalanceDisplay').innerText = '₦' + parseFloat(balance).toFixed(2);
        }
      } catch(e) {}
    }

    async function fundWallet() {
      const amount = prompt("Enter amount to fund (Fiat Currency - NGN):", "5000");
      if (!amount || isNaN(amount)) return;
      
      try {
        const res = await fetch('/api/v2/patient/wallet/fund', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ patientId: currentPatientId, amount: amount })
        });
        const data = await res.json();
        if(data.success) {
          document.getElementById('walletBalanceDisplay').innerText = '₦' + parseFloat(data.newBalance).toFixed(2);
          alert("Wallet funded successfully! (No Refunds Policy applies)");
        }
      } catch(e) {
        alert("Failed to fund wallet.");
      }
    }
  </script>
"""
html = html.replace('<body>', '<body>\n' + overlay)

# 2. Add Wallet UI to Dashboard
wallet_ui = """
          <!-- Wallet Widget -->
          <div class="glass-card" style="grid-column: span 1; background: linear-gradient(135deg, #1e293b, #0f172a); color: white; border: 1px solid rgba(255,255,255,0.1);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <h3 style="margin-top:0; font-size:16px; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px;">Fiat Wallet</h3>
                <div id="walletBalanceDisplay" style="font-size:36px; font-weight:800; margin-bottom:4px; letter-spacing:-1px;">₦0.00</div>
                <p style="margin:0; font-size:13px; color:#cbd5e1; display:flex; align-items:center; gap:6px;">
                  <span style="display:inline-block; width:8px; height:8px; background:#10b981; border-radius:50%;"></span> Active
                </p>
              </div>
              <div style="width:48px; height:48px; background:rgba(255,255,255,0.1); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px;">💳</div>
            </div>
            <div style="margin-top:24px;">
              <button onclick="fundWallet()" style="width:100%; padding:12px; background:white; color:#0f172a; border:none; border-radius:8px; font-weight:700; cursor:pointer; transition: transform 0.2s;">
                ➕ Fund Wallet
              </button>
            </div>
          </div>
"""

# Find a good place to insert the wallet. There is a grid in the dashboard.
# Look for: <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
html = html.replace('<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">', 
                    '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">\n' + wallet_ui)

with open('public/portal.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Injected Wallet and Privacy Overlay into portal.html")
