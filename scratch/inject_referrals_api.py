import re

with open('server/server.js', 'r', encoding='utf-8') as f:
    js = f.read()

referrals_api = """
// ============================================================================
// V2 REFERRALS API (Realtime Ledger)
// ============================================================================

app.get('/api/v2/referrals', v2AuthMiddleware, (req, res) => {
  if (!data.referrals) data.referrals = [];
  res.json(data.referrals);
});

app.post('/api/v2/referrals', v2AuthMiddleware, (req, res) => {
  if (!data.referrals) data.referrals = [];
  const ref = {
    id: 'REF' + Math.floor(Math.random() * 90000 + 10000),
    date: new Date().toISOString(),
    patientId: req.body.patientId || 'UNKNOWN',
    patientName: req.body.patientName || 'Unknown',
    fromUnit: req.body.fromUnit || 'External',
    toUnit: req.body.toUnit || 'General',
    diagnosis: req.body.diagnosis || 'None',
    urgency: req.body.urgency || 'Routine',
    status: 'Pending'
  };
  data.referrals.push(ref);
  queueDatabaseWrite();
  res.json({ success: true, referral: ref });
});

app.put('/api/v2/referrals/:id/status', v2AuthMiddleware, (req, res) => {
  if (!data.referrals) data.referrals = [];
  const ref = data.referrals.find(r => r.id === req.params.id);
  if (!ref) return res.status(404).json({ error: 'Referral not found' });
  ref.status = req.body.status || ref.status;
  queueDatabaseWrite();
  res.json({ success: true, referral: ref });
});
"""

# Inject before app.listen
js = js.replace('app.listen(PORT', referrals_api + '\napp.listen(PORT')

with open('server/server.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Referrals API injected successfully.")
