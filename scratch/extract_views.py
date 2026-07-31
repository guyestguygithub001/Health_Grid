import re

with open('public/command.html', 'r', encoding='utf-8') as f:
    content = f.read()

wards = re.search(r'(<div id="wardsView".*?</div>\s*</div>)', content, re.DOTALL | re.IGNORECASE)
if not wards:
    # try another closing logic for wardsView
    wards = re.search(r'(<div id="wardsView".*?)(?=<div id="labsView")', content, re.DOTALL | re.IGNORECASE)
if wards:
    with open('scratch/wards.html', 'w', encoding='utf-8') as fw:
        fw.write(wards.group(1))

labs = re.search(r'(<div id="labsView".*?)(?=<div id="billingView")', content, re.DOTALL | re.IGNORECASE)
if labs:
    with open('scratch/labs.html', 'w', encoding='utf-8') as fl:
        fl.write(labs.group(1))

print("Extraction complete.")
