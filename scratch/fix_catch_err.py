import re
with open('public/emr.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('console.error("Billing error", err);', 'console.error("Billing error", e);')
html = html.replace('console.error("Records error", err);', 'console.error("Records error", e);')

with open('public/emr.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Replaced err with e successfully.")
