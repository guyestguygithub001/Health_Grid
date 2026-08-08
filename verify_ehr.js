const fs = require('fs');
const html = fs.readFileSync('public/command.html', 'utf8');
const checks = [
  ['Super Admin nav button REMOVED', !html.includes('superAdminNavBtn')],
  ['Super Admin view REMOVED', !html.includes('id="superAdminView"')],
  ['Triage & Vitals nav PRESENT', html.includes('Triage & Vitals')],
  ['Ward bed cards grid PRESENT', html.includes('wardBedsGrid')],
  ['Ward filter tabs PRESENT', html.includes('filterWardBy')],
  ['Ward stats grid PRESENT', html.includes('wardStatsGrid')],
  ['Encounter unit filter PRESENT', html.includes('encounterUnitFilter')],
  ['GOPD option PRESENT', html.includes('GOPD')],
  ['SOPD option PRESENT', html.includes('SOPD')],
  ['MOPD option PRESENT', html.includes('MOPD')],
  ['Encounter waiting list PRESENT', html.includes('encounterWaitingList')],
  ['Pharmacy inventory grid PRESENT', html.includes('pharmacyInventoryGrid')],
  ['Pharmacy Rx queue PRESENT', html.includes('pharmacyRxQueue')],
  ['Appointments live table PRESENT', html.includes('apptTableBody')],
  ['New appointment modal PRESENT', html.includes('newApptModal')],
  ['MRU overview tab PRESENT', html.includes('mruContent-overview')],
  ['MRU audit trail tab PRESENT', html.includes('mruContent-audit')],
  ['fetchLiveWards JS PRESENT', html.includes('fetchLiveWards')],
  ['fetchPharmacyData JS PRESENT', html.includes('fetchPharmacyData')],
  ['Auto-fetch on view switch', html.includes('fetchLiveAppointments()')],
];
let pass = 0, fail = 0;
checks.forEach(([label, result]) => {
  console.log((result ? '[PASS]' : '[FAIL]') + ' ' + label);
  result ? pass++ : fail++;
});
console.log('');
console.log('Result: ' + pass + '/' + checks.length + ' checks passed');
console.log('File size: ' + (html.length/1024).toFixed(1) + 'KB');
