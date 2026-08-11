
const fs = require('fs');

let origLines = fs.readFileSync('app/components/DashboardApp.orig.css', 'utf8').split('\n');
let currentLines = fs.readFileSync('app/components/DashboardApp.css', 'utf8').split('\n');

// Line 1 is the minified CSS
currentLines[0] = origLines[0];

// Write back
fs.writeFileSync('app/components/DashboardApp.css', currentLines.join('\n'));
console.log('Restored line 1 of DashboardApp.css');

