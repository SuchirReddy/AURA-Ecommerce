import fs from 'fs';
import path from 'path';

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      walk(path.join(dir, file), fileList);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const files = walk(path.join(process.cwd(), 'src'));
const issues = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find all JSX tags <ComponentName ...
  const tagRegex = /<([A-Z][a-zA-Z0-9_]*)(?:\s|>|\/)/g;
  const tags = new Set();
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    tags.add(match[1]);
  }
  
  // Check if each tag is defined in the file
  for (const tag of tags) {
    // Quick heuristic: does the word appear as "import ... tag", "const tag", "function tag", "class tag", etc?
    // We'll just check if there's any import containing it, or it's declared.
    const importRegex = new RegExp(`import\\s+.*?\\b${tag}\\b.*?\\s+from`, 's');
    const declRegex = new RegExp(`(?:const|let|var|function|class)\\s+${tag}\\b`);
    const isImported = importRegex.test(content);
    const isDeclared = declRegex.test(content);
    
    if (!isImported && !isDeclared && tag !== 'Fragment') {
      issues.push({ file: path.relative(process.cwd(), file), component: tag });
    }
  }
});

console.log(JSON.stringify(issues, null, 2));
