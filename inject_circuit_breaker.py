import re

with open('server/db-postgres.js', 'r', encoding='utf-8') as f:
    content = f.read()

circuit_breaker_logic = """
let circuitBreakerOpen = false;
let circuitBreakerTimeout = null;

// The Fallback Data Store (Extra Powerful Local Fallback)
function getLocalFallbackData(text) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
    
    // Naive local fallback router
    if (text.toLowerCase().includes('from patients')) return { rows: data.patients || [], rowCount: (data.patients || []).length };
    if (text.toLowerCase().includes('from doctors')) return { rows: data.doctors || [], rowCount: (data.doctors || []).length };
    if (text.toLowerCase().includes('from appointments')) return { rows: data.appointments || [], rowCount: (data.appointments || []).length };
    
    return { rows: [], rowCount: 0 };
  } catch (e) {
    console.error('[Circuit Breaker] Fallback JSON also failed!', e);
    return { rows: [], rowCount: 0 };
  }
}

/**
 * Primary query function — use this everywhere.
 * Now equipped with a Circuit Breaker & Docker/JSON Fallback.
 */
async function query(text, params = []) {
  if (circuitBreakerOpen) {
    console.warn('[Circuit Breaker OPEN] Routing query to Local Fallback Data Layer...');
    return getLocalFallbackData(text);
  }

  const db = getDb();
  try {
    const result = await db.query(text, params);
    return result;
  } catch (err) {
    console.error('[DB] Primary Query Failed:', err.message);
    
    // If it's a connection error (API down, Neon rate limit, Docker down), trip the breaker
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.message.includes('fetch failed')) {
      console.error('💥 [CIRCUIT BREAKER TRIPPED] Primary database is down. Switching to powerful local fallback...');
      circuitBreakerOpen = true;
      
      // Attempt to close breaker and recover after 60 seconds
      if (circuitBreakerTimeout) clearTimeout(circuitBreakerTimeout);
      circuitBreakerTimeout = setTimeout(() => {
        console.log('🔄 [CIRCUIT BREAKER] Attempting to reconnect to primary database...');
        circuitBreakerOpen = false;
      }, 60000);
      
      return getLocalFallbackData(text);
    }
    
    throw err;
  }
}
"""

# Replace the existing query function
query_pattern = r"/\*\*\n \* Primary query function — use this everywhere\..*?async function query\(text, params = \[\]\) \{.*?\n\}"
content = re.sub(query_pattern, circuit_breaker_logic, content, flags=re.DOTALL)

with open('server/db-postgres.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Implemented Backend Circuit Breaker and Local Fallback in db-postgres.js.")
