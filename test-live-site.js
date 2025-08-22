// Test the live site's EMQ score
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto('https://hentarbrezel.com', { waitUntil: 'networkidle2' });
    
    const score = await page.evaluate(() => {
        function getCookie(name) {
            const value = '; ' + document.cookie;
            const parts = value.split('; ' + name + '=');
            return parts.length === 2 ? parts.pop().split(';')[0] : null;
        }
        
        const data = {
            email: localStorage.getItem('user_email') || localStorage.getItem('user_email_hash'),
            phone: localStorage.getItem('user_phone') || localStorage.getItem('user_phone_hash'),
            fbp: getCookie('_fbp'),
            fbc: getCookie('_fbc') || localStorage.getItem('_fbc'),
            user_id: localStorage.getItem('user_id') || localStorage.getItem('external_id')
        };
        
        let score = 0;
        let found = [];
        
        if (data.email) { score += 1.5; found.push('Email'); }
        if (data.phone) { score += 1.5; found.push('Phone'); }
        if (data.fbp) { score += 1.5; found.push('_fbp'); }
        if (data.fbc) { score += 1.5; found.push('_fbc'); }
        if (data.user_id) { score += 1.5; found.push('User ID'); }
        
        return {
            score: score.toFixed(1),
            found: found,
            data: data
        };
    });
    
    console.log('📊 HentArBrezel.com EMQ Score:', score.score + '/10');
    console.log('✅ Data found:', score.found.join(', '));
    
    await browser.close();
})();
