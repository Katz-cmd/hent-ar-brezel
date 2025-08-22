// SIMPLE TEST FOR MAXIMUM EMQ - Copy & Paste this in console on hentarbrezel.com

(function testMaxEMQ() {
    console.log('🔍 TESTING MAXIMUM EMQ IMPLEMENTATION...\n');
    
    // 1. Check if enhanced pixel is loaded
    const hasMaxEMQ = typeof getOrCreateUserID !== 'undefined';
    const hasFingerprint = localStorage.getItem('user_id')?.includes('user_');
    const hasLocation = localStorage.getItem('user_country') || localStorage.getItem('user_city');
    
    console.log('===== IMPLEMENTATION CHECK =====');
    console.log('✅ Enhanced Pixel:', hasMaxEMQ ? 'LOADED' : 'NOT FOUND');
    console.log('✅ Browser Fingerprint:', hasFingerprint ? 'ACTIVE' : 'NOT ACTIVE');
    console.log('✅ Auto Location:', hasLocation ? 'CAPTURED' : 'NOT CAPTURED');
    
    // 2. Check current EMQ score
    function getCookie(name) {
        const value = '; ' + document.cookie;
        const parts = value.split('; ' + name + '=');
        return parts.length === 2 ? parts.pop().split(';')[0] : null;
    }
    
    let score = 0;
    let found = [];
    let missing = [];
    
    // Check each parameter
    const checks = {
        '_fbp cookie': getCookie('_fbp'),
        'User ID': localStorage.getItem('user_id') || localStorage.getItem('external_id'),
        'Email': localStorage.getItem('user_email_hash') || localStorage.getItem('user_email'),
        'Phone': localStorage.getItem('user_phone_hash') || localStorage.getItem('user_phone'),
        '_fbc (FB ads)': getCookie('_fbc') || localStorage.getItem('_fbc'),
        'Location': localStorage.getItem('user_country') || localStorage.getItem('user_city'),
        'Names': localStorage.getItem('user_fn_hash') || localStorage.getItem('user_ln_hash')
    };
    
    // Calculate score
    if (checks['_fbp cookie']) { score += 1.5; found.push('_fbp'); } else { missing.push('_fbp'); }
    if (checks['User ID']) { score += 1.5; found.push('User ID'); } else { missing.push('User ID'); }
    if (checks['Email']) { score += 1.5; found.push('Email'); } else { missing.push('Email'); }
    if (checks['Phone']) { score += 1.5; found.push('Phone'); } else { missing.push('Phone'); }
    if (checks['_fbc (FB ads)']) { score += 1.5; found.push('_fbc'); } else { missing.push('_fbc'); }
    if (checks['Location']) { score += 0.5; found.push('Location'); }
    if (checks['Names']) { score += 0.5; found.push('Names'); }
    
    console.log('\n===== CURRENT EMQ SCORE =====');
    console.log('📊 Score:', score.toFixed(1) + '/10');
    console.log('✅ Data Found:', found.length > 0 ? found.join(', ') : 'None');
    console.log('❌ Missing:', missing.length > 0 ? missing.join(', ') : 'None');
    
    // 3. Test data capture
    console.log('\n===== LIVE CAPTURE TEST =====');
    console.log('Type this in any input field to test:');
    console.log('📧 Email: test@example.com');
    console.log('📱 Phone: +33612345678');
    console.log('Then run this test again to see if score increased!');
    
    // 4. Show what's in localStorage
    console.log('\n===== STORED DATA =====');
    const storedData = {
        'user_id': localStorage.getItem('user_id'),
        'email_hash': localStorage.getItem('user_email_hash'),
        'phone_hash': localStorage.getItem('user_phone_hash'),
        'country': localStorage.getItem('user_country'),
        'city': localStorage.getItem('user_city'),
        '_fbc': localStorage.getItem('_fbc'),
        'utm_source': localStorage.getItem('utm_source')
    };
    
    Object.entries(storedData).forEach(([key, value]) => {
        if (value) {
            console.log(`${key}:`, value.substring(0, 20) + (value.length > 20 ? '...' : ''));
        }
    });
    
    // 5. Check if MAX EMQ features are working
    console.log('\n===== MAX EMQ FEATURES =====');
    
    // Check console logs for [MAX EMQ]
    const hasMaxLogs = console.log.toString().includes('[MAX EMQ]');
    
    // Create a test to see if capture works
    window.testEmailCapture = function() {
        const testInput = document.createElement('input');
        testInput.type = 'email';
        testInput.value = 'test@example.com';
        document.body.appendChild(testInput);
        
        const event = new Event('input', { bubbles: true });
        testInput.dispatchEvent(event);
        
        setTimeout(() => {
            const captured = localStorage.getItem('user_email_hash');
            console.log('Email capture test:', captured ? '✅ WORKING' : '❌ NOT WORKING');
            document.body.removeChild(testInput);
        }, 100);
    };
    
    console.log('Run testEmailCapture() to test email capture');
    
    // Return summary
    const status = score >= 3.0 ? '✅ WORKING' : '⚠️ PARTIAL';
    console.log('\n===== SUMMARY =====');
    console.log('Status:', status);
    console.log('Score:', score.toFixed(1) + '/10');
    console.log('Implementation:', hasMaxEMQ ? 'MAX EMQ Active' : 'Basic Pixel Only');
    
    return {
        score: score.toFixed(1),
        status: status,
        found: found,
        missing: missing
    };
})();