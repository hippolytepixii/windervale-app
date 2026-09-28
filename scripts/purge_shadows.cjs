const fs = require('fs');

// 1. Update tailwind.config.js to eliminate shadows
let tw = fs.readFileSync('tailwind.config.js', 'utf8');
tw = tw.replace(/boxShadow:\s*\{[\s\S]*?\},/, `boxShadow: {
        'none': '0 0 #0000',
        'editorial': '0 0 #0000',
        'editorial-bold': '0 0 #0000',
        'editorial-rose': '0 0 #0000',
        'editorial-wine': '0 0 #0000',
        'editorial-cobalt': '0 0 #0000',
        'editorial-mustard': '0 0 #0000',
        'editorial-ivory': '0 0 #0000',
      },`);
fs.writeFileSync('tailwind.config.js', tw);
console.log('Updated tailwind.config.js');

// 2. Update src/index.css to remove box-shadow rules
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/box-shadow:[^;]+;/g, '/* box-shadow removed for bold borders */');
fs.writeFileSync('src/index.css', css);
console.log('Updated src/index.css');

// 3. Strip shadow-[...] and shadow-(2xl|xl|lg|md|sm) from all tsx files in src/
function cleanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = dir + '/' + entry.name;
    if (entry.isDirectory()) {
      cleanDirectory(full);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      let content = fs.readFileSync(full, 'utf8');
      const original = content;
      content = content.replace(/shadow-\[[^\]]+\]/g, '');
      content = content.replace(/shadow-(2xl|xl|lg|md|sm)/g, '');
      if (content !== original) {
        fs.writeFileSync(full, content);
        console.log('Stripped shadows from ' + full);
      }
    }
  }
}
cleanDirectory('src');
