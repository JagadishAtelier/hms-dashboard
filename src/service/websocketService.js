// src/service/websocketService.js
import BASE_API from "../api/baseurl.js";

function getWsUrl() {
  if (typeof window === "undefined") return "";

  let base = BASE_API || "";
  let protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

  if (base.startsWith("https://")) {
    base = base.replace(/^https:\/\//, "wss://");
  } else if (base.startsWith("http://")) {
    base = base.replace(/^http:\/\//, "ws://");
  } else {
    base = `${protocol}//${window.location.host}`;
  }

  // Strip trailing /api/v1 or /api/v1/
  base = base.replace(/\/api\/v1\/?$/, "");
  return `${base}/ws/alerts`;
}

class WebSocketService {
  constructor() {
    this.socket = null;
    this.subscribers = new Set();
    this.reconnectTimer = null;
    this.reconnectDelay = 2000;
    this.maxReconnectDelay = 16000;
    this.isExplicitlyClosed = false;
  }

  connect() {
    if (typeof window === "undefined") return;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;
    const wsUrl = getWsUrl();

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.reconnectDelay = 2000;
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.notifySubscribers(payload);
        } catch (err) {
          // ignore non-json payloads
        }
      };

      this.socket.onclose = () => {
        this.socket = null;
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = () => {
        if (this.socket) {
          this.socket.close();
        }
      };
    } catch (err) {
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
      this.connect();
    }, this.reconnectDelay);
  }

  notifySubscribers(event) {
    for (const callback of this.subscribers) {
      try {
        callback(event);
      } catch (err) {
        console.error("Error in websocket subscriber callback:", err);
      }
    }
  }

  /**
   * Subscribe to real-time events.
   * Returns an unsubscribe function.
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    // Automatically ensure socket is connected if listeners exist
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.connect();
    }

    return () => {
      this.subscribers.delete(callback);
    };
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }

  disconnect() {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

const websocketService = new WebSocketService();
export default websocketService;

