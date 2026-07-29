import os

# 1. Rename admin.html to command.html
os.rename('public/admin.html', 'public/command.html')

# 2. Update index.html
with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()
html = html.replace('admin.html', 'command.html')
with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 3. Update emr.html
with open('public/emr.html', 'r', encoding='utf-8') as f:
    html = f.read()
html = html.replace('admin.html', 'command.html')
with open('public/emr.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 4. Update command.html (previously admin.html) to reference itself correctly if needed
with open('public/command.html', 'r', encoding='utf-8') as f:
    html = f.read()
html = html.replace('admin.html', 'command.html')
with open('public/command.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 5. Update server.js to redirect admin.html to command.html
with open('server/server.js', 'r', encoding='utf-8') as f:
    js = f.read()

redirect_code = """
  // Cache Buster Redirect
  if (url.pathname === "/admin.html") {
    res.writeHead(302, { 'Location': '/command.html' });
    res.end();
    return;
  }
"""
js = js.replace('const requested = url.pathname === "/" ? "/index.html" : url.pathname;', redirect_code + '\n  const requested = url.pathname === "/" ? "/index.html" : url.pathname;')

with open('server/server.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Cache buster applied successfully.")
