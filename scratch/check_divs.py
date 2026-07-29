from html.parser import HTMLParser

class DivCounter(HTMLParser):
    def __init__(self):
        super().__init__()
        self.div_depth = 0
        self.view_depths = {}
        self.current_view = None
        self.in_main = False
        self.main_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag == 'main':
            self.in_main = True
            self.main_depth = self.div_depth
        
        if tag == 'div':
            self.div_depth += 1
            
            # Check if this div is an ehr-view
            is_view = False
            view_id = None
            for attr in attrs:
                if attr[0] == 'class' and 'ehr-view' in attr[1]:
                    is_view = True
                if attr[0] == 'id':
                    view_id = attr[1]
            
            if is_view and view_id:
                self.view_depths[view_id] = self.div_depth
                print(f"Started view {view_id} at depth {self.div_depth}")

    def handle_endtag(self, tag):
        if tag == 'div':
            self.div_depth -= 1
        if tag == 'main':
            self.in_main = False
            print(f"Ended main at div depth {self.div_depth}. Expected {self.main_depth}")

parser = DivCounter()
with open('public/command.html', 'r', encoding='utf-8') as f:
    parser.feed(f.read())
