import re

with open("public/emr.html", "r", encoding="utf-8") as f:
    html = f.read()

safeStorageCode = """
    // Safe storage wrapper to support file:// protocol
    const safeStorage = {
      memory: {},
      getItem: function(k) {
        try { return sessionStorage.getItem(k) || this.memory[k] || null; } 
        catch(e) { return this.memory[k] || null; }
      },
      setItem: function(k, v) {
        this.memory[k] = v;
        try { sessionStorage.setItem(k, v); } catch(e) {}
      },
      removeItem: function(k) {
        if (k in this.memory) delete this.memory[k];
        try { sessionStorage.removeItem(k); } catch(e) {}
      }
    };
"""

if "safeStorage" not in html:
    html = re.sub(r'<script>', '<script>\n' + safeStorageCode, html, count=1)

html = html.replace("sessionStorage.getItem", "safeStorage.getItem")
html = html.replace("sessionStorage.setItem", "safeStorage.setItem")
html = html.replace("sessionStorage.removeItem", "safeStorage.removeItem")

# But wait! The earlier regex I ran replaced `sessionStorage.getItem` with `(function(k){try{return sessionStorage.getItem(k);}catch(e){return null;}})(`
# Let's undo that damage:
bad1 = r"\(function\(k\)\{try\{return sessionStorage\.getItem\(k\);\}catch\(e\)\{return null;\}\}\)\("
html = re.sub(bad1, "safeStorage.getItem(", html)

bad2 = r"try\{sessionStorage\.setItem\((.*?),\s*(.*?)\);\}catch\(e\)\{console\.warn\('sessionStorage not available'\);\}"
html = re.sub(bad2, r"safeStorage.setItem(\1, \2)", html)

bad3 = r"\(function\(k\)\{try\{sessionStorage\.removeItem\(k\);\}catch\(e\)\{\}\}\)\("
html = re.sub(bad3, "safeStorage.removeItem(", html)

with open("public/emr.html", "w", encoding="utf-8") as f:
    f.write(html)
print("Fixed safeStorage memory fallback")
