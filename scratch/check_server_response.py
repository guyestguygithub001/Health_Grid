import urllib.request
req = urllib.request.Request('http://localhost:8082/admin.html')
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        print('HTTP Status:', response.status)
        print('legalView in served HTML:', 'id="legalView"' in html)
        print('Sleek in served HTML:', 'SLEEK' in html)
except Exception as e:
    print('Error:', e)
