const fs = require('fs');
const path = require('path');
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
  let nc = c.replace(/<span className="text-orange">\.CI<\/span>/g, '');
  if (c !== nc) {
    fs.writeFileSync(f, nc, 'utf8');
    console.log('Updated: ' + f);
  }
});
