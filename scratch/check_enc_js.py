with open('public/command.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('finalizeEncounter =')
if idx == -1:
    idx = html.find('finalizeEncounter(')
if idx == -1:
    idx = html.find('function finalizeEncounter')

if idx != -1:
    print(html[idx:idx+2500])
else:
    print('Not found')
