html = open('public/emr.html', encoding='utf-8').read()
b = html.find('id="billingView"')
print(html[b:b+800])
