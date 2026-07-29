with open('public/emr.html', 'r', encoding='utf-8') as f:
    html = f.read()

for v in ['legalView', 'wardsView', 'labsView', 'billingView']:
    print(f'{v} in emr.html:', html.count(f'id="{v}"'))
