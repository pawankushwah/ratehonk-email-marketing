const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  { regex: /(text|bg|border|shadow)-\[#0ea5e9\]/gi, replace: '$1-main' },
  { regex: /(text|bg|border|shadow)-\[#374151\]/gi, replace: '$1-text' },
  { regex: /(text|bg|border|shadow)-\[#6b7280\]/gi, replace: '$1-text-dim' },
  { regex: /(text|bg|border|shadow)-\[#e0f4fc\]/gi, replace: '$1-main-dim' },
  { regex: /(text|bg|border|shadow)-\[#0284c7\]/gi, replace: '$1-alt' } // mapping hover sky-700 to alt for now
];

walkDir(path.join(__dirname, 'app'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replacements.forEach(r => {
      content = content.replace(r.regex, r.replace);
    });

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
