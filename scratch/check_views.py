import re

with open('public/command.html', 'r', encoding='utf-8') as f:
    content = f.read()

wards_match = re.search(r'<div id="wardsView".*?>(.*?)<!-- \?\?\? -->', content, re.DOTALL | re.IGNORECASE)
if not wards_match:
    wards_match = re.search(r'<div id="wardsView"[^>]*>(.*?)</div>\s*</div>', content, re.DOTALL | re.IGNORECASE)

if wards_match:
    print("WARDS VIEW:\n", wards_match.group(0)[:1500])
else:
    print("wardsView not found")

lab_match = re.search(r'<div id="labView"[^>]*>(.*?)</div>\s*</div>', content, re.DOTALL | re.IGNORECASE)
if lab_match:
    print("\nLAB VIEW:\n", lab_match.group(0)[:1500])
else:
    print("labView not found")
