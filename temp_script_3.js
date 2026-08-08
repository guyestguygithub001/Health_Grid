
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
  