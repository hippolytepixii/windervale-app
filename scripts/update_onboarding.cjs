const fs = require('fs');

let flowCode = fs.readFileSync('src/components/onboarding/OnboardingFlow.tsx', 'utf8');

// 1. In handleRegisterSubmit, pass offerings and portfolio_url
flowCode = flowCode.replace(
  'collaboration_interests: fullCollaborationNotes,',
  `collaboration_interests: whatDoYouWant.trim(),
        offerings: whatCanYouOffer.trim(),
        portfolio_url: portfolioLink.trim(),`
);

// 2. Remove the 01 / IDENTITY badge and header numbers
flowCode = flowCode.replace(
  /<span className="bg-black text-\[#dfa5a2\] px-2 py-0\.5 font-bold uppercase">[\s\S]*?<\/span>/,
  `<span className="font-mono text-[10px] font-bold text-black uppercase tracking-wider">
            APPLICATION
          </span>`
);

// 3. Remove all shadow classes
flowCode = flowCode.replace(/shadow-\[[^\]]+\]/g, '');

fs.writeFileSync('src/components/onboarding/OnboardingFlow.tsx', flowCode);
console.log('Successfully updated OnboardingFlow.tsx');
