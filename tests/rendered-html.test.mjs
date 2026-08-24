import { access, readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("the government seal is the site favicon and installable app icon", async () => {
  const layout = await read("app/layout.tsx");
  const manifest = await read("public/manifest.webmanifest");

  assert.match(layout, /manifest: "\/manifest\.webmanifest"/);
  assert.match(layout, /url: "\/bd-logo\.svg", type: "image\/svg\+xml"/);
  assert.match(layout, /url: "\/apple-touch-icon\.png"/);
  assert.match(manifest, /"src": "\/app-icon-192\.png"/);
  assert.match(manifest, /"src": "\/app-icon-512\.png"/);
  await access(new URL("../public/bd-logo.svg", import.meta.url));
  await access(new URL("../public/apple-touch-icon.png", import.meta.url));
  await access(new URL("../public/app-icon-192.png", import.meta.url));
  await access(new URL("../public/app-icon-512.png", import.meta.url));
});

test("stock page keeps its Bengali headings without English section labels", async () => {
  const dashboard = await read("app/components/DashboardApp.tsx");
  const styles = await read("app/components/DashboardApp.css");
  const stockRoute = await read("app/api/stock/route.ts");
  const acceptedStockTypes = stockRoute.match(/const transactionTypes = new Set\(\[[\s\S]*?\]\);/)?.[0] ?? "";

  assert.doesNotMatch(dashboard, /Procurement Planner|Stock Transaction|Recent Ledger/);
  assert.match(dashboard, /কত দিনের পণ্য একসাথে কিনবেন/);
  assert.match(dashboard, /সাম্প্রতিক লেনদেন/);
  assert.doesNotMatch(dashboard, /ডিফল্ট পরিকল্পনা|চাহিদাভিত্তিক/);
  assert.doesNotMatch(dashboard, /ক্রয় পরিমাণ = নির্বাচিত দিনের মোট চাহিদা/);
  assert.doesNotMatch(dashboard, /নষ্ট বা ইস্যুকৃত পণ্য স্টক লেনদেন/);
  assert.doesNotMatch(styles, /stock-formula/);
  assert.doesNotMatch(dashboard, /stock transaction দেওয়ার সঙ্গে সঙ্গে balance/);
  assert.match(styles, /\/\* Compact procurement planner \*\//);
  assert.match(styles, /\.stock-planner \{[\s\S]*?padding: 16px 18px;/);
  assert.match(styles, /\.stock-planner > \.panel-head h2 \{[\s\S]*?font-size: 20px;/);
  assert.match(styles, /\.stock-planner \.coverage-controls label \{[\s\S]*?font-size: 13px;/);
  assert.match(styles, /\.stock-planner \.procurement-card dt \{[\s\S]*?font-size: 12px;/);
  assert.match(styles, /@media \(max-width: 520px\)[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(dashboard, /\[stockLedgerItem, setStockLedgerItem\]/);
  assert.match(dashboard, /filteredStockLedger = a\.filter/);
  assert.match(dashboard, /Math\.ceil\(filteredStockLedger\.length \/ 10\)/);
  assert.match(dashboard, /currentStockLedgerPage \* 10/);
  assert.match(dashboard, /className: `stock-ledger-toolbar no-print`/);
  assert.match(dashboard, /className: `stock-ledger-pagination no-print`/);
  assert.match(dashboard, /className: `stock-ledger-print print-only`/);
  assert.match(dashboard, /printDesktopLayout\(`printing-stock-ledger`\)/);
  assert.match(styles, /body\.printing-stock-ledger \.stock-ledger-print/);
  assert.match(dashboard, /\[stockPlannerOpen, setStockPlannerOpen\]/);
  assert.match(dashboard, /stockPlannerOpen \? `−` : `\+`/);
  assert.match(dashboard, /setStockPlannerOpen\(\(e\) => !e\)/);
  assert.doesNotMatch(styles, /\.stock-planner \{[\s\S]*?order: 2/);
  assert.match(styles, /\.stock-planner:not\(\.is-open\) \.coverage-controls/);
  assert.match(dashboard, /কত দিনের পণ্য একসাথে কিনবেন\?/);
  assert.match(dashboard, /পরবর্তী বিতরণ \$\{formatStockPlanDate/);
  assert.match(dashboard, /\$\{N\(String\(t\)\)\}/);
  assert.match(dashboard, /রোজঃ \$\{formatStockPlanWeekday/);
  assert.match(dashboard, /\/api\/meal-plan\?month=\$\{e\}/);
  assert.match(dashboard, /stockPlanDays\.find/);
  assert.match(dashboard, /e\.items\.includes\(n\)/);
  assert.match(dashboard, /schools: h/);
  assert.match(dashboard, /areaDailyDemandByCode = stockSchools\.reduce/);
  assert.match(dashboard, /\[stockOutAreas, setStockOutAreas\]/);
  assert.match(dashboard, /className: `stock-area-picker`/);
  assert.match(dashboard, /type: `checkbox`/);
  assert.match(dashboard, /stockOutAreas\.reduce/);
  assert.match(dashboard, /areaCodes: g === `stock_out` \? stockOutAreas : \[\]/);
  assert.match(dashboard, /formatStockAreaNames\(e\.areaCode\)/);
  assert.match(styles, /\.stock-area-picker \{[\s\S]*?grid-template-columns: repeat\(4/);
  assert.match(stockRoute, /areaCodes\?: unknown/);
  assert.match(stockRoute, /JSON\.stringify\(areaCodes\)/);
  assert.match(stockRoute, /area_codes_json/);
  assert.match(await read("db/bootstrap.ts"), /\["area_codes_json", "TEXT"\]/);
  assert.doesNotMatch(
    dashboard,
    /অঞ্চল নির্বাচন করলে একদিনের এক আইটেমের চাহিদা পরিমাণ ঘরে স্বয়ংক্রিয়ভাবে বসবে/,
  );
  const deleteHandler = stockRoute.slice(stockRoute.indexOf("export async function DELETE"));
  assert.doesNotMatch(deleteHandler, /let balance = 0|পূর্ববর্তী স্টক ঋণাত্মক/);
  assert.match(deleteHandler, /const reverseDelta = -deletedDelta/);
  assert.match(deleteHandler, /current\.currentQuantity \+ reverseDelta/);
  assert.match(deleteHandler, /return NextResponse\.json\([\s\S]*?status: 500/);
  assert.match(dashboard, /responseText = await e\.text\(\)[\s\S]*?method: `DELETE`|method: `DELETE`[\s\S]*?responseText = await e\.text\(\)/);
  assert.match(dashboard, /stockEntryTransactionTypes\.map/);
  assert.match(dashboard, /stockEntryTransactionTypes\.includes\(e\.transactionType\)/);
  assert.doesNotMatch(acceptedStockTypes, /adjustment_add|adjustment_sub/);
  assert.match(stockRoute, /outgoingTypes = new Set\(\["stock_out", "damaged", "adjustment_sub"\]\)/);
  assert.match(dashboard, /formatStockPlanDate\(M\(e\)\).*রোজঃ.*formatStockPlanWeekday\(M\(e\)\)/);
  assert.match(styles, /\.stock-planner \.date-chips \{[\s\S]*?display: grid/);
  assert.match(styles, /\.stock-planner \.date-chips span \{[\s\S]*?white-space: normal/);
  assert.doesNotMatch(stockRoute, /ORDER BY st\.id DESC LIMIT 20/);
});

test("supplier page keeps the Bengali account heading without the English label", async () => {
  const dashboard = await read("app/components/DashboardApp.tsx");
  const styles = await read("app/components/DashboardApp.css");

  assert.doesNotMatch(dashboard, /Supplier Accounts/);
  assert.match(dashboard, /পণ্যভিত্তিক সরবরাহকারী ও আলাদা হিসাব/);
  assert.match(dashboard, /children: `নগদ প্রদান`/);
  assert.doesNotMatch(dashboard, /children: `ন নগদ প্রদান`/);
  assert.match(styles, /\/\* Professional stacked supplier accounts \*\//);
  assert.match(styles, /\.supplier-account-grid \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(styles, /\.supplier-account \{[\s\S]*?grid-template-columns: minmax\(210px, \.7fr\) minmax\(0, 1\.3fr\)/);
  assert.match(styles, /\.supplier-account \.supplier-list > div \{[\s\S]*?grid-template-columns: minmax\(210px, 1fr\) auto auto minmax\(125px, auto\)/);
  assert.match(dashboard, /\[supplierFormOpen, setSupplierFormOpen\]/);
  assert.match(dashboard, /aria-controls": `supplier-entry-form`/);
  assert.match(dashboard, /supplierFormOpen \? `−` : `\+`/);
  assert.match(dashboard, /setSupplierFormOpen\(!0\)/);
  assert.match(styles, /\.supplier-form-shell \{[\s\S]*?max-height: 0/);
  assert.match(styles, /\.supplier-form-shell\.is-open \{[\s\S]*?max-height: 520px/);
});

test("mobile notification icon uses the lucide bell without idle background", async () => {
  const component = await read("app/components/NotificationCenter.tsx");
  const styles = await read("app/components/notification-center.css");
  const accountStyles = await read("app/components/account-profile.css");

  assert.match(component, /Bell[\s\S]*from "lucide-react"/);
  assert.match(component, /className="mobile-notification-launcher"/);
  assert.doesNotMatch(component, /🔔/);
  assert.match(
    styles,
    /\.mobile-notification-launcher > span:first-child \{[\s\S]*?background: transparent;/,
  );
  assert.match(
    accountStyles,
    /@media \(max-width: 800px\) \{[\s\S]*?\.topbar \.alert-button \{[\s\S]*?display: none !important;/,
  );
  assert.match(
    accountStyles,
    /\.topbar \.alert-button::before,\s*\.topbar \.alert-button::after \{[\s\S]*?content: none !important;[\s\S]*?display: none !important;/,
  );
  assert.doesNotMatch(styles, /background: rgba\(255, 255, 255, \.08\)/);
  assert.doesNotMatch(accountStyles, /background: rgba\(255, 255, 255, \.08\)/);
});

test("expense notifications open the related payment management page", async () => {
  const notificationCenter = await read("app/components/NotificationCenter.tsx");
  const notificationStyles = await read("app/components/notification-center.css");
  const adminExpensePage = await read("app/components/AdminExpenseManagementPage.tsx");

  assert.match(notificationCenter, /area_code\?: string \| null;/);
  assert.match(notificationCenter, /notification\.type === "expense" && notification\.area_code/);
  assert.match(notificationCenter, /new CustomEvent\("open-area-expense-workspace"/);
  assert.match(notificationCenter, /expenseId: notification\.id/);
  assert.match(notificationCenter, /expenseDate: notification\.date \|\| ""/);
  assert.doesNotMatch(notificationCenter, /\/area-expenses/);
  assert.match(notificationCenter, /onClick=\{\(\) => openNotification\(notification\)\}/);
  assert.match(notificationCenter, /খরচ দেখুন/);
  assert.match(notificationStyles, /\.notification-card \{[\s\S]*?cursor: pointer;/);
  assert.match(adminExpensePage, /setSelectedArea\(initialAreaCode \|\| "all"\)/);
  assert.match(adminExpensePage, /data-ledger-expense-id/);
  assert.match(adminExpensePage, /selectedArea !== "all"/);
});

test("distribution notifications open the exact report and keep admin audience separate", async () => {
  const notificationCenter = await read("app/components/NotificationCenter.tsx");
  const notificationsRoute = await read("app/api/notifications/route.ts");
  const distributionRoute = await read("app/api/distribution-reports/route.ts");
  const distributionItemRoute = await read("app/api/distribution-reports/[id]/route.ts");
  const distribution = await read("app/components/SchoolDistributionAdjustment.tsx");

  assert.match(notificationCenter, /new CustomEvent\("open-distribution-report"/);
  assert.match(notificationCenter, /schoolEmis: targetUrl\.searchParams\.get\("school"\)/);
  assert.match(notificationCenter, /রিপোর্ট দেখুন/);
  assert.match(notificationsRoute, /WHERE is_read = 0 AND area_code IS NULL/);
  assert.match(distributionRoute, /status=new&school=\$\{data\.schoolEmisCode\}/);
  assert.match(distributionItemRoute, /school=\$\{existing\.school_emis_code\}/);
  assert.doesNotMatch(distributionItemRoute, /\/admin\/distribution/);
  assert.match(distribution, /window\.addEventListener\('open-distribution-report'/);
  assert.match(distribution, /data-distribution-school/);
});

test("profile launcher is rendered inside the sidebar instead of the header", async () => {
  const dashboard = await read("app/components/DashboardApp.tsx");
  const profileCard = await read("app/components/AccountProfileCard.tsx");
  const accountStyles = await read("app/components/account-profile.css");
  const headerStyles = await read("app/components/header-cleanup.css");

  assert.match(dashboard, /import "\.\/header-cleanup\.css"/);
  assert.doesNotMatch(dashboard, /className: `user-card`/);
  assert.match(profileCard, /import \{ createPortal \} from "react-dom"/);
  assert.match(profileCard, /document\.querySelector\("\.sidebar"\)/);
  assert.match(profileCard, /launcherTarget && createPortal\(launcher, launcherTarget\)/);
  assert.match(profileCard, /className="account-user-card"/);
  assert.match(profileCard, /className="account-settings-button"/);
  assert.match(profileCard, /open-system-settings/);
  assert.match(accountStyles, /\.sidebar > \.account-user-card \{[\s\S]*?position: static;/);
  assert.match(accountStyles, /\.sidebar > \.account-user-card \{[\s\S]*?gap: 0;[\s\S]*?overflow: hidden;/);
  assert.match(accountStyles, /\.sidebar > \.account-user-card \.account-settings-button \{[\s\S]*?border-left: 1px solid/);
  assert.match(accountStyles, /\.sidebar > \.account-user-card \.account-profile-launcher \{[\s\S]*?background: transparent;[\s\S]*?border: 0;/);
  assert.match(accountStyles, /\.sidebar-collapsed > \.account-user-card \.account-launcher-details,[\s\S]*?display: none;/);
  assert.match(accountStyles, /\.sidebar-collapsed > \.account-user-card \.account-settings-button \{ display: none; \}/);
  assert.match(accountStyles, /\.sidebar-collapsed > \.account-user-card \.account-profile-launcher \{[\s\S]*?justify-content: center;[\s\S]*?padding: 6px;/);
  assert.match(accountStyles, /\.sidebar-collapsed > \.account-user-card img\.account-launcher-avatar \{[\s\S]*?clip-path: circle\(50% at 50% 50%\);[\s\S]*?object-fit: cover;/);
  assert.match(accountStyles, /\.account-profile-card \{[\s\S]*?max-width: 282px;[\s\S]*?width: min\(282px,/);
  assert.match(accountStyles, /\.account-identity-row \{[\s\S]*?display: grid;[\s\S]*?gap: 4px;/);
  assert.match(accountStyles, /\.account-profile-trigger \{[\s\S]*?margin-top: 4px;/);
  assert.match(accountStyles, /\.account-modal-settings-btn \{[\s\S]*?margin-top: 4px;/);
  assert.match(accountStyles, /\.account-close-button \{[\s\S]*?aspect-ratio: 1;[\s\S]*?min-height: 22px;[\s\S]*?min-width: 22px;/);
  assert.match(accountStyles, /\.account-modal-settings-btn \{[\s\S]*?aspect-ratio: 1;[\s\S]*?min-height: 28px;[\s\S]*?min-width: 28px;/);
  assert.match(accountStyles, /@media \(max-width: 800px\) \{[\s\S]*?\.account-user-card \.account-settings-button \{ display: none; \}[\s\S]*?\.account-modal-settings-btn \{ display: flex; \}/);
  assert.match(headerStyles, /\.topbar \{[\s\S]*?margin-left: -32px;[\s\S]*?padding-right: 32px;/);
  assert.match(headerStyles, /\.top-actions \{[\s\S]*?margin-right: -14px;/);
  assert.match(headerStyles, /@media \(max-width: 800px\) \{[\s\S]*?\.top-actions \{[\s\S]*?margin-right: 0;/);
  assert.match(headerStyles, /@media \(max-width: 800px\) \{[\s\S]*?\.topbar > div:first-child \{[\s\S]*?display: grid;[\s\S]*?grid-template-columns: 40px minmax\(0, 1fr\);/);
  assert.match(headerStyles, /\.topbar \.mobile-menu \{[\s\S]*?grid-row: 1 \/ span 2;/);
  assert.match(headerStyles, /\.topbar > div:first-child > p,[\s\S]*?\.topbar > div:first-child > small \{[\s\S]*?white-space: nowrap;/);
  assert.match(headerStyles, /\.top-actions \.user-card \{[\s\S]*?display: none !important;/);
  assert.doesNotMatch(dashboard, /একদিনের এক আইটেমের অনুমোদিত চাহিদাকে ভিত্তি ধরে পরিকল্পনা ও হিসাব/);
  assert.match(headerStyles, /\.page-head \{[\s\S]*?align-items: flex-end;[\s\S]*?padding-bottom: 12px;/);
  assert.match(headerStyles, /\.page-head > div:first-child \{[\s\S]*?display: none !important;/);
});

test("dashboard cleanup widgets replace operational alert residue", async () => {
  const page = await read("app/page.tsx");
  const reportWidget = await read("app/components/ReportDashboardWidgets.tsx");
  const adminExpensePage = await read("app/components/AdminExpenseManagementPage.tsx");
  const reportStyles = await read("app/components/report-dashboard-widgets.css");

  assert.match(page, /<ReportDashboardWidgets[\s\S]*?accountRole=\{user\.role \|\| ""\}[\s\S]*?userAreaCode=\{user\.areaCode \|\| ""\}/);
  assert.doesNotMatch(reportWidget, /AdminExpenseManagementPage/);
  assert.match(reportWidget, /new CustomEvent\("open-area-expense-workspace"\)/);
  assert.doesNotMatch(reportWidget, /\/area-expenses/);
  assert.match(adminExpensePage, /অঞ্চলভিত্তিক খরচ/);
  assert.doesNotMatch(adminExpensePage, /standalone|createPortal/);
  assert.match(adminExpensePage, /value="all">সকল অঞ্চল/);
  assert.match(adminExpensePage, /selectedArea === "all"/);
  assert.match(adminExpensePage, /পেমেন্ট দিতে নির্দিষ্ট একটি অঞ্চল নির্বাচন করুন/);
  assert.match(adminExpensePage, /পেমেন্ট ম্যানেজ/);
  assert.match(adminExpensePage, /\/api\/my-account/);
  assert.match(adminExpensePage, /\/api\/expenses\?\$\{params\.toString\(\)\}/);
  assert.match(reportWidget, /heading\.textContent = "রিপোর্ট"/);
  assert.match(reportStyles, /\.report-widget-host > article \{[\s\S]*?display: none !important;/);
  assert.match(reportStyles, /\.sidebar nav button\[title="রিপোর্ট"\]/);
  assert.match(reportStyles, /\.print-report > table:first-of-type[\s\S]*?\{\s*display: none !important;/);
  assert.doesNotMatch(reportWidget, /চাহিদা সারসংক্ষেপ|একদিনের এক আইটেমের চাহিদা/);
  assert.match(reportWidget, /আজকের বিতরণের রিপোর্ট করুন/);
  assert.match(reportWidget, /দুপুর ২টার আগে রিপোর্ট করুন · আর বাকি/);
  assert.match(reportWidget, /new CustomEvent\("open-distribution-report"/);
  assert.match(reportWidget, /new CustomEvent\("area-account-open", \{ detail: \{ focus: "expense" \} \}\)/);
  assert.match(reportWidget, /disabled=\{!reportingWindow\.canReport\}/);
  assert.doesNotMatch(await read("app/components/DashboardApp.tsx"), /স্টক অনুমোদনের আগে প্রাথমিক পরিমাণ দিন|মূল্য ছাড়া আনুমানিক মাসিক বিল তৈরি হবে না/);
  assert.doesNotMatch(await read("app/components/DashboardApp.tsx"), /Opening stock যোগ করা হয়নি|বিলের unit price অপেক্ষমাণ/);
});

test("distribution print action renders only the printable report table", async () => {
  const distribution = await read("app/components/SchoolDistributionAdjustment.tsx");
  const dashboardStyles = await read("app/components/DashboardApp.css");

  assert.match(distribution, /const printDistributionReport = useCallback/);
  assert.match(distribution, /printDesktopLayout\('printing-distribution-report'\)/);
  assert.match(distribution, /onClick=\{printDistributionReport\}/);
  assert.match(
    dashboardStyles,
    /body\.printing-distribution-report #distribution-exceptions,[\s\S]*?visibility: visible !important;/,
  );
  assert.match(
    dashboardStyles,
    /body\.printing-distribution-report \.responsive-adjustment-table \{[\s\S]*?display: table !important;/,
  );
  assert.match(
    dashboardStyles,
    /body\.printing-distribution-report \.responsive-adjustment-table tr \{[\s\S]*?position: static !important;/,
  );
  assert.match(
    dashboardStyles,
    /body\.printing-distribution-report \.responsive-adjustment-table thead \{[\s\S]*?display: table-row-group !important;/,
  );
  assert.match(
    dashboardStyles,
    /body\.printing-distribution-report \.responsive-adjustment-table th\.no-print,[\s\S]*?display: none !important;/,
  );
  assert.match(
    dashboardStyles,
    /body\.printing-distribution-report \.responsive-adjustment-table th,[\s\S]*?padding: 2px 4px !important;[\s\S]*?font-size: 8pt !important;[\s\S]*?line-height: 1\.1 !important;/,
  );
  assert.match(distribution, /<th className="no-print"[\s\S]*?>অ্যাকশন<\/th>/);
  assert.match(distribution, /<td className="no-print"/);
});

test("430px distribution layout stays compact without flattening desktop tables", async () => {
  const distribution = await read("app/components/SchoolDistributionAdjustment.tsx");
  const dashboardStyles = await read("app/components/DashboardApp.css");
  const distributionStyles = await read("app/components/distribution-redesign.css");

  assert.match(distribution, /className="distribution-exception-filters no-print"/);
  assert.match(distribution, /className="distribution-exceptions-body"/);
  assert.match(
    dashboardStyles,
    /@media \(min-width: 401px\) and \(max-width: 460px\) \{[\s\S]*?\.distribution-exception-filters \{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/,
  );
  assert.match(
    dashboardStyles,
    /@media \(max-width: 600px\) \{[\s\S]*?#distribution-exceptions \.distribution-exceptions-body \{[\s\S]*?padding: 4px !important;/,
  );
  assert.match(
    dashboardStyles,
    /@media \(max-width: 600px\) \{[\s\S]*?\.distribution-exception-filters \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);[\s\S]*?gap: 8px !important;[\s\S]*?label:first-child \{[\s\S]*?grid-column: 1 \/ -1;/,
  );
  assert.match(
    dashboardStyles,
    /@media \(max-width: 600px\) \{[\s\S]*?\.responsive-adjustment-table tr \{[\s\S]*?grid-template-columns: repeat\(12, minmax\(0, 1fr\)\);[\s\S]*?\.responsive-adjustment-table td \{[\s\S]*?white-space: normal !important;/,
  );
  assert.match(
    dashboardStyles,
    /@media \(max-width: 600px\) \{[\s\S]*?td:nth-of-type\(6\) > span \{[\s\S]*?font-size: 10px !important;[\s\S]*?line-height: 1\.25;/,
  );
  assert.doesNotMatch(distribution, /className="distribution-exceptions-body" style=/);
  assert.match(
    dashboardStyles,
    /\.responsive-adjustment-table tr \{[\s\S]*?grid-template-columns: 42px minmax\(0, 1\.35fr\) minmax\(0, 1fr\);/,
  );
  assert.match(
    distributionStyles,
    /\.daily-plan-panel-inner:not\(:has\(\.empty-state\)\) \{[\s\S]*?"plan-cards plan-total";/,
  );
  assert.match(
    distributionStyles,
    /@media \(width <= 520px\) \{[\s\S]*?grid-auto-columns: minmax\(104px, 32%\);/,
  );
  assert.match(
    distributionStyles,
    /@media \(width <= 520px\) \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) 104px;[\s\S]*?\.distribution-total strong \{[\s\S]*?font-size: 14px;/,
  );
  const dashboard = await read("app/components/DashboardApp.tsx");
  assert.match(dashboard, /\/food-thumbnails\/bread-roll\.png/);
  assert.match(dashboard, /\/food-thumbnails\/boiled-egg\.png/);
  assert.match(dashboard, /\/food-thumbnails\/banana\.png/);
  assert.doesNotMatch(dashboard, /\bCroissant\b|\bEgg\b|\bBanana\b/);
  assert.match(distributionStyles, /\.routine-food-photo \{[\s\S]*?object-fit: contain;/);
});

test("legacy distribution exceptions widget and its local dead code stay removed", async () => {
  const dashboard = await read("app/components/DashboardApp.tsx");
  const dashboardStyles = await read("app/components/DashboardApp.css");

  assert.doesNotMatch(dashboard, /children: `Exceptions`/);
  assert.doesNotMatch(dashboard, /distribution-anomaly|distribution-exception-grid/);
  assert.doesNotMatch(dashboard, /anomalies:|setAnomalies/);
  assert.doesNotMatch(dashboardStyles, /distribution-anomaly|distribution-exception-grid/);
  assert.match(dashboard, /SchoolDistributionAdjustment/);
});

test("area manager reporting uses the Dhaka 2 PM cutoff and exact automatic status", async () => {
  const distribution = await read("app/components/SchoolDistributionAdjustment.tsx");
  const collectionRoute = await read("app/api/distribution-reports/route.ts");
  const itemRoute = await read("app/api/distribution-reports/[id]/route.ts");
  const reportingWindow = await read("app/lib/distribution-reporting-window.ts");

  assert.match(reportingWindow, /DISTRIBUTION_REPORT_CUTOFF_HOUR = 14/);
  assert.match(reportingWindow, /timeZone: "Asia\/Dhaka"/);
  assert.match(reportingWindow, /canReport: isReportDay && !isAfterCutoff/);
  assert.match(distribution, /!report && reportingWindow\.shouldAutoReceive/);
  assert.match(distribution, /const hasScheduledItems = showBread \|\| showEgg \|\| showBanana/);
  assert.match(distribution, /const isAutoReceived = hasScheduledItems &&/);
  assert.match(distribution, /if \(isAutoReceived\) \{[\s\S]*?totalBread \+= planned;[\s\S]*?\} else if \(report\) \{/);
  assert.match(distribution, /totalBread \+= Number\(report\.received_bread\) \|\| 0/);
  assert.match(distribution, /totalEgg \+= Number\(report\.received_egg\) \|\| 0/);
  assert.match(distribution, /totalBanana \+= Number\(report\.received_banana\) \|\| 0/);
  assert.doesNotMatch(distribution, /else \{\s*totalBread \+= report\.received_bread/);
  assert.match(distribution, /সঠিক আইটেম পাওয়া গেছে/);
  assert.match(distribution, /report\.status === 'new'[\s\S]*?problemTypeMapping as any\)\[report\.problem_type\]/);
  assert.doesNotMatch(distribution, /report\.status === 'new' \? 'নতুন'/);
  assert.doesNotMatch(distribution, /নতুন অভিযোগ \(New\)/);
  assert.match(collectionRoute, /if \(showBread \|\| showEgg \|\| showBanana\)/);
  assert.match(collectionRoute, /INSERT OR IGNORE INTO distribution_reports/);
  assert.match(collectionRoute, /status, problem_type, reason, comments, reported_by/);
  assert.match(collectionRoute, /'resolved', 'none',[\s\S]*?'অটো-রিসিভড \(২ টার পর\)', 'System'/);
  assert.match(collectionRoute, /if \(!reportingWindow\.canReport\)/);
  assert.match(itemRoute, /if \(!getAreaManagerReportingWindow\(existing\.date\)\.canReport\)/);
});

test("area cards open the complete embedded expense workspace below the area grid", async () => {
  const page = await read("app/page.tsx");
  const dashboard = await read("app/components/DashboardApp.tsx");
  const embeddedWorkspace = await read(
    "app/components/EmbeddedAreaExpenseWorkspace.tsx",
  );
  const embeddedStyles = await read(
    "app/components/embedded-area-expense-workspace.css",
  );

  assert.match(page, /<EmbeddedAreaExpenseWorkspace \/>/);
  assert.match(dashboard, /open-area-expense-workspace/);
  assert.match(dashboard, /detail: \{ areaCode: t\.code \}/);
  assert.match(embeddedWorkspace, /document\.querySelector\("\.areas-panel"\)/);
  assert.match(embeddedWorkspace, /button\.getAttribute\("title"\) === "অঞ্চল"/);
  assert.match(embeddedWorkspace, /areasNavButton\?\.click\(\)/);
  assert.match(embeddedWorkspace, /insertAdjacentElement\("afterend", workspaceHost\)/);
  assert.match(embeddedWorkspace, /new MutationObserver/);
  assert.match(embeddedWorkspace, /target\.closest<HTMLButtonElement>\("\.sidebar nav button"\)/);
  assert.match(embeddedWorkspace, /setOpen\(false\)/);
  assert.doesNotMatch(embeddedWorkspace, /ChevronUp|সংকুচিত করুন/);
  assert.match(
    embeddedWorkspace,
    /<AdminExpenseManagementPage initialAreaCode=\{areaCode\} initialExpenseId=\{expenseId\} initialExpenseDate=\{expenseDate\} \/>/,
  );
  assert.match(embeddedStyles, /\.embedded-area-expense-workspace \{/);
  assert.match(
    embeddedStyles,
    /@media \(max-width: 800px\) \{[\s\S]*?\.embedded-expense-toolbar \{/,
  );
});

test("embedded expense workspace keeps the polished report layout without a legacy route", async () => {
  const adminExpensePage = await read("app/components/AdminExpenseManagementPage.tsx");
  const embeddedWorkspace = await read("app/components/EmbeddedAreaExpenseWorkspace.tsx");
  const expenseStyles = await read("app/components/admin-expense-management-page.css");

  assert.match(
    embeddedWorkspace,
    /<AdminExpenseManagementPage initialAreaCode=\{areaCode\} initialExpenseId=\{expenseId\} initialExpenseDate=\{expenseDate\} \/>/,
  );
  assert.match(adminExpensePage, /className="admin-expense-page"/);
  assert.doesNotMatch(adminExpensePage, /className="admin-expense-header"/);
  assert.doesNotMatch(adminExpensePage, /standalone|createPortal|window\.location\.search/);
  assert.doesNotMatch(expenseStyles, /expense-shell-main|admin-expense-standalone|admin-expense-header/);
  assert.match(expenseStyles, /\.admin-expense-filters \{[\s\S]*?border-radius: 18px;[\s\S]*?box-shadow: 0 12px 32px/);
  assert.match(expenseStyles, /\.admin-expense-metrics article \{[\s\S]*?min-height: 118px;[\s\S]*?overflow: hidden;/);
  assert.match(expenseStyles, /\.admin-expense-report,[\s\S]*?\.admin-payment-panel,[\s\S]*?\.admin-expense-details \{[\s\S]*?border-radius: 20px;[\s\S]*?box-shadow: 0 16px 38px/);
  assert.match(adminExpensePage, /className="panel admin-ledger-panel"/);
  assert.match(adminExpensePage, /className="no-print admin-ledger-payment-form"/);
  assert.match(expenseStyles, /\.admin-ledger-panel-head \{[\s\S]*?grid-template-columns:/);
  assert.match(expenseStyles, /@media \(max-width: 520px\) \{[\s\S]*?\.admin-ledger-payment-form \{[\s\S]*?grid-template-columns: 1fr;/);
});

test("official area codes stay hidden from user-facing UI and exports", async () => {
  const dashboard = await read("app/components/DashboardApp.tsx");
  const profileCard = await read("app/components/AccountProfileCard.tsx");
  const adminExpensePage = await read("app/components/AdminExpenseManagementPage.tsx");

  assert.doesNotMatch(dashboard, /অঞ্চল কোড|অফিসিয়াল area code|children: e\.areaCode|children: t\.code|children: e\.code|children: \[e\.name, ` \(`/);
  assert.doesNotMatch(profileCard, /display\.area_code \|\|/);
  assert.match(profileCard, /display\.area_code \? "নির্ধারিত অঞ্চল" : "উপজেলা পর্যায়ের পূর্ণ অনুমতি"/);
  assert.doesNotMatch(adminExpensePage, /<small>\{area\.code\}<\/small>/);
});

test("security cleanup keeps password hashing helpers in place", async () => {
  const passwordHelper = await read("app/lib/password.ts");
  const loginRoute = await read("app/api/auth/login/route.ts");
  const authHelper = await read("app/lib/auth.ts");
  const profileRoute = await read("app/api/profile/route.ts");
  const stockRoute = await read("app/api/stock/route.ts");
  const demandRoute = await read("app/api/schools/[emisCode]/demand/route.ts");
  const supplierRoute = await read("app/api/suppliers/[id]/ledger/route.ts");
  const distributionRoute = await read("app/api/distribution-reports/route.ts");
  const distributionItemRoute = await read("app/api/distribution-reports/[id]/route.ts");
  const accountRoute = await read("app/api/my-account/route.ts");
  const bootstrap = await read("db/bootstrap.ts");
  const loginPage = await read("app/login/page.tsx");

  assert.match(passwordHelper, /PBKDF2_ITERATIONS = 100_000/);
  assert.match(passwordHelper, /import \{ pbkdf2Async \} from "@noble\/hashes\/pbkdf2\.js"/);
  assert.match(passwordHelper, /iterations > WEB_CRYPTO_MAX_ITERATIONS/);
  assert.match(passwordHelper, /pbkdf2Async\(sha256, password, salt/);
  assert.match(passwordHelper, /crypto\.subtle\.deriveBits/);
  assert.match(passwordHelper, /pbkdf2-sha256:/);
  assert.match(loginRoute, /verifyPassword/);
  assert.match(loginRoute, /createSession\(user\.id\)/);
  assert.doesNotMatch(loginRoute, /WHERE username = \? AND password = \?/);
  assert.match(authHelper, /FROM sessions s/);
  assert.match(authHelper, /s\.expires_at > CURRENT_TIMESTAMP/);
  assert.doesNotMatch(authHelper, /JSON\.parse\(Buffer\.from/);
  assert.match(profileRoute, /\.bind\(authUser\.id\)/);
  assert.doesNotMatch(profileRoute, /data\.id/);
  assert.match(stockRoute, /requireSuperAdmin/);
  assert.match(stockRoute, /requirePermission\("stock"\)/);
  assert.match(demandRoute, /requireSuperAdmin/);
  assert.match(supplierRoute, /requireSuperAdmin/);
  assert.match(distributionRoute, /authUser\.role === "super_admin"[\s\S]*?requestedAreaCode[\s\S]*?: authUser\.areaCode/);
  assert.match(distributionRoute, /SELECT area_code FROM schools WHERE emis_code = \?/);
  assert.match(distributionRoute, /school\.area_code !== data\.areaCode/);
  assert.match(distributionRoute, /existing\.area_code !== data\.areaCode/);
  assert.match(distributionRoute, /authUser\.role === "super_admin" \? String\(data\.status \|\| "new"\) : "new"/);
  assert.match(distributionItemRoute, /if \(authUser\.role === "super_admin"\) allowedFields\.push\("status"\)/);
  assert.match(accountRoute, /authUser\.role === "super_admin"[\s\S]*?searchParams\.get\("area_code"\)[\s\S]*?: authUser\.areaCode/);
  assert.match(loginRoute, /MAX_LOGIN_FAILURES = 5/);
  assert.match(loginRoute, /status: 429/);
  assert.match(bootstrap, /CREATE TABLE IF NOT EXISTS login_attempts/);
  assert.doesNotMatch(bootstrap, /password: await hashPassword\(String\(area\.managerMobile\)\)/);
  assert.doesNotMatch(loginPage, /পাসওয়ার্ড তাদের মোবাইল নাম্বার/);
});

test("area manager account page and expense report API are wired", async () => {
  const page = await read("app/page.tsx");
  const accountPage = await read("app/components/AreaAccountPage.tsx");
  const accountStyles = await read("app/components/area-account-page.css");
  const expensesRoute = await read("app/api/expenses/route.ts");
  const accountRoute = await read("app/api/my-account/route.ts");
  const bootstrap = await read("db/bootstrap.ts");

  assert.match(page, /<AreaAccountPage/);
  assert.match(page, /userRole=\{user\.role \|\| ""\}/);
  assert.match(page, /button:nth-child\(5\)/);
  assert.match(page, /button:nth-child\(7\)/);
  const dashboard = await read("app/components/DashboardApp.tsx");
  assert.match(dashboard, /id: `account`, label: `হিসাব`/);
  assert.match(dashboard, /userRole: accountRole/);
  assert.match(dashboard, /accountRole === `area_manager`/);
  assert.match(dashboard, /CustomEvent\(`area-account-open`\)/);
  assert.match(accountPage, /title="হিসাব"/);
  assert.match(accountPage, /পেমেন্ট রিকোয়েস্ট পাঠান/);
  assert.doesNotMatch(accountPage, /type="date" required value=\{expenseDate\}/);
  assert.doesNotMatch(accountPage, /setExpenseDate/);
  assert.match(accountPage, /expense_date: getDhakaClock\(\)\.date/);
  assert.equal((accountPage.match(/খরচের পরিমাণ/g) || []).length, 1);
  assert.match(accountPage, /\/api\/my-account/);
  assert.match(accountPage, /loadingRef/);
  assert.match(accountPage, /!open \|\| loaded/);
  assert.match(accountPage, /area-ledger-skeleton/);
  assert.match(accountPage, /closeWhenOtherNavOpens/);
  assert.match(accountPage, /button\.title === "হিসাব"/);
  assert.match(accountPage, /previousActiveNavRef/);
  assert.match(accountPage, /closingForNavigationRef/);
  assert.match(accountPage, /\.sidebar nav button\.nav-active:not\(\.area-account-nav\)/);
  assert.match(accountPage, /activeNav\?\.classList\.remove\("nav-active"\)/);
  assert.match(accountPage, /window\.addEventListener\("area-account-open", openAccountPage\)/);
  assert.match(accountPage, /accountNav\?\.classList\.add\("area-account-nav", "area-account-nav-active"\)/);
  assert.doesNotMatch(accountPage, /createPortal\(\s*<button[\s\S]*title="হিসাব"/);
  assert.match(accountPage, /setPageTarget\(main\)/);
  assert.match(accountPage, /area-account-open/);
  assert.match(accountPage, /pageTarget/);
  assert.match(accountStyles, /\.app-main\.area-account-open > :not\(\.topbar\):not\(\.notice\):not\(\.area-account-page\)/);
  assert.match(accountStyles, /\.area-account-page \{[\s\S]*?position: relative;/);
  assert.match(accountStyles, /\.area-account-nav \{[\s\S]*?order: 3;/);
  assert.match(accountStyles, /\.sidebar nav button:nth-child\(3\) \{[\s\S]*?order: 4;/);
  assert.doesNotMatch(accountStyles, /position: fixed;/);
  assert.match(accountRoute, /LIMIT 12/);
  assert.match(accountRoute, /SELECT\s+COALESCE/);
  assert.match(accountRoute, /Amount must be greater than zero/);
  assert.match(accountRoute, /Valid area and payment date are required/);
  assert.match(accountRoute, /const expenseDate = getDhakaClock\(\)\.date/);
  assert.match(accountRoute, /authUser\.areaCode,[\s\S]*?expenseDate,/);
  assert.match(expensesRoute, /export async function GET/);
  assert.match(expensesRoute, /function expenseRange/);
  assert.match(expensesRoute, /period === "day"/);
  assert.match(expensesRoute, /period === "week"/);
  assert.match(expensesRoute, /area_expenses e/);
  assert.match(expensesRoute, /expenseDate/);
  assert.match(bootstrap, /expense_date TEXT NOT NULL/);
  assert.match(bootstrap, /ALTER TABLE area_expenses ADD COLUMN/);
});

test("desktop sidebar can collapse and expand without mobile injection", async () => {
  const dashboard = await read("app/components/DashboardApp.tsx");
  const sidebarStyles = await read("app/components/sidebar-collapse.css");

  assert.match(dashboard, /import "\.\/sidebar-collapse\.css"/);
  assert.match(dashboard, /sidebarCollapsed/);
  assert.match(dashboard, /setSidebarCollapsed/);
  assert.match(dashboard, /desktop-sidebar-toggle/);
  assert.match(dashboard, /সাইডবার ক্লোজ করুন/);
  assert.match(dashboard, /সাইডবার ওপেন করুন/);
  assert.match(sidebarStyles, /\.sidebar-collapsed \{/);
  assert.match(sidebarStyles, /\.sidebar-collapsed \.sidebar-foot \{[\s\S]*?border-radius: 16px;[\s\S]*?height: 52px;[\s\S]*?width: 56px;/);
  assert.match(sidebarStyles, /\.sidebar-collapsed \.sidebar-foot \.live-dot \{[\s\S]*?box-shadow:[\s\S]*?height: 10px;[\s\S]*?width: 10px;/);
  assert.match(sidebarStyles, /\.sidebar-is-collapsed \.app-main \{[\s\S]*?margin-left: 84px;/);
  assert.match(sidebarStyles, /@media \(max-width: 800px\) \{[\s\S]*?\.desktop-sidebar-toggle \{[\s\S]*?display: none;/);
});

test("super admin user management supports validated Bengali roles, create, update and delete", async () => {
  const widget = await read("app/components/UserManagementWidget.tsx");
  const page = await read("app/page.tsx");
  const settings = await read("app/components/SettingsModule.tsx");
  const roles = await read("app/lib/user-roles.ts");
  const usersRoute = await read("app/api/users/route.ts");
  const userRoute = await read("app/api/users/[id]/route.ts");
  const bootstrap = await read("db/bootstrap.ts");

  assert.match(roles, /area_manager: "এরিয়া ম্যানেজার"/);
  assert.match(roles, /tiffin_manager: "টিফিন ম্যানেজার"/);
  assert.doesNotMatch(roles, /viewer|auditor|accounts/);
  assert.match(widget, /নতুন ইউজার যোগ করুন/);
  assert.match(widget, /method: isCreating \? "POST" : "PUT"/);
  assert.match(widget, /method: "DELETE"/);
  assert.match(widget, /window\.confirm/);
  assert.doesNotMatch(page, /UserManagementWidget/);
  assert.match(settings, /tab==="users"[\s\S]*?<UserManagementWidget\/>/);
  assert.match(usersRoute, /isAssignableUserRole/);
  assert.match(userRoute, /existing\.role === "super_admin"/);
  assert.match(bootstrap, /role IN \('accounts', 'viewer', 'auditor'\)/);
});

test("expense report supports day week and month filters", async () => {
  const dashboard = await read("app/components/DashboardApp.tsx");

  assert.match(dashboard, /expensePeriod/);
  assert.match(dashboard, /দিনভিত্তিক/);
  assert.match(dashboard, /সাপ্তাহিক/);
  assert.match(dashboard, /মাসিক/);
  assert.match(dashboard, /expenseRangeLabel/);
  assert.match(dashboard, /\/api\/expenses\?\$\{e\.toString\(\)\}/);
});

test("all user-facing dates use the shared day month year format", async () => {
  const formatter = await read("app/lib/date-format.ts");
  const dashboard = await read("app/components/DashboardApp.tsx");
  const expenses = await read("app/components/AdminExpenseManagementPage.tsx");
  const account = await read("app/components/AreaAccountPage.tsx");
  const distribution = await read("app/components/SchoolDistributionAdjustment.tsx");
  const notifications = await read("app/components/NotificationCenter.tsx");

  assert.match(formatter, /day: "2-digit"[\s\S]*month: "2-digit"[\s\S]*year: "numeric"/);
  for (const source of [dashboard, expenses, account, distribution]) {
    assert.match(source, /formatDateDMY/);
  }
  assert.match(notifications, /formatDateTimeDMY/);
  assert.doesNotMatch(`${dashboard}\n${expenses}\n${account}\n${distribution}`, /toLocaleDateString/);
  assert.doesNotMatch(`${expenses}\n${account}\n${distribution}`, /replace\(\/\\\/\/g, ['"]-['"]\)/);
  assert.doesNotMatch(`${account}\n${distribution}`, />\{(?:row\.date|filterDate)\}</);
  assert.match(`${dashboard}\n${expenses}\n${distribution}`, /type: ['"]date['"][^}\n]*lang: ['"]en-GB['"]|type="date"[\s\S]{0,60}lang="en-GB"/);
  assert.equal(
    [...dashboard.matchAll(/type: `date`,/g)].length,
    [...dashboard.matchAll(/type: `date`,\s*lang: `en-GB`,/g)].length,
  );
});

test("every print action uses the device-independent desktop print layout", async () => {
  const layout = await read("app/layout.tsx");
  const helper = await read("app/lib/desktop-print.ts");
  const styles = await read("app/desktop-print.css");
  const dashboard = await read("app/components/DashboardApp.tsx");
  const distribution = await read("app/components/SchoolDistributionAdjustment.tsx");
  const expenses = await read("app/components/AdminExpenseManagementPage.tsx");
  const account = await read("app/components/AreaAccountPage.tsx");

  assert.match(layout, /import "\.\/desktop-print\.css"/);
  assert.match(helper, /"desktop-print-layout"/);
  assert.match(helper, /window\.addEventListener\("afterprint"/);
  assert.match(helper, /window\.matchMedia\("print"\)/);
  assert.match(helper, /const previousTitle = document\.title/);
  assert.match(helper, /document\.title = ""/);
  assert.match(helper, /document\.title = previousTitle/);
  for (const source of [dashboard, distribution, expenses, account]) {
    assert.match(source, /printDesktopLayout/);
    assert.doesNotMatch(source, /window\.print\(\)/);
  }
  assert.match(styles, /@page \{[\s\S]*?size: A4 portrait/);
  assert.match(styles, /@page \{[\s\S]*?margin: 0;/);
  assert.match(styles, /@top-left \{[\s\S]*?content: none/);
  assert.match(styles, /@bottom-right \{[\s\S]*?content: none/);
  assert.match(styles, /\.distribution-exceptions::before,[\s\S]*?content: none !important;[\s\S]*?display: none !important;/);
  assert.match(styles, /body\.desktop-print-layout \{[\s\S]*?margin: 0 auto !important;[\s\S]*?min-width: 180mm !important;[\s\S]*?position: relative !important;[\s\S]*?width: 180mm !important;/);
  assert.match(styles, /printing-distribution-report #distribution-exceptions,[\s\S]*?min-width: 180mm !important;[\s\S]*?width: 180mm !important;/);
  assert.match(
    styles,
    /printing-distribution-report[\s\S]*?#distribution-exceptions[\s\S]*?\.distribution-exception-filters\.no-print[\s\S]*?display: none !important;[\s\S]*?visibility: hidden !important;/,
  );
  assert.match(styles, /\.responsive-adjustment-table[\s\S]*?display: table !important/);
  assert.match(styles, /\.responsive-adjustment-table tr,[\s\S]*?display: table-row !important/);
  assert.match(styles, /\.responsive-adjustment-table th,[\s\S]*?display: table-cell !important/);
  assert.match(styles, /\.responsive-adjustment-table td::before \{[\s\S]*?content: none !important/);
});

test("production manifests reference only emitted client chunks", async () => {
  const manifest = await read("dist/server/__vite_rsc_assets_manifest.js");
  const assets = [
    ...manifest.matchAll(/"\/assets\/([^"]+\.js)"/g),
  ].map((match) => match[1]);

  assert.ok(assets.length > 0);
  await Promise.all(
    assets.map((asset) =>
      access(new URL(`../dist/client/assets/${asset}`, import.meta.url)),
    ),
  );
});

test("super admin settings are backed by protected APIs, audit, permissions and encrypted 2FA", async () => {
  const [page, settingsUi, settingsApi, bootstrap, auth, totp, secretBox] = await Promise.all([
    read("app/page.tsx"), read("app/components/SettingsModule.tsx"),
    read("app/api/settings/route.ts"), read("db/bootstrap.ts"),
    read("app/lib/auth.ts"), read("app/lib/totp.ts"), read("app/lib/secret-box.ts"),
  ]);
  assert.match(page, /user\.role === "super_admin" && <SettingsModule/);
  assert.match(settingsUi, /বিদ্যালয় ও অঞ্চল/);
  assert.match(settingsUi, /ইউজার ও অনুমতি/);
  assert.match(settingsUi, /নিরাপত্তা ও ব্যাকআপ/);
  assert.match(settingsUi, /window\.addEventListener\("open-system-settings"/);
  assert.doesNotMatch(settingsUi, /settings-launcher/);
  assert.match(settingsApi, /requireSuperAdmin/);
  assert.match(settingsApi, /writeAudit/);
  assert.match(bootstrap, /CREATE TABLE IF NOT EXISTS system_settings/);
  assert.match(bootstrap, /CREATE TABLE IF NOT EXISTS role_permissions/);
  assert.match(auth, /requirePermission/);
  assert.match(totp, /verifyTotp/);
  assert.match(secretBox, /AES-GCM/);
});

test("area school list refreshes from the database after a Settings edit", async () => {
  const [dashboard, schoolsApi, settingsUi, bootstrap, schoolSettingsApi] = await Promise.all([
    read("app/components/DashboardApp.tsx"),
    read("app/api/schools/route.ts"),
    read("app/components/SettingsModule.tsx"),
    read("db/bootstrap.ts"),
    read("app/api/settings/schools/route.ts"),
  ]);
  assert.match(dashboard, /fetch\(`\/api\/schools`/);
  assert.match(dashboard, /school\.name_bn/);
  assert.match(dashboard, /school-data-updated/);
  assert.match(schoolsApi, /a\.name_bn AS area_name/);
  assert.match(settingsUi, /dispatchEvent\(new Event\("school-data-updated"\)\)/);
  assert.match(bootstrap, /serial_number/);
  assert.match(schoolsApi, /COALESCE\(s\.serial_number, 999999\)/);
  assert.match(dashboard, /school\.serial_number/);
  assert.match(settingsUi, /বিদ্যালয়ের ক্রমিক/);
  assert.match(schoolSettingsApi, /duplicateSerial/);
});

test("monthly meal planning is persisted, protected, audited and used by daily distribution", async () => {
  const [bootstrap, schema, settingsUi, plannerUi, plannerApi, dailyApi, distribution] = await Promise.all([
    read("db/bootstrap.ts"), read("db/schema.ts"), read("app/components/SettingsModule.tsx"),
    read("app/components/MealPlanningSettings.tsx"), read("app/api/settings/meal-plans/route.ts"),
    read("app/api/meal-plan/route.ts"), read("app/components/SchoolDistributionAdjustment.tsx"),
  ]);
  assert.match(bootstrap, /CREATE TABLE IF NOT EXISTS meal_plan_periods/);
  assert.match(bootstrap, /UNIQUE\(period_id, plan_date\)/);
  assert.match(schema, /mealPlanPeriodsTable/);
  assert.match(settingsUi, /মাসিক পরিকল্পনা/);
  assert.match(plannerUi, /একাধিক খাবার নির্বাচন করা যাবে/);
  assert.match(plannerUi, /বিদ্যালয় বন্ধ/);
  assert.match(plannerUi, /foodNames/);
  assert.match(plannerUi, /foodDayCounts/);
  assert.match(plannerUi, /খাবারের দিনের সারাংশ/);
  assert.match(plannerUi, /meal-plan-updated/);
  assert.match(plannerApi, /requireSuperAdmin/);
  assert.match(plannerApi, /meal_plan\.day_saved/);
  assert.match(plannerApi, /status='active'/);
  assert.match(dailyApi, /getAuthUser/);
  assert.match(dailyApi, /source: "configured"/);
  assert.match(dailyApi, /searchParams\.get\("month"\)/);
  assert.match(dailyApi, /SELECT plan_date,items_json FROM meal_plan_days/);
  assert.match(distribution, /\/api\/meal-plan\?date=/);
  assert.match(distribution, /configuredMealItems/);
  assert.match(distribution, /onDateChange\?\.\(filterDate\)/);
  const dashboard = await read("app/components/DashboardApp.tsx");
  assert.match(dashboard, /function W\(/);
  assert.match(dashboard, /weeklyPlanDays/);
  assert.match(dashboard, /weeklyItemsByDate/);
  assert.match(dashboard, /selectedDailyDate/);
  assert.match(dashboard, /dailyPlanCodes/);
  assert.match(dashboard, /onDateChange: setSelectedDailyDate/);
  assert.match(dashboard, /months = \[\.\.\.new Set\(weekDates/);
  assert.match(dashboard, /বিদ্যালয় বন্ধ/);
  assert.doesNotMatch(dashboard, /\[`রবিবার`, `বনরুটি \+ সিদ্ধ ডিম`/);
  assert.match(dashboard, /\/api\/meal-plan\?month=/);
  assert.match(dashboard, /monthlyPlanCounts/);
  assert.match(dashboard, /monthlyPlanDays/);
  assert.match(dashboard, /setMonthlyPlanDays\(payload\.days \?\? \[\]\)/);
  assert.match(dashboard, /monthlyPlanDays\.find\(\(day\) => day\.date === c\)/);
  assert.match(dashboard, /mealCodesToRoutineNames/);
  assert.match(dashboard, /মাসিক খাবার পরিকল্পনায় এই তারিখে কোনো খাবার নির্ধারিত নেই/);
  assert.doesNotMatch(dashboard, /শুক্রবার, শনিবার অথবা নির্বাচিত item/);
  assert.match(dashboard, /monthlyPlanCounts\.bun/);
  assert.match(dashboard, /monthlyRemainingCounts/);
  assert.match(dashboard, /day\.date > today/);
  assert.match(dashboard, /bun: 13\.5, egg: 10, banana: 6/);
  assert.match(dashboard, /item-purchase-cost/);
  assert.match(dashboard, /বনরুটি \(\$\{D\.format\(monthlyPlanCounts\?\.bun/);
  assert.match(dashboard, /remainingItemCosts/);
  assert.match(dashboard, /moneyToBengaliWords/);
  assert.match(dashboard, /কথায়:/);
  assert.match(dashboard, /মাসের বাকি দিনের পণ্য ক্রয় বাবদ খরচ/);
  assert.doesNotMatch(dashboard, /শিক্ষার্থী সংখ্যা নয়/);
  assert.match(dashboard, /setMonthlyPlanName\(payload\.periodName/);
  assert.match(dashboard, /monthlyPlanName \|\| `চলমান মাস`/);
  assert.match(dashboard, /!\[`areas`, `stock`, `suppliers`\]\.includes\(n\) &&[\s\S]*?\(0, E\.jsxs\)\(`div`, \{[\s\S]*?className: `global-filters no-print`/);
});

test("every dashboard view shares the mobile-first system layout", async () => {
  const dashboard = await read("app/components/DashboardApp.tsx");
  const mobile = await read("app/components/mobile-system.css");
  const mobileNavigation = await read("app/components/mobile-navigation.css");
  const layout = await read("app/layout.tsx");

  assert.match(dashboard, /import "\.\/mobile-system\.css"/);
  assert.match(layout, /viewportFit: "cover"/);
  assert.match(mobile, /\.metric-grid \{[\s\S]*?grid-template-columns: repeat\(2/);
  assert.match(mobile, /\.table-panel \.table-scroll > table > tbody > tr \{[\s\S]*?display: grid/);
  assert.match(mobile, /\.sidebar > \.account-user-card/);
  assert.match(mobileNavigation, /\.sidebar > \.account-user-card \{[\s\S]*?bottom: auto !important;[\s\S]*?right: auto !important;[\s\S]*?top: auto !important;/);
  assert.doesNotMatch(mobile, /sidebar-foot:has\(\.settings-launcher\)/);
  assert.match(mobile, /button,[\s\S]*?input,[\s\S]*?select,[\s\S]*?textarea,[\s\S]*?min-height: 44px/);
  assert.match(mobile, /font-size: 16px/);
  assert.match(mobile, /safe-area-inset-bottom/);
  assert.match(mobile, /@media \(orientation: landscape\)/);
});
