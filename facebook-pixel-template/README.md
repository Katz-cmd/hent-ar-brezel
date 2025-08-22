# Facebook Pixel + Conversions API Template
## Complete Installation Package

This template provides everything needed to install Facebook Pixel with server-side tracking (Conversions API) on any website.

---

## 📋 What's Included

1. **Browser Pixel Code** - Client-side tracking
2. **Cloudflare Worker** - Server-side tracking (CAPI)
3. **Installation Instructions** - Step-by-step guide
4. **Testing Tools** - Verify everything works

---

## 🚀 Quick Start (15 Minutes Total)

### Prerequisites
- Facebook Business Manager account
- Cloudflare account (free tier works)
- Access to website HTML/code
- Facebook Pixel ID

---

## Step 1: Get Your Facebook Pixel ID & Access Token (5 min)

### Get Pixel ID:
1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select or create your pixel
3. Copy the Pixel ID (looks like: `1234567890123456`)

### Get Access Token:
1. In Events Manager, click **Settings**
2. Scroll to **Conversions API**
3. Click **Generate access token**
4. Copy and save it securely

---

## Step 2: Deploy Cloudflare Worker (5 min)

### 2.1 Create Worker
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Workers & Pages** → **Create Application** → **Create Worker**
3. Name it (e.g., `fb-capi-worker`)
4. Click **Deploy**

### 2.2 Add Worker Code
1. Click **Edit code**
2. Delete all default code
3. Copy all code from `cloudflare-worker.js` in this package
4. Paste it into the editor
5. Click **Save and Deploy**

### 2.3 Set Environment Variables
1. Go to Worker **Settings** → **Variables**
2. Add these environment variables:
   ```
   FB_ACCESS_TOKEN = [your-access-token-from-step-1]
   PIXEL_ID = [your-pixel-id-from-step-1]
   ```
3. Save changes

### 2.4 Copy Worker URL
Your worker URL will be: `https://[worker-name].[your-subdomain].workers.dev`
Save this URL for the next step.

---

## Step 3: Install Pixel on Website (5 min)

### 3.1 Update Configuration
In the `pixel-code.html` file, update these values:
```javascript
window.FB_CONFIG = {
    pixelId: 'YOUR_PIXEL_ID_HERE',           // From Step 1
    capiEndpoint: 'YOUR_WORKER_URL_HERE',    // From Step 2.4
    testEventCode: '',                       // Leave empty for production
    debug: false                              // Set to true for testing
};
```

### 3.2 Add Code to Website
Copy the ENTIRE contents of `pixel-code.html` and paste it into your website's `<head>` section, right after the opening `<head>` tag.

**For WordPress:**
- Use a plugin like "Insert Headers and Footers"
- Or edit theme's `header.php`

**For Shopify:**
- Go to Online Store → Themes → Actions → Edit code
- Open `theme.liquid`
- Paste before `</head>`

**For Other Platforms:**
- Add to global header/template file
- Or use platform's custom code injection feature

---

## Step 4: Test Your Installation

### 4.1 Get Test Event Code
1. Go to [Facebook Test Events](https://business.facebook.com/events_manager/test_events)
2. Select your pixel
3. Copy the test event code

### 4.2 Run Test
1. Update your website config with test code:
   ```javascript
   testEventCode: 'TEST12345',  // Your test code
   debug: true                   // Enable debug mode
   ```
2. Visit your website
3. Check Facebook Test Events tab (events appear in 2-5 seconds)

### 4.3 Verify Success
You should see:
- Events appearing in "Server" column
- "Received from: Server and Browser" (best case)
- All custom parameters visible

---

## 📁 File Structure

```
facebook-pixel-template/
├── README.md                 # This file
├── pixel-code.html          # Website pixel code
├── cloudflare-worker.js     # CAPI worker code
├── test-page.html           # Testing tool
└── troubleshooting.md       # Common issues & fixes
```

---

## 🎯 Features

- ✅ **Dual Tracking**: Browser + Server events
- ✅ **Automatic Deduplication**: Prevents counting events twice
- ✅ **Privacy Compliant**: Automatic PII hashing
- ✅ **iOS 14.5+ Ready**: Server-side tracking bypasses restrictions
- ✅ **Ad Blocker Resistant**: CAPI works even with blockers
- ✅ **Enhanced Match Quality**: Better audience matching
- ✅ **Real-time Testing**: Instant verification with test events

---

## 📊 Events Tracked Automatically

- **PageView** - Every page visit
- **ViewContent** - Product/content views
- **AddToCart** - Add to cart actions
- **InitiateCheckout** - Checkout starts
- **Purchase** - Completed purchases
- **Lead** - Form submissions
- **Custom Events** - Any custom tracking

---

## 🔧 Customization

### Track Custom Events
```javascript
// Track a custom event
fbq('track', 'CustomEvent', {
    custom_parameter: 'value',
    another_parameter: 123
});
```

### Track with User Data
```javascript
// Update user data for better matching
window.updateUserData('user@email.com', '+1234567890', 'user_123');
```

### E-commerce Events
```javascript
// Purchase event with details
fbq('track', 'Purchase', {
    value: 99.99,
    currency: 'USD',
    content_ids: ['PRODUCT_ID_1'],
    content_type: 'product',
    num_items: 1
});
```

---

## ⚠️ Important Notes

1. **Access Token Security**: Never expose your access token in client-side code
2. **GDPR Compliance**: Ensure you have user consent before tracking
3. **Testing**: Always test with test event codes first
4. **Monitoring**: Check Events Manager regularly for issues
5. **Updates**: Keep worker code updated for API changes

---

## 🆘 Support

### Quick Diagnostics
- Use `test-page.html` to verify installation
- Check `troubleshooting.md` for common issues
- Enable debug mode for console logging

### Resources
- [Facebook Pixel Documentation](https://developers.facebook.com/docs/facebook-pixel)
- [Conversions API Guide](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Events Manager](https://business.facebook.com/events_manager)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

---

## 📈 Performance Tips

1. **Use Test Events**: Always test before going live
2. **Monitor Match Quality**: Aim for "Good" or "Great"
3. **Include User Data**: Improves attribution accuracy
4. **Check Diagnostics**: Weekly review recommended
5. **Update Regularly**: Keep code current with API changes

---

## ✅ Installation Checklist

- [ ] Facebook Pixel ID obtained
- [ ] Access Token generated
- [ ] Cloudflare Worker deployed
- [ ] Environment variables set
- [ ] Worker URL copied
- [ ] Pixel code added to website
- [ ] Configuration updated
- [ ] Test event code obtained
- [ ] Installation tested
- [ ] Events appearing in Facebook

---

## 📝 License

This template is provided as-is for commercial and personal use.

---

## 🎉 Success Indicators

When properly installed, you'll see:
- ✅ Events in Facebook within seconds (with test code)
- ✅ "Server and Browser" in received from column
- ✅ Good/Great event match quality
- ✅ No warnings in diagnostics
- ✅ Accurate conversion tracking

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Compatibility**: Facebook Graph API v19.0