import re
with open('public/command.html', 'r', encoding='utf-8') as f:
    html = f.read()
    
match = re.search(r'function\s+\w*switchEhrView[^{]*\{.*?\}', html, re.DOTALL)
if match:
    print("Found switchEhrView!")
    print(match.group(0))
else:
    print("switchEhrView not found.")

match2 = re.search(r'function\s+\w*enterEhrModule[^{]*\{.*?(?=function|\</script)', html, re.DOTALL)
if match2:
    print("Found enterEhrModule!")
    print(match2.group(0)[:500])
else:
    print("enterEhrModule not found.")
