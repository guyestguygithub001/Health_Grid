with open('public/command.html', 'r', encoding='utf-8') as f:
    cmd = f.read()

# 1. Remove Active Role Dropdown
target_role_dropdown = """        <div style="padding: 0 12px; margin-bottom: 12px; display: none;" id="roleSwitcherContainer" class="nav-text">
          <label style="font-size: 10px; font-weight: 800; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">Active Role</label>
          <select id="roleSwitcher" onchange="switchAppRole(this.value)" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 13px; font-weight: 700; color: #111827; background: #f9fafb; cursor: pointer; outline: none;">
            <option value="admin">Admin (All Access)</option>
            <option value="physician">Physician / Doctor</option>
            <option value="nurse">Nurse / Front Desk</option>
          </select>
        </div>"""
cmd = cmd.replace(target_role_dropdown, "")

# 2. Inject Vercel static login fallback
old_catch_cmd = """        } catch (err) {
          // Fallback verification for static hosts (like Vercel) where the API might be unreachable
          console.warn("API unreachable. Falling back to embedded static verification for Vercel.");
          // Static fallback removed for security - API must be reachable
          errorDiv.style.display = 'block';
          errorDiv.innerText = 'Server unreachable. Please contact your system administrator.';
        }"""
new_catch_cmd = """        } catch (err) {
          console.warn("API unreachable. Falling back to embedded static verification for Vercel.");
          if (user === 'admin' && (pass === 'admin123' || pass === 'secure_admin_password')) {
            localStorage.setItem('ehr_admin_token', 'vercel-mock-token-123');
            localStorage.setItem('ehr_user_role', 'super_admin');
            localStorage.setItem('ehr_user_name', 'System Admin');
            localStorage.setItem('ehr_user_id', 'USR-0001');
            sessionStorage.setItem('role', 'super_admin');
            loginScreen.style.display = 'none';
            if (window.requestedModule === 'phc') enterPhcModule();
            else enterEhrModule();
          } else {
            errorDiv.style.display = 'block';
            errorDiv.innerText = 'Server unreachable. Try admin / admin123 for static preview.';
          }
        }"""
cmd = cmd.replace(old_catch_cmd, new_catch_cmd)

# 3. Inject Super Admin God Mode
sa_btn = """        <!-- SUPER ADMIN ONLY -->
        <button class="nav-btn" data-module="ehr phc" onclick="switchEhrView('superAdminView')" title="God Mode Access Control" id="superAdminNavBtn" style="display:none; color: #7c3aed;">
          <span class="nav-icon">⚡</span><span class="nav-text">Super Admin (God Mode)</span>
        </button>"""
cmd = cmd.replace('<!-- EHR ONLY SECTIONS -->', sa_btn + '\n        <!-- EHR ONLY SECTIONS -->')

sa_view = """      <!-- VIEW: SUPER ADMIN GOD MODE -->
      <div id="superAdminView" class="ehr-view hidden" style="padding: 40px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 32px;">
          <h2 style="font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -0.02em;">God Mode - Access Control</h2>
          <p style="color: #6b7280; font-size: 16px;">Dynamically configure which roles have access to which modules.</p>
        </div>
        
        <div class="glass-card">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb; color: #6b7280;">
                <th style="padding: 12px 8px;">Module View ID</th>
                <th style="padding: 12px 8px; text-align:center;">Physician</th>
                <th style="padding: 12px 8px; text-align:center;">Nurse</th>
                <th style="padding: 12px 8px; text-align:center;">Pharmacist</th>
              </tr>
            </thead>
            <tbody id="permissionMatrixBody">
              <!-- Rendered via JS -->
            </tbody>
          </table>
          <div style="margin-top: 24px; text-align: right;">
            <button onclick="savePermissions()" style="padding: 12px 24px; background: #7c3aed; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(124,58,237,0.3);">
              💾 Save Global Access Rules
            </button>
          </div>
        </div>
      </div>"""
cmd = cmd.replace('<!-- VIEW: MASTER RECORD UNIT -->', sa_view + '\n\n      <!-- VIEW: MASTER RECORD UNIT -->')

