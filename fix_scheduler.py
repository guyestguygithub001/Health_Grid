import re

with open('public/portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the slot.time to slot.start bug
content = content.replace("slot.time", "slot.start")

# Make the date pills and time pills sleeker with CSS
custom_css = """
    /* Scheduler Enhancements */
    .date-scroll {
      display: flex; overflow-x: auto; gap: 12px; padding-bottom: 12px;
      scrollbar-width: none;
    }
    .date-scroll::-webkit-scrollbar { display: none; }
    
    .date-pill {
      min-width: 72px; text-align: center; padding: 14px 10px;
      border-radius: 16px; border: 1px solid rgba(14, 165, 233, 0.2);
      cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      background: rgba(255, 255, 255, 0.7);
    }
    .date-pill:hover {
      background: rgba(255, 255, 255, 1);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1);
    }
    .date-pill.selected {
      background: linear-gradient(135deg, #2563EB, #1d4ed8);
      color: white; border-color: transparent;
      box-shadow: 0 8px 20px rgba(37,99,235,0.3);
      transform: scale(1.05);
    }
    .date-pill.selected > div { color: white !important; }

    .time-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 12px; margin-top: 16px;
    }
    .time-pill {
      padding: 12px; text-align: center; border-radius: 12px;
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
      border: 1px solid rgba(14, 165, 233, 0.2);
      transition: all 0.2s;
    }
    .time-pill.available {
      background: rgba(255, 255, 255, 0.8); color: #1e293b;
    }
    .time-pill.available:hover {
      border-color: #2563EB; background: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37,99,235,0.1);
    }
    .time-pill.selected {
      background: #2563EB; color: white; border-color: transparent;
      box-shadow: 0 4px 15px rgba(37,99,235,0.3);
      transform: scale(1.05);
    }
    .time-pill.booked {
      background: rgba(0, 0, 0, 0.05); color: #94a3b8;
      border-color: transparent; cursor: not-allowed; text-decoration: line-through;
    }
"""

if "/* Scheduler Enhancements */" not in content:
    content = content.replace('</style>', custom_css + '\n</style>')

with open('public/portal.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: Fixed slot.start bug and injected sleek scheduler CSS.")
