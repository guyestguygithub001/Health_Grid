with open('server/server.js', 'r', encoding='utf-8') as f:
    server_code = f.read()

old_readFile = """function _readFile() {
  if (memoryDb) return memoryDb;
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (!data.staff) { data.staff = []; fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8"); }
    return data;
  } catch (_) {
    const seed = _loadSeed();
    memoryDb = seed;
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
}"""

new_readFile = """function _readFile() {
  if (memoryDb) return memoryDb;
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (!data.staff) { 
      data.staff = []; 
      try { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8"); } catch(e) {} 
    }
    return data;
  } catch (_) {
    const seed = _loadSeed();
    memoryDb = seed;
    try { fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), "utf8"); } catch(e) {}
    return seed;
  }
}"""

server_code = server_code.replace(old_readFile, new_readFile)

with open('server/server.js', 'w', encoding='utf-8') as f:
    f.write(server_code)
print("Safely patched _readFile for read-only Vercel environment.")