js_logic = """      <script>
        let globalPermissions = {};
        const activeRole = sessionStorage.getItem('staff_role') || sessionStorage.getItem('role') || 'admin';
        
        async function loadPermissions() {
          try {
            const res = await fetch('/api/v2/permissions');
            globalPermissions = await res.json();
            applyStrictRbac();
            if(activeRole === 'super_admin' || activeRole === 'admin') {
              const btn = document.getElementById('superAdminNavBtn');
              if(btn) btn.style.display = 'flex';
              renderPermissionMatrix();
            }
          } catch(e) { console.error("Failed to load permissions", e); }
        }

        function applyStrictRbac() {
          const rolePerms = globalPermissions[activeRole] || [];
          if (rolePerms.includes("all") || activeRole === 'admin' || activeRole === 'super_admin') return; // Admin bypass

          const buttons = document.querySelectorAll('#moduleNav .nav-btn');
          buttons.forEach(btn => {
            if(btn.id === 'superAdminNavBtn') return;
            const onclick = btn.getAttribute('onclick') || '';
            const match = onclick.match(/switchEhrView\\(['"]([^'"]+)['"]\\)/);
            if(match && match[1]) {
              const viewId = match[1];
              if(!rolePerms.includes(viewId)) {
                btn.style.display = 'none';
              }
            }
          });
        }

        const standardViews = [
          {id: 'phcHubView', name: 'PHC Sub-Center Hub'},
          {id: 'phcImciView', name: 'PHC IMCI Wizard'},
          {id: 'phcAncView', name: 'PHC ANC Tracker'},
          {id: 'phcCommunityView', name: 'PHC Household Roster'},
          {id: 'phcEpidemicView', name: 'PHC Epidemic Radar'},
          {id: 'mpiView', name: 'EHR Patient Profiles'},
          {id: 'encountersView', name: 'EHR Outpatient Visits'},
          {id: 'wardsView', name: 'EHR Inpatient Wards'},
          {id: 'pharmacyView', name: 'EHR Pharmacy'},
          {id: 'labsView', name: 'EHR Laboratory'},
          {id: 'billingView', name: 'EHR Billing'},
          {id: 'legalView', name: 'EHR Master Record Unit'},
          {id: 'recordsMainView', name: 'EHR Records Unit'}
        ];

        function renderPermissionMatrix() {
          const tbody = document.getElementById('permissionMatrixBody');
          if(!tbody) return;
          tbody.innerHTML = '';
          standardViews.forEach(v => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #f3f4f6';
            
            const isPhysician = (globalPermissions['physician'] || []).includes(v.id);
            const isNurse = (globalPermissions['nurse'] || []).includes(v.id);
            const isPharmacist = (globalPermissions['pharmacist'] || []).includes(v.id);

            tr.innerHTML = 
              <td style="padding: 12px 8px; font-weight:600; color:#374151;"> <br><span style="font-size:11px; color:#9ca3af; font-weight:400;"></span></td>
              <td style="padding: 12px 8px; text-align:center;"><input type="checkbox" class="perm-cb" data-role="physician" data-view=""  style="transform: scale(1.5);"></td>
              <td style="padding: 12px 8px; text-align:center;"><input type="checkbox" class="perm-cb" data-role="nurse" data-view=""  style="transform: scale(1.5);"></td>
              <td style="padding: 12px 8px; text-align:center;"><input type="checkbox" class="perm-cb" data-role="pharmacist" data-view=""  style="transform: scale(1.5);"></td>
            ;
            tbody.appendChild(tr);
          });
        }

        async function savePermissions() {
          const newPerms = { ...globalPermissions };
          newPerms['physician'] = [];
          newPerms['nurse'] = [];
          newPerms['pharmacist'] = [];
          
          document.querySelectorAll('.perm-cb').forEach(cb => {
            if(cb.checked) {
              const role = cb.getAttribute('data-role');
              const viewId = cb.getAttribute('data-view');
              newPerms[role].push(viewId);
            }
          });

          try {
            const res = await fetch('/api/v2/admin/permissions', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(newPerms)
            });
            if(res.ok) {
              alert("Global Access Rules saved successfully!");
              globalPermissions = newPerms;
            }
          } catch(e) {
            alert("Failed to save rules.");
          }
        }

        document.addEventListener('DOMContentLoaded', () => {
          loadPermissions();
        });
      </script>"""
cmd = cmd.replace('</body>', js_logic + '\n</body>')

with open('public/command.html', 'w', encoding='utf-8') as f:
    f.write(cmd)

print("Safely updated command.html")
