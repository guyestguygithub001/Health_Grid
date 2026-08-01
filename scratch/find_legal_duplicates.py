import re

with open('public/command.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all blocks with id="legalView"
matches = re.finditer(r'<[a-z]+[^>]*?id="legalView"[^>]*>.*?(?=</main>|<[a-z]+[^>]*?id="[a-zA-Z0-9]+View")', content, re.DOTALL)

for i, match in enumerate(matches):
    print(f"Match {i+1}:")
    snippet = match.group(0)[:500]
    print(snippet)
    print("-" * 50)
