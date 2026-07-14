const fs = require('fs');
const files = ['public/admin.html', 'public/app.js', 'public/styles.css', 'server/server.js'];
for (const f of files) {
  let text = fs.readFileSync(f, 'utf8');
  
  // Text content
  text = text.replace(/AI Suite/g, 'Smart Clinical Tools');
  text = text.replace(/AI TRIAGE TOOL/g, 'Automated Triage Tool');
  text = text.replace(/Run AI Triage/g, 'Run Automated Triage');
  text = text.replace(/Ambient AI Auto-Note/g, 'Ambient Auto-Note');
  text = text.replace(/AI-GENERATED/g, 'AUTO-GENERATED');
  text = text.replace(/Generating AI summary/g, 'Generating clinical summary');
  text = text.replace(/AI acuity scoring/g, 'Automated acuity scoring');
  text = text.replace(/AI output rendering/g, 'Smart output rendering');
  text = text.replace(/AI Scrub/g, 'Automated Scrub');
  text = text.replace(/AI Output/g, 'Smart Output');
  text = text.replace(/AI Engines/g, 'Clinical Engines');
  text = text.replace(/AI Endpoints/g, 'Clinical Endpoints');
  text = text.replace(/AI-Assisted/gi, 'Auto-Assisted');
  
  // Classes
  text = text.replace(/ai-card/g, 'smart-card');
  text = text.replace(/ai-panel/g, 'smart-panel');
  text = text.replace(/ai-tool-grid/g, 'smart-tool-grid');
  text = text.replace(/ai-tool-card/g, 'smart-tool-card');
  text = text.replace(/ai-section-label/g, 'smart-section-label');
  text = text.replace(/ai-output/g, 'smart-output');
  
  // IDs and views
  text = text.replace(/id="ai"/g, 'id="smartTools"');
  text = text.replace(/data-view="ai"/g, 'data-view="smartTools"');
  text = text.replace(/data-view-jump="ai"/g, 'data-view-jump="smartTools"');
  text = text.replace(/switchView\('ai'\)/g, "switchView('smartTools')");
  text = text.replace(/switchView\("ai"\)/g, 'switchView("smartTools")');
  
  // JS vars
  text = text.replace(/aiSection/g, 'smartSection');
  text = text.replace(/#ai/g, '#smartTools');

  fs.writeFileSync(f, text);
}
console.log('Scrub complete.');
