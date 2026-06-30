const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');
c = c.replace(/background:\s*'white'/g, "background: 'var(--white)'");
c = c.replace(/background:\s*'#ffffff'/g, "background: 'var(--white)'");
c = c.replace(/background:\s*"white"/g, "background: 'var(--white)'");
c = c.replace(/background:\s*'#fff'/gi, "background: 'var(--white)'");
fs.writeFileSync('app/page.tsx', c, 'utf8');
console.log('done');
