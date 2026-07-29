html = open('public/emr.html', encoding='utf-8').read()
b = html.find('id="billingView"')
with open('scratch/billing_dump.txt', 'w', encoding='utf-8') as out:
    out.write(html[b:b+800])

r = html.find('id="recordsMainView"')
with open('scratch/records_dump.txt', 'w', encoding='utf-8') as out:
    out.write(html[r:r+800])
