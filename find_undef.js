import fs from 'fs';
import path from 'path';
import * as acorn from 'acorn';
import jsx from 'acorn-jsx';

const Parser = acorn.Parser.extend(jsx());

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') walk(path.join(dir, file), fileList);
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
  try {
    const ast = Parser.parse(content, { sourceType: 'module', ecmaVersion: 2022 });
    
    // We will collect all declared variables and all used variables.
    const declared = new Set(['React', 'document', 'window', 'console', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'localStorage', 'sessionStorage', 'fetch', 'Promise', 'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'Math', 'JSON', 'navigator', 'location', 'process', 'require', 'module', 'exports', 'global', 'URL', 'URLSearchParams', 'FormData', 'Blob', 'File', 'Error', 'Map', 'Set', 'Intl', 'window', 'document', 'screen', 'navigator', 'history']);
    
    // Extract declarations
    function visitDecl(node) {
      if (!node) return;
      if (Array.isArray(node)) {
        node.forEach(visitDecl);
        return;
      }
      if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') declared.add(node.id.name);
      if (node.type === 'VariableDeclarator' && node.id.type === 'ObjectPattern') {
        node.id.properties.forEach(p => {
            if(p.value && p.value.type === 'Identifier') declared.add(p.value.name);
        });
      }
      if (node.type === 'VariableDeclarator' && node.id.type === 'ArrayPattern') {
        node.id.elements.forEach(e => {
            if(e && e.type === 'Identifier') declared.add(e.name);
        });
      }
      if (node.type === 'FunctionDeclaration' && node.id) declared.add(node.id.name);
      if (node.type === 'ClassDeclaration' && node.id) declared.add(node.id.name);
      if (node.type === 'ImportDeclaration') {
        node.specifiers.forEach(s => declared.add(s.local.name));
      }
      
      // Function params are local to function, so this is just a quick hack, we might get false positives if we don't handle scope correctly.
      // Since it's a quick heuristic, let's just use regex for JSX tags again but robustly.
    }
  } catch (e) {
      // Ignore parse errors for now
  }
});

