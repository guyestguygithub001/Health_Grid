with open('public/admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace all occurrences of loadBilling with fetchLiveBilling
html = html.replace('loadBilling()', 'fetchLiveBilling()')
html = html.replace('setInterval(loadBilling', 'setInterval(fetchLiveBilling')

with open('public/admin.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Replaced loadBilling with fetchLiveBilling.')
