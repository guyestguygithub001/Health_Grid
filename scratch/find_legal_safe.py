import io
import sys

# Change standard output encoding to utf-8 to avoid charmap errors
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

content = open('public/command.html', 'r', encoding='utf-8').readlines()
matches = [(i+1, line.strip()) for i, line in enumerate(content) if 'legal' in line.lower()]

for n, t in matches:
    print(f'Line {n}: {t}')
    print(''.join(content[max(0, n-3):min(len(content), n+3)]))
