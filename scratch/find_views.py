import re

with open('public/command.html', 'r', encoding='utf-8') as f:
    content = f.read()

ids = re.findall(r'<div id="([^"]+)"[^>]*class="[^"]*ehr-view[^"]*"', content)
print("EHR Views:", ids)

lab = re.search(r'(<div id="labsView"[^>]*>.*?</form>.*?</div>\s*</div>)', content, re.DOTALL | re.IGNORECASE)
if lab: print("LAB VIEW FOUND:", lab.group(1)[:500])
