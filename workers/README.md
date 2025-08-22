# Facebook Conversions API Worker for Cloudflare

This Cloudflare Worker handles server-side tracking for Facebook Pixel using the Conversions API (CAPI).

## Features

- ✅ Simplified and optimized code
- ✅ Automatic SHA-256 hashing for PII (email, phone, external_id)
- ✅ CORS support with configurable origins
- ✅ Test event code support for debugging
- ✅ Error handling and logging
- ✅ Support for both single events and batch events
- ✅ Automatic event ID generation for deduplication

## Setup Instructions

### 1. Deploy to Cloudflare Workers

1. Log in to your Cloudflare dashboard
2. Go to Workers & Pages
3. Create a new Worker
4. Copy the contents of `capi-worker.js` and paste into the editor
5. Save and deploy

### 2. Configure Environment Variables

In your Worker settings, add these environment variables:

- `FB_ACCESS_TOKEN` (Required): Your Facebook Conversions API access token
  - Get this from Facebook Events Manager > Settings > Conversions API
- `PIXEL_ID` (Optional): Your Facebook Pixel ID (default: 1452655989058364)
- `CORS_ORIGIN` (Optional): Allowed origins, comma-separated (default: https://hentarbrezel.com)

### 3. Update Your Website

Update the `capiEndpoint` in your website's index.html:

```javascript
window.FB_CONFIG = {
    pixelId: 'YOUR_PIXEL_ID',
    capiEndpoint: 'https://your-worker.your-subdomain.workers.dev',
    testEventCode: '', // Add test code when testing
    debug: false // Set to true for console logging
};
```

## Testing

### 1. Using Facebook Test Events

1. Go to Facebook Events Manager
2. Select your pixel
3. Go to "Test events" tab
4. Copy the test event code
5. Add it to your website config:
   ```javascript
   testEventCode: 'TEST12345'
   ```

### 2. Using the Diagnostic Tool

Access the diagnostic tool at:
- `/fb-pixel-diagnostic.html` - Full diagnostic suite
- `/pixel-test.html` - Simple testing interface

### 3. Verify in Events Manager

1. Check the Events Manager for incoming events
2. Look for events in the "Test events" section if using test code
3. Monitor the "Diagnostics" tab for any issues

## Common Issues and Solutions

### Issue: Events not appearing in Events Manager
- **Check**: Is the `FB_ACCESS_TOKEN` correctly set in Worker environment?
- **Check**: Is the Worker URL correct in your website config?
- **Check**: Are there any CORS errors in browser console?

### Issue: Duplicate events
- **Solution**: The worker generates unique event IDs automatically
- **Check**: Ensure you're not calling `fbq()` multiple times for the same action

### Issue: User data not matching
- **Solution**: The worker automatically hashes email, phone, and external_id
- **Note**: Email should be lowercase and trimmed before hashing
- **Note**: Phone should have all non-digits removed before hashing

### Issue: CORS errors
- **Check**: Is your domain in the `CORS_ORIGIN` environment variable?
- **Solution**: Add your domain to the allowed origins list

## API Endpoint

### POST `/`

Send events to Facebook Conversions API.

**Request Body:**
```json
{
  "event_name": "Purchase",
  "event_time": 1234567890,
  "event_id": "unique-id",
  "action_source": "website",
  "event_source_url": "https://example.com/product",
  "user_data": {
    "em": "user@example.com",
    "ph": "+1234567890",
    "fbp": "_fbp.cookie.value",
    "fbc": "_fbc.cookie.value"
  },
  "custom_data": {
    "value": 99.99,
    "currency": "EUR",
    "content_ids": ["PRODUCT_ID"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "events_processed": 1,
  "fb_response": {
    "events_received": 1,
    "messages": []
  }
}
```

## Security Notes

1. **Never expose your access token** in client-side code
2. **Use environment variables** for sensitive configuration
3. **Implement rate limiting** if expecting high traffic
4. **Monitor usage** in Facebook Events Manager

## Support

For issues or questions:
1. Check Facebook's [Conversions API documentation](https://developers.facebook.com/docs/marketing-api/conversions-api)
2. Use the Facebook Pixel Helper Chrome extension
3. Check Worker logs in Cloudflare dashboard