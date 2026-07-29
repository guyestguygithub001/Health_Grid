with open('public/admin.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('scratch/buttons_output.txt', 'w', encoding='utf-8') as out:
    for i, line in enumerate(lines):
        if 'Legal Matrix' in line or 'Inpatient Wards' in line or 'Lab & Diagnostics' in line or 'Billing & Claims' in line:
            if '<button' in line or '<span class="nav-text">' in line:
                out.write(f'{i+1}: {line.strip()}\n')
