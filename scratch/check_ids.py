import re
html = open('public/emr.html', encoding='utf-8').read()
print("Billing Btn:", len(re.findall(r"switchEmrView\('billingView'\)", html)))
print("Records Btn:", len(re.findall(r"switchEmrView\('recordsMainView'\)", html)))
print("Billing Div:", len(re.findall(r'id="billingView"', html)))
print("Records Div:", len(re.findall(r'id="recordsMainView"', html)))

# Let's also check if they are nested inside another .emr-view!
# A common bug is pasting a view INSIDE another view.
