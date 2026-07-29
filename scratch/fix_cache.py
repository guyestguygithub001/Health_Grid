import sys
with open('server/server.js', 'r', encoding='utf-8') as f:
    js = f.read()

replacement = """
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
    });
    res.end(content);
"""

original = """
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(content);
"""

if original.strip() in js:
    js = js.replace(original.strip(), replacement.strip())
    with open('server/server.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("Added Cache-Control headers to serveStatic.")
else:
    print("Could not find original block to replace.")
