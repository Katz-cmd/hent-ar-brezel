# 🚀 Facebook Pixel + CAPI Installation Guide

## Quick Install (15 Minutes)

### What You'll Get:
- ✅ Facebook Pixel tracking (browser-side)
- ✅ Conversions API tracking (server-side) 
- ✅ Automatic event deduplication
- ✅ iOS 14.5+ compatible
- ✅ Ad blocker resistant
- ✅ Enhanced match quality

---

## 📦 Package Contents

```
📁 facebook-pixel-template/
├── 📄 pixel-code.html       → Add to your website
├── 📄 cloudflare-worker.js  → Deploy to Cloudflare
├── 📄 test-page.html        → Test your installation
├── 📄 troubleshooting.md    → Fix common issues
└── 📄 README.md             → Full documentation
```

---

## Installation Steps

### 1️⃣ Get Facebook Credentials (2 min)

**Get Pixel ID:**
1. Open https://business.facebook.com/events_manager
2. Select your pixel or create new one
3. Copy the Pixel ID number

**Get Access Token:**
1. In Events Manager → Settings
2. Find "Conversions API" section
3. Click "Generate access token"
4. Copy and save securely

---

### 2️⃣ Deploy Cloudflare Worker (5 min)

1. **Login to Cloudflare:**
   https://dash.cloudflare.com

2. **Create Worker:**
   - Click "Workers & Pages"
   - Click "Create Application"
   - Choose "Create Worker"
   - Name it (e.g., `fb-capi`)
   - Click "Deploy"

3. **Add Code:**
   - Click "Edit code"
   - Delete default code
   - Copy ALL code from `cloudflare-worker.js`
   - Paste and click "Save and Deploy"

4. **Add Credentials:**
   - Go to Settings → Variables
   - Add:
     ```
     FB_ACCESS_TOKEN = [your-token]
     PIXEL_ID = [your-pixel-id]
     ```
   - Save

5. **Copy Worker URL:**
   Format: `https://[worker-name].[subdomain].workers.dev`

---

### 3️⃣ Add to Website (5 min)

1. **Open `pixel-code.html`**

2. **Update Configuration:**
   ```javascript
   window.FB_CONFIG = {
       pixelId: 'YOUR_PIXEL_ID',        // From step 1
       capiEndpoint: 'WORKER_URL',      // From step 2
       testEventCode: '',                // For testing
       debug: false                      // Set true to debug
   };
   ```

3. **Copy ENTIRE code**

4. **Paste in website `<head>`:**

   **WordPress:**
   - Install "Insert Headers and Footers" plugin
   - Paste in header section

   **HTML Site:**
   - Open your HTML files
   - Paste after `<head>` tag

   **React/Vue/Angular:**
   - Add to index.html
   - Or use in app component

   **Shopify:**
   - Online Store → Themes → Edit code
   - Open theme.liquid
   - Paste before `</head>`

---

### 4️⃣ Test Installation (3 min)

1. **Get Test Code:**
   - Go to https://business.facebook.com/events_manager/test_events
   - Copy test event code

2. **Open Test Page:**
   - Open `test-page.html` in browser
   - Enter your credentials
   - Click "Run Test"

3. **Verify in Facebook:**
   - Check Test Events tab
   - Should see events in 2-5 seconds
   - Look for "Server" column

---

## ✅ Success Checklist

- [ ] Pixel ID obtained
- [ ] Access token generated  
- [ ] Worker deployed
- [ ] Environment variables set
- [ ] Worker URL copied
- [ ] Pixel code added to website
- [ ] Configuration updated
- [ ] Test successful
- [ ] Events in Facebook

---

## 🎯 Quick Test

After installation, test with this:
```javascript
// Fire a test purchase event
fbq('track', 'Purchase', {
    value: 25.00,
    currency: 'USD'
});
```

Check Facebook Test Events - should appear in 2-5 seconds!

---

## 📱 Platform-Specific Instructions

### WordPress
```php
// Add to functions.php or use plugin
add_action('wp_head', function() {
    // Paste pixel code here
});
```

### Shopify
- Use Shopify's Facebook channel for basic pixel
- Add CAPI code to theme.liquid for enhanced tracking

### WooCommerce
```php
// Track purchase automatically
add_action('woocommerce_thankyou', function($order_id) {
    $order = wc_get_order($order_id);
    ?>
    <script>
    fbq('track', 'Purchase', {
        value: <?php echo $order->get_total(); ?>,
        currency: '<?php echo $order->get_currency(); ?>',
        content_ids: <?php echo json_encode(wp_list_pluck($order->get_items(), 'product_id')); ?>
    });
    </script>
    <?php
});
```

### Google Tag Manager
1. Create Custom HTML tag
2. Paste pixel code
3. Trigger on All Pages
4. Publish container

---

## 🚨 Common Issues

**"Failed to fetch" error:**
- Worker not deployed
- Wrong URL
- Check troubleshooting.md

**Events not showing:**
- Missing test code
- Invalid access token
- Wait 2-5 seconds

**Only browser events:**
- CAPI not configured
- Check worker logs

---

## 📞 Need Help?

1. Check `troubleshooting.md`
2. Use `test-page.html` for diagnostics
3. Enable debug mode:
   ```javascript
   debug: true
   ```
4. Check browser console

---

## 🎉 You're Done!

Your Facebook Pixel is now:
- Tracking browser events
- Tracking server events
- Deduplicating automatically
- Ready for iOS 14.5+
- Resistant to ad blockers

**Next Steps:**
- Remove test event code for production
- Set debug to false
- Monitor in Events Manager
- Check weekly for issues

---

**Questions?** The answer is probably in `troubleshooting.md`!