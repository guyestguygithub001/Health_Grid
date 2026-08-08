import os

files_to_update = ['public/command.html', 'public/index.html']
script_tag = '<script src="/js/apiClient.js"></script>\n<script>'

for file in files_to_update:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if '<script src="/js/apiClient.js"></script>' not in content:
            content = content.replace('<script>', script_tag, 1)
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)

print("SUCCESS: Injected Universal API Client into command.html and index.html")
