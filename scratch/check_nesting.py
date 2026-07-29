import re
html = open('public/emr.html', encoding='utf-8').read()

# Find all <div class="emr-view" ...
matches = list(re.finditer(r'<div[^>]*class="[^"]*emr-view[^"]*"[^>]*id="([^"]+)"', html))
for m in matches:
    print("Found emr-view:", m.group(1), "at", m.start())

# Let's see if the closing tag of one view happens AFTER the opening tag of another view
view_starts = [(m.group(1), m.start()) for m in matches]

for i in range(len(view_starts) - 1):
    current_id, current_start = view_starts[i]
    next_id, next_start = view_starts[i+1]
    
    # Just checking if current view's HTML block extends past the start of the next view.
    # A simple way to check nesting is to see if the next view's ID is INSIDE the current view's outer div.
    # Actually, a better way is to just find the depth of nesting.
