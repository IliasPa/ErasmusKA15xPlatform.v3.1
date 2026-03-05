const fs = require('fs');
const path = require('path');

const repo = process.argv[2];
if (!repo) {
  console.error('Usage: node set-base.js <repo-name>');
  process.exit(1);
}

const distIndex = path.join(process.cwd(), 'dist', 'index.html');
if (!fs.existsSync(distIndex)) {
  console.error('dist/index.html not found');
  process.exit(1);
}

let html = fs.readFileSync(distIndex, 'utf8');
if (html.includes('<base')) {
  console.log('base already present');
  process.exit(0);
}

const baseTag = `<base href="/${repo}/">`;
html = html.replace(/<head(\s[^>]*)?>/i, match => `${match}\n  ${baseTag}`);
fs.writeFileSync(distIndex, html, 'utf8');
console.log('Inserted base tag with /' + repo + '/');
