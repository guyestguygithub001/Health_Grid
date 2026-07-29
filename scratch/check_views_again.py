with open('public/admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

for v in ['legalView', 'wardsView', 'labsView', 'billingView']:
    print(f'{v} exists:', html.count(f'id="{v}"'))
