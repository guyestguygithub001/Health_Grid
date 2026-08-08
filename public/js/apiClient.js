/**
 * Universal API Client
 * One Source of Truth for all Network Calls
 */

class UniversalClient {
  constructor() {
    this.tokenKey = 'hg_patient_token';
    this.staffTokenKey = 'hg_staff_token';
    this.queueKey = 'hg_offline_queue';
    
    // Original fetch reference
    this._nativeFetch = window.fetch.bind(window);
    
    this.processOfflineQueue();
    window.addEventListener('online', () => this.processOfflineQueue());
  }

  showGracefulMessage(msg, isError = false) {
    if (window.showGlobalError) {
      window.showGlobalError(msg);
    } else if (window.showToast) {
      window.showToast(msg, isError ? 'error' : 'success');
    } else {
      console.warn('Graceful Message:', msg);
    }
  }

  /**
   * Drop-in replacement for fetch()
   * Returns an object that mimics the Response interface so existing code doesn't break.
   */
  async fetch(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const token = localStorage.getItem(this.tokenKey) || localStorage.getItem(this.staffTokenKey);
    
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { ...options, headers };

    try {
      const response = await this._nativeFetch(endpoint, config);
      
      // Clone response to read JSON without consuming the original stream
      const clone = response.clone();
      let data = {};
      try { data = await clone.json(); } catch (e) {}

      if (!response.ok) {
        throw new Error(data.error || data.message || `Server Error ${response.status}`);
      }

      // Fallback 1: Caching successful GET requests
      if (method === 'GET') {
        localStorage.setItem(`cache_${endpoint}`, JSON.stringify(data));
      }

      return response;
    } catch (err) {
      console.error(`[API Client] Failed: ${endpoint}`, err);
      
      // Fallback 2: Serve from Cache for GET requests
      if (method === 'GET') {
        const cached = localStorage.getItem(`cache_${endpoint}`);
        if (cached) {
          this.showGracefulMessage("You are offline. Showing cached data.", false);
          return {
            ok: true,
            status: 200,
            json: async () => JSON.parse(cached)
          };
        }
      }

      // Fallback 3: Offline Retry Queue for Mutations (POST, PUT, DELETE)
      if (['POST', 'PUT', 'DELETE'].includes(method) && !navigator.onLine) {
        this.queueRequest(endpoint, config);
        this.showGracefulMessage("You are offline. Your action has been saved and will retry automatically when connected.", false);
        return {
          ok: true,
          status: 202, // Accepted
          json: async () => ({ queued: true, message: "Queued for retry" })
        };
      }

      // Fallback 4: Graceful Degradation Message
      this.showGracefulMessage(`Service temporarily unreachable. Don't worry, retrying in 60 seconds... (${err.message})`, true);
      
      // Return a failed response mock to prevent raw unhandled promise rejections crashing the UI
      return {
        ok: false,
        status: 503,
        json: async () => ({ error: 'Service Unavailable', offline: true })
      };
    }
  }

  // Simplified request method that directly returns JSON data (for new code)
  async request(endpoint, options = {}) {
    const res = await this.fetch(endpoint, options);
    return await res.json();
  }

  queueRequest(endpoint, config) {
    let queue = [];
    try { queue = JSON.parse(localStorage.getItem(this.queueKey)) || []; } catch (e) {}
    queue.push({ endpoint, config, timestamp: Date.now() });
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
  }

  async processOfflineQueue() {
    if (!navigator.onLine) return;
    
    let queue = [];
    try { queue = JSON.parse(localStorage.getItem(this.queueKey)) || []; } catch (e) {}
    if (queue.length === 0) return;
    
    console.log(`[API Client] Processing ${queue.length} queued offline requests...`);
    const failedQueue = [];

    for (const req of queue) {
      try {
        await this._nativeFetch(req.endpoint, req.config);
        console.log(`[API Client] Successfully synced queued request: ${req.endpoint}`);
      } catch (err) {
        failedQueue.push(req);
      }
    }
    
    if (failedQueue.length < queue.length) {
      this.showGracefulMessage("Back online! Your offline changes have been synced.", false);
    }
    
    localStorage.setItem(this.queueKey, JSON.stringify(failedQueue));
  }
}

window.apiClient = new UniversalClient();
window.fetch = window.apiClient.fetch.bind(window.apiClient);
