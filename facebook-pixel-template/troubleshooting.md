# Facebook Pixel Troubleshooting Guide

## Common Issues and Solutions

---

## 🔴 Issue: "Network error: Failed to fetch"

### Causes:
- Cloudflare Worker not deployed
- Wrong Worker URL
- CORS blocking requests

### Solutions:
1. **Verify Worker is deployed:**
   - Open your worker URL in browser: `https://your-worker.workers.dev`
   - Should see: `{"error":"Method not allowed"}`
   - If not, deploy the worker first

2. **Check Worker URL:**
   - Ensure no typos in the URL
   - Include `https://` and trailing `/` if needed
   - Match exactly what Cloudflare shows

3. **Fix CORS:**
   - Use the provided `cloudflare-worker.js` code
   - It allows all origins by default
   - For production, restrict origins later

---

## 🔴 Issue: "FB_ACCESS_TOKEN not configured"

### Cause:
Worker is running but access token not set

### Solution:
1. Go to Cloudflare Worker Settings
2. Add Environment Variable:
   - Name: `FB_ACCESS_TOKEN`
   - Value: Your token from Facebook
3. Save and redeploy

### How to get token:
1. Facebook Events Manager → Settings
2. Conversions API → Generate access token
3. Copy the entire token string

---

## 🔴 Issue: Events not appearing in Facebook

### Possible Causes:
1. No test event code
2. Invalid access token
3. Wrong pixel ID
4. Events being filtered

### Solutions:

**1. Use Test Event Code:**
- Get from Facebook Test Events tab
- Add to configuration
- Events appear in 2-5 seconds

**2. Verify Access Token:**
- Token might be expired
- Generate new one if needed
- Ensure it's for correct pixel

**3. Check Pixel ID:**
- Must match exactly
- No extra spaces or characters
- Same in website and worker

**4. Check Facebook Filters:**
- Test Events tab might have filters
- Clear all filters
- Check "Server" column

---

## 🟡 Issue: "Duplicate events" warning

### Cause:
Same event sent twice without proper deduplication

### Solution:
- Ensure both browser and server events use same `event_id`
- Code handles this automatically
- Don't manually fire same event twice

---

## 🟡 Issue: Poor Event Match Quality

### Cause:
Not enough user data for matching

### Solutions:
1. **Include user data when available:**
   ```javascript
   updateUserData('email@example.com', '+1234567890', 'user_id');
   ```

2. **Ensure cookies are captured:**
   - `_fbp` and `_fbc` cookies
   - Code captures automatically

3. **Add more user parameters:**
   - Email (required for best matching)
   - Phone number
   - External ID
   - Name, location (optional)

---

## 🟡 Issue: Events only showing "Browser" not "Server"

### Causes:
- CAPI not working
- Worker errors
- Network issues

### Solutions:
1. Check worker logs in Cloudflare
2. Verify access token is valid
3. Test worker directly with curl:
   ```bash
   curl -X POST https://your-worker.workers.dev \
     -H "Content-Type: application/json" \
     -d '{"event_name":"Test","event_time":1234567890}'
   ```

---

## 📊 Testing Checklist

### Quick Tests:
- [ ] Worker URL responds to GET (shows error)
- [ ] Worker accepts POST requests
- [ ] Test event appears in Facebook
- [ ] Both Browser and Server columns show data
- [ ] No errors in browser console
- [ ] No warnings in Facebook Diagnostics

### Tools to Use:
1. **Browser Console:** Check for JavaScript errors
2. **Network Tab:** See if requests are sent
3. **Facebook Test Events:** Real-time event viewer
4. **Worker Logs:** Check Cloudflare dashboard

---

## 🛠️ Debug Mode

Enable debug mode to see detailed logs:
```javascript
window.FB_CONFIG = {
    // ... other config
    debug: true  // Enable console logging
};
```

Check browser console for:
- Pixel initialization
- Event firing
- CAPI responses
- Any errors

---

## 📱 Mobile & iOS Issues

### iOS 14.5+ Tracking:
- Browser pixel limited by ATT
- CAPI still works (server-side)
- Ensure CAPI is configured

### Mobile Browsers:
- Some block third-party cookies
- CAPI provides backup tracking
- Test on multiple browsers

---

## 🔒 Ad Blocker Issues

### Problem:
Ad blockers prevent pixel loading

### Solutions:
1. **CAPI as backup:** Works even with blockers
2. **First-party domain:** Use your own domain for worker
3. **Server-side implementation:** Move tracking to backend

---

## 📈 Performance Issues

### Slow Event Processing:
- Check worker response time
- Verify Facebook API isn't rate limited
- Use batch events for high volume

### Missing Events:
- Check if keepalive is set
- Ensure events sent before page unload
- Verify no JavaScript errors

---

## 🚨 Emergency Fixes

### If Nothing Works:
1. **Start Fresh:**
   - Delete and recreate worker
   - Generate new access token
   - Clear all browser data
   - Test with simple payload first

2. **Minimal Test:**
   ```javascript
   fbq('track', 'PageView');
   ```
   - If this works, gradually add complexity

3. **Check Facebook Status:**
   - Facebook API might be down
   - Check developer.facebook.com/status

---

## 📞 Getting Help

### Information to Provide:
1. Pixel ID
2. Worker URL
3. Error messages (exact text)
4. Browser console output
5. Network request/response
6. Facebook Events Manager screenshot

### Where to Get Help:
- Facebook Business Help Center
- Cloudflare Workers Discord
- Stack Overflow (tag: facebook-pixel)
- GitHub Issues on repository

---

## ✅ When It's Working

You should see:
- Events in Test Events tab (2-5 seconds)
- "Server and Browser" in received column
- Good/Great match quality
- No errors in diagnostics
- Consistent conversion tracking

---

## 🔄 Regular Maintenance

### Weekly:
- Check Events Manager diagnostics
- Review match quality scores
- Monitor error rates

### Monthly:
- Update worker code if needed
- Review Facebook API changes
- Test all event types

### Quarterly:
- Regenerate access tokens
- Audit tracking implementation
- Update to latest API version