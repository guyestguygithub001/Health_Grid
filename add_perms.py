import re

with open('server/server.js', 'r', encoding='utf-8') as f:
    server_code = f.read()

# Add default permissions to initialization
init_block = """
  // Ensure default roles exist
  if (!data.permissions) {
    data.permissions = {
      "super_admin": ["all"],
      "admin": ["all"],
      "physician": ["encountersView", "wardsView", "pharmacyView", "labsView", "phcHubView", "phcAncView", "phcEpidemicView"],
      "nurse": ["mpiView", "wardsView", "labsView", "recordsMainView", "phcHubView", "phcImciView", "phcAncView", "phcCommunityView"],
      "pharmacist": ["pharmacyView"]
    };
    await writeData(data);
  }
"""

server_code = server_code.replace('if (!data.hmo_preauths) data.hmo_preauths = [];', 
                                  'if (!data.hmo_preauths) data.hmo_preauths = [];\n' + init_block)

# Add permissions endpoints right after auth endpoints
permission_endpoints = """
  if (req.method === "GET" && pathname === "/api/v2/permissions") {
    sendJson(res, 200, data.permissions || {});
    return;
  }
  if (req.method === "POST" && pathname === "/api/v2/admin/permissions") {
    const body = await collectBody(req);
    // Overwrite the permissions matrix
    data.permissions = body;
    queueDatabaseWrite(data);
    sendJson(res, 200, { success: true });
    return;
  }
"""

server_code = server_code.replace('if (req.method === "POST" && url.pathname === "/api/v2/auth/reset") {',
                                  permission_endpoints + '\n  if (req.method === "POST" && url.pathname === "/api/v2/auth/reset") {')

with open('server/server.js', 'w', encoding='utf-8') as f:
    f.write(server_code)
print("Added permissions endpoints to server.js")
