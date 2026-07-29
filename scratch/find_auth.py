import re
code = open('server/server.js', encoding='utf-8').read()
idx = code.find('/api/v2/auth/register')
if idx != -1:
    print(code[max(0, idx-500):idx+500])
else:
    print("Could not find /api/v2/auth/register")
    idx2 = code.find('/auth')
    if idx2 != -1:
        print("Found /auth")
        print(code[max(0, idx2-500):idx2+500])
