with open('public/command.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i in range(len(lines)):
    if 'function switchEhrView' in lines[i]:
        print(f"Found at {i}")
