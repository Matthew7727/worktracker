const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function findAndReplaceStrings(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findAndReplaceStrings(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.jsx') || fullPath.endsWith('.js'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const originalContent = content;
      
      // Basic color replacement
      content = content.replace(/color:\s*'(?:black|#000000)'/g, "color: 'text.primary'");
      content = content.replace(/color:\s*'(?:white|#ffffff)'/g, "color: 'background.paper'");
      content = content.replace(/bgcolor:\s*'(?:white|#ffffff)'/g, "bgcolor: 'background.paper'");
      content = content.replace(/bgcolor:\s*'(?:black|#000000)'/g, "bgcolor: 'text.primary'");
      content = content.replace(/backgroundColor:\s*'(?:white|#ffffff)'/g, "backgroundColor: 'background.paper'");
      
      // Borders
      content = content.replace(/border:\s*'(\d+px (?:solid|dashed)) (?:black|#000000)'/g, "border: '$1', borderColor: 'text.primary'");
      content = content.replace(/borderBottom:\s*'(\d+px (?:solid|dashed)) (?:black|#000000)'/g, "borderBottom: '$1', borderColor: 'text.primary'");
      content = content.replace(/borderTop:\s*'(\d+px (?:solid|dashed)) (?:black|#000000)'/g, "borderTop: '$1', borderColor: 'text.primary'");
      content = content.replace(/borderColor:\s*'(?:black|#000000)'/g, "borderColor: 'text.primary'");
      
      // Theme aware box shadows. Needs to handle being inside sx={{ ... }}
      content = content.replace(/boxShadow:\s*'([^']+)\s+(?:black|#000000)'/g, "boxShadow: (theme) => `$1 ${theme.palette.text.primary}`");
      // Handle rgba(0,0,0,0.1) shadows slightly differently where they were explicitly using some opacity
      content = content.replace(/boxShadow:\s*'([^']+)\s+rgba\(0,0,0,0\.1\)'/g, "boxShadow: (theme) => `$1 ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`");

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

findAndReplaceStrings(directoryPath);
console.log('Done!');
