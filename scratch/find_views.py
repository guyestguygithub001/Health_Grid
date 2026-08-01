import re
with open('public/command.html', 'r', encoding='utf-8') as f:
    content = f.read()

matches = re.finditer(r'<[^>]*class="[^"]*ehr-view[^"]*"[^>]*>', content)
for m in matches:
    print(m.group(0))
