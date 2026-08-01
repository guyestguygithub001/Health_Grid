with open('public/command.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_landing = '<div id="landingScreen" style="display:flex; height:100vh; overflow:hidden; flex-direction:column; justify-content:center; align-items:center; position:relative; z-index:40;">'
new_landing = '<div id="landingScreen" style="display:flex; position:fixed; inset:0; overflow:hidden; flex-direction:column; justify-content:center; align-items:center; z-index:40; background:#f8fafc;">'

if old_landing in html:
    html = html.replace(old_landing, new_landing)
    with open('public/command.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Updated landingScreen CSS to position:fixed; inset:0;")
else:
    print("Could not find exact landingScreen string")
