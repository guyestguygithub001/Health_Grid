html = open('public/emr.html', encoding='utf-8').read()
idx_b = html.find('id="billingView"')
idx_r = html.find('id="recordsMainView"')
print(f"billingView index: {idx_b}")
print(f"recordsMainView index: {idx_r}")

if idx_b != -1:
    print(f"Billing HTML snippet: {html[idx_b:idx_b+200]}")
if idx_r != -1:
    print(f"Records HTML snippet: {html[idx_r:idx_r+200]}")
