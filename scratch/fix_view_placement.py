import re

with open('public/emr.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find the end of mainContent by looking for </main>
main_end_idx = html.rfind('</main>')

# Extract billingView block
# It starts at id="billingView"
# We need to find the full div. We can do this reliably using regex if we know it doesn't contain deeply nested mismatched divs,
# But a safer way is to use JSDOM in node, or just carefully slice.
