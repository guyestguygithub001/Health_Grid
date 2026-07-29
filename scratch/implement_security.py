"""
Refactor server.js to add:
1. UniversalErrorHandler & AppError
2. AuditLogger
3. Security Headers in sendJson
4. XSS escaping in collectBody
5. Wrap the main request listener in the UniversalErrorHandler
"""

import re
import os

filepath = 'server/server.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject Error Classes and Audit Logger right after imports
imports_section = """const zlib = require("zlib");

// ── SmartClinic Enterprise Modules ────────────────────────────"""

new_classes = """const zlib = require("zlib");

// ── Security & Architecture Modules ────────────────────────────
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

class UniversalErrorHandler {
  static handle(err, res) {
    const isDev = process.env.NODE_ENV !== 'production';
    const statusCode = err.statusCode || 500;
    
    if (isDev) {
      console.error('🔥 [DEV ERROR]:', err);
    } else if (!err.isOperational) {
      console.error('💥 [PROD CRITICAL ERROR]:', err.name, err.message);
    }

    // Mask details in production for 500s
    if (!isDev && statusCode === 500) {
      sendJson(res, 500, { error: 'Internal Server Error' });
      return;
    }

    sendJson(res, statusCode, {
      error: err.message || 'Error occurred',
      ...(isDev && { stack: err.stack })
    });
  }
}

class AuditLogger {
  static logAction(req, payload) {
    const method = req.method;
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) return;
    
    // Mask sensitive secrets (passwords, tokens), but KEEP names/phones for NDPA traceability
    const maskedPayload = JSON.parse(JSON.stringify(payload || {}));
    if (maskedPayload.password) maskedPayload.password = '***MASKED***';
    if (maskedPayload.token) maskedPayload.token = '***MASKED***';

    const entry = {
      timestamp: new Date().toISOString(),
      method: method,
      url: req.url,
      ip: req.socket.remoteAddress || 'unknown',
      user: req.headers['x-user-id'] || 'anonymous',
      payload: maskedPayload
    };

    const logLine = JSON.stringify(entry) + "\\n";
    fs.appendFile(path.join(__dirname, 'audit.log'), logLine, (err) => {
      if (err) console.error('Failed to write audit log:', err);
    });
  }
}

// ── SmartClinic Enterprise Modules ────────────────────────────"""

if 'class UniversalErrorHandler' not in content:
    content = content.replace(imports_section, new_classes)
    print("Injected Security Classes.")


# 2. Update sendJson with Security Headers
old_send_json = """  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };"""

new_send_json = """  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-id",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'self'",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
  };"""

content = content.replace(old_send_json, new_send_json)
print("Updated sendJson headers.")


# 3. Add XSS Escaping to collectBody
old_collect_body = """function collectBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => { raw += chunk; if (raw.length > 2_000_000) reject(new Error("Body too large")); });
    req.on("end", () => { if (!raw) { resolve({}); return; } try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
  });
}"""

new_collect_body = """function escapeXSS(obj) {
  if (typeof obj === 'string') {
    return obj.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  if (Array.isArray(obj)) {
    return obj.map(escapeXSS);
  }
  if (obj !== null && typeof obj === 'object') {
    for (let key in obj) {
      obj[key] = escapeXSS(obj[key]);
    }
  }
  return obj;
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => { raw += chunk; if (raw.length > 2_000_000) reject(new AppError("Payload Too Large", 413)); });
    req.on("end", () => { 
      if (!raw) { resolve({}); return; } 
      try { 
        const parsed = JSON.parse(raw);
        resolve(escapeXSS(parsed)); // Defeat XSS without stripping clinical notes
      } catch (e) { 
        reject(new AppError("Invalid JSON", 400)); 
      } 
    });
  });
}"""

content = content.replace(old_collect_body, new_collect_body)
print("Updated collectBody with XSS escaping.")


# 4. Wrap HTTP server logic in UniversalErrorHandler & inject AuditLogger
# First, let's find the start of http.createServer
import re

# Replace the inner try/catch with the universal error handler
# Wait, let's replace the whole top-level try-catch block inside http.createServer.
# The server block starts like:
# const server = http.createServer(async (req, res) => {
# ... rate limit checks ...
#   try {
#      // ... routes
#   } catch (err) { sendJson(res, 500, { error: err.message }); }
# });

# First inject the audit logger call at the start of handleApi, or inside the main server block?
# The instructions say intercept POST/PUT/DELETE, which are parsed by collectBody. We only get the body inside the routes.
# But we can log the action (URL, method) immediately, and the body separately, or we just log the body inside the routes.
# Wait, `handleApi` is where body is parsed. It's better to hook the AuditLogger inside `collectBody` directly!
# Let's adjust collectBody to do the audit logging!

# Let's rewrite the collectBody replacement to include Audit logging.
better_collect_body = """function escapeXSS(obj) {
  if (typeof obj === 'string') {
    return obj.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  if (Array.isArray(obj)) {
    return obj.map(escapeXSS);
  }
  if (obj !== null && typeof obj === 'object') {
    for (let key in obj) {
      obj[key] = escapeXSS(obj[key]);
    }
  }
  return obj;
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => { raw += chunk; if (raw.length > 2_000_000) reject(new AppError("Payload Too Large", 413)); });
    req.on("end", () => { 
      if (!raw) { 
        AuditLogger.logAction(req, {});
        resolve({}); 
        return; 
      } 
      try { 
        const parsed = JSON.parse(raw);
        const safeData = escapeXSS(parsed);
        AuditLogger.logAction(req, safeData); // Audit trail intercept
        resolve(safeData);
      } catch (e) { 
        reject(new AppError("Invalid JSON", 400)); 
      } 
    });
  });
}"""

content = content.replace(new_collect_body, better_collect_body)

# Replace the global catch block
old_catch = "} catch (err) { sendJson(res, 500, { error: err.message }); }"
new_catch = "} catch (err) { UniversalErrorHandler.handle(err, res); }"
content = content.replace(old_catch, new_catch)
print("Updated main catch block.")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done refactoring server.js")
