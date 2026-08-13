const fs = require('fs');
let c = fs.readFileSync('public/emr.html', 'utf8');

const apiReplacement = `  window.API = {
    _headers() {
      const token = sessionStorage.getItem('staff_token');
      return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      };
    },
    async registerPatient(data) {
      const res = await fetch('/api/v2/patient/register', { method: 'POST', headers: this._headers(), body: JSON.stringify(data) });
      return res.json();
    },
    async createEncounter(data) {
      const res = await fetch('/api/v2/encounters', { method: 'POST', headers: this._headers(), body: JSON.stringify(data) });
      return res.json();
    },
    async getPatients() {
      const res = await fetch('/api/v2/mpi/search?q=', { headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('staff_token') } });
      return res.json();
    },
    async getEncounters() {
      const res = await fetch('/api/v2/encounters', { headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('staff_token') } });
      return res.json();
    },
    async updateRecord(collection, id, fields) {
      const res = await fetch('/api/v2/update-record', { method: 'POST', headers: this._headers(), body: JSON.stringify({collection, id, fields}) });
      return res.json();
    }
  };`;

c = c.replace(/window\.API = \{[\s\S]*?async updateRecord[\s\S]*?\}\n  \};/, apiReplacement);

const fetchRecordsReplacement = `  async function fetchRecordsQueue() {
    const q = document.getElementById('recordsQueue');
    if (!q) return;
    
    try {
      const data = await window.API.getPatients();
      
      q.innerHTML = '';
      if (!data.results || data.results.length === 0) {
        q.innerHTML = '<div style="padding: 64px; text-align: center; color: #94a3b8;"><i data-lucide="inbox" style="width: 48px; height: 48px; opacity: 0.5; margin-bottom: 16px;"></i><br><span style="font-size: 16px; font-weight: 500;">No patients found in database.</span></div>';
        if(window.lucide) window.lucide.createIcons();
        return;
      }
      
      const patients = data.results.sort((a,b) => b.id.localeCompare(a.id));
      
      patients.forEach(pt => {
        const item = document.createElement('div');
        item.style = 'padding: 16px 24px; border-bottom: 1px solid #f1f5f9; background: white; display: grid; grid-template-columns: 1.5fr 1fr 1fr 1.5fr 1fr; gap: 16px; align-items: center; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;';
        item.onmouseover = () => { item.style.background = '#f8fafc'; item.style.transform = 'translateY(-1px)'; item.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; };
        item.onmouseout = () => { item.style.background = 'white'; item.style.transform = 'none'; item.style.boxShadow = 'none'; };
        
        // When clicking a row, maybe show a summary or load into a modal (for now just highlight)
        item.onclick = () => {
          document.querySelectorAll('#recordsQueue > div').forEach(el => el.style.borderLeft = 'none');
          item.style.borderLeft = '4px solid #4f46e5';
        };
        
        item.innerHTML = \`
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">
              \${pt.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style="font-weight: 700; color: #0f172a; font-size: 15px;">\${pt.name}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">MPI Record</div>
            </div>
          </div>
          <div>
            <div style="font-family: 'SFMono-Regular', Consolas, monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 6px; color: #334155; font-weight: 600; display: inline-block; font-size: 13px;">\${pt.id}</div>
          </div>
          <div>
            <div style="font-size: 14px; font-weight: 600; color: #334155;">\${pt.age || '--'} yrs</div>
            <div style="font-size: 13px; color: #64748b;">\${pt.gender || pt.sex || '--'}</div>
          </div>
          <div>
            <div style="font-size: 14px; font-weight: 500; color: #1e293b;">\${pt.phone || 'No Phone'}</div>
            <div style="font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;" title="\${pt.address || ''}">\${pt.address || 'No Address'}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <i data-lucide="calendar" style="width: 14px; height: 14px; color: #94a3b8;"></i>
            <span style="font-size: 13px; color: #64748b; font-weight: 500;">\${pt.registeredAt ? new Date(pt.registeredAt).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'}) : '--'}</span>
          </div>
        \`;
        q.appendChild(item);
      });
      if(window.lucide) window.lucide.createIcons();
    } catch (e) {
      console.error('Failed to fetch records', e);
      q.innerHTML = '<div style="padding: 48px; text-align: center; color: #ef4444; font-size: 16px;">Failed to connect to database.</div>';
    }
  }`;

c = c.replace(/async function fetchRecordsQueue\(\) \{[\s\S]*?\} catch \(e\) \{[\s\S]*?\}\n  \}/, fetchRecordsReplacement);

fs.writeFileSync('public/emr.html', c);
console.log('Patched API and Records Unit');
