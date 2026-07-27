const fs = require('fs');
const s = fs.readFileSync('server/server.js','utf8');

const lines = s.split('\n').length;
const usesHttp = s.includes('http.createServer') || s.includes('require("http")');
const corsWildcard = (s.match(/origin.*\*/g)||[]).length;
const hasEnvFile = fs.existsSync('.env');
const gitignore = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore','utf8') : '';
const envInGitignore = gitignore.includes('.env');
const dataJsonExposed = !gitignore.includes('data.json') && fs.existsSync('data.json');
const hasHelmet = s.includes('helmet');
const hasRateLimit = s.includes('rateLimit') || s.includes('rate-limit') || s.includes('429');
const sessionSecret = (s.match(/secret:\s*['"][^'"]{8,}['"]/g)||[]).length;
const hardcodedPasswords = (s.match(/password.*=.*['"]\w{3,}['"]/gi)||[]).length;

console.log('=== ARCHITECTURE ===');
console.log('Server total lines:', lines);
console.log('Uses raw http module (no Express):', usesHttp);
console.log('');

console.log('=== CORS ===');
console.log('Wildcard CORS origin (*) found:', corsWildcard > 0 ? corsWildcard + ' occurrences WARNING' : 'None OK');
console.log('');

console.log('=== HTTP SECURITY HEADERS ===');
console.log('Helmet middleware:', hasHelmet ? 'Present OK' : 'MISSING WARNING - Add helmet for X-Frame, XSS, HSTS headers');
console.log('Rate limiting:', hasRateLimit ? 'Present OK' : 'MISSING WARNING');
console.log('');

console.log('=== SECRETS & ENV ===');
console.log('.env file exists:', hasEnvFile);
console.log('.env in .gitignore:', envInGitignore ? 'OK' : 'MISSING from .gitignore WARNING');
console.log('data.json possibly exposed in git:', dataJsonExposed ? 'WARNING - contains patient data' : 'OK');
console.log('Session secret length >= 8 chars:', sessionSecret > 0 ? 'OK' : 'WARNING - check session secret strength');
console.log('Hardcoded passwords found:', hardcodedPasswords > 0 ? hardcodedPasswords + ' WARNING' : 'None OK');
