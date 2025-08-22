# 🧪 SUPER SIMPLE TEST FOR YOUR LIVE WEBSITE

## Quick Test (One Line)

Go to **hentarbrezel.com** → Open Console (F12) → Paste this:

```javascript
(function(){let s=0,d=[];if(localStorage.getItem('user_id')){s+=1.5;d.push('UserID');}if(document.cookie.includes('_fbp')){s+=1.5;d.push('_fbp');}if(localStorage.getItem('user_email_hash')){s+=1.5;d.push('Email');}if(localStorage.getItem('user_phone_hash')){s+=1.5;d.push('Phone');}if(localStorage.getItem('_fbc')){s+=1.5;d.push('_fbc');}if(localStorage.getItem('user_country')||localStorage.getItem('user_city')){s+=0.5;d.push('Location');}console.log('🎯 EMQ Score:',s+'/10');console.log('✅ Data:',d.join(', ')||'None');console.log('🔥 MAX EMQ:',typeof getOrCreateUserID!=='undefined'?'ACTIVE':'NOT ACTIVE');return s;})();
```

### What You Should See:

```
🎯 EMQ Score: 3.5/10
✅ Data: UserID, _fbp, Location
🔥 MAX EMQ: ACTIVE
```

## Full Diagnostic Test

For more details, paste this longer version:

```javascript
// CHECK IF MAX EMQ IS WORKING
console.clear();
console.log('🔍 CHECKING MAX EMQ ON', window.location.hostname);
console.log('=====================================\n');

// Check implementation
const hasMax = typeof getOrCreateUserID !== 'undefined';
console.log('1️⃣ MAX EMQ Code:', hasMax ? '✅ LOADED' : '❌ NOT FOUND');

// Check auto-generated data
const userId = localStorage.getItem('user_id');
const location = localStorage.getItem('user_country') || localStorage.getItem('user_city');
console.log('2️⃣ Auto User ID:', userId ? '✅ ' + userId.substring(0,20) + '...' : '❌ Missing');
console.log('3️⃣ Auto Location:', location ? '✅ ' + location : '❌ Missing');

// Calculate score
let score = 0;
if (userId) score += 1.5;
if (document.cookie.includes('_fbp')) score += 1.5;
if (location) score += 0.5;
if (localStorage.getItem('user_email_hash')) score += 1.5;
if (localStorage.getItem('user_phone_hash')) score += 1.5;

console.log('\n📊 CURRENT EMQ SCORE:', score + '/10');

// Show what to expect
console.log('\n📈 EXPECTED SCORES:');
console.log('• Any visitor: 3.0-3.5/10 (automatic)');
console.log('• With email: 5.0/10');
console.log('• With phone: 6.5/10');
console.log('• Complete: 8.5/10');

// Test status
if (score >= 3.0) {
    console.log('\n✅ SUCCESS! MAX EMQ is working!');
} else {
    console.log('\n⚠️ MAX EMQ may not be deployed yet');
}
```

## How to Test Data Capture

1. **Test Email Capture:**
   - Find ANY input field on your site
   - Type: `test@example.com`
   - Run the test again - score should increase by 1.5

2. **Test Phone Capture:**
   - Type in any field: `+33612345678`
   - Run the test again - score should increase by 1.5

## What the Scores Mean

| Score | Status | What It Means |
|-------|--------|---------------|
| 1.5/10 | ❌ Old | Only basic pixel |
| 3.0-3.5/10 | ✅ Working | MAX EMQ active, auto-tracking visitors |
| 5.0/10 | ✅ Good | Email captured |
| 6.5/10 | ✅ Great | Phone captured |
| 8.0+/10 | ✅ Excellent | Full data collection |

## Signs MAX EMQ is Working

✅ **It's working if you see:**
- Score of 3.0 or higher (even without filling forms)
- "MAX EMQ: ACTIVE" message
- User ID starting with "user_" and containing browser data
- Location data captured automatically

❌ **It's NOT working if:**
- Score is still 1.5/10
- "MAX EMQ: NOT ACTIVE"
- No user_id in localStorage
- No location data

## Need to Deploy?

If MAX EMQ shows "NOT ACTIVE", the code needs to be deployed to your live site. The changes are in GitHub but may not be on your production server yet.