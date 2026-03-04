const fs = require('fs');

async function scrape() {
    try {
        const response = await fetch('https://complystrong.com/');
        const html = await response.text();
        const stylesRegex = /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/ig;
        let match;
        const cssUrls = [];
        while ((match = stylesRegex.exec(html)) !== null) {
            let href = match[1];
            if (href.startsWith('/')) {
                href = 'https://complystrong.com' + href;
            }
            cssUrls.push(href);
        }

        const cssContents = await Promise.all(cssUrls.map(url => fetch(url).then(r => r.text()).catch(e => '')));
        const allCss = cssContents.join('\n') + '\n' + html;

        const cssVarsRegex = /--[a-zA-Z0-9-]+:\s*#?[a-zA-Z0-9(),\s.%]+;/g;
        const rootVars = allCss.match(cssVarsRegex) || [];
        const uniqueVars = [...new Set(rootVars.map(v => v.trim()))];

        const fontRegex = /font-family:\s*([^;]+);/ig;
        let fonts = [];
        while ((match = fontRegex.exec(allCss)) !== null) {
            fonts.push(match[1].replace(/"|'/g, '').trim());
        }
        const uniqueFonts = [...new Set(fonts)];

        const result = {
            colors: uniqueVars.filter(v => v.includes('color') || v.includes('rgb') || v.includes('#')),
            fonts: uniqueFonts
        };

        fs.writeFileSync('theme.json', JSON.stringify(result, null, 2), 'utf-8');
        console.log('Saved to theme.json');
    } catch (e) {
        console.error(e);
    }
}

scrape();
