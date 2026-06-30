const fs = require('fs');
const path = require('path');

// 1. Update globals.css
const cssPath = path.join(__dirname, 'app', 'globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('--fixed-white')) {
  css = css.replace(':root {', `:root {
  /* Fixed colors that never change in dark mode */
  --fixed-white: #FFFFFF;
  --fixed-gray-900: #111827;
`);
}

if (!css.includes('[data-theme="dark"]')) {
  css += `\n
/* ============================================
   Dark Mode Overrides
   ============================================ */
[data-theme="dark"] {
  --white: #1F2937;
  --gray-50: #111827;
  --gray-100: #374151;
  --gray-200: #4B5563;
  --gray-300: #6B7280;
  --gray-400: #9CA3AF;
  --gray-500: #D1D5DB;
  --gray-600: #E5E7EB;
  --gray-700: #F3F4F6;
  --gray-800: #F9FAFB;
  --gray-900: #FFFFFF;
  
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
}
`;
}

// Global replacement in globals.css for text colors that must stay white
// For example: `color: var(--white);` -> `color: var(--fixed-white);`
css = css.replace(/color:\s*var\(--white\)/g, 'color: var(--fixed-white)');
// The above is safe for CSS classes like .btn-primary where the text must be white

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Updated globals.css');

// 2. Replace var(--white) text colors in all TSX files
function walk(dir, cb) {
  fs.readdirSync(dir).forEach(f => {
    let d = path.join(dir, f);
    if (fs.statSync(d).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') walk(d, cb);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      cb(d);
    }
  });
}

walk('.', (f) => {
  let c = fs.readFileSync(f, 'utf8');
  // Replaces inline style { color: "var(--white)" } to { color: "var(--fixed-white)" }
  let nc = c.replace(/color:\s*["']var\(--white\)["']/g, 'color: "var(--fixed-white)"');
  
  // Replaces { color: "white" } to { color: "var(--fixed-white)" } if it's explicitly set to 'white' 
  // Wait, let's just stick to var(--white) since that's what's used
  
  if (c !== nc) {
    fs.writeFileSync(f, nc, 'utf8');
    console.log('Updated: ' + f);
  }
});
