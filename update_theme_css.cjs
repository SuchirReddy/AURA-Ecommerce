const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const origContent = content;
      content = content.replace(/@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)/g, '[data-theme="dark"]');
      content = content.replace(/@media\s*\(\s*prefers-color-scheme\s*:\s*light\s*\)/g, '[data-theme="light"]');
      
      if (content !== origContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir('/Users/suchirreddy/Projects/Ecommerce/src');
