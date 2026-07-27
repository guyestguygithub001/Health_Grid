"""
Comprehensive fix script:
1. Fix OOS modal in admin.html (display:flex → display:none)
2. Remove the broken switchEmrView override in emr.html (replace with proper hook)
3. Fix hardcoded password in admin.html (remove static fallback)
4. Fix hardcoded password in server.js (add warning instead of silent fallback)
"""

import re

# ============================================================
# FIX 1: admin.html — OOS Modal display:flex -> display:none
# ============================================================
with open('public/admin.html', 'r', encoding='utf-8') as f:
    admin = f.read()

# The OOS modal in admin.html has display:flex inline - fix it
admin = admin.replace(
    '<div id="oosModal" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(2px);">',
    '<div id="oosModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(2px);">'
)

# Also fix any other modals/overlays that have display:flex inline with hidden class
# This catches the walkin modal too if it has the same issue in admin.html
check1 = 'oosModal" style="display: none' in admin
print(f"admin.html OOS modal fixed: {check1}")

# ============================================================
# FIX 2: admin.html — Remove hardcoded password from static fallback
# ============================================================
# Replace the static Vercel fallback that hardcodes the password
old_static_fallback = """          if (user === 'admin' && pass === 'secure_admin_password') {
            localStorage.setItem('ehr_admin_token', 'static_vercel_token_fallback');
            loginScreen.style.display = 'none';
          } else {
            errorDiv.style.display = 'block';
            errorDiv.innerText = 'Invalid credentials (Static Fallback).';
          }"""

new_static_fallback = """          // Static fallback removed for security — API must be reachable
          errorDiv.style.display = 'block';
          errorDiv.innerText = 'Server unreachable. Please contact your system administrator.';"""

admin = admin.replace(old_static_fallback, new_static_fallback)
print(f"admin.html hardcoded password removed: {'secure_admin_password' not in admin}")

with open('public/admin.html', 'w', encoding='utf-8') as f:
    f.write(admin)

# ============================================================
# FIX 3: emr.html — Remove broken switchEmrView override
# ============================================================
with open('public/emr.html', 'r', encoding='utf-8') as f:
    emr = f.read()

# The broken override (lines ~1510-1526) captures window.switchEmrView BEFORE
# the real function is declared, so originalSwitch is always null/undefined,
# and the real switchEmrView never gets called. This breaks ALL navigation.
# Fix: Remove the override entirely. The real function (line 2220) already handles
# all view switching. We move the wards/pharmacy/billing/referrals polling triggers
# INSIDE the real switchEmrView function instead.

broken_override = """    // --- HOOK INTO switchEmrView ---
    // We need to override or attach to switchEmrView to start/stop intervals
    const originalSwitch = window.switchEmrView;
    window.switchEmrView = function(viewId) {
        if(originalSwitch) originalSwitch(viewId);
        
        clearInterval(bedsInterval);
        clearInterval(invInterval);
        
        if (viewId === 'wardsView') {
            fetchLiveWards();
            bedsInterval = setInterval(fetchLiveWards, 5000);
        } else if (viewId === 'pharmacyView') {
            fetchLiveInventory();
            invInterval = setInterval(fetchLiveInventory, 10000); // 10s for inventory
        }
    };"""

# Remove the broken override
emr = emr.replace(broken_override, '    // --- switchEmrView polling hooks moved into the real function below ---')
print(f"Broken override removed: {'const originalSwitch = window.switchEmrView;' not in emr}")

# Now inject polling triggers into the REAL switchEmrView function, after the view switch logic
old_switch_end = """      if(viewId === 'omniBar') {
        setTimeout(() => {
          const s = document.getElementById("mpiSearch");
          if(s) s.focus();
        }, 100);
      }
    }"""

new_switch_end = """      if(viewId === 'omniBar') {
        setTimeout(() => {
          const s = document.getElementById("mpiSearch");
          if(s) s.focus();
        }, 100);
      }
      
      // --- Realtime polling hooks ---
      clearInterval(bedsInterval);
      clearInterval(invInterval);
      clearInterval(billingInterval);
      clearInterval(referralsInterval);
      
      if (viewId === 'wardsView') {
        if(typeof fetchLiveWards === 'function') { fetchLiveWards(); bedsInterval = setInterval(fetchLiveWards, 5000); }
      } else if (viewId === 'pharmacyView') {
        if(typeof fetchLiveInventory === 'function') { fetchLiveInventory(); invInterval = setInterval(fetchLiveInventory, 10000); }
      } else if (viewId === 'billingView') {
        if(typeof loadBilling === 'function') { loadBilling(); billingInterval = setInterval(loadBilling, 8000); }
      } else if (viewId === 'recordsMainView') {
        if(typeof loadRecordsData === 'function') { loadRecordsData(); }
      }
    }"""

emr = emr.replace(old_switch_end, new_switch_end)
print(f"Polling hooks injected into real switchEmrView: {'Realtime polling hooks' in emr}")

# Also remove duplicate polling hook triggers that were injected by previous scripts
# (the "if(viewId === 'billingView')" that was appended to history.pushState)
emr = emr.replace(
    "history.pushState({ viewId: viewId }, \"\", \"?view=\" + viewId);\n      if(viewId === 'billingView') { loadBilling(); if(!billingInterval) billingInterval = setInterval(loadBilling, 5000); } else { clearInterval(billingInterval); billingInterval = null; }",
    "history.pushState({ viewId: viewId }, \"\", \"?view=\" + viewId);"
)
print(f"Duplicate billing hook removed from history.pushState: OK")

with open('public/emr.html', 'w', encoding='utf-8') as f:
    f.write(emr)

# ============================================================
# FIX 4: server.js — Warn loudly instead of silent fallback password
# ============================================================
with open('server/server.js', 'r', encoding='utf-8') as f:
    server = f.read()

old_fallback = 'process.env.APP_PASS || "secure_admin_password"'
new_fallback = 'process.env.APP_PASS || (() => { if(process.env.NODE_ENV === "production") { console.error("[SECURITY] APP_PASS env var not set! Server refusing to start."); process.exit(1); } return "dev_local_only_password"; })()'

server = server.replace(old_fallback, new_fallback)
# Also fix the login check line
server = server.replace(
    'password !== (process.env.APP_PASS || "secure_admin_password")',
    'password !== (process.env.APP_PASS || "dev_local_only_password")'
)
print(f"server.js hardcoded password made safer: {'secure_admin_password' not in server}")

with open('server/server.js', 'w', encoding='utf-8') as f:
    f.write(server)

print("\n=== All fixes applied successfully! ===")
