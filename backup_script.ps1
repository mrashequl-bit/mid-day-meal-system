$SourceDir = "C:\Users\Sunny\Desktop\Mid Day Meal"
$BaseBackupDir = "C:\Users\Sunny\Desktop\Mid Day Meal\Backup"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupDir = Join-Path $BaseBackupDir "MidDayMeal_Backup_$Timestamp"

# Create backup directory
if (-not (Test-Path -Path $BaseBackupDir)) {
    New-Item -ItemType Directory -Path $BaseBackupDir | Out-Null
}
New-Item -ItemType Directory -Path $BackupDir | Out-Null

Write-Host "Creating backup at $BackupDir ..."

# Exclude unnecessary heavy folders, but KEEP .wrangler (contains DB state)
$ExcludeList = @("node_modules", "dist", "build", ".next", ".git", "Backup")

# Get items to copy
$Items = Get-ChildItem -Path $SourceDir -Exclude $ExcludeList

# Copy each item
foreach ($Item in $Items) {
    $DestinationPath = Join-Path $BackupDir $Item.Name
    Copy-Item -Path $Item.FullName -Destination $DestinationPath -Recurse -Force
}

# Add Guideline file
$GuidelineContent = @"
======================================================
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
- এডিটরের টার্মিনাল ওপেন করুন।

ধাপ ৩: প্যাকেজ ইন্সটল
- প্রজেক্টের সাইজ ছোট রাখার জন্য node_modules ফোল্ডারটি ব্যাকআপ করা হয়নি। তাই প্রথমে ডিপেন্ডেন্সিগুলো ইন্সটল করতে হবে। টার্মিনালে নিচের কমান্ডটি রান করুন:
  npm install

ধাপ ৪: প্রজেক্ট রান করা
- ইন্সটলেশন শেষ হলে সরাসরি প্রজেক্ট রান করতে নিচের কমান্ডটি দিন:
  npm run dev

এটাই! সিস্টেমটি আগের মতই লোকালহোস্টে চালু হবে এবং আপনার পূর্বের ডাটাবেস (.wrangler ফোল্ডারে থাকা ডাটা) হুবহু কাজ করবে। কোনো এক্সট্রা কনফিগারেশনের প্রয়োজন নেই (Plug and Play)।
"@

$GuidelinePath = Join-Path $BackupDir "Restore_Guideline.txt"
Set-Content -Path $GuidelinePath -Value $GuidelineContent -Encoding UTF8

Write-Host "Backup completed successfully!"
Write-Host "Please check $BackupDir"
