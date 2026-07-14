const fs = require('fs');
const files = ['public/admin.html', 'public/app.js', 'public/styles.css', 'server/server.js'];
for (const f of files) {
  let text = fs.readFileSync(f, 'utf8');
  
  text = text.replace(/Clinical Suite/g, 'AI Suite');
  text = text.replace(/CLINICAL TRIAGE TOOL/g, 'AI TRIAGE TOOL');
  text = text.replace(/Automated acuity scoring/g, 'AI acuity scoring');
  text = text.replace(/Run Clinical Triage/g, 'Run AI Triage');
  text = text.replace(/Run Triage/g, 'Run AI Triage'); // Just in case my previous replace caught this
  text = text.replace(/Ambient Auto-Note/g, 'Ambient AI Auto-Note');
  text = text.replace(/AUTO-GENERATED/g, 'AI-GENERATED');
  text = text.replace(/Auto-Assisted/g, 'AI-Assisted');
  text = text.replace(/Clinical output rendering/g, 'AI output rendering');
  text = text.replace(/Automated Scrub/g, 'AI Scrub');
  text = text.replace(/Generating clinical summary/g, 'Generating AI summary');
  text = text.replace(/Clinical Output/g, 'AI Output');
  text = text.replace(/Clinical Engines/g, 'AI Engines');
  text = text.replace(/Clinical Endpoints/g, 'AI Endpoints');
  
  text = text.replace(/insight-card/g, 'ai-card');
  text = text.replace(/insight-panel/g, 'ai-panel');
  text = text.replace(/insight-tool/g, 'ai-tool');
  text = text.replace(/insight-section/g, 'ai-section');
  text = text.replace(/insight-output/g, 'ai-output');
  
  text = text.replace(/switchView\("insight"\)/g, 'switchView("ai")');
  text = text.replace(/data-view="insight"/g, 'data-view="ai"');
  text = text.replace(/id="insight"/g, 'id="ai"');
  text = text.replace(/data-view-jump="insight"/g, 'data-view-jump="ai"');
  
  text = text.replace(/const insightSection = document.querySelector\("#ai"\);/g, 'const aiSection = document.querySelector("#ai");');
  text = text.replace(/if \(\!insightSection\) return;/g, 'if (!aiSection) return;');
  text = text.replace(/insightSection\.insertBefore/g, 'aiSection.insertBefore');
  text = text.replace(/insightSection\.firstChild/g, 'aiSection.firstChild');

  fs.writeFileSync(f, text);
}
console.log('Done reverting insight/clinical to ai.');
