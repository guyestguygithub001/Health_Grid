from html.parser import HTMLParser
import sys

class DOMParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.views = ['legalView', 'wardsView', 'labsView', 'billingView']
        self.found = {}
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        self.stack.append((tag, attrs_dict.get('id')))
        if attrs_dict.get('id') in self.views:
            self.found[attrs_dict.get('id')] = [a[0] for a in self.stack]
            
    def handle_endtag(self, tag):
        if self.stack:
            expected = self.stack[-1][0]
            if expected == tag:
                self.stack.pop()
            else:
                # Try to recover or warn
                for i in range(len(self.stack)-1, -1, -1):
                    if self.stack[i][0] == tag:
                        # popped all the way down
                        self.stack = self.stack[:i]
                        break

parser = DOMParser()
with open('public/admin.html', 'r', encoding='utf-8') as f:
    parser.feed(f.read())

for view, path in parser.found.items():
    print(f"Path to {view}: {' -> '.join(path)}")
