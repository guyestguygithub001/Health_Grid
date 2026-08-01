with open('public/command.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'switchEhrView' in line or 'enterEhrModule' in line:
        print(f"Line {i+1}: {line.strip()}")
