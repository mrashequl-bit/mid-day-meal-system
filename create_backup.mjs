import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = __dirname;
const baseBackupDir = path.join(sourceDir, 'Backup');

// Generate Timestamp (YYYY-MM-DD_HH-mm-ss)
const now = new Date();
const timestamp = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + '_' +
    String(now.getHours()).padStart(2, '0') + '-' +
    String(now.getMinutes()).padStart(2, '0') + '-' +
    String(now.getSeconds()).padStart(2, '0');

const backupDir = path.join(baseBackupDir, `MidDayMeal_Backup_${timestamp}`);

// Create directories
if (!fs.existsSync(baseBackupDir)) {
    fs.mkdirSync(baseBackupDir);
}
fs.mkdirSync(backupDir);

console.log(`Creating backup at: ${backupDir}`);

// Exclude list (Do not exclude .wrangler as it contains the D1 database state)
const excludeList = ['node_modules', 'dist', 'build', '.next', '.git', 'Backup', 'create_backup.mjs'];

// Recursive copy function
function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(function(childItemName) {
            if (!excludeList.includes(childItemName)) {
                copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
            }
        });
    } else {
        if (!excludeList.includes(path.basename(src))) {
            fs.copyFileSync(src, dest);
        }
    }
}

// Start copy
fs.readdirSync(sourceDir).forEach(item => {
    if (!excludeList.includes(item) && item !== 'backup_script.ps1') {
        copyRecursiveSync(path.join(sourceDir, item), path.join(backupDir, item));
    }
});

// Bengali RTF generation with unicode escapes
function encodeRTF(text) {
    return text.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code > 127) {
            return `\\u${code}?`;
        }
        if (char === '\\' || char === '{' || char === '}') {
            return '\\' + char;
        }
        if (char === '\n') {
            return '\\par\n';
        }
        return char;
    }).join('');
}

const instructionsText = `======================================================
Mid Day Meal System - Restore & Plug and Play Guide
======================================================

এই ফোল্ডারে আপনার সম্পূর্ণ সিস্টেমের সোর্স কোড এবং ডাটাবেস (.wrangler ফোল্ডারে) ব্যাকআপ করা আছে। 

অন্য কোনো পিসিতে বা ভবিষ্যতে এটি পুনরায় চালু করতে নিচের ধাপগুলো অনুসরণ করুন:

ধাপ ১: Prerequisites (প্রয়োজনীয় সফটওয়্যার)
- আপনার পিসিতে Node.js ইন্সটল করা থাকতে হবে (ভার্সন ২২ বা তার উপরের)। 
  চেক করতে টার্মিনালে লিখুন: node -v

ধাপ ২: প্রজেক্ট ওপেন করুন
- এই ব্যাকআপ ফোল্ডারটি (MidDayMeal_Backup_...) আপনার সুবিধামতো কোনো ড্রাইভে রাখুন।
- VS Code বা যেকোনো কোড এডিটর দিয়ে ফোল্ডারটি ওপেন করুন।
- এডিটরের টার্মিনাল (Terminal) ওপেন করুন।

ধাপ ৩: প্যাকেজ ইন্সটল
- প্রজেক্টের সাইজ ছোট রাখার জন্য node_modules ফোল্ডারটি ব্যাকআপ করা হয়নি। তাই প্রথমে ডিপেন্ডেন্সিগুলো ইন্সটল করতে হবে। টার্মিনালে নিচের কমান্ডটি রান করুন:
  npm install

ধাপ ৪: প্রজেক্ট রান করা
- ইন্সটলেশন শেষ হলে সরাসরি প্রজেক্ট রান করতে নিচের কমান্ডটি দিন:
  npm run dev

এটাই! সিস্টেমটি আগের মতই লোকালহোস্টে চালু হবে এবং আপনার পূর্বের ডাটাবেস (.wrangler ফোল্ডারে থাকা ডাটা) হুবহু কাজ করবে। কোনো এক্সট্রা কনফিগারেশনের প্রয়োজন নেই (Plug and Play).
`;

const rtfContent = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang1033{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}}
{\\*\\generator Node.js}\\viewkind4\\uc1 
\\pard\\sa200\\sl276\\slmult1\\f0\\fs22\\lang9 
${encodeRTF(instructionsText)}
}`;

const instructionsPath = path.join(backupDir, 'instructions.rtf');
fs.writeFileSync(instructionsPath, rtfContent, 'utf8');

console.log('Backup completed successfully!');
console.log(`Instructions saved at: ${instructionsPath}`);
