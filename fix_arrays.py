with open('server/server.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re

old_readFile = """function _readFile() {
  if (memoryDb) return memoryDb;
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (!data.staff) { 
      data.staff = []; 
      try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8"); } catch(e) {} 
    }
    return data;"""

new_readFile = """function _readFile() {
  if (memoryDb) return memoryDb;
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    const arrays = ['staff', 'patients', 'encounters', 'admissions', 'billing', 'facilities', 'orders', 'appointments', 'labResults', 'beds', 'consultations', 'referrals', 'emr_encounters', 'emr_clinical_notes', 'wallets', 'transactions'];
    let modified = false;
    arrays.forEach(k => {
      if (!data[k]) { data[k] = []; modified = true; }
    });
    if (modified) { 
      try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8"); } catch(e) {} 
    }
    return data;"""

if old_readFile in code:
    code = code.replace(old_readFile, new_readFile)
    with open('server/server.js', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Safely patched _readFile to initialize all arrays.")
else:
    print("Could not find exact _readFile string")
