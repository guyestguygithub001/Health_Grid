with open('public/admin.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

sidebar_buttons = """
        <button class="nav-btn" data-roles="admin" onclick="switchEhrView('legalView')" title="Legal Matrix">
          <span class="nav-icon">⚖️</span><span class="nav-text">Legal Matrix</span>
        </button>
        <button class="nav-btn" data-roles="admin physician nurse" onclick="switchEhrView('wardsView')" title="Inpatient Wards">
          <span class="nav-icon">🛏️</span><span class="nav-text">Inpatient Wards</span>
        </button>
        <button class="nav-btn" data-roles="admin physician" onclick="switchEhrView('labsView')" title="Lab & Diagnostics">
          <span class="nav-icon">🧪</span><span class="nav-text">Lab & Diagnostics</span>
        </button>
        <button class="nav-btn" data-roles="admin nurse" onclick="switchEhrView('billingView')" title="Billing & Claims">
          <span class="nav-icon">💳</span><span class="nav-text">Billing & Claims</span>
        </button>
"""

for i, line in enumerate(lines):
    if "switchEhrView('recordsMainView')" in line:
        # It's a 3-line block: <button ...> \n <span>...</span> \n </button>
        lines.insert(i + 3, sidebar_buttons)
        break

with open('public/admin.html', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Injected sidebar buttons.")
