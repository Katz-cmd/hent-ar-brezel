// Simplified Facebook Conversions API Worker for Cloudflare
export default {
  async fetch(request, env) {
    // Configuration
    const config = {
      allowedOrigins: (env.CORS_ORIGIN || 'https://hentarbrezel.com').split(','),
      pixelId: env.PIXEL_ID || '1452655989058364',
      accessToken: env.FB_ACCESS_TOKEN,
      apiVersion: 'v19.0'
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204, getOrigin(request, config.allowedOrigins));
    }

    // Validate access token
    if (!config.accessToken) {
      return errorResponse('FB_ACCESS_TOKEN not configured', 500, getOrigin(request, config.allowedOrigins));
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return errorResponse('Method not allowed', 405, getOrigin(request, config.allowedOrigins));
    }

    try {
      // Parse request body
      const body = await request.json();
      
      // Extract request metadata
      const metadata = {
        ip: request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '',
        userAgent: request.headers.get('User-Agent') || '',
        referer: request.headers.get('Referer') || '',
        origin: getOrigin(request, config.allowedOrigins)
      };

      // Process events
      const events = await processEvents(body, metadata);
      
      if (!events.length) {
        return errorResponse('No valid events to process', 400, metadata.origin);
      }

      // Get test event code if provided
      const testEventCode = getTestEventCode(request, body);

      // Send to Facebook
      const result = await sendToFacebook(events, config, testEventCode);
      
      return corsResponse({
        success: result.success,
        events_processed: events.length,
        fb_response: result.data
      }, result.success ? 200 : 500, metadata.origin);

    } catch (error) {
      console.error('Worker error:', error);
      return errorResponse(error.message, 500, getOrigin(request, config.allowedOrigins));
    }
  }
};

// Helper Functions

function getOrigin(request, allowedOrigins) {
  const origin = request.headers.get('Origin');
  if (!origin) return allowedOrigins[0];
  
  // Check if origin is in allowed list
  for (const allowed of allowedOrigins) {
    if (allowed === '*' || origin === allowed || origin.endsWith(allowed.replace('https://', '.'))) {
      return origin;
    }
  }
  return allowedOrigins[0];
}

function corsResponse(data, status = 200, origin = '*') {
  return new Response(data ? JSON.stringify(data) : null, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

function errorResponse(message, status = 400, origin = '*') {
  return corsResponse({ error: message, status }, status, origin);
}

async function hashValue(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function isHashed(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
}

async function processEvents(body, metadata) {
  // Support both single event and array of events
  const rawEvents = Array.isArray(body.data) ? body.data : [body];
  
  const processedEvents = [];
  
  for (const event of rawEvents) {
    // Skip if no event name
    if (!event.event_name && !event.event) continue;
    
    // Build event object
    const processedEvent = {
      event_name: event.event_name || event.event,
      event_time: event.event_time || Math.floor(Date.now() / 1000),
      event_id: event.event_id || event.eventID || generateEventId(),
      action_source: event.action_source || 'website',
      event_source_url: event.event_source_url || event.url || metadata.referer,
      user_data: await processUserData(event.user_data || {}, metadata),
      custom_data: event.custom_data || {}
    };
    
    processedEvents.push(processedEvent);
  }
  
  return processedEvents;
}

async function processUserData(userData, metadata) {
  const processed = {
    ...userData,
    client_ip_address: userData.client_ip_address || metadata.ip,
    client_user_agent: userData.client_user_agent || metadata.userAgent
  };
  
  // Hash email if not already hashed
  if (processed.em && !isHashed(processed.em)) {
    processed.em = await hashValue(processed.em.toLowerCase().trim());
  }
  
  // Hash phone if not already hashed (remove non-digits first)
  if (processed.ph && !isHashed(processed.ph)) {
    const cleanPhone = processed.ph.toString().replace(/\D/g, '');
    processed.ph = await hashValue(cleanPhone);
  }
  
  // Hash external_id if not already hashed
  if (processed.external_id && !isHashed(processed.external_id)) {
    processed.external_id = await hashValue(processed.external_id.toString().trim());
  }
  
  // Add Facebook cookies if provided
  if (processed.fbc) processed.fbc = processed.fbc;
  if (processed.fbp) processed.fbp = processed.fbp;
  
  return processed;
}

function generateEventId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function getTestEventCode(request, body) {
  return new URL(request.url).searchParams.get('test_event_code') ||
         request.headers.get('x-fb-test-event-code') ||
         body.test_event_code ||
         null;
}

async function sendToFacebook(events, config, testEventCode) {
  const url = `https://graph.facebook.com/${config.apiVersion}/${config.pixelId}/events`;
  
  const payload = {
    data: events,
    access_token: config.accessToken
  };
  
  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('Facebook API error:', error);
    return {
      success: false,
      status: 500,
      data: { error: error.message }
    };
  }
}