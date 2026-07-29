with open('public/admin.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

ehr_app_shell_start = -1
for i, line in enumerate(lines):
    if 'id="ehrAppShell"' in line:
        ehr_app_shell_start = i
        break
print('ehrAppShell starts at', ehr_app_shell_start + 1)
