import re

with open('public/portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject the script tag
script_tag = '<script src="/js/apiClient.js"></script>\n<script>'
content = content.replace('<script>', script_tag, 1)

# 2. Delete the local apiCall and getMockData
# We can use regex to remove the functions.
api_call_pattern = r"async function apiCall\(endpoint, options = \{\}\) \{.*?\n    \}"
content = re.sub(api_call_pattern, "", content, flags=re.DOTALL)

get_mock_data_pattern = r"function getMockData\(endpoint, options\) \{.*?\n    \}"
content = re.sub(get_mock_data_pattern, "", content, flags=re.DOTALL)

# 3. Replace all instances of `await apiCall` with `await window.apiClient.request`
content = content.replace('await apiCall(', 'await window.apiClient.request(')
content = content.replace('apiCall(', 'window.apiClient.request(')

with open('public/portal.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Refactored portal.html to use Universal API Client.")
