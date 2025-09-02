"use client"

// Real-time session management using WebSocket
export interface SessionEvent {
  type: 'session_update' | 'force_logout' | 'session_warning' | 'activity_update';
  data: any;
  timestamp: number;
}

export interface SessionStatus {
  sessionId: string;
  userId: string;
  isActive: boolean;
  lastActivity: number;
  expiresAt: number;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
    location?: string;
  };
}

export class RealtimeSessionManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private pingInterval: NodeJS.Timeout | null = null;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private listeners: Map<string, ((event: SessionEvent) => void)[]> = new Map();
  
  constructor(
    private sessionId: string,
    private accessToken: string
  ) {}

  // Connect to WebSocket server
  connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/ws/session?token=${this.accessToken}`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('📡 Session WebSocket connected');
          this.reconnectAttempts = 0;
          this.startPingPong();
          this.startSessionCheck();
          resolve(true);
        };
        
        this.ws.onmessage = (event) => {
          try {
            const sessionEvent: SessionEvent = JSON.parse(event.data);
            this.handleSessionEvent(sessionEvent);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
        
        this.ws.onclose = () => {
          console.log('📡 Session WebSocket disconnected');
          this.cleanup();
          this.attemptReconnect();
        };
        
        this.ws.onerror = (error) => {
          console.error('📡 Session WebSocket error:', error);
          reject(error);
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.cleanup();
  }

  // Send session activity update
  updateActivity(action?: string, page?: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'activity_update',
        data: {
          sessionId: this.sessionId,
          timestamp: Date.now(),
          action,
          page: page || window.location.pathname,
        }
      };
      
      this.ws.send(JSON.stringify(message));
    }
  }

  // Request session status
  requestSessionStatus() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'get_session_status',
        data: { sessionId: this.sessionId }
      };
      
      this.ws.send(JSON.stringify(message));
    }
  }

  // Add event listener
  addEventListener(eventType: string, callback: (event: SessionEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  // Remove event listener
  removeEventListener(eventType: string, callback: (event: SessionEvent) => void) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Handle session events
  private handleSessionEvent(event: SessionEvent) {
    console.log('📡 Session event received:', event);
    
    switch (event.type) {
      case 'force_logout':
        this.handleForceLogout(event.data);
        break;
      case 'session_warning':
        this.handleSessionWarning(event.data);
        break;
      case 'session_update':
        this.handleSessionUpdate(event.data);
        break;
      case 'activity_update':
        this.handleActivityUpdate(event.data);
        break;
    }
    
    // Notify listeners
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
  }

  // Handle force logout
  private handleForceLogout(data: any) {
    console.warn('🔒 Force logout received:', data.reason);
    
    // Clear local storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = `/auth/login?reason=${encodeURIComponent(data.reason || 'session_terminated')}`;
  }

  // Handle session warning
  private handleSessionWarning(data: any) {
    console.warn('⚠️ Session warning:', data);
    
    // Show user notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Session Warning', {
        body: data.message || 'Your session will expire soon',
        icon: '/favicon.ico'
      });
    }
  }

  // Handle session update
  private handleSessionUpdate(data: SessionStatus) {
    console.log('📊 Session updated:', data);
    
    // Update local session information
    sessionStorage.setItem('sessionStatus', JSON.stringify(data));
  }

  // Handle activity update
  private handleActivityUpdate(data: any) {
    console.log('🎯 Activity update:', data);
  }

  // Start ping-pong to keep connection alive
  private startPingPong() {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds
  }

  // Start periodic session check
  private startSessionCheck() {
    this.sessionCheckInterval = setInterval(() => {
      this.requestSessionStatus();
    }, 60000); // Check every minute
  }

  // Attempt to reconnect
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`📡 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        this.connect().catch(() => {
          // Continue reconnection attempts
        });
      }, delay);
    } else {
      console.error('📡 Max reconnection attempts reached');
    }
  }

  // Cleanup intervals and timers
  private cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }
}

// Browser activity monitoring
export class ActivityMonitor {
  private lastActivity = Date.now();
  private inactiveThreshold = 5 * 60 * 1000; // 5 minutes
  private checkInterval: NodeJS.Timeout | null = null;
  private listeners: (() => void)[] = [];
  
  constructor(
    private sessionManager: RealtimeSessionManager,
    private onInactive?: () => void
  ) {}

  // Start monitoring user activity
  start() {
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 
      'touchstart', 'click', 'focus', 'blur'
    ];

    const updateActivity = () => {
      const now = Date.now();
      if (now - this.lastActivity > 60000) { // Only update every minute
        this.lastActivity = now;
        this.sessionManager.updateActivity('user_activity');
        
        // Notify listeners
        this.listeners.forEach(listener => listener());
      }
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Store cleanup function
    this.cleanup = () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };

    // Start inactivity check
    this.startInactivityCheck();
  }

  // Stop monitoring
  stop() {
    if (this.cleanup) {
      this.cleanup();
    }
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Add activity listener
  addActivityListener(callback: () => void) {
    this.listeners.push(callback);
  }

  // Remove activity listener
  removeActivityListener(callback: () => void) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Get last activity time
  getLastActivity(): Date {
    return new Date(this.lastActivity);
  }

  // Check if user is currently active
  isActive(): boolean {
    return Date.now() - this.lastActivity < this.inactiveThreshold;
  }

  // Start checking for inactivity
  private startInactivityCheck() {
    this.checkInterval = setInterval(() => {
      if (!this.isActive() && this.onInactive) {
        this.onInactive();
      }
    }, 60000); // Check every minute
  }

  private cleanup?: () => void;
}

// Multi-tab session synchronization
export class MultiTabSync {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  
  constructor(private channelName = 'elevate360-session') {}

  // Initialize multi-tab sync
  init() {
    if ('BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(this.channelName);
      
      this.channel.onmessage = (event) => {
        const { type, data } = event.data;
        this.handleMessage(type, data);
      };
    }
  }

  // Send message to other tabs
  sendMessage(type: string, data: any) {
    if (this.channel) {
      this.channel.postMessage({ type, data, timestamp: Date.now() });
    }
  }

  // Add message listener
  addListener(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }

  // Handle incoming messages
  private handleMessage(type: string, data: any) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Cleanup
  destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}

// Session notification system
export class SessionNotifications {
  private permission: NotificationPermission = 'default';
  
  constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    }
    return false;
  }

  // Show session warning notification
  showSessionWarning(message: string, timeLeft?: number) {
    if (this.permission === 'granted') {
      const title = 'Session Warning';
      const body = timeLeft 
        ? `${message} (${Math.ceil(timeLeft / 60)} minutes remaining)`
        : message;
        
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'session-warning',
        requireInteraction: true,
      });
    }
  }

  // Show session expired notification
  showSessionExpired() {
    if (this.permission === 'granted') {
      new Notification('Session Expired', {
        body: 'Your session has expired. Please log in again.',
        icon: '/favicon.ico',
        tag: 'session-expired',
        requireInteraction: true,
      });
    }
  }

  // Show security alert
  showSecurityAlert(message: string) {
    if (this.permission === 'granted') {
      new Notification('Security Alert', {
        body: message,
        icon: '/favicon.ico',
        tag: 'security-alert',
        requireInteraction: true,
      });
    }
  }
}
