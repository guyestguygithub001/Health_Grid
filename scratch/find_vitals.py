with open('public/emr.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'id="vitalsView"' in line:
        for j in range(max(0, i-2), min(len(lines), i+30)):
            print(f'{j+1}: {lines[j].strip()}')
        break
