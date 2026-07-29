with open('public/command.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'id="legalView"' in line:
        print('Found legalView at', i)
    if 'id="wardsView"' in line:
        print('Found wardsView at', i)
    if '</main>' in line:
        print('Found </main> at', i)
