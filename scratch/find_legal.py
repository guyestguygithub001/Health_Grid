with open('public/command.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
print("Views:", re.findall(r'<div id="([^"]+)"[^>]*class="[^"]*ehr-view[^"]*"', content))
print("Legal text present:", 'legal' in content.lower())
