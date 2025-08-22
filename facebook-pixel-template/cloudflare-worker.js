/**
 * Facebook Conversions API Worker for Cloudflare
 * Version: 1.0.0
 * 
 * This worker handles server-side event tracking for Facebook Pixel
 * Deploy this to Cloudflare Workers and set the required environment variables
 */

export default {
  async fetch(request, env) {
    // Get the origin from the request for CORS
    const origin = request.headers.get('Origin') || '*';
    
    // Configuration from environment variables
    const config = {
      pixelId: env.PIXEL_ID || 'YOUR_PIXEL_ID',
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
          message: 'Please provide event_name in the request body'
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

      // Send to Facebook Conversions API
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

// Helper function to hash values using SHA-256
async function hashValue(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check if value is already hashed (64 character hex string)
function isHashed(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
}

// Process events and prepare them for Facebook
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
    const customFields = ['value', 'currency', 'content_ids', 'content_type', 
                         'content_name', 'content_category', 'num_items', 'contents'];
    
    for (const field of customFields) {
      if (event[field] !== undefined) {
        processedEvent.custom_data[field] = event[field];
      }
    }
    
    processedEvents.push(processedEvent);
  }
  
  return processedEvents;
}

// Process and hash user data for privacy
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
  
  // Hash other PII fields if provided
  const piiFields = ['fn', 'ln', 'ct', 'st', 'zp', 'country'];
  for (const field of piiFields) {
    if (processed[field] && !isHashed(processed[field])) {
      processed[field] = await hashValue(processed[field].toLowerCase().trim());
    }
  }
  
  // Keep Facebook cookies if provided (don't hash these)
  if (processed.fbc) processed.fbc = processed.fbc;
  if (processed.fbp) processed.fbp = processed.fbp;
  
  return processed;
}

// Generate unique event ID for deduplication
function generateEventId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}