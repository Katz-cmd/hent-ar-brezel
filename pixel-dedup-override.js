/**
 * Facebook Pixel Global Deduplication Override
 * This script MUST be loaded BEFORE your main application JavaScript
 * It intercepts ALL Facebook Pixel calls and prevents duplicates
 */

(function() {
    'use strict';
    
    console.log('[FB Dedup] Initializing global deduplication override...');
    
    // Global deduplication storage
    window.FB_DEDUP_STORAGE = {
        events: new Map(),
        capiCalls: new Map(),
        pageViewSent: false,
        DEDUP_WINDOW: 5000, // 5 seconds
        debug: true
    };
    
    // Generate unique event ID
    function generateEventId() {
        return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
    
    // Check if this is a duplicate event
    function isDuplicateEvent(eventName, params) {
        const storage = window.FB_DEDUP_STORAGE;
        const eventKey = `${eventName}_${JSON.stringify(params?.content_ids || '')}_${params?.value || ''}_${params?.content_name || ''}`;
        const now = Date.now();
        const lastSent = storage.events.get(eventKey);
        
        if (lastSent && (now - lastSent) < storage.DEDUP_WINDOW) {
            if (storage.debug) {
                console.warn(`[FB Dedup] BLOCKED duplicate event: ${eventName}`, {
                    timeSinceLastSent: now - lastSent,
                    eventKey: eventKey
                });
            }
            return true;
        }
        
        storage.events.set(eventKey, now);
        
        // Clean old entries
        if (storage.events.size > 100) {
            const oldestKey = storage.events.keys().next().value;
            storage.events.delete(oldestKey);
        }
        
        return false;
    }
    
    // Check if this is a duplicate CAPI call
    function isDuplicateCAPI(eventName, eventId) {
        const storage = window.FB_DEDUP_STORAGE;
        const now = Date.now();
        const capiKey = `${eventName}_${eventId}`;
        const lastSent = storage.capiCalls.get(capiKey);
        
        if (lastSent && (now - lastSent) < storage.DEDUP_WINDOW) {
            if (storage.debug) {
                console.warn(`[FB Dedup] BLOCKED duplicate CAPI call: ${eventName}`, {
                    eventId: eventId,
                    timeSinceLastSent: now - lastSent
                });
            }
            return true;
        }
        
        storage.capiCalls.set(capiKey, now);
        
        // Clean old entries
        if (storage.capiCalls.size > 100) {
            const oldestKey = storage.capiCalls.keys().next().value;
            storage.capiCalls.delete(oldestKey);
        }
        
        return false;
    }
    
    // Wait for fbq to be available
    function waitForFbq(callback) {
        if (window.fbq && window.fbq.callMethod) {
            callback();
        } else {
            setTimeout(() => waitForFbq(callback), 100);
        }
    }
    
    // Override fbq when it becomes available
    waitForFbq(function() {
        console.log('[FB Dedup] Facebook Pixel detected, installing override...');
        
        // Store original fbq
        const originalFbq = window.fbq;
        
        // Create our wrapper
        window.fbq = function() {
            const args = Array.from(arguments);
            const command = args[0];
            const eventName = args[1];
            let params = args[2];
            
            // Handle track and trackCustom commands
            if (command === 'track' || command === 'trackCustom') {
                // Special handling for PageView
                if (eventName === 'PageView') {
                    if (window.FB_DEDUP_STORAGE.pageViewSent) {
                        if (window.FB_DEDUP_STORAGE.debug) {
                            console.warn('[FB Dedup] BLOCKED duplicate PageView event');
                        }
                        return;
                    }
                    window.FB_DEDUP_STORAGE.pageViewSent = true;
                } else {
                    // Check for duplicates on other events
                    if (isDuplicateEvent(eventName, params)) {
                        return; // Block duplicate
                    }
                }
                
                // Ensure unique event ID
                if (params && typeof params === 'object') {
                    if (!params.eventID) {
                        params.eventID = generateEventId();
                    }
                } else {
                    params = { eventID: generateEventId() };
                    args[2] = params;
                }
                
                if (window.FB_DEDUP_STORAGE.debug) {
                    console.log(`[FB Dedup] ✅ Allowing event: ${eventName}`, {
                        eventID: params.eventID,
                        params: params
                    });
                }
            }
            
            // Call original fbq
            return originalFbq.apply(this, args);
        };
        
        // Copy all properties from original fbq
        for (let key in originalFbq) {
            if (originalFbq.hasOwnProperty(key)) {
                window.fbq[key] = originalFbq[key];
            }
        }
        
        console.log('[FB Dedup] Override installed successfully');
    });
    
    // Override fetch to intercept CAPI calls
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        // Check if this is a CAPI call
        if (url && url.includes('capiworker') && options && options.method === 'POST') {
            try {
                const body = JSON.parse(options.body);
                if (body.event_name && body.event_id) {
                    if (isDuplicateCAPI(body.event_name, body.event_id)) {
                        // Return fake successful response for blocked CAPI calls
                        return Promise.resolve(new Response(JSON.stringify({
                            success: true,
                            blocked: true,
                            reason: 'duplicate_event'
                        }), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        }));
                    }
                }
            } catch (e) {
                // If we can't parse the body, let it through
            }
        }
        
        // Call original fetch
        return originalFetch.apply(this, arguments);
    };
    
    // Also override XMLHttpRequest just in case
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url) {
        this._url = url;
        this._method = method;
        return originalOpen.apply(this, arguments);
    };
    
    XMLHttpRequest.prototype.send = function(body) {
        if (this._url && this._url.includes('capiworker') && this._method === 'POST') {
            try {
                const data = JSON.parse(body);
                if (data.event_name && data.event_id) {
                    if (isDuplicateCAPI(data.event_name, data.event_id)) {
                        // Don't send duplicate CAPI calls
                        console.warn('[FB Dedup] BLOCKED duplicate CAPI XHR call');
                        return;
                    }
                }
            } catch (e) {
                // If we can't parse the body, let it through
            }
        }
        
        return originalSend.apply(this, arguments);
    };
    
    console.log('[FB Dedup] Global deduplication override ready');
    
    // Expose control functions for debugging
    window.FB_DEDUP_CONTROL = {
        clearCache: function() {
            window.FB_DEDUP_STORAGE.events.clear();
            window.FB_DEDUP_STORAGE.capiCalls.clear();
            console.log('[FB Dedup] Cache cleared');
        },
        setDebug: function(enabled) {
            window.FB_DEDUP_STORAGE.debug = enabled;
            console.log(`[FB Dedup] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
        },
        getStats: function() {
            return {
                eventsInCache: window.FB_DEDUP_STORAGE.events.size,
                capiCallsInCache: window.FB_DEDUP_STORAGE.capiCalls.size,
                pageViewSent: window.FB_DEDUP_STORAGE.pageViewSent,
                dedupWindow: window.FB_DEDUP_STORAGE.DEDUP_WINDOW
            };
        }
    };
})();