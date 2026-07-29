html = open('public/emr.html', encoding='utf-8').read()
idx = html.find('Unified Clinical Workspace')
with open('scratch/workspace_dump.txt', 'w', encoding='utf-8') as f:
    f.write(html[max(0, idx-500):idx+3000])
