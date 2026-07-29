import re
code = open('server/server.js', encoding='utf-8').read()
routes = re.findall(r'app\.(?:post|get|put|delete)\([\'"](.*?)[\'"]', code)
print("\n".join(routes))
