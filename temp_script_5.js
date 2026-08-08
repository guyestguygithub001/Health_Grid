
  // Auth and RBAC Logic
  let globalPermissions = {};
  
  async function loadPermissions() {
    try {
      const res = await fetch('/api/v2/permissions');
      globalPermissions = await res.json();
    } catch(e) { console.error("Failed to load permissions", e); }
  }
  loadPermissions();

  function applyRbac(role) {
    let allowedViews = globalPermissions[role] || [];
    if (allowedViews.includes("all") || role === 'admin' || role === 'super_admin') {
      allowedViews = ['omniBar', 'triageView', 'clinicsDashboardView', 'wardsView', 'pharmacyView', 'labView', 'radView', 'billingView', 'recordsMainView', 'postEncounterView', 'workspace'];
    }
    
    // Hide all sidebar buttons first
    document.querySelectorAll('#emrSidebar .nav-btn').forEach(btn => {
      // Find what view this button switches to by looking at its onclick or data-target-view
      const onclickAttr = btn.getAttribute('onclick') || '';
      let targetViewMatch = onclickAttr.match(/switchEmrView\('([^']+)'\)/);
      if (targetViewMatch) {
        const viewId = targetViewMatch[1];
        if (!allowedViews.includes(viewId)) {
          btn.style.display = 'none';
        } else {
          btn.style.display = 'flex';
        }
      } else {
         // Things like "Exit to Admin" or others - keep them visible
         // Ensure they are visible if they were accidentally hidden
      }
    });

    // Auto-navigate to the first allowed view (usually omniBar)
    if (allowedViews.length > 0) {
      switchEmrView(allowedViews[0]);
    }
  }

  function checkSession() {
    const token = sessionStorage.getItem('staff_token');
    const role = sessionStorage.getItem('staff_role');
    const name = sessionStorage.getItem('staff_name');
    
    if (token && role) {
      document.getElementById('emrAuthGateway').style.display = 'none';
      document.getElementById('emrMainApp').style.display = 'flex';
      
      const roleNames = {
        'admin': 'System Admin (Full Access)',
        'physician': 'Physician (Clerking / Rx)',
        'nurse': 'Nurse (Triage / Wards)',
        'pharmacist': 'Pharmacist'
      };
      
      const roleText = (name ? name + " - " : "") + (roleNames[role] || role);
      document.getElementById('activeRoleDisplay').innerText = roleText;
      
      applyRbac(role);
    } else {
      document.getElementById('emrAuthGateway').style.display = 'flex';
      document.getElementById('emrMainApp').style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    
    const loginForm = document.getElementById('staffLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('loginUser').value;
        const p = document.getElementById('loginPass').value;
        const errDiv = document.getElementById('loginError');
        errDiv.style.display = 'none';
        
        try {
          const res = await fetch('/api/v2/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: u, password: p})
          });
          const data = await res.json();
          if (res.ok) {
            sessionStorage.setItem('staff_token', data.token);
            sessionStorage.setItem('staff_role', data.user.role);
            sessionStorage.setItem('staff_name', data.user.name);
            checkSession();
          } else {
            errDiv.style.display = 'block';
            errDiv.innerText = data.error || 'Login failed.';
          }
        } catch (err) {
          console.warn("API unreachable. Falling back to static Vercel preview.");
          if (u === 'admin' && (p === 'admin123' || p === 'secure_admin_password')) {
            sessionStorage.setItem('staff_token', 'vercel-mock-token-123');
            sessionStorage.setItem('staff_role', 'admin');
            sessionStorage.setItem('staff_name', 'System Admin');
            checkSession();
          } else {
            errDiv.style.display = 'block';
            errDiv.innerText = 'Network error. Try admin / admin123 for static preview.';
          }
        }
      });
    }
  });

  function staffLogout() {
    sessionStorage.removeItem('staff_token');
    sessionStorage.removeItem('staff_role');
    sessionStorage.removeItem('staff_name');
    checkSession();
  }
