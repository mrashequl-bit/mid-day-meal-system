const fs = require('fs');

const cssFiles = [
  'app/components/DashboardApp.css',
  'app/components/SystemBrandSync.css',
  'app/components/EmbeddedAreaExpenseWorkspace.css',
  'app/components/SettingsModule.css',
  'app/components/UserManagementWidget.css',
  'app/components/ReportDashboardWidgets.css'
];

cssFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // First, restore if already broken (replace empty max-width with nothing or just ignore them since we restored line 1)
    
    // Replace @media (max-width: xxx) with @media screen and (max-width: xxx)
    content = content.replace(/@media\s*\(\s*max-width\s*:\s*([0-9]+px)\s*\)/g, '@media screen and (max-width: $1)');
    
    // Replace @media (width<=xxx) with @media screen and (max-width: xxx)
    content = content.replace(/@media\s*\(\s*width\s*<=\s*([0-9]+px)\s*\)/g, '@media screen and (max-width: $1)');
    
    // Replace @media (min-width: xxx) with @media screen and (min-width: xxx)
    content = content.replace(/@media\s*\(\s*min-width\s*:\s*([0-9]+px)\s*\)/g, '@media screen and (min-width: $1)');
    
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  }
});
