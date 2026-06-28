const fs = require('fs');
let code = fs.readFileSync('lib/store.ts', 'utf8');

const helperCode = `
const checkAuthError = (err: any) => {
  if (err && (err.code === 'PGRST303' || (err.message && err.message.includes('JWT expired')))) {
    console.error('Session expirée, déconnexion forcée...');
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login';
    }
  }
};
`;

if (!code.includes('checkAuthError')) {
  code = code.replace('export const db = {', helperCode + '\nexport const db = {');
  code = code.replace(/console\.error\(\"Error fetching.*?\",\s*err\);/g, match => match + '\n        checkAuthError(err);');
  fs.writeFileSync('lib/store.ts', code);
  console.log('Modified store.ts');
} else {
  console.log('Already modified');
}
