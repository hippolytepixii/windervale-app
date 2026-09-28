const fs = require('fs');

// 1. HumanMap.tsx
let humanMap = fs.readFileSync('src/components/map/HumanMap.tsx', 'utf8');
humanMap = humanMap.replace(/'#54141d'/g, "'#000000'");
humanMap = humanMap.replace(/'#3d0c13'/g, "'#000000'");
humanMap = humanMap.replace(/bg-wv-wine hover:bg-wv-wine\/90 border border-wv-dustyrose\/30 text-wv-ivory/g, 'bg-black hover:bg-[#dfa5a2] hover:text-black border-2 border-black text-[#dfa5a2] font-black shadow-[3px_3px_0px_0px_#000000]');
humanMap = humanMap.replace(/bg-wv-wine hover:bg-wv-wine\/90/g, 'bg-black hover:bg-[#dfa5a2] hover:text-black border-2 border-black text-[#dfa5a2] font-black shadow-[3px_3px_0px_0px_#000000]');
humanMap = humanMap.replace(/bg-wv-wine\/30 border border-wv-wine text-wv-ivory/g, 'bg-black border-2 border-black text-[#dfa5a2]');
humanMap = humanMap.replace(/border border-wv-charcoal p-5 shadow-2xl/g, 'border-2 border-black p-5 shadow-[5px_5px_0px_0px_#000000]');
fs.writeFileSync('src/components/map/HumanMap.tsx', humanMap);
console.log('Updated src/components/map/HumanMap.tsx');

// 2. WorkspaceLanding.tsx
let wsLanding = fs.readFileSync('src/components/workspace/WorkspaceLanding.tsx', 'utf8');
wsLanding = wsLanding.replace(/WHAT AM I MAKING\?/g, 'what am i making?');
wsLanding = wsLanding.replace(/font-display font-medium text-2xl sm:text-3xl text-wv-paper tracking-normal mt-1/g, 'font-fun font-bold text-2xl sm:text-3xl text-[#fbf6f0] lowercase tracking-normal mt-1');
wsLanding = wsLanding.replace(/bg-wv-wine\/40 border border-wv-wine/g, 'bg-black border-2 border-[#dfa5a2] text-[#dfa5a2]');
wsLanding = wsLanding.replace(/text-wv-dustyrose/g, 'text-[#dfa5a2]');
wsLanding = wsLanding.replace(/border border-wv-charcoal/g, 'border-2 border-black shadow-[3px_3px_0px_0px_#000000]');
fs.writeFileSync('src/components/workspace/WorkspaceLanding.tsx', wsLanding);
console.log('Updated src/components/workspace/WorkspaceLanding.tsx');

// 3. ProjectsView.tsx
let pView = fs.readFileSync('src/components/projects/ProjectsView.tsx', 'utf8');
pView = pView.replace(/bg-wv-wine\/40 border border-wv-blood/g, 'bg-black border-2 border-[#dfa5a2] text-[#dfa5a2]');
pView = pView.replace(/bg-wv-wine\/20/g, 'bg-[#dfa5a2]/20');
pView = pView.replace(/text-wv-blood/g, 'text-[#dfa5a2]');
fs.writeFileSync('src/components/projects/ProjectsView.tsx', pView);
console.log('Updated src/components/projects/ProjectsView.tsx');

// 4. ConnectionsView.tsx
let cView = fs.readFileSync('src/components/connections/ConnectionsView.tsx', 'utf8');
cView = cView.replace(/bg-wv-wine\/20/g, 'bg-[#dfa5a2]/20');
cView = cView.replace(/bg-wv-wine text-wv-ivory font-semibold text-xs font-sans tracking-wider uppercase border border-wv-dustyrose\/30 hover:bg-wv-wine\/90/g, 'bg-black text-[#dfa5a2] font-black text-xs font-mono tracking-wider uppercase border-2 border-black hover:bg-[#dfa5a2] hover:text-black shadow-[2px_2px_0px_0px_#000000]');
cView = cView.replace(/bg-wv-wine text-wv-ivory border border-wv-dustyrose\/30 text-xs font-sans uppercase tracking-wider font-semibold flex items-center gap-1.5 hover:bg-wv-wine\/90/g, 'bg-black text-[#dfa5a2] border-2 border-black text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 hover:bg-[#dfa5a2] hover:text-black shadow-[2px_2px_0px_0px_#000000]');
cView = cView.replace(/bg-wv-wine text-wv-paper border border-wv-oldpink\/40/g, 'bg-black text-[#dfa5a2] border-2 border-black font-serif');
fs.writeFileSync('src/components/connections/ConnectionsView.tsx', cView);
console.log('Updated src/components/connections/ConnectionsView.tsx');

// 5. SettingsView.tsx & Tools
let sView = fs.readFileSync('src/components/settings/SettingsView.tsx', 'utf8');
sView = sView.replace(/text-wv-blood/g, 'text-[#dfa5a2]');
sView = sView.replace(/border-wv-blood/g, 'border-black');
sView = sView.replace(/bg-wv-wine\/40/g, 'bg-black');
fs.writeFileSync('src/components/settings/SettingsView.tsx', sView);
console.log('Updated src/components/settings/SettingsView.tsx');

// Tools replacement
const toolsDir = 'src/components/workspace/tools';
const toolFiles = fs.readdirSync(toolsDir);
for (const tf of toolFiles) {
  if (tf.endsWith('.tsx')) {
    const fullP = toolsDir + '/' + tf;
    let tContent = fs.readFileSync(fullP, 'utf8');
    tContent = tContent.replace(/text-wv-blood/g, 'text-[#dfa5a2]');
    tContent = tContent.replace(/border-wv-blood/g, 'border-black');
    tContent = tContent.replace(/bg-wv-blood/g, 'bg-black text-[#dfa5a2]');
    tContent = tContent.replace(/bg-wv-wine/g, 'bg-black');
    fs.writeFileSync(fullP, tContent);
  }
}
console.log('Updated workspace tools');
