# 📈 How to Improve Facebook Pixel Event Match Quality

## Your Current Issues:

1. **Browser pixel sending only 25% of events** - Need to ensure browser pixel fires on ALL pages
2. **Low match quality scores** - Need to send more user data for better matching

## 🔧 Immediate Fixes:

### 1. Replace Your Current Pixel Code

Use the `enhanced-pixel-code.html` which includes:
- Advanced matching parameters
- Automatic form data capture
- Better cookie persistence
- Enhanced user data collection

### 2. Capture User Data at Key Points

Add this code when users provide their information:

#### After Login:
```javascript
updateUserData({
    email: userEmail,        // From login form
    userId: userId,          // Your internal user ID
    firstName: firstName,    // If available
    lastName: lastName       // If available
});
```

#### On Checkout/Purchase:
```javascript
trackCheckout({
    value: 99.99,
    currency: 'EUR',
    productIds: ['PROD_001'],
    numItems: 1,
    orderId: 'ORDER_123',
    customer: {
        email: customerEmail,
        phone: customerPhone,
        firstName: firstName,
        lastName: lastName,
        id: customerId,
        city: city,
        state: state,
        zip: zipCode,
        country: 'FR'
    }
});
```

#### On Newsletter Signup:
```javascript
// Capture email immediately
updateUserData({
    email: document.getElementById('newsletter-email').value
});

// Then track the lead event
fbq('track', 'Lead', {
    content_name: 'Newsletter Signup',
    content_category: 'Email'
});
```

### 3. Add to Your Checkout Flow

For WooCommerce/Shopify/Custom checkout:

```php
// PHP Example for WooCommerce
add_action('woocommerce_thankyou', function($order_id) {
    $order = wc_get_order($order_id);
    $customer = $order->get_user();
    ?>
    <script>
    // Update user data for better matching
    updateUserData({
        email: '<?php echo $order->get_billing_email(); ?>',
        phone: '<?php echo $order->get_billing_phone(); ?>',
        firstName: '<?php echo $order->get_billing_first_name(); ?>',
        lastName: '<?php echo $order->get_billing_last_name(); ?>',
        userId: '<?php echo $order->get_customer_id(); ?>',
        city: '<?php echo $order->get_billing_city(); ?>',
        state: '<?php echo $order->get_billing_state(); ?>',
        zip: '<?php echo $order->get_billing_postcode(); ?>',
        country: '<?php echo $order->get_billing_country(); ?>'
    });
    
    // Track purchase
    fbq('track', 'Purchase', {
        value: <?php echo $order->get_total(); ?>,
        currency: '<?php echo $order->get_currency(); ?>',
        content_ids: <?php echo json_encode(wp_list_pluck($order->get_items(), 'product_id')); ?>,
        content_type: 'product',
        num_items: <?php echo $order->get_item_count(); ?>
    });
    </script>
    <?php
});
```

### 4. Ensure Pixel Fires on ALL Pages

Check that the pixel code is on:
- ✅ Homepage
- ✅ Product pages
- ✅ Category pages
- ✅ Cart page
- ✅ Checkout pages
- ✅ Thank you/confirmation page
- ✅ Account pages
- ✅ Blog/content pages

### 5. Fix the 25% Event Issue

The message indicates your browser pixel is missing 75% of events. This happens when:

1. **Pixel not on all pages** - Add to global header
2. **JavaScript errors** - Check browser console
3. **Ad blockers** - CAPI helps but check if pixel loads
4. **Single Page Apps** - Fire PageView on route changes:

```javascript
// For React/Vue/Angular SPAs
router.afterEach((to, from) => {
    fbq('track', 'PageView');
});
```

## 📊 To Get 100% Match Quality:

### For Click ID (fbc) - 100% increase potential:
- This is automatically captured from Facebook ads
- Make sure pixel fires immediately on landing pages
- The enhanced code captures this automatically

### For Email - 25.39% increase potential:
```javascript
// Capture email whenever available
updateUserData({ email: userEmail });
```

### For Phone - 7.48% increase potential:
```javascript
// Capture phone when provided
updateUserData({ phone: userPhone });
```

### For External ID - 4.81% increase potential:
```javascript
// Use your internal user ID
updateUserData({ userId: 'USER_' + userId });
```

## 🎯 Quick Win Actions:

1. **Add email capture to all forms:**
```javascript
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function() {
        const email = form.querySelector('input[type="email"]');
        if (email && email.value) {
            updateUserData({ email: email.value });
        }
    });
});
```

2. **Capture data from logged-in users:**
```javascript
// If user is logged in, immediately update their data
if (userIsLoggedIn) {
    updateUserData({
        email: currentUser.email,
        userId: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName
    });
}
```

3. **Add to cart with user data:**
```javascript
// When adding to cart, include any known user data
document.querySelector('.add-to-cart').addEventListener('click', function() {
    fbq('track', 'AddToCart', {
        content_ids: [productId],
        content_type: 'product',
        value: productPrice,
        currency: 'EUR'
    });
});
```

## 📈 Expected Results After Implementation:

- **Email match**: Should increase from 25% to 60-80%
- **Phone match**: Should increase from 7% to 20-30%
- **External ID**: Should increase from 4% to 50-70%
- **Overall match quality**: Should improve to "Good" or "Great"

## 🔍 How to Monitor:

1. Go to Events Manager
2. Click on your pixel
3. Go to "Settings" → "Event Setup"
4. Look at "Event Match Quality"
5. Check weekly for improvements

## 💡 Pro Tips:

1. **Capture email early** - Even before checkout
2. **Use consistent IDs** - Same user ID everywhere
3. **Hash on client-side** - For faster processing
4. **Test with real data** - Use actual customer emails
5. **Progressive enhancement** - Capture more data over time

## 🚨 Important:

- Always get user consent before tracking (GDPR)
- The enhanced code automatically hashes PII
- CAPI provides backup when browser pixel fails
- Match quality improves over time as you collect more data

After implementing these changes, your match quality should improve significantly within 24-48 hours!