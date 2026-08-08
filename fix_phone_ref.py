import re

with open('server/patient-api.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix ReferenceError: phone is not defined in query arrays for OTP endpoints
content = content.replace("[phone]", "[contact]")
content = content.replace(", phone]", ", contact]")
content = content.replace(", phone)", ", contact)")

with open('server/patient-api.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Fixed ReferenceError for phone.")
