"""
Inject new administrative workflow routes into server.js
"""

import os

filepath = 'server/server.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add /api/v2/audit route
audit_route = """
  // ── Audit Trail (Admin Only) ─────────────────────────────────
  if (req.method === "GET" && url.pathname === "/api/v2/audit") {
    try {
      const logPath = path.join(__dirname, 'audit.log');
      if (!fs.existsSync(logPath)) {
        sendJson(res, 200, { logs: [] });
        return;
      }
      const rawLogs = fs.readFileSync(logPath, 'utf8').trim().split('\\n');
      const parsedLogs = rawLogs.slice(-100).map(line => {
        try { return JSON.parse(line); } catch(e) { return null; }
      }).filter(Boolean).reverse();
      
      sendJson(res, 200, { logs: parsedLogs });
    } catch (e) {
      throw new AppError("Failed to read audit logs", 500);
    }
    return;
  }
"""

# Insert before handleApi function ends. Let's find handleEnterpriseApi or the top of handleApi
if "/api/v2/audit" not in content:
    # Find a good place to insert. Let's look for "if (req.method === "GET" && url.pathname === "/api/v2/orders")"
    content = content.replace(
        '  if (req.method === "GET" && url.pathname === "/api/v2/orders")',
        audit_route + '\n  if (req.method === "GET" && url.pathname === "/api/v2/orders")'
    )


# 2. Add /api/v2/orders/status route
orders_status_route = """
  if (req.method === "POST" && url.pathname === "/api/v2/orders/status") {
    const body = await collectBody(req);
    let found = false;
    data.encounters.forEach(enc => {
      if (enc.orders) {
        enc.orders.forEach(o => {
          if (o.id === body.id) {
            o.status = body.status;
            if (body.result) o.result = body.result;
            found = true;
          }
        });
      }
    });
    if (found) {
      queueDatabaseWrite(data);
      sendJson(res, 200, { success: true });
    } else {
      sendJson(res, 404, { error: "Order not found" });
    }
    return;
  }
"""

if "/api/v2/orders/status" not in content:
    content = content.replace(
        '  if (req.method === "GET" && url.pathname === "/api/v2/orders")',
        '  if (req.method === "GET" && url.pathname === "/api/v2/orders")' + orders_status_route
    )

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected routes into server.js")
