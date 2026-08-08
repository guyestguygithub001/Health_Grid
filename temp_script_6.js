
// Appointment Requests - Doctor Portal Integration
let _apptFilter = 'pending';

async function loadAppointmentRequests() {
  const list = document.getElementById('apptRequestsList');
  if (!list) return;
  list.innerHTML = '<div style="color:#9ca3af;text-align:center;padding:48px;">Loading...</div>';
  const staffId = sessionStorage.getItem('staff_id') || '';
  const role = sessionStorage.getItem('staff_role') || '';
  try {
    let url = '/api/v2/doctor/appointments?status=' + _apptFilter;
    if (role === 'physician' && staffId) url += '&doctor_id=' + staffId;
    const res = await fetch(url, { headers: { 'x-user-id': staffId, 'x-user-role': role } });
    const data = await res.json();
    renderApptRequests(data.appointments || []);
    const badge = document.getElementById('apptBadge');
    if (badge && _apptFilter === 'pending') {
      const cnt = (data.appointments || []).length;
      badge.textContent = cnt; badge.style.display = cnt > 0 ? 'flex' : 'none';
    }
  } catch (e) {
    if (list) list.innerHTML = '<div style="color:#ef4444;padding:48px;text-align:center;">Error: ' + e.message + '</div>';
  }
}

function filterApptRequests(status) {
  _apptFilter = status;
  ['pending','confirmed','payment_due','paid'].forEach(function(s) {
    const btn = document.getElementById('apptTab_' + s);
    if (!btn) return;
    if (s === status) { btn.style.background='white'; btn.style.color='#0B5E7E'; btn.style.boxShadow='0 2px 4px rgba(0,0,0,.08)'; }
    else { btn.style.background='transparent'; btn.style.color='#6b7280'; btn.style.boxShadow='none'; }
  });
  loadAppointmentRequests();
}

function renderApptRequests(appts) {
  const list = document.getElementById('apptRequestsList');
  if (!list) return;
  if (!appts.length) {
    list.innerHTML = '<div style="text-align:center;padding:64px;color:#9ca3af;"><div style="font-size:48px;">&#128197;</div><div style="font-weight:700;font-size:18px;margin:8px 0 4px;">No ' + _apptFilter.replace(/_/g,' ') + ' appointments</div><div style="font-size:14px;">Patient booking requests will appear here.</div></div>';
    return;
  }
  const typeColor = {'in-person':'#0B5E7E','chat':'#7c3aed','video':'#059669'};
  const statusColor = {pending:'#f59e0b',confirmed:'#3b82f6',payment_due:'#ef4444',paid:'#10b981',completed:'#6b7280',declined:'#991b1b'};
  list.innerHTML = appts.map(function(a) {
    const dateStr = new Date(a.appointment_date).toLocaleDateString('en-NG',{weekday:'short',day:'numeric',month:'short'});
    const isPending = a.status === 'pending';
    const tc = typeColor[a.type] || '#6b7280';
    const sc = statusColor[a.status] || '#6b7280';
    const typeLabel = a.type==='in-person'?'&#127973; In-Person':a.type==='chat'?'&#128172; Chat':'&#128249; Video';
    const actionBtns = isPending
      ? '<button onclick="handleApptAction(\'' + a.id + '\',\'confirm\')" style="background:#10b981;color:white;border:none;padding:10px 18px;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;">&#9989; Confirm</button><button onclick="handleApptAction(\'' + a.id + '\',\'decline\')" style="background:#fef2f2;color:#ef4444;border:1px solid #fecaca;padding:10px 18px;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;">&#10007; Decline</button>'
      : '<span style="padding:8px 14px;background:#f9fafb;border-radius:10px;font-size:12px;font-weight:600;color:#6b7280;">' + (a.status==='paid'?'&#9989; Paid':'&#9203; '+a.status.replace(/_/g,' ')) + '</span>';
    const reasonHtml = a.reason ? '<div style="font-size:13px;color:#374151;margin-top:6px;font-style:italic;">&ldquo;' + a.reason + '&rdquo;</div>' : '';
    const fee = parseFloat(a.fee || 0).toLocaleString();
    const phone = a.patient_phone || '&mdash;';
    const time = (a.start_time || '').slice(0,5);
    const pname = a.patient_name || 'Unknown';
    const initial = pname.charAt(0).toUpperCase();
    return '<div style="background:white;border:1px solid #e5e7eb;border-radius:16px;padding:20px 24px;display:flex;align-items:center;gap:20px;box-shadow:0 2px 8px rgba(0,0,0,.04);">' +
      '<div style="width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#0B5E7E,#0ea5e9);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:white;font-weight:800;font-size:20px;">' + initial + '</div>' +
      '<div style="flex:1;min-width:0;">' +
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
          '<span style="font-weight:800;font-size:16px;">' + pname + '</span>' +
          '<span style="padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;background:' + tc + '25;color:' + tc + ';">' + typeLabel + '</span>' +
          '<span style="padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;background:' + sc + '25;color:' + sc + ';">' + a.status.replace(/_/g,' ').toUpperCase() + '</span>' +
        '</div>' +
        '<div style="font-size:13px;color:#6b7280;margin-top:4px;">&#128222; ' + phone + ' &nbsp;&middot;&nbsp; &#128197; ' + dateStr + ' at ' + time + ' &nbsp;&middot;&nbsp; &#8358;' + fee + '</div>' +
        reasonHtml +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-shrink:0;">' + actionBtns + '</div>' +
    '</div>';
  }).join('');
}

async function handleApptAction(apptId, action) {
  if (!confirm((action === 'confirm' ? 'Confirm' : 'Decline') + ' this appointment?')) return;
  try {
    const staffId = sessionStorage.getItem('staff_id') || '';
    const res = await fetch('/api/v2/doctor/appointments/' + apptId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-id': staffId },
      body: JSON.stringify({ action: action })
    });
    const data = await res.json();
    if (data.ok) {
      if (typeof showToast === 'function') showToast(action === 'confirm' ? 'Confirmed! Patient notified to pay.' : 'Appointment declined.');
      loadAppointmentRequests();
    } else {
      if (typeof showToast === 'function') showToast('Error: ' + (data.error || 'Unknown'));
    }
  } catch (e) {
    if (typeof showToast === 'function') showToast('Network error: ' + e.message);
  }
}

// Auto-refresh pending badge every 30s
setInterval(function() {
  fetch('/api/v2/doctor/appointments?status=pending')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      const b = document.getElementById('apptBadge');
      if (b) { const c = (d.appointments||[]).length; b.textContent = c; b.style.display = c > 0 ? 'flex' : 'none'; }
    }).catch(function() {});
}, 30000);
