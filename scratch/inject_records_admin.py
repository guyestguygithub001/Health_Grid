import re

with open('public/emr.html', 'r', encoding='utf-8') as f:
    emr_html = f.read()

# 1. Extract Records View HTML
start_marker = '<div id="recordsMainView"'
start_idx = emr_html.find(start_marker)
# Find the closing div of recordsMainView (it is the last emr-view before <div id="walkinAdmissionBackdrop")
end_idx = emr_html.find('<!-- Walk-In Admission Modal -->')
if end_idx == -1:
    end_idx = emr_html.find('<div id="walkinAdmissionBackdrop"')

records_html = emr_html[start_idx:end_idx].strip()

# 2. Extract JS Logic
js_start = emr_html.find('function switchRecordsTab')
js_end = emr_html.find('function savePatientEdit', js_start)
# find end of savePatientEdit function
js_end = emr_html.find('}', js_end) + 1
js_end = emr_html.find('}', js_end) + 1
js_end = emr_html.find('}', js_end) + 1 # catch nested braces

records_js = emr_html[js_start:js_end].strip()

# 3. Read admin.html
with open('public/admin.html', 'r', encoding='utf-8') as f:
    admin_html = f.read()

# 4. Inject sidebar button
sidebar_btn = """<button class="nav-btn" data-roles="admin nurse" onclick="switchEhrView('recordsMainView')" title="Records Unit">
            <span>📂</span><span class="nav-text">Records Unit</span>
        </button>"""
# inject before Legal Matrix
admin_html = admin_html.replace('<button class="nav-btn" data-roles="admin" onclick="switchEhrView(\'legalView\')"', sidebar_btn + '\n        <button class="nav-btn" data-roles="admin" onclick="switchEhrView(\'legalView\')"')

# 5. Inject HTML View
# inject before legalView
records_html = records_html.replace('class="emr-view hidden"', 'class="ehr-view hidden"')
admin_html = admin_html.replace('<!-- VIEW: LEGAL MATRIX -->', '<!-- VIEW: Records Unit -->\n      ' + records_html + '\n\n      <!-- VIEW: LEGAL MATRIX -->')

# 6. Inject JS Logic
admin_html = admin_html.replace('    function switchEhrView(viewId', records_js + '\n\n    function switchEhrView(viewId')

# 7. Write back
with open('public/admin.html', 'w', encoding='utf-8') as f:
    f.write(admin_html)

print("Records unit injected successfully!")
