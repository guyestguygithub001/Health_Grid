import re

with open('public/command.html', 'r', encoding='utf-8') as f:
    html = f.read()

for view in ['legalView', 'wardsView', 'labsView', 'billingView']:
    matches = re.findall(rf'id=[\"\']{view}[\"\']', html)
    print(f'{view} count: {len(matches)}')
