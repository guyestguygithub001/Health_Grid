import re

with open('public/admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Rename the FIRST instance of id="billingView" to oldBillingView
html = html.replace('id="billingView"', 'id="oldBillingView"', 1)

# 2. Add fetchAuditLogs
js = """
    async function fetchAuditLogs() {
      console.log('Fetching audit logs...');
    }
"""
if 'function fetchAuditLogs' not in html:
    html = html.replace('async function fetchLiveWards()', js + '    async function fetchLiveWards()')

# 3. Add fetchRecordsRegistry
js_records = """
    async function fetchRecordsRegistry() {
      console.log('Fetching records registry...');
    }
"""
if 'function fetchRecordsRegistry' not in html:
    html = html.replace('async function fetchLiveWards()', js_records + '    async function fetchLiveWards()')

with open('public/admin.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Fixed duplicate billingView and added missing functions.')
