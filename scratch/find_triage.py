with open('public/emr.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'Triage & Vitals' in line or 'triage' in line.lower():
        print(f'Match at line {i+1}:')
        for j in range(max(0, i-2), min(len(lines), i+20)):
            print(f'{j+1}: {lines[j].strip()}')
        break
