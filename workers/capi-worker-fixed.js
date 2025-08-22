// Facebook Conversions API Worker for Cloudflare - Fixed CORS Version
export default {
  async fetch(request, env) {
    // Get the origin from the request
    const origin = request.headers.get('Origin') || '*';
    
    // Configuration
    const config = {
      pixelId: env.PIXEL_ID || '1452655989058364',
      accessToken: env.FB_ACCESS_TOKEN,
      apiVersion: 'v19.0'
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Validate access token
    if (!config.accessToken) {
      return new Response(JSON.stringify({ 
        error: 'FB_ACCESS_TOKEN not configured',
        message: 'Please set the FB_ACCESS_TOKEN environment variable in Cloudflare Workers settings'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ 
        error: 'Method not allowed',
        message: 'Only POST requests are accepted'
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    try {
      // Parse request body
      const body = await request.json();
      
      // Extract request metadata
      const ip = request.headers.get('CF-Connecting-IP') || 
                 request.headers.get('X-Forwarded-For') || 
                 request.headers.get('X-Real-IP') || '';
      const userAgent = request.headers.get('User-Agent') || '';
      const referer = request.headers.get('Referer') || '';

      // Process events (support both single event and array)
      const events = await processEvents(body, { ip, userAgent, referer });
      
      if (!events.length) {
        return new Response(JSON.stringify({ 
          error: 'No valid events to process',
          message: 'Please provide event_name or event in the request body'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Get test event code if provided
      const testEventCode = 
        new URL(request.url).searchParams.get('test_event_code') ||
        request.headers.get('x-fb-test-event-code') ||
        body.test_event_code ||
        null;

      // Send to Facebook
      const fbUrl = `https://graph.facebook.com/${config.apiVersion}/${config.pixelId}/events`;
      
      const fbPayload = {
        data: events,
        access_token: config.accessToken
      };
      
      if (testEventCode) {
        fbPayload.test_event_code = testEventCode;
      }

      const fbResponse = await fetch(fbUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fbPayload)
      });
      
      const fbResult = await fbResponse.json();
      
      // Return response with CORS headers
      return new Response(JSON.stringify({
        success: fbResponse.ok,
        events_processed: events.length,
        fb_response: fbResult,
        fb_status: fbResponse.status
      }), {
        status: fbResponse.ok ? 200 : 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};

// Helper function to hash values
async function hashValue(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check if value is already hashed
function isHashed(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
}

// Process events
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
      event_source_url: event.event_source_url || event.url || metadata.referer || '',
      user_data: await processUserData(event.user_data || {}, metadata),
      custom_data: event.custom_data || {}
    };
    
    // Handle custom data that might be at the root level
    if (event.value !== undefined) processedEvent.custom_data.value = event.value;
    if (event.currency) processedEvent.custom_data.currency = event.currency;
    if (event.content_ids) processedEvent.custom_data.content_ids = event.content_ids;
    if (event.content_type) processedEvent.custom_data.content_type = event.content_type;
    if (event.content_name) processedEvent.custom_data.content_name = event.content_name;
    if (event.num_items) processedEvent.custom_data.num_items = event.num_items;
    if (event.contents) processedEvent.custom_data.contents = event.contents;
    
    processedEvents.push(processedEvent);
  }
  
  return processedEvents;
}

// Process user data
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
  
  // Hash first name if provided
  if (processed.fn && !isHashed(processed.fn)) {
    processed.fn = await hashValue(processed.fn.toLowerCase().trim());
  }
  
  // Hash last name if provided
  if (processed.ln && !isHashed(processed.ln)) {
    processed.ln = await hashValue(processed.ln.toLowerCase().trim());
  }
  
  // Hash city if provided
  if (processed.ct && !isHashed(processed.ct)) {
    processed.ct = await hashValue(processed.ct.toLowerCase().trim());
  }
  
  // Hash state if provided
  if (processed.st && !isHashed(processed.st)) {
    processed.st = await hashValue(processed.st.toLowerCase().trim());
  }
  
  // Hash zip if provided
  if (processed.zp && !isHashed(processed.zp)) {
    processed.zp = await hashValue(processed.zp.toLowerCase().trim());
  }
  
  // Hash country if provided (2-letter code)
  if (processed.country && !isHashed(processed.country)) {
    processed.country = await hashValue(processed.country.toLowerCase().trim());
  }
  
  // Keep Facebook cookies if provided
  if (processed.fbc) processed.fbc = processed.fbc;
  if (processed.fbp) processed.fbp = processed.fbp;
  
  return processed;
}

// Generate unique event ID
function generateEventId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}