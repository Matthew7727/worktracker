const fs = require('fs');
const path = require('path');

const OLD_COLOR = '#9d4edd';
const NEW_COLOR = '#ffd166';
const SRC_DIR = path.join(__dirname, 'src');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(OLD_COLOR)) {
        content = content.replaceAll(OLD_COLOR, NEW_COLOR);
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${path.relative(__dirname, fullPath)}`);
      }
    }
  }
}

walk(SRC_DIR);
