import os
import re

error_handler = """
  <!-- Global Error Handler -->
  <style>
    #global-error-toast {
      position: fixed;
      bottom: -100px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4);
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      z-index: 999999;
      transition: bottom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      max-width: 400px;
    }
    #global-error-toast.show {
      bottom: 20px;
    }
    #global-error-toast .close-btn {
      margin-left: auto;
      cursor: pointer;
      font-weight: bold;
      opacity: 0.8;
    }
    #global-error-toast .close-btn:hover {
      opacity: 1;
    }
  </style>
  <div id="global-error-toast">
    <span>⚠️</span>
    <span id="global-error-msg">An unexpected error occurred.</span>
    <span class="close-btn" onclick="document.getElementById('global-error-toast').classList.remove('show')">✕</span>
  </div>
  <script>
    window.showGlobalError = function(msg) {
      const toast = document.getElementById('global-error-toast');
      const msgEl = document.getElementById('global-error-msg');
      if(toast && msgEl) {
        msgEl.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 5000);
      } else {
        console.error("Global error:", msg);
      }
    };
    window.addEventListener('error', function(event) {
      window.showGlobalError(event.message || 'A script error occurred.');
    });
    window.addEventListener('unhandledrejection', function(event) {
      window.showGlobalError(event.reason ? (event.reason.message || event.reason) : 'An asynchronous error occurred.');
    });
    
    // Intercept fetch to catch network errors globally
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      try {
        const response = await originalFetch.apply(this, args);
        if(!response.ok && response.status >= 500) {
           window.showGlobalError(`Server Error: ${response.status} ${response.statusText}`);
        }
        return response;
      } catch (err) {
        window.showGlobalError('Network Error: Unable to reach the server.');
        throw err;
      }
    };
  </script>
  <!-- End Global Error Handler -->
"""

files = ['public/command.html', 'public/emr.html', 'public/portal.html', 'public/index.html']

for file in files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if 'Global Error Handler' not in content:
            # Inject just before </body>
            if '</body>' in content:
                content = content.replace('</body>', error_handler + '\n</body>')
            else:
                content += error_handler
                
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Injected into {file}")
        else:
            print(f"Already injected in {file}")
