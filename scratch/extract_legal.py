import re

with open('public/command.html', 'r', encoding='utf-8') as f:
    content = f.read()

legal = re.search(r'(<div id="legalView".*?)(?=<div id="\w+View"|</main>)', content, re.DOTALL | re.IGNORECASE)
if legal:
    with open('scratch/legal.html', 'w', encoding='utf-8') as fw:
        fw.write(legal.group(1))
    print("Found legal view.")
else:
    print("Not found")
