import re
code = open('server/server.js', encoding='utf-8').read()
routes = set(re.findall(r'url\.pathname === ["\'](.*?)["\']', code))
routes.update(re.findall(r'url\.pathname\.startsWith\(["\'](.*?)["\']\)', code))
routes.update(re.findall(r'req\.url === ["\'](.*?)["\']', code))
routes.update(re.findall(r'req\.url\.startsWith\(["\'](.*?)["\']\)', code))
with open('scratch/routes_dump.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sorted(list(routes))))
