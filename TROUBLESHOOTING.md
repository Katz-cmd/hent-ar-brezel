# Facebook Pixel CAPI Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Issue: "Network error: Failed to fetch"

This error means the browser cannot connect to your Cloudflare Worker. Here's how to fix it:

#### Solution 1: Check if Worker is Deployed

1. **Verify the Worker URL**:
   - Current configured URL: `https://capiworker.elhallaoui-mohamed1.workers.dev/`
   - Open this URL directly in your browser
   - You should see an error message (since it only accepts POST requests)
   - If you get "Site cannot be reached", the worker isn't deployed

2. **Deploy the Worker**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to Workers & Pages
   - Create new Worker named `capiworker`
   - Copy the code from `workers/capi-worker-fixed.js` (the fixed CORS version)
   - Deploy it

#### Solution 2: Fix CORS Issues

The original worker might be blocking requests from testing domains. Use the fixed version:

1. **Update your Worker** with the code from `workers/capi-worker-fixed.js`
2. This version allows requests from any origin (safe for testing)
3. For production, you can restrict origins later

#### Solution 3: Check Environment Variables

In Cloudflare Worker settings, ensure these are set:
- `FB_ACCESS_TOKEN`: Your Facebook access token (REQUIRED)
- `PIXEL_ID`: 1452655989058364
- `CORS_ORIGIN`: * (for testing) or your specific domains

### Issue: "FB_ACCESS_TOKEN not configured"

This means the worker is running but the Facebook access token isn't set.

#### How to Get Your Access Token:

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your pixel (1452655989058364)
3. Click **Settings** in the left menu
4. Scroll to **Conversions API** section
5. Click **Generate access token**
6. Copy the token
7. Add it to Cloudflare Worker environment variables:
   - Go to your Worker settings
   - Add environment variable: `FB_ACCESS_TOKEN = [your-token]`
   - Save and deploy

### Issue: Events Not Appearing in Facebook

Even if the API returns success, events might not show if:

1. **Missing Test Event Code**:
   - Get code from Facebook Test Events tab
   - Add it to your test requests
   - Events with test code appear in 2-5 seconds
   - Without test code: 5-20 minute delay

2. **Invalid Access Token**:
   - Token might be expired or incorrect
   - Generate a new one from Events Manager

3. **Wrong Pixel ID**:
   - Verify pixel ID is 1452655989058364
   - Check it matches in both website and worker

### Issue: Duplicate Events

If Facebook shows duplicate event warnings:

1. **Check Event IDs**:
   - Browser and server events should have the SAME event_id
   - This enables deduplication
   - Our code handles this automatically

2. **Timing Issues**:
   - Events fired too close together might not deduplicate
   - Add a small delay between browser and server events

## 🧪 Testing Your Setup

### Quick Test Command (using curl):

```bash
curl -X POST https://capiworker.elhallaoui-mohamed1.workers.dev/ \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "TestEvent",
    "event_time": 1234567890,
    "action_source": "website",
    "event_source_url": "https://test.com",
    "user_data": {},
    "custom_data": {"test": true},
    "test_event_code": "YOUR_TEST_CODE"
  }'
```

### Expected Response:

```json
{
  "success": true,
  "events_processed": 1,
  "fb_response": {
    "events_received": 1,
    "messages": []
  },
  "fb_status": 200
}
```

## 📋 Deployment Checklist

- [ ] Worker deployed to Cloudflare
- [ ] FB_ACCESS_TOKEN environment variable set
- [ ] Worker URL updated in website config
- [ ] Test event code obtained from Facebook
- [ ] CORS working (test from your domain)
- [ ] Events appearing in Facebook Test Events tab

## 🔧 Advanced Debugging

### 1. Check Worker Logs

In Cloudflare dashboard:
- Go to your Worker
- Click "Logs" tab
- Look for error messages

### 2. Test with Postman/Insomnia

Create a POST request to your worker with:
```json
{
  "event_name": "Purchase",
  "event_time": 1234567890,
  "event_id": "test-123",
  "action_source": "website",
  "event_source_url": "https://example.com",
  "user_data": {
    "em": "test@example.com",
    "ph": "+1234567890"
  },
  "custom_data": {
    "value": 99.99,
    "currency": "EUR"
  },
  "test_event_code": "YOUR_TEST_CODE"
}
```

### 3. Verify in Facebook

1. **Test Events Tab**: Real-time with test code
2. **Events Manager Overview**: 5-20 minute delay
3. **Diagnostics Tab**: Check for warnings
4. **Event Match Quality**: Should be "Good" or "Great"

## 🆘 Still Having Issues?

1. **Check Browser Console** for detailed error messages
2. **Use the diagnostic tool**: `/fb-pixel-diagnostic.html`
3. **Test with simplified payload** first
4. **Verify Facebook Business Manager** has proper permissions
5. **Check if pixel is active** in Events Manager

## 📞 Contact Points

- Facebook Business Help: https://business.facebook.com/business/help
- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- GitHub Issues: Create an issue in your repository with error details