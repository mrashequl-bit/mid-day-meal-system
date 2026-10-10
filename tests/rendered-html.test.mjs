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

test("school directory shows union and mobile without an inline correction action", async () => {
  const dashboard = await read("app/components/DashboardApp.tsx");
  const mobile = await read("app/components/mobile-system.css");

  assert.match(dashboard, /unionName: school\.union_name \?\? ``/);
  assert.match(dashboard, /children: `ইউনিয়ন`/);
  assert.match(dashboard, /children: `মোবাইল নম্বর`/);
  assert.match(dashboard, /formatSchoolMobile\(e\.legacyMobile\)/);
  assert.match(dashboard, /`ইউনিয়ন`,[\s\S]*?`মোবাইল নম্বর`/);
  assert.doesNotMatch(dashboard, /children: `সংশোধন`/);
  assert.doesNotMatch(dashboard, /children: `কাজ`/);
  assert.match(mobile, /td:nth-child\(7\)::before \{ content: "মোবাইল নম্বর"; \}/);
  assert.match(mobile, /td:nth-child\(8\)::before \{ content: "চাহিদা"; \}/);
});

test("stock page keeps its Bengali headings without English section labels", async () => {
  const dashboard = await read("app/components/DashboardApp.tsx");
  const styles = await read("app/components/DashboardApp.css");
  const stockRoute = await read("app/api/stock/route.ts");
  const acceptedStockTypes =
    stockRoute.match(
      /const transactionTypes = new Set\(\[[\s\S]*?\]\);/,
    )?.[0] ?? "";

  assert.doesNotMatch(
    dashboard,
    /Procurement Planner|Stock Transaction|Recent Ledger/,
  );
  assert.match(dashboard, /কত দিনের পণ্য একসাথে কিনবেন/);
  assert.match(dashboard, /সাম্প্রতিক লেনদেন/);
  assert.doesNotMatch(dashboard, /ডিফল্ট পরিকল্পনা|চাহিদাভিত্তিক/);
  assert.doesNotMatch(dashboard, /ক্রয় পরিমাণ = নির্বাচিত দিনের মোট চাহিদা/);
  assert.doesNotMatch(dashboard, /নষ্ট বা ইস্যুকৃত পণ্য স্টক লেনদেন/);
  assert.doesNotMatch(styles, /stock-formula/);
  assert.doesNotMatch(
    dashboard,
    /stock transaction দেওয়ার সঙ্গে সঙ্গে balance/,
  );
  assert.match(styles, /\/\* Compact procurement planner \*\//);
  assert.match(styles, /\.stock-planner \{[\s\S]*?padding: 16px 18px;/);
  assert.match(
    styles,
    /\.stock-planner > \.panel-head h2 \{[\s\S]*?font-size: 20px;/,
  );
  assert.match(
    styles,
    /\.stock-planner \.coverage-controls label \{[\s\S]*?font-size: 13px;/,
  );
  assert.match(
    styles,
    /\.stock-planner \.procurement-card dt \{[\s\S]*?font-size: 12px;/,
  );
  assert.match(
    styles,
    /@media \(max-width: 520px\)[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/,
  );
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
  assert.match(
    dashboard,
    /areaCodes: g === `stock_out` \? stockOutAreas : \[\]/,
  );
  assert.match(dashboard, /formatStockAreaNames\(e\.areaCode\)/);
  assert.match(
    styles,
    /\.stock-area-picker \{[\s\S]*?grid-template-columns: repeat\(4/,
  );
  assert.match(stockRoute, /areaCodes\?: unknown/);
  assert.match(stockRoute, /JSON\.stringify\(areaCodes\)/);
  assert.match(stockRoute, /area_codes_json/);
  assert.match(await read("db/bootstrap.ts"), /\["area_codes_json", "TEXT"\]/);
  assert.doesNotMatch(
    dashboard,
    /অঞ্চল নির্বাচন করলে একদিনের এক আইটেমের চাহিদা পরিমাণ ঘরে স্বয়ংক্রিয়ভাবে বসবে/,
  );
  const deleteHandler = stockRoute.slice(
    stockRoute.indexOf("export async function DELETE"),
  );
  assert.doesNotMatch(deleteHandler, /let balance = 0|পূর্ববর্তী স্টক ঋণাত্মক/);
  assert.match(deleteHandler, /const reverseDelta = -deletedDelta/);
  assert.match(deleteHandler, /current\.currentQuantity \+ reverseDelta/);
  assert.match(deleteHandler, /return NextResponse\.json\([\s\S]*?status: 500/);
  assert.match(
    dashboard,
    /responseText = await e\.text\(\)[\s\S]*?method: `DELETE`|method: `DELETE`[\s\S]*?responseText = await e\.text\(\)/,
  );
  assert.match(dashboard, /stockEntryTransactionTypes\.map/);
  assert.match(
    dashboard,
    /stockEntryTransactionTypes\.includes\(e\.transactionType\)/,
  );
  assert.doesNotMatch(acceptedStockTypes, /adjustment_add|adjustment_sub/);
  assert.match(
    stockRoute,
    /outgoingTypes = new Set\(\["stock_out", "damaged", "adjustment_sub"\]\)/,
  );
  assert.match(
    dashboard,
    /formatStockPlanDate\(M\(e\)\).*রোজঃ.*formatStockPlanWeekday\(M\(e\)\)/,
  );
  assert.match(styles, /\.stock-planner \.date-chips \{[\s\S]*?display: grid/);
  assert.match(
    styles,
    /\.stock-planner \.date-chips span \{[\s\S]*?white-space: normal/,
  );
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
  assert.match(
    styles,
    /\.supplier-account-grid \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\)/,
  );
  assert.match(
    styles,
    /\.supplier-account \{[\s\S]*?grid-template-columns: minmax\(210px, \.7fr\) minmax\(0, 1\.3fr\)/,
  );
  assert.match(
    styles,
    /\.supplier-account \.supplier-list > div \{[\s\S]*?grid-template-columns: minmax\(210px, 1fr\) auto auto minmax\(125px, auto\)/,
  );
  assert.match(dashboard, /\[supplierFormOpen, setSupplierFormOpen\]/);
  assert.match(dashboard, /aria-controls": `supplier-entry-form`/);
  assert.match(dashboard, /supplierFormOpen \? `−` : `\+`/);
  assert.match(dashboard, /setSupplierFormOpen\(!0\)/);
  assert.match(styles, /\.supplier-form-shell \{[\s\S]*?max-height: 0/);
  assert.match(
    styles,
    /\.supplier-form-shell\.is-open \{[\s\S]*?max-height: 520px/,
  );
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
  const notificationCenter = await read(
    "app/components/NotificationCenter.tsx",
  );
  const notificationStyles = await read(
    "app/components/notification-center.css",
  );
  const adminExpensePage = await read(
    "app/components/AdminExpenseManagementPage.tsx",
  );

  assert.match(notificationCenter, /area_code\?: string \| null;/);
  assert.match(
    notificationCenter,
    /notification\.type === "expense" && notification\.area_code/,
  );
  assert.match(
    notificationCenter,
    /new CustomEvent\("open-area-expense-workspace"/,
  );
  assert.match(notificationCenter, /expenseId: notification\.id/);
  assert.match(notificationCenter, /expenseDate: notification\.date \|\| ""/);
  assert.doesNotMatch(notificationCenter, /\/area-expenses/);
  assert.match(
    notificationCenter,
    /onClick=\{\(\) => openNotification\(notification\)\}/,
  );
  assert.match(notificationCenter, /খরচ দেখুন/);
  assert.match(
    notificationStyles,
    /\.notification-card \{[\s\S]*?cursor: pointer;/,
  );
  assert.match(
    adminExpensePage,
    /setSelectedArea\(initialAreaCode \|\| "all"\)/,
  );
  assert.match(adminExpensePage, /data-ledger-expense-id/);
  assert.match(adminExpensePage, /selectedArea !== "all"/);
});

test("distribution notifications open the exact report and keep admin audience separate", async () => {
  const notificationCenter = await read(
    "app/components/NotificationCenter.tsx",
  );
  const notificationsRoute = await read("app/api/notifications/route.ts");
  const distributionRoute = await read("app/api/distribution-reports/route.ts");
  const distributionItemRoute = await read(
    "app/api/distribution-reports/[id]/route.ts",
  );
  const distribution = await read(
    "app/components/SchoolDistributionAdjustment.tsx",
  );

  assert.match(
    notificationCenter,
    /new CustomEvent\("open-distribution-report"/,
  );
  assert.match(
    notificationCenter,
    /schoolEmis: targetUrl\.searchParams\.get\("school"\)/,
  );
  assert.match(notificationCenter, /রিপোর্ট দেখুন/);
  assert.match(notificationCenter, /addEventListener\("notifications-updated", loadNotifications\)/);
  assert.match(notificationsRoute, /WHERE is_read = 0 AND area_code IS NULL/);
  assert.match(
    distributionRoute,
    /status=new&school=\$\{data\.schoolEmisCode\}/,
  );
  assert.match(
    distributionItemRoute,
    /school=\$\{existing\.school_emis_code\}/,
  );
  assert.doesNotMatch(distributionItemRoute, /\/admin\/distribution/);
  assert.match(
    distribution,
    /window\.addEventListener\('open-distribution-report'/,
  );
  assert.match(distribution, /data-distribution-school/);
});

test("distribution notifications describe item differences and support scoped mark-all-read", async () => {
  const summary = await read("app/lib/distribution-notification.ts");
  const notificationCenter = await read("app/components/NotificationCenter.tsx");
  const notificationStyles = await read("app/components/notification-center.css");
  const notificationsRoute = await read("app/api/notifications/route.ts");
  const distributionRoute = await read("app/api/distribution-reports/route.ts");
  const distributionItemRoute = await read("app/api/distribution-reports/[id]/route.ts");

  assert.match(summary, /টি \$\{label\} পায়নি/);
  assert.match(summary, /টি \$\{label\} বেশি পেয়েছে/);
  assert.match(distributionRoute, /buildDistributionIssueSummary/);
  assert.match(distributionItemRoute, /buildDistributionIssueSummary/);
  assert.match(notificationCenter, /action: "mark_all_read"/);
  assert.match(notificationCenter, /সব নোটিফিকেশন পড়া হিসেবে চিহ্নিত করুন/);
  assert.match(notificationCenter, /if \(response\.ok\) setNotifications\(\[\]\)/);
  assert.match(notificationStyles, /\.notification-mark-all \{/);
  assert.match(notificationsRoute, /payload\.action === "mark_all_read"/);
  assert.match(notificationsRoute, /UPDATE area_expenses SET is_read = 1 WHERE is_read = 0/);
  assert.match(notificationsRoute, /UPDATE notifications SET is_read = 1 WHERE is_read = 0 AND area_code IS NULL/);
  assert.match(notificationsRoute, /UPDATE area_payments SET is_read = 1 WHERE is_read = 0 AND area_code = \?/);
  assert.match(notificationsRoute, /UPDATE notifications SET is_read = 1 WHERE is_read = 0 AND area_code = \?/);
});

test("distribution adjustment keeps the manager reason until admin resolution and prints the resolution reason", async () => {
  const distribution = await read("app/components/SchoolDistributionAdjustment.tsx");
  const distributionStyles = await read("app/components/DashboardApp.css");
  const redesignStyles = await read("app/components/distribution-redesign.css");
  const collectionRoute = await read("app/api/distribution-reports/route.ts");
  const itemRoute = await read("app/api/distribution-reports/[id]/route.ts");
  const schema = await read("db/schema.ts");
  const bootstrap = await read("db/bootstrap.ts");

  assert.match(distribution, /'পরবর্তী বিতরণে সমন্বয়'/);
  assert.match(distribution, /'রিপোর্ট ভুল \/ বাতিল'/);
  assert.match(distribution, /কী ব্যবস্থা নেওয়া হবে\?/);
  assert.match(distribution, /resolutionReason: accountRole === 'super_admin'/);
  assert.match(distribution, /report\.status === 'new' \? 'সমাধান প্রয়োজন'/);
  assert.match(distribution, /কারণ: \$\{report\.reason/);
  assert.match(distribution, /সমন্বয়ের কারণ: \$\{report\.resolution_reason\}/);
  assert.match(distribution, /className="distribution-status-reason"/);
  assert.match(distribution, /className="distribution-resolution-drawer"/);
  assert.match(redesignStyles, /\.distribution-summary-grid/);
  assert.match(redesignStyles, /\.distribution-resolution-drawer/);
  assert.match(distribution, /সরবরাহ\/পূরণ করা পরিমাণ/);
  assert.match(distribution, /resolutionItems: accountRole === 'super_admin'/);
  assert.match(distribution, /resolutionItemCode: accountRole === 'super_admin'/);
  assert.match(distribution, /aria-pressed=\{isSelected\}/);
  assert.match(distribution, /আলাদাভাবে সমন্বয় করতে বকেয়া আইটেমে ক্লিক করুন/);
  assert.match(distribution, /প্রশাসনিক সমন্বয় ইতিহাস/);
  assert.match(redesignStyles, /\.distribution-resolution-quantity-grid/);
  assert.match(distributionStyles, /printing-distribution-report \.distribution-status-reason/);
  assert.match(collectionRoute, /কারণ: \$\{String\(data\.reason/);
  assert.match(itemRoute, /কারণ: \$\{String\(data\.reason \|\| existing\.reason/);
  assert.match(itemRoute, /resolution_reason = NULL/);
  assert.match(itemRoute, /data\.resolutionItemCode/);
  assert.match(itemRoute, /সমন্বয়ের জন্য একটি নির্দিষ্ট আইটেম নির্বাচন করুন/);
  assert.match(itemRoute, /type LIKE 'distribution_issue%'/);
  assert.match(schema, /resolutionReason: text\("resolution_reason"\)/);
  assert.match(bootstrap, /ALTER TABLE distribution_reports ADD COLUMN resolution_reason TEXT/);
});

test("profile launcher uses the sidebar or the responsive portal host", async () => {
  const dashboard = await read("app/components/DashboardApp.tsx");
  const profileCard = await read("app/components/AccountProfileCard.tsx");
  const accountStyles = await read("app/components/account-profile.css");
  const headerStyles = await read("app/components/header-cleanup.css");

  assert.match(dashboard, /import "\.\/header-cleanup\.css"/);
  assert.doesNotMatch(dashboard, /className: `user-card`/);
  assert.match(profileCard, /import \{ createPortal \} from "react-dom"/);
  assert.match(profileCard, /document\.querySelector\("\.tiffin-bottom-nav \.account-launcher-host"\)/);
  assert.match(profileCard, /document\.querySelector\("\.tiffin-topbar \.account-launcher-host, \.account-launcher-host, \.sidebar"\)/);
  assert.match(
    profileCard,
    /launcherTarget && createPortal\(launcher, launcherTarget\)/,
  );
  assert.match(profileCard, /className="account-user-card"/);
  assert.match(profileCard, /className="account-settings-button"/);
  assert.match(profileCard, /open-system-settings/);
  assert.match(
    accountStyles,
    /\.sidebar > \.account-user-card \{[\s\S]*?position: static;/,
  );
  assert.match(
    accountStyles,
    /\.sidebar > \.account-user-card \{[\s\S]*?gap: 0;[\s\S]*?overflow: hidden;/,
  );
  assert.match(
    accountStyles,
    /\.sidebar > \.account-user-card \.account-settings-button \{[\s\S]*?border-left: 1px solid/,
  );
  assert.match(
    accountStyles,
    /\.sidebar > \.account-user-card \.account-profile-launcher \{[\s\S]*?background: transparent;[\s\S]*?border: 0;/,
  );
  assert.match(
    accountStyles,
    /\.sidebar-collapsed > \.account-user-card \.account-launcher-details,[\s\S]*?display: none;/,
  );
  assert.match(
    accountStyles,
    /\.sidebar-collapsed > \.account-user-card \.account-settings-button \{ display: none; \}/,
  );
  assert.match(
    accountStyles,
    /\.sidebar-collapsed > \.account-user-card \.account-profile-launcher \{[\s\S]*?justify-content: center;[\s\S]*?padding: 6px;/,
  );
  assert.match(
    accountStyles,
    /\.sidebar-collapsed > \.account-user-card img\.account-launcher-avatar \{[\s\S]*?clip-path: circle\(50% at 50% 50%\);[\s\S]*?object-fit: cover;/,
  );
  assert.match(
    accountStyles,
    /\.account-profile-card \{[\s\S]*?max-width: 282px;[\s\S]*?width: min\(282px,/,
  );
  assert.match(
    accountStyles,
    /\.account-profile-layer \{[^}]*?align-items: flex-start;[^}]*?justify-content: flex-end;[^}]*?padding: 72px 30px 12px;/,
  );
  assert.match(profileCard, /launcherButtonRef = useRef<HTMLButtonElement>/);
  assert.match(profileCard, /launcherButton\.getBoundingClientRect\(\)/);
  assert.match(profileCard, /rect\.top > window\.innerHeight \/ 2/);
  assert.match(profileCard, /bottom: window\.innerHeight - rect\.top \+ gap/);
  assert.match(profileCard, /is-launcher-anchored/);
  assert.match(accountStyles, /\.account-profile-layer\.is-launcher-anchored/);
  assert.match(
    accountStyles,
    /@media \(max-width: 800px\) \{[\s\S]*?\.account-profile-layer \{[^}]*?align-items: flex-end;[^}]*?padding: 12px 12px 68px;/,
  );
  assert.match(
    accountStyles,
    /\.account-identity-row \{[\s\S]*?display: grid;[\s\S]*?gap: 4px;/,
  );
  assert.match(
    accountStyles,
    /\.account-profile-trigger \{[\s\S]*?margin-top: 4px;/,
  );
  assert.match(
    accountStyles,
    /\.account-modal-settings-btn \{[\s\S]*?margin-top: 4px;/,
  );
  assert.match(
    accountStyles,
    /\.account-close-button \{[\s\S]*?aspect-ratio: 1;[\s\S]*?min-height: 22px;[\s\S]*?min-width: 22px;/,
  );
  assert.match(
    accountStyles,
    /\.account-modal-settings-btn \{[\s\S]*?aspect-ratio: 1;[\s\S]*?min-height: 28px;[\s\S]*?min-width: 28px;/,
  );
  assert.match(
    accountStyles,
    /@media \(max-width: 800px\) \{[\s\S]*?\.account-user-card \.account-settings-button \{ display: none; \}[\s\S]*?\.account-modal-settings-btn \{ display: flex; \}/,
  );
  assert.match(
    headerStyles,
    /\.topbar \{[\s\S]*?margin-left: -32px;[\s\S]*?padding-right: 32px;/,
  );
  assert.match(headerStyles, /\.top-actions \{[\s\S]*?margin-right: -14px;/);
  assert.match(
    headerStyles,
    /@media \(max-width: 800px\) \{[\s\S]*?\.top-actions \{[\s\S]*?margin-right: 0;/,
  );
  assert.match(
    headerStyles,
    /@media \(max-width: 800px\) \{[\s\S]*?\.topbar > div:first-child \{[\s\S]*?display: grid;[\s\S]*?grid-template-columns: 40px minmax\(0, 1fr\);/,
  );
  assert.match(
    headerStyles,
    /\.topbar \.mobile-menu \{[\s\S]*?grid-row: 1 \/ span 2;/,
  );
  assert.match(
    headerStyles,
    /\.topbar > div:first-child > p,[\s\S]*?\.topbar > div:first-child > small \{[\s\S]*?white-space: nowrap;/,
  );
  assert.match(
    headerStyles,
    /\.top-actions \.user-card \{[\s\S]*?display: none !important;/,
  );
  assert.doesNotMatch(
    dashboard,
    /একদিনের এক আইটেমের অনুমোদিত চাহিদাকে ভিত্তি ধরে পরিকল্পনা ও হিসাব/,
  );
  assert.match(
    headerStyles,
    /\.page-head \{[\s\S]*?align-items: flex-end;[\s\S]*?padding-bottom: 12px;/,
  );
  assert.match(
    headerStyles,
    /\.page-head > div:first-child \{[\s\S]*?display: none !important;/,
  );
});

test("dashboard cleanup widgets replace operational alert residue", async () => {
  const page = await read("app/page.tsx");
  const reportWidget = await read("app/components/ReportDashboardWidgets.tsx");
  const adminExpensePage = await read(
    "app/components/AdminExpenseManagementPage.tsx",
  );
  const reportStyles = await read(
    "app/components/report-dashboard-widgets.css",
  );

  assert.match(
    page,
    /<ReportDashboardWidgets[\s\S]*?accountRole=\{user\.role \|\| ""\}[\s\S]*?userAreaCode=\{user\.areaCode \|\| ""\}/,
  );
  assert.doesNotMatch(reportWidget, /AdminExpenseManagementPage/);
  assert.match(
    reportWidget,
    /new CustomEvent\("open-area-expense-workspace"\)/,
  );
  assert.doesNotMatch(reportWidget, /\/area-expenses/);
  assert.match(adminExpensePage, /অঞ্চলভিত্তিক খরচ/);
  assert.doesNotMatch(adminExpensePage, /standalone|createPortal/);
  assert.match(adminExpensePage, /value="all">সকল অঞ্চল/);
  assert.match(adminExpensePage, /selectedArea === "all"/);
  assert.match(
    adminExpensePage,
    /পেমেন্ট দিতে নির্দিষ্ট একটি অঞ্চল নির্বাচন করুন/,
  );
  assert.match(adminExpensePage, /পেমেন্ট ম্যানেজ/);
  assert.match(adminExpensePage, /\/api\/my-account/);
  assert.match(adminExpensePage, /\/api\/expenses\?\$\{params\.toString\(\)\}/);
  assert.match(reportWidget, /heading\.textContent = "রিপোর্ট"/);
  assert.match(
    reportStyles,
    /\.report-widget-host > article \{[\s\S]*?display: none !important;/,
  );
  assert.match(reportStyles, /\.sidebar nav button\[title="রিপোর্ট"\]/);
  assert.match(
    reportStyles,
    /\.print-report > table:first-of-type[\s\S]*?\{\s*display: none !important;/,
  );
  assert.doesNotMatch(
    reportWidget,
    /চাহিদা সারসংক্ষেপ|একদিনের এক আইটেমের চাহিদা/,
  );
  assert.match(reportWidget, /আজকের বিতরণের রিপোর্ট করুন/);
  assert.match(reportWidget, /দুপুর ২টার আগে রিপোর্ট করুন · আর বাকি/);
  assert.match(reportWidget, /new CustomEvent\("open-distribution-report"/);
  assert.match(
    reportWidget,
    /new CustomEvent\("area-account-open", \{ detail: \{ focus: "expense" \} \}\)/,
  );
  assert.match(reportWidget, /disabled=\{!reportingWindow\.canReport\}/);
  assert.doesNotMatch(
    await read("app/components/DashboardApp.tsx"),
    /স্টক অনুমোদনের আগে প্রাথমিক পরিমাণ দিন|মূল্য ছাড়া আনুমানিক মাসিক বিল তৈরি হবে না/,
  );
  assert.doesNotMatch(
    await read("app/components/DashboardApp.tsx"),
    /Opening stock যোগ করা হয়নি|বিলের unit price অপেক্ষমাণ/,
  );
});

test("distribution print action renders only the printable report table", async () => {
  const distribution = await read(
    "app/components/SchoolDistributionAdjustment.tsx",
  );
  const dashboardStyles = await read("app/components/DashboardApp.css");

  assert.match(distribution, /const printDistributionReport = useCallback/);
  assert.match(
    distribution,
    /printDesktopLayout\('printing-distribution-report', \(\) => setPrintingAllRows\(false\)\)/,
  );
  assert.match(distribution, /printingAllRows\s*\? sortedFilteredSchools/);
  assert.match(distribution, /<option value=\{100\}>১০০<\/option>/);
  assert.match(distribution, /<option value=\{200\}>২০০<\/option>/);
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
  const distribution = await read(
    "app/components/SchoolDistributionAdjustment.tsx",
  );
  const dashboardStyles = await read("app/components/DashboardApp.css");
  const distributionStyles = await read(
    "app/components/distribution-redesign.css",
  );

  assert.match(
    distribution,
    /className="distribution-exception-filters no-print"/,
  );
  assert.match(distribution, /className="distribution-exceptions-body"/);
  assert.doesNotMatch(distribution, /const AlertIcon/);
  assert.match(distribution, /className="distribution-exceptions-title"/);
  assert.match(distribution, /className="distribution-header-meta"/);
  assert.match(distribution, /headerDate = mounted \? formatDateDMY\(currentTime\)/);
  assert.match(distribution, /toLocaleTimeString\('bn-BD'/);
  assert.match(
    distribution,
    /className="button-primary distribution-print-button no-print"/,
  );
  assert.match(distributionStyles, /\.distribution-exceptions-title/);
  assert.match(distributionStyles, /\.distribution-header-meta/);
  assert.match(
    distributionStyles,
    /\.distribution-exception-filters \{[\s\S]*?background: #f5f9f7;/,
  );
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
  assert.doesNotMatch(
    distribution,
    /className="distribution-exceptions-body" style=/,
  );
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
  assert.doesNotMatch(dashboard, /\/food-thumbnails\//);
  assert.doesNotMatch(dashboard, /routine-food-photo|routine-food-icon/);
  assert.doesNotMatch(dashboard, /className: `distribution-empty-icon`/);
  assert.doesNotMatch(dashboard, /className: `daily-plan-panel-inner`[\s\S]{0,800}className: `status-badge status-good`/);
  assert.match(dashboard, /routine-day-card \$\{hasFood \? `is-planned` : `is-closed`\}/);
  assert.match(dashboard, /className: `routine-day-meta`/);
  assert.doesNotMatch(dashboard, /\bCroissant\b|\bEgg\b|\bBanana\b/);
  assert.doesNotMatch(distributionStyles, /\.routine-food-photo|\.routine-food-icon/);
  assert.match(distributionStyles, /\.routine-day-card\.is-closed/);
  assert.match(distributionStyles, /\.routine-day-meta/);
});

test("legacy distribution exceptions widget and its local dead code stay removed", async () => {
  const dashboard = await read("app/components/DashboardApp.tsx");
  const dashboardStyles = await read("app/components/DashboardApp.css");

  assert.doesNotMatch(dashboard, /children: `Exceptions`/);
  assert.doesNotMatch(
    dashboard,
    /distribution-anomaly|distribution-exception-grid/,
  );
  assert.doesNotMatch(dashboard, /anomalies:|setAnomalies/);
  assert.doesNotMatch(
    dashboardStyles,
    /distribution-anomaly|distribution-exception-grid/,
  );
  assert.match(dashboard, /SchoolDistributionAdjustment/);
});

test("area manager reporting uses the Dhaka 2 PM cutoff and exact automatic status", async () => {
  const distribution = await read(
    "app/components/SchoolDistributionAdjustment.tsx",
  );
  const collectionRoute = await read("app/api/distribution-reports/route.ts");
  const itemRoute = await read("app/api/distribution-reports/[id]/route.ts");
  const reportingWindow = await read(
    "app/lib/distribution-reporting-window.ts",
  );
  const adjustmentService = await read("app/lib/distribution-adjustments.ts");
  const worker = await read("worker/index.ts");

  assert.match(reportingWindow, /DISTRIBUTION_REPORT_CUTOFF_HOUR = 14/);
  assert.match(reportingWindow, /timeZone: "Asia\/Dhaka"/);
  assert.match(reportingWindow, /canReport: isReportDay && !isAfterCutoff/);
  assert.match(distribution, /!report && reportingWindow\.shouldAutoReceive/);
  assert.match(
    distribution,
    /const hasScheduledItems = showBread \|\| showEgg \|\| showBanana/,
  );
  assert.match(distribution, /const isAutoReceived = hasScheduledItems &&/);
  assert.match(
    distribution,
    /if \(isAutoReceived\) \{[\s\S]*?totalBread \+= planned;[\s\S]*?\} else if \(report\) \{/,
  );
  assert.match(
    distribution,
    /totalBread \+= Number\(report\.received_bread\) \|\| 0/,
  );
  assert.match(
    distribution,
    /totalEgg \+= Number\(report\.received_egg\) \|\| 0/,
  );
  assert.match(
    distribution,
    /totalBanana \+= Number\(report\.received_banana\) \|\| 0/,
  );
  assert.doesNotMatch(
    distribution,
    /else \{\s*totalBread \+= report\.received_bread/,
  );
  assert.match(distribution, /স্বয়ংক্রিয়ভাবে নিশ্চিত/);
  assert.match(distribution, /report\.status === 'new' \? 'সমাধান প্রয়োজন'/);
  assert.match(distribution, /report\.reason \|\| \(problemTypeMapping as any\)\[report\.problem_type\]/);
  assert.doesNotMatch(distribution, /report\.status === 'new' \? 'নতুন'/);
  assert.doesNotMatch(distribution, /নতুন অভিযোগ \(New\)/);
  assert.match(collectionRoute, /autoConfirmDistributionReports\(date, db\)/);
  assert.match(adjustmentService, /INSERT OR IGNORE INTO distribution_reports/);
  assert.match(
    adjustmentService,
    /status, problem_type, reason, comments, reported_by/,
  );
  assert.match(
    adjustmentService,
    /'resolved', 'none',[\s\S]*?'অটো-রিসিভড \(২ টার পর\)', 'System'/,
  );
  assert.match(adjustmentService, /confirmation_source, auto_confirmed_at/);
  assert.match(worker, /controller\.cron === "0 8 \* \* \*"/);
  assert.match(collectionRoute, /if \(!reportingWindow\.canReport\)/);
  assert.match(
    itemRoute,
    /if \(!getAreaManagerReportingWindow\(existing\.date\)\.canReport\)/,
  );
});

test("D1 runtime bootstrap and automatic receipts avoid repeat writes", async () => {
  const bootstrap = await read("db/bootstrap.ts");
  const adjustmentService = await read("app/lib/distribution-adjustments.ts");
  const migration = await read("drizzle/0012_d1_runtime_bootstrap.sql");

  assert.match(bootstrap, /RUNTIME_BOOTSTRAP_VERSION = "0012"/);
  assert.match(bootstrap, /hasCurrentRuntimeBootstrap/);
  assert.match(bootstrap, /setting_key = 'runtime_bootstrap_version'/);
  assert.match(bootstrap, /if \(await hasCurrentRuntimeBootstrap\(db\)\)/);
  assert.match(bootstrap, /COALESCE\(confirmation_source, ''\) <> 'system' OR auto_confirmed_at IS NULL/);
  assert.match(bootstrap, /WHERE areas\.name_bn IS NOT excluded\.name_bn/);
  assert.match(bootstrap, /WHERE system_settings\.setting_value <> excluded\.setting_value/);
  assert.match(adjustmentService, /LEFT JOIN distribution_reports r/);
  assert.match(adjustmentService, /CASE WHEN r\.id IS NULL THEN 0 ELSE 1 END AS has_report/);
  assert.match(adjustmentService, /missingSchools = schoolResult\.results\.filter/);
  assert.match(adjustmentService, /const statements = missingSchools\.map/);
  assert.match(migration, /runtime_bootstrap_version', '0012'/);
  assert.match(migration, /COALESCE\(confirmation_source, ''\) <> 'system' OR auto_confirmed_at IS NULL/);
});

test("monthly school-item adjustment ledger reconciles FIFO without overwriting original reports", async () => {
  const service = await read("app/lib/distribution-adjustments.ts");
  const schema = await read("db/schema.ts");
  const bootstrap = await read("db/bootstrap.ts");
  const collectionRoute = await read("app/api/distribution-reports/route.ts");
  const itemRoute = await read("app/api/distribution-reports/[id]/route.ts");
  const distribution = await read("app/components/SchoolDistributionAdjustment.tsx");
  const portal = await read("app/components/TiffinManagerPortal.tsx");
  const delivery = await read("app/lib/daily-distribution-delivery.ts");

  assert.match(schema, /distributionAdjustmentsTable/);
  assert.match(schema, /distributionResolutionItemsTable/);
  assert.match(schema, /shortageReportId/);
  assert.match(schema, /excessReportId/);
  assert.match(bootstrap, /CREATE TABLE IF NOT EXISTS distribution_adjustments/);
  assert.match(bootstrap, /CREATE TABLE IF NOT EXISTS distribution_resolution_items/);
  assert.match(service, /ORDER BY r\.date, r\.id/);
  assert.match(service, /shortage\.report\.date >= report\.date/);
  assert.match(service, /Math\.min\(shortage\.remaining, excessRemaining\)/);
  assert.doesNotMatch(service, /excessRemaining === 0 \|\| !String\(report\.reason/);
  assert.match(service, /status = 'partially_resolved'/);
  assert.match(service, /resolution\.direction === "shortage" \? matchedShortage : matchedExcess/);
  assert.match(service, /স্বয়ংক্রিয় মাসিক সমন্বয়/);
  assert.match(service, /effective_received_\$\{itemCode\}/);
  assert.match(service, /bun: \{ planned: "planned_bread", received: "received_bread"/);
  assert.match(service, /egg: \{ planned: "planned_egg", received: "received_egg"/);
  assert.match(service, /banana: \{ planned: "planned_banana", received: "received_banana"/);
  assert.match(service, /const inferredPlanned = Math\.max\(0, received \+ Number\(report\[fields\.shortage\] \|\| 0\) - Number\(report\[fields\.excess\] \|\| 0\)\)/);
  assert.match(service, /Math\.min\(planned, received \+ totalSettledShortage\)/);
  assert.match(service, /বরাদ্দবহির্ভূত অতিরিক্ত প্রিন্টে বাদ/);
  assert.doesNotMatch(distribution, /'অতিরিক্ত প্রদান',/);
  assert.doesNotMatch(collectionRoute, /"অতিরিক্ত প্রদান"/);
  assert.match(collectionRoute, /data\.comments = null/);
  assert.match(itemRoute, /data\.resolutionNote = needsComment \? data\.comments : null/);
  assert.match(distribution, /প্রিন্টে বাদ/);
  assert.match(distribution, /disabled=\{difference >= 0 \|\| !canResolveSelectedReport\}/);
  assert.match(distribution, /\{\['অন্যান্য', 'রিপোর্ট ভুল \/ বাতিল'\]\.includes\(resolutionReason\) && <label/);
  assert.match(collectionRoute, /reconcileSchoolMonthAdjustments/);
  assert.match(itemRoute, /reconcileSchoolMonthAdjustments/);
  assert.match(itemRoute, /QUANTITY_RESOLUTION_DIRECTIONS/);
  assert.match(itemRoute, /INSERT INTO distribution_resolution_items/);
  assert.match(itemRoute, /totalOutstanding - appliedQuantity/);
  assert.match(portal, /মাসিক সমন্বয়/);
  assert.match(portal, /বর্তমান বকেয়া/);
  assert.match(delivery, /outstanding_shortage_/);
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
  assert.match(
    embeddedWorkspace,
    /button\.getAttribute\("title"\) === "অঞ্চল"/,
  );
  assert.match(embeddedWorkspace, /areasNavButton\?\.click\(\)/);
  assert.match(
    embeddedWorkspace,
    /insertAdjacentElement\("afterend", workspaceHost\)/,
  );
  assert.match(embeddedWorkspace, /new MutationObserver/);
  assert.match(
    embeddedWorkspace,
    /target\.closest<HTMLButtonElement>\("\.sidebar nav button"\)/,
  );
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
  const adminExpensePage = await read(
    "app/components/AdminExpenseManagementPage.tsx",
  );
  const embeddedWorkspace = await read(
    "app/components/EmbeddedAreaExpenseWorkspace.tsx",
  );
  const expenseStyles = await read(
    "app/components/admin-expense-management-page.css",
  );

  assert.match(
    embeddedWorkspace,
    /<AdminExpenseManagementPage initialAreaCode=\{areaCode\} initialExpenseId=\{expenseId\} initialExpenseDate=\{expenseDate\} \/>/,
  );
  assert.match(adminExpensePage, /className="admin-expense-page"/);
  assert.doesNotMatch(adminExpensePage, /className="admin-expense-header"/);
  assert.doesNotMatch(
    adminExpensePage,
    /standalone|createPortal|window\.location\.search/,
  );
  assert.doesNotMatch(
    expenseStyles,
    /expense-shell-main|admin-expense-standalone|admin-expense-header/,
  );
  assert.match(
    expenseStyles,
    /\.admin-expense-filters \{[\s\S]*?border-radius: 18px;[\s\S]*?box-shadow: 0 12px 32px/,
  );
  assert.match(
    expenseStyles,
    /\.admin-expense-metrics article \{[\s\S]*?min-height: 118px;[\s\S]*?overflow: hidden;/,
  );
  assert.match(
    expenseStyles,
    /\.admin-expense-report,[\s\S]*?\.admin-payment-panel,[\s\S]*?\.admin-expense-details \{[\s\S]*?border-radius: 20px;[\s\S]*?box-shadow: 0 16px 38px/,
  );
  assert.match(adminExpensePage, /className="panel admin-ledger-panel"/);
  assert.match(
    adminExpensePage,
    /className="no-print admin-ledger-payment-form"/,
  );
  assert.match(
    expenseStyles,
    /\.admin-ledger-panel-head \{[\s\S]*?grid-template-columns:/,
  );
  assert.match(
    expenseStyles,
    /@media \(max-width: 520px\) \{[\s\S]*?\.admin-ledger-payment-form \{[\s\S]*?grid-template-columns: 1fr;/,
  );
});

test("official area codes stay hidden from user-facing UI and exports", async () => {
  const dashboard = await read("app/components/DashboardApp.tsx");
  const profileCard = await read("app/components/AccountProfileCard.tsx");
  const adminExpensePage = await read(
    "app/components/AdminExpenseManagementPage.tsx",
  );

  assert.doesNotMatch(
    dashboard,
    /অঞ্চল কোড|অফিসিয়াল area code|children: e\.areaCode|children: t\.code|children: e\.code|children: \[e\.name, ` \(`/,
  );
  assert.doesNotMatch(profileCard, /display\.area_code \|\|/);
  assert.match(
    profileCard,
    /display\.area_code \? "নির্ধারিত অঞ্চল" : "উপজেলা পর্যায়ের পূর্ণ অনুমতি"/,
  );
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
  const distributionItemRoute = await read(
    "app/api/distribution-reports/[id]/route.ts",
  );
  const accountRoute = await read("app/api/my-account/route.ts");
  const bootstrap = await read("db/bootstrap.ts");
  const loginPage = await read("app/login/page.tsx");

  assert.match(passwordHelper, /PBKDF2_ITERATIONS = 100_000/);
  assert.match(
    passwordHelper,
    /import \{ pbkdf2Async \} from "@noble\/hashes\/pbkdf2\.js"/,
  );
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
  assert.match(
    distributionRoute,
    /authUser\.role === "super_admin"[\s\S]*?requestedAreaCode[\s\S]*?: authUser\.areaCode/,
  );
  assert.match(
    distributionRoute,
    /SELECT area_code, current_daily_demand FROM schools WHERE emis_code = \? AND is_active = 1/,
  );
  assert.match(distributionRoute, /school\.area_code !== data\.areaCode/);
  assert.match(distributionRoute, /existing\.area_code !== data\.areaCode/);
  assert.match(distributionRoute, /data\.problemType === "none" \? "resolved" : "new"/);
  assert.match(
    distributionItemRoute,
    /if \(authUser\.role === "super_admin"\) allowedFields\.push\("status"\)/,
  );
  assert.match(
    accountRoute,
    /authUser\.role === "super_admin"[\s\S]*?searchParams\.get\("area_code"\)[\s\S]*?: authUser\.areaCode/,
  );
  assert.match(loginRoute, /MAX_LOGIN_FAILURES = 5/);
  assert.match(loginRoute, /status: 429/);
  assert.match(bootstrap, /CREATE TABLE IF NOT EXISTS login_attempts/);
  assert.doesNotMatch(
    bootstrap,
    /password: await hashPassword\(String\(area\.managerMobile\)\)/,
  );
  assert.doesNotMatch(loginPage, /পাসওয়ার্ড তাদের মোবাইল নাম্বার/);
});

test("tiffin managers are limited to Home, Monthly Plan, Distribution, their own EMIS school and the Dhaka reporting window", async () => {
  const page = await read("app/page.tsx");
  const dashboard = await read("app/components/DashboardApp.tsx");
  const distribution = await read("app/components/SchoolDistributionAdjustment.tsx");
  const schoolsRoute = await read("app/api/schools/route.ts");
  const reportsRoute = await read("app/api/distribution-reports/route.ts");
  const reportRoute = await read("app/api/distribution-reports/[id]/route.ts");

  assert.match(page, /schoolEmis=\{user\.username\}/);
  assert.match(page, /user\.role !== "area_manager" && user\.role !== "tiffin_manager"/);
  assert.match(dashboard, /e\.id === `dashboard` \|\| e\.id === `distribution`/);
  assert.match(dashboard, /accountRole === `tiffin_manager` && e !== `dashboard` && e !== `distribution`/);
  assert.match(distribution, /s\.emis_code === userSchoolEmis/);
  assert.match(distribution, /disabled=\{accountRole === 'tiffin_manager'\}/);
  assert.match(schoolsRoute, /WHERE s\.emis_code = \? AND s\.is_active = 1 LIMIT 1/);
  assert.match(schoolsRoute, /params = \[authUser\.username\]/);
  assert.match(reportsRoute, /r\.school_emis_code = \?/);
  assert.match(reportsRoute, /const ISO_MONTH/);
  assert.match(reportsRoute, /month && !ISO_MONTH\.test\(month\)/);
  assert.match(reportsRoute, /query \+= ` AND r\.date LIKE \?`/);
  assert.match(reportsRoute, /params\.push\(`\$\{month\}-%`\)/);
  assert.match(reportsRoute, /data\.schoolEmisCode !== authUser\.username/);
  assert.match(reportsRoute, /scheduledItems\.length === 0/);
  assert.match(reportsRoute, /getAreaManagerReportingWindow\(data\.date\)/);
  assert.match(reportRoute, /existing\.school_emis_code !== authUser\.username/);
  assert.match(reportRoute, /getAreaManagerReportingWindow\(existing\.date\)/);
});

test("a tiffin manager report is locked after first submit and can be reopened exactly once by a qualifying admin action before 2 PM", async () => {
  const collectionRoute = await read("app/api/distribution-reports/route.ts");
  const itemRoute = await read("app/api/distribution-reports/[id]/route.ts");
  const adjustmentService = await read("app/lib/distribution-adjustments.ts");
  const portal = await read("app/components/TiffinManagerPortal.tsx");
  const styles = await read("app/components/tiffin-manager-portal.css");
  const schema = await read("db/schema.ts");
  const bootstrap = await read("db/bootstrap.ts");
  const migration = await read("drizzle/0011_distribution_report_reopen.sql");
  const backup = await read("app/lib/system-backup.ts");

  assert.match(collectionRoute, /authUser\.role === "tiffin_manager"[\s\S]*?ইতোমধ্যে জমা হয়েছে/);
  assert.match(itemRoute, /MANAGER_REOPEN_ACTIONS = new Set\(\["পুনরায় সরবরাহ", "নষ্ট পণ্য পরিবর্তন"\]\)/);
  assert.match(itemRoute, /managerReopenGranted[\s\S]*?getAreaManagerReportingWindow\(existing\.date\)\.canReport/);
  assert.match(itemRoute, /manager_submission_count = 2/);
  assert.match(itemRoute, /manager_reopen_allowed = 0/);
  assert.match(itemRoute, /manager_reopen_used_at = CURRENT_TIMESTAMP/);
  assert.match(itemRoute, /Number\(existing\.manager_submission_count \|\| 1\) >= 2/);
  assert.match(itemRoute, /INSERT OR IGNORE INTO distribution_report_submissions/);
  assert.match(itemRoute, /INSERT INTO distribution_report_submissions/);
  assert.match(itemRoute, /'manager_resubmit'/);
  assert.match(adjustmentService, /submissions: ReportSubmissionRow\[\]/);
  assert.match(adjustmentService, /FROM distribution_report_submissions rs/);
  assert.match(schema, /distributionReportSubmissionsTable/);
  assert.match(bootstrap, /CREATE TABLE IF NOT EXISTS distribution_report_submissions/);
  assert.match(bootstrap, /manager_reopen_allowed INTEGER NOT NULL DEFAULT 0/);
  assert.match(migration, /UNIQUE\(report_id, submission_number\)/);
  assert.match(backup, /"distribution_report_submissions"/);
  assert.match(portal, /আপনার রিপোর্ট জমা দেওয়া হয়েছে/);
  assert.match(portal, /আজকে আর রিপোর্ট করতে পারবেন না/);
  assert.match(portal, /একবারের জন্য রিপোর্ট সম্পাদনার অনুমতি দেওয়া হয়েছে/);
  assert.match(portal, /অনুমোদিত দ্বিতীয় রিপোর্ট/);
  assert.match(styles, /\.tiffin-report-edit-state\.is-locked/);
  assert.match(styles, /\.tiffin-report-edit-state\.is-reopened/);
  assert.match(portal, /className="tiffin-receipt-heading"[\s\S]*?className=\{`tiffin-report-edit-state/);
  assert.match(styles, /\.tiffin-receipt-heading \{[\s\S]*?justify-content: space-between;/);
  assert.match(styles, /\.tiffin-report-edit-state \{[\s\S]*?align-items: center;[\s\S]*?margin: 0;[\s\S]*?max-width: 360px;[\s\S]*?padding: 7px 10px;/);
  assert.match(styles, /\.tiffin-report-edit-state > svg \{[^}]*?height: 15px;[^}]*?width: 15px;/);
});

test("monthly tiffin print catches up automatic receipts and refreshes admin adjustments before output", async () => {
  const collectionRoute = await read("app/api/distribution-reports/route.ts");
  const adjustments = await read("app/lib/distribution-adjustments.ts");
  const portal = await read("app/components/TiffinManagerPortal.tsx");

  assert.match(collectionRoute, /month && authUser\.role === "tiffin_manager"/);
  assert.match(collectionRoute, /getAreaManagerReportingWindow\(reportDate\)\.shouldAutoReceive/);
  assert.match(collectionRoute, /autoConfirmDistributionReports\(reportDate, db, authUser\.username\)/);
  assert.match(adjustments, /schoolEmisCode \? " AND s\.emis_code = \?" : ""/);
  assert.match(adjustments, /missingSchools\.map/);
  assert.match(portal, /const refreshPrintableReports = useCallback/);
  assert.match(portal, /flushSync\(\(\) => setMonthReports\(latestReports\)\)/);
  assert.match(portal, /await refreshPrintableReports\(\);[\s\S]*?printDesktopLayout\("printing-monthly-food-report"\)/);
  assert.match(portal, /await refreshPrintableReports\(\);[\s\S]*?report\.classList\.add\("is-pdf-capture"\)/);
  assert.match(portal, /effectiveReceivedValue\(row\.report, "bun"\)/);
  assert.match(portal, /effectiveReceivedValue\(row\.report, "egg"\)/);
  assert.match(portal, /effectiveReceivedValue\(row\.report, "banana"\)/);
});

test("tiffin monthly calendar prefetches and renders independently from slow report reconciliation", async () => {
  const portal = await read("app/components/TiffinManagerPortal.tsx");

  assert.match(portal, /MONTHLY_PLAN_CACHE_TTL_MS = 5 \* 60 \* 1000/);
  assert.match(portal, /monthlyPlanCache = new Map/);
  assert.match(portal, /monthlyPlanRequests = new Map/);
  assert.match(portal, /Date\.now\(\) - cached\.cachedAt <= MONTHLY_PLAN_CACHE_TTL_MS/);
  assert.match(portal, /void loadMonthlyPlan\(today\.slice\(0, 7\)\)\.catch/);
  assert.match(portal, /const cachedStartingPlan = getCachedMonthlyPlan\(startingMonth\)/);
  assert.match(portal, /const result = await loadMonthlyPlan\(month\)/);
  assert.doesNotMatch(portal, /Promise\.all\(\[\s*fetch\(`\/api\/meal-plan\?month=\$\{month\}`[\s\S]*?fetch\(`\/api\/distribution-reports\?month=\$\{month\}`/);
  assert.match(portal, /const refreshPrintableReports = useCallback/);
});

test("tiffin manager portal follows the compact allocation-card and mobile navigation design", async () => {
  const page = await read("app/page.tsx");
  const portal = await read("app/components/TiffinManagerPortal.tsx");
  const styles = await read("app/components/tiffin-manager-portal.css");
  const profile = await read("app/components/AccountProfileCard.tsx");
  const brandSync = await read("app/components/SystemBrandSync.tsx");

  assert.match(page, /user\.role === "tiffin_manager" \? \(/);
  assert.match(page, /<TiffinManagerPortal/);
  assert.doesNotMatch(portal, />আজকের বরাদ্দ</);
  assert.doesNotMatch(portal, />বিতরণ পরিকল্পনা</);
  assert.doesNotMatch(portal, /className="tiffin-status-badge"/);
  assert.match(portal, /প্রাপ্ত আইটেমের তথ্য/);
  assert.match(portal, /সব আইটেম সম্পূর্ণ পেয়েছি/);
  assert.match(portal, /সব আইটেম পেয়েছি/);
  assert.match(portal, /কোন আইটেম পাই নি/);
  assert.doesNotMatch(portal, /½ পেয়েছি/);
  assert.doesNotMatch(portal, /০ পেয়েছি/);
  assert.doesNotMatch(portal, /কারণ বা মন্তব্য লিখুন/);
  assert.doesNotMatch(portal, /<textarea rows=\{3\}/);
  assert.match(portal, /const SHORTAGE_REASONS = \["সরবরাহ কম", "নষ্ট হয়েছে", "পরিবহন সমস্যা", "অন্যান্য"\]/);
  assert.match(portal, /const EXCESS_REASONS = \["ঘাটতি সমন্বয়", "অতিরিক্ত সরবরাহ", "উপহার", "অন্যান্য"\]/);
  assert.match(portal, /প্রাপ্ত পরিমাণ সঠিক আছে।/);
  assert.doesNotMatch(portal, /পার্থক্য ০ হলে কোনো কারণ নির্বাচনের প্রয়োজন নেই।/);
  assert.doesNotMatch(portal, /সব আইটেম বরাদ্দের সঙ্গে মিলেছে।/);
  assert.match(portal, /ঘাটতির কারণ <span>আবশ্যক<\/span>/);
  assert.match(portal, /অতিরিক্ত প্রাপ্তির কারণ <span>আবশ্যক<\/span>/);
  assert.match(portal, /disabled=\{!canReport \|\| saving \|\| !reasonsComplete\}/);
  assert.match(portal, /comments: ""/);
  assert.match(styles, /\.tiffin-reason-picker button\.is-selected/);
  assert.match(portal, /প্রাপ্তি সফলভাবে সংরক্ষিত হয়েছে/);
  assert.match(portal, /requestSubmitConfirmation/);
  assert.match(portal, /receiptConfirmationText/);
  assert.match(portal, /প্রাপ্তি নিশ্চিত করবেন\?/);
  assert.match(portal, /আমি \$\{list\} বুঝে পেয়েছি।/);
  assert.match(portal, /হ্যাঁ, নিশ্চিত করুন/);
  assert.match(portal, /ফিরে গিয়ে দেখুন/);
  assert.match(portal, /aria-modal="true" aria-labelledby="tiffin-receipt-confirm-title"/);
  assert.match(styles, /\.tiffin-receipt-confirm-layer\s*\{[\s\S]*?position: fixed;[\s\S]*?z-index: 160;/);
  assert.match(styles, /@media \(max-width: 760px\)[\s\S]*?\.tiffin-receipt-confirm-dialog\s*\{[^}]*?border-radius: 22px 22px 0 0;[^}]*?max-height: 86dvh;/);
  assert.match(portal, /function TiffinHomeDashboard/);
  assert.match(portal, /tiffin-home-dashboard tiffin-daily-dashboard/);
  assert.match(portal, /আজকের খাবার/);
  assert.match(portal, /বরাদ্দ ও প্রাপ্তির হিসাব/);
  assert.match(portal, /primaryActionLabel = hasIssue \? "সমস্যার রিপোর্ট দেখুন" : report \? "আজকের রিপোর্ট দেখুন" : "প্রাপ্তি ও বিতরণ রিপোর্ট দিন"/);
  assert.doesNotMatch(portal, /<h2>দ্রুত কার্যক্রম<\/h2>/);
  assert.doesNotMatch(portal, /আজকের ৩টি কাজ সম্পন্ন/);
  assert.match(portal, /প্রাপ্ত পরিমাণে পার্থক্য পাওয়া গেছে/);
  assert.match(portal, /className=\{item\.shortageValue \? "is-shortage" : item\.excessValue \? "is-excess" : report \? "is-done" : "is-pending"\}/);
  assert.match(portal, /সাপ্তাহিক সারসংক্ষেপ/);
  assert.match(portal, /সর্বশেষ রিপোর্টসমূহ/);
  assert.match(portal, /পরবর্তী দিনের পরিকল্পনা/);
  assert.doesNotMatch(portal, /প্রোফাইল দেখুন/);
  assert.match(portal, /DISTRIBUTION_REPORT_CUTOFF_HOUR/);
  assert.match(portal, /fetch\("\/api\/distribution-reports"/);
  assert.match(portal, /fetch\(`\/api\/meal-plan\?date=\$\{tomorrow\}`/);
  assert.match(portal, /submittingRef\.current/);
  assert.match(portal, /differenceSummary/);
  assert.match(portal, /item\.difference < 0 \? "ঘাটতি" : "অতিরিক্ত"/);
  assert.match(portal, /\$\{differenceSummary\}। রিপোর্ট সফলভাবে পাঠানো হয়েছে।/);
  assert.match(portal, /aria-label="মোবাইল মেনু"/);
  assert.doesNotMatch(portal, /className="tiffin-context"/);
  assert.match(portal, /<footer className="tiffin-school-footer">/);
  assert.doesNotMatch(portal, /সংযুক্ত বিদ্যালয়/);
  assert.match(portal, /school\.emis_code/);
  assert.match(styles, /\.tiffin-school-footer\s*\{/);
  assert.doesNotMatch(portal, />আজকের পরিকল্পনা</);
  assert.doesNotMatch(portal, /view === "monthly" \? "মাসিক পরিকল্পনা" : "আজকের পরিকল্পনা"/);
  assert.match(portal, /className="tiffin-brand-logo" src="\/bd-logo\.svg"/);
  assert.match(portal, /মিড-ডে মিল ব্যবস্থাপনা/);
  assert.match(portal, /সরবরাহ ব্যবস্থাপনা/);
  assert.match(portal, /মাসিক পরিকল্পনা/);
  assert.match(portal, /function MonthlyMealPlan/);
  assert.match(portal, /onOpenTodayReport/);
  assert.match(portal, /setMonthlyFocusDate\(today\)/);
  assert.match(portal, /persistedReceiptSuccess/);
  assert.match(portal, /if \(!report\) return null/);
  assert.match(portal, /report\.submissions\?\.at\(-1\)\?\.submitted_at \|\| report\.created_at \|\| report\.updated_at/);
  assert.match(portal, /const showEditableReceipt = Boolean\(!report \|\| \(hasAuthorizedSecondSubmission && reportingWindow\.canReport\)\)/);
  assert.match(portal, /showEditableReceipt \? <section className="tiffin-report-panel tiffin-receipt-panel"/);
  assert.match(portal, /report && persistedReceiptSuccess \? <section className="tiffin-submitted-receipt"/);
  assert.match(portal, /tiffin-submitted-receipt[\s\S]*?setMonthlyFocusDate\(today\); setView\("monthly"\);[\s\S]*?>পূর্ণ রিপোর্ট দেখুন/);
  assert.match(portal, /আজকে আর রিপোর্ট সম্পাদনা করা যাবে না/);
  assert.match(portal, /requestedDate=\{monthlyFocusDate\}/);
  assert.match(portal, /fetch\(`\/api\/distribution-reports\?date=\$\{date\}`/);
  assert.match(portal, /className="tiffin-day-report-panel"/);
  assert.match(portal, /দৈনিক প্রাপ্তি রিপোর্ট/);
  assert.match(portal, /function DayReportAuditTrail/);
  assert.match(portal, /সমন্বয়ের পূর্ণ রেকর্ড/);
  assert.match(portal, /মূল রিপোর্ট এবং পরবর্তী সব সমন্বয় আলাদাভাবে সংরক্ষিত/);
  assert.match(portal, /report\.resolution_items/);
  assert.match(portal, /প্রিন্টে গণ্য/);
  assert.match(portal, /ঘাটতি পূরণ \+\{bengaliNumber\(settledShortage\)\}/);
  assert.match(portal, /আগের ঘাটতিতে ব্যবহার/);
  assert.match(styles, /\.tiffin-day-audit-trail\s*\{/);
  assert.match(styles, /\.tiffin-day-audit-summary\s*\{[\s\S]*?grid-template-columns: 1fr 1fr;/);
  assert.match(portal, /এই দিনের রিপোর্ট পাওয়া যায়নি/);
  assert.match(portal, /is-report-selected/);
  assert.match(portal, /\/api\/meal-plan\?month=\$\{month\}/);
  assert.match(portal, /fetch\(`\/api\/distribution-reports\?month=\$\{month\}`, \{ cache: "no-store" \}\)/);
  assert.match(portal, /entry\.date\.startsWith\(`\$\{month\}-`\)/);
  assert.match(portal, /const monthReportsByDate = useMemo/);
  assert.match(portal, /const monthlyReceivedTotals = useMemo/);
  assert.match(portal, /function effectiveReceivedValue/);
  assert.match(portal, /effective_received_\$\{code\}/);
  assert.match(portal, /return Math\.min\(planned, printableReceived\)/);
  assert.match(portal, /function reportItemCodes/);
  assert.match(portal, /const printableDays = useMemo/);
  assert.match(portal, /monthReports\.forEach\(\(report\) =>/);
  assert.match(portal, /printReportStatus\(row\.report, row\.items\)/);
  assert.match(portal, /className="tiffin-report-status"/);
  assert.match(portal, /hadDifference \? "সমন্বিত"/);
  assert.match(portal, /row\.report \? effectiveReceivedValue\(row\.report, "egg"\) : ""/);
  assert.match(portal, /\{monthlyReceivedTotals\.egg\}/);
  assert.doesNotMatch(portal, /<tfoot>[\s\S]*?\{itemCounts\.egg \* demand\}/);
  assert.match(portal, /মাসিক খাবার পরিকল্পনা/);
  assert.match(portal, /সরকারি প্রাথমিক বিদ্যালয় ফিডিং কর্মসূচি/);
  assert.match(portal, /বিদ্যালয়ে গৃহীত খাদ্যের মাসিক প্রতিবেদন/);
  assert.match(portal, /school\?\.union_name/);
  assert.match(portal, /school\?\.cluster_name/);
  assert.match(portal, /নমুনা ফরম-৪/);
  assert.match(portal, /printDesktopLayout\("printing-monthly-food-report"\)/);
  assert.match(portal, /import\("html-to-image"\)/);
  assert.doesNotMatch(portal, /import\("html2canvas"\)/);
  assert.match(portal, /import\("jspdf"\)/);
  assert.match(portal, /টপশিট ডাউনলোড করুন/);
  assert.match(styles, /\.tiffin-monthly-print-report\s*\{[\s\S]*?height: 297mm;[\s\S]*?width: 210mm;/);
  assert.match(styles, /\.tiffin-monthly-print-report\s*\{[\s\S]*?max-height: 297mm;[\s\S]*?overflow: hidden;/);
  assert.match(styles, /\.tiffin-report-status\s*\{[\s\S]*?max-height: 3\.7mm;[\s\S]*?white-space: normal;/);
  assert.match(styles, /body\.desktop-print-layout\.printing-monthly-food-report\s*\{[\s\S]*?height: 297mm !important;[\s\S]*?width: 210mm !important;/);
  assert.match(styles, /body\.printing-monthly-food-report \.tiffin-monthly-print-report/);
  assert.match(styles, /\.tiffin-month-workspace\.has-day-report\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\) 330px/);
  assert.match(styles, /\.tiffin-day-report-panel\s*\{[\s\S]*?position: sticky/);
  assert.match(styles, /@media \(max-width: 760px\)[\s\S]*?\.tiffin-day-report-panel\s*\{[\s\S]*?bottom: 0;[\s\S]*?position: fixed/);
  assert.match(portal, /বিদ্যালয় বন্ধ/);
  assert.doesNotMatch(portal, /className="tiffin-date"/);
  assert.doesNotMatch(styles, /\.tiffin-date/);
  assert.match(portal, /bun: \{ name: "বনরুটি", unit: "পিস", iconSrc: "\/icons8\/bread-color\.png"/);
  assert.match(portal, /egg: \{ name: "সিদ্ধ ডিম", unit: "পিস", iconSrc: "\/icons8\/egg\.png"/);
  assert.match(portal, /banana: \{ name: "কলা", unit: "টি", iconSrc: "\/icons8\/banana\.png"/);
  assert.doesNotMatch(portal, /tiffin-icon-credit/);
  assert.match(profile, /className="account-icon-credit"/);
  assert.match(profile, /https:\/\/icons8\.com\/icon\/vpQbzeGCwsQ1\/bread/);
  await access(new URL("../public/icons8/bread-color.png", import.meta.url));
  await access(new URL("../public/icons8/banana.png", import.meta.url));
  await access(new URL("../public/icons8/egg.png", import.meta.url));
  assert.doesNotMatch(portal, />History|>Reports/);
  assert.match(styles, /\.tiffin-allocation-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3/);
  assert.match(styles, /\.tiffin-receipt-overview\s*\{/);
  assert.match(styles, /\.tiffin-quantity-stepper\s*\{/);
  assert.match(styles, /\.tiffin-submitted-receipt\s*\{/);
  assert.match(styles, /\.tiffin-submitted-items\s*\{/);
  assert.match(styles, /\.tiffin-distribution-state\s*\{/);
  assert.match(styles, /\.tiffin-home-dashboard\s*\{/);
  assert.match(styles, /\.tiffin-daily-header\s*\{/);
  assert.match(styles, /\.tiffin-daily-main-grid\s*\{/);
  assert.match(styles, /\.tiffin-daily-meal-row\s*\{/);
  assert.match(styles, /\.tiffin-daily-metrics\s*\{[^}]*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)/);
  assert.match(styles, /\.tiffin-bottom-nav\s*\{[^}]*display:\s*none/);
  assert.match(portal, /account-launcher-host tiffin-mobile-profile-host/);
  assert.match(styles, /grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(styles, /\.tiffin-portal \.tiffin-mobile-profile-host \.account-user-card\s*\{[^}]*position:\s*static/);
  assert.match(styles, /\.tiffin-portal \.tiffin-mobile-profile-host \.account-launcher-avatar\s*\{[^}]*border-radius:\s*50%/);
  assert.doesNotMatch(styles, /min-width:630px/);
  assert.match(profile, /\.account-launcher-host, \.sidebar/);
  assert.match(brandSync, /set\("\.tiffin-brand strong",projectName\)/);
  assert.match(brandSync, /tiffinLogo\.src=s\.logo_data_url/);
});

test("school EMIS login accepts Bengali digits and copied whitespace without changing other passwords", async () => {
  const normalization = await read("app/lib/login-normalization.ts");
  const loginRoute = await read("app/api/auth/login/route.ts");
  const loginPage = await read("app/login/page.tsx");
  const profile = await read("app/components/AccountProfileCard.tsx");

  assert.match(normalization, /BENGALI_DIGITS = "০১২৩৪৫৬৭৮৯"/);
  assert.match(normalization, /compactUsername.*replace\(\/\\s\+\/g, ""\)/);
  assert.match(normalization, /isEmisLogin = \/\^\\d\{11\}\$\//);
  assert.match(normalization, /isEmisLogin[\s\S]*toAsciiDigits\(String\(rawPassword/);
  assert.match(loginRoute, /normalizeLoginCredentials/);
  assert.match(loginPage, /বাংলা বা ইংরেজি অঙ্কে দেওয়া যাবে/);
  assert.match(loginPage, /autoComplete="current-password"/);
  assert.match(loginPage, /window\.location\.replace\("\/"\)/);
  assert.match(profile, /window\.location\.replace\("\/login"\)/);
  assert.doesNotMatch(loginPage, /router\.replace/);
  assert.doesNotMatch(profile, /router\.replace/);
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
  assert.doesNotMatch(
    accountPage,
    /type="date" required value=\{expenseDate\}/,
  );
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
  assert.match(
    accountPage,
    /\.sidebar nav button\.nav-active:not\(\.area-account-nav\)/,
  );
  assert.match(accountPage, /activeNav\?\.classList\.remove\("nav-active"\)/);
  assert.match(
    accountPage,
    /window\.addEventListener\("area-account-open", openAccountPage\)/,
  );
  assert.match(
    accountPage,
    /accountNav\?\.classList\.add\("area-account-nav", "area-account-nav-active"\)/,
  );
  assert.doesNotMatch(
    accountPage,
    /createPortal\(\s*<button[\s\S]*title="হিসাব"/,
  );
  assert.match(accountPage, /setPageTarget\(main\)/);
  assert.match(accountPage, /area-account-open/);
  assert.match(accountPage, /pageTarget/);
  assert.match(
    accountStyles,
    /\.app-main\.area-account-open > :not\(\.topbar\):not\(\.notice\):not\(\.area-account-page\)/,
  );
  assert.match(
    accountStyles,
    /\.area-account-page \{[\s\S]*?position: relative;/,
  );
  assert.match(accountStyles, /\.area-account-nav \{[\s\S]*?order: 3;/);
  assert.match(
    accountStyles,
    /\.sidebar nav button:nth-child\(3\) \{[\s\S]*?order: 4;/,
  );
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
  assert.match(
    sidebarStyles,
    /\.sidebar-collapsed \.sidebar-foot \{[\s\S]*?border-radius: 16px;[\s\S]*?height: 52px;[\s\S]*?width: 56px;/,
  );
  assert.match(
    sidebarStyles,
    /\.sidebar-collapsed \.sidebar-foot \.live-dot \{[\s\S]*?box-shadow:[\s\S]*?height: 10px;[\s\S]*?width: 10px;/,
  );
  assert.match(
    sidebarStyles,
    /\.sidebar-is-collapsed \.app-main \{[\s\S]*?margin-left: 84px;/,
  );
  assert.match(
    sidebarStyles,
    /@media \(max-width: 800px\) \{[\s\S]*?\.desktop-sidebar-toggle \{[\s\S]*?display: none;/,
  );
});

test("super admin user management supports validated Bengali roles, create, update and delete", async () => {
  const widget = await read("app/components/UserManagementWidget.tsx");
  const page = await read("app/page.tsx");
  const settings = await read("app/components/SettingsModule.tsx");
  assert.doesNotMatch(settings, /SUPER ADMIN CONTROL/);
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
  assert.match(widget, /ইউজার রোল অনুযায়ী ফিল্টার/);
  assert.match(widget, /roleFilter !== "all" && user\.role !== roleFilter/);
  assert.match(widget, /<option value="all">সব রোল<\/option>/);
  assert.doesNotMatch(page, /UserManagementWidget/);
  assert.match(settings, /tab\s*===\s*"users"[\s\S]*?<UserManagementWidget\s*\/>/);
  assert.match(usersRoute, /isAssignableUserRole/);
  assert.match(userRoute, /existing\.role === "super_admin"/);
  assert.match(bootstrap, /role IN \('accounts', 'viewer', 'auditor'\)/);
});

test("school tiffin manager account API stays protected after its setup panel is removed", async () => {
  const widget = await read("app/components/UserManagementWidget.tsx");
  const route = await read("app/api/users/tiffin-managers/route.ts");

  assert.doesNotMatch(widget, /বিদ্যালয় অ্যাকাউন্ট সেটআপ/);
  assert.doesNotMatch(widget, /tiffin-manager-setup/);
  assert.match(route, /requireSuperAdmin/);
  assert.match(route, /WHERE s\.is_active = 1/);
  assert.match(route, /row\.user_id == null/);
  assert.match(route, /hashPassword\(school\.emis_code\)/);
  assert.match(route, /'tiffin_manager'/);
  assert.match(route, /INSERT OR IGNORE INTO users/);
  assert.doesNotMatch(route, /password:\s*school\.emis_code/);
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
  const distribution = await read(
    "app/components/SchoolDistributionAdjustment.tsx",
  );
  const notifications = await read("app/components/NotificationCenter.tsx");

  assert.match(
    formatter,
    /day: "2-digit"[\s\S]*month: "2-digit"[\s\S]*year: "numeric"/,
  );
  for (const source of [dashboard, expenses, account, distribution]) {
    assert.match(source, /formatDateDMY/);
  }
  assert.match(notifications, /formatDateTimeDMY/);
  assert.doesNotMatch(
    `${dashboard}\n${expenses}\n${account}\n${distribution}`,
    /toLocaleDateString/,
  );
  assert.doesNotMatch(
    `${expenses}\n${account}\n${distribution}`,
    /replace\(\/\\\/\/g, ['"]-['"]\)/,
  );
  assert.doesNotMatch(
    `${account}\n${distribution}`,
    />\{(?:row\.date|filterDate)\}</,
  );
  assert.match(
    `${dashboard}\n${expenses}\n${distribution}`,
    /type: ['"]date['"][^}\n]*lang: ['"]en-GB['"]|type="date"[\s\S]{0,60}lang="en-GB"/,
  );
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
  const distribution = await read(
    "app/components/SchoolDistributionAdjustment.tsx",
  );
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
  assert.match(
    styles,
    /\.distribution-exceptions::before,[\s\S]*?content: none !important;[\s\S]*?display: none !important;/,
  );
  assert.match(
    styles,
    /body\.desktop-print-layout \{[\s\S]*?margin: 0 auto !important;[\s\S]*?min-width: 180mm !important;[\s\S]*?position: relative !important;[\s\S]*?width: 180mm !important;/,
  );
  assert.match(
    styles,
    /printing-distribution-report #distribution-exceptions,[\s\S]*?min-width: 180mm !important;[\s\S]*?width: 180mm !important;/,
  );
  assert.match(
    styles,
    /printing-distribution-report[\s\S]*?#distribution-exceptions[\s\S]*?\.distribution-exception-filters\.no-print[\s\S]*?display: none !important;[\s\S]*?visibility: hidden !important;/,
  );
  assert.match(
    styles,
    /\.responsive-adjustment-table[\s\S]*?display: table !important/,
  );
  assert.match(
    styles,
    /\.responsive-adjustment-table tr,[\s\S]*?display: table-row !important/,
  );
  assert.match(
    styles,
    /\.responsive-adjustment-table th,[\s\S]*?display: table-cell !important/,
  );
  assert.match(
    styles,
    /\.responsive-adjustment-table td::before \{[\s\S]*?content: none !important/,
  );
});

test("production manifests reference only emitted client chunks", async () => {
  const manifest = await read("dist/server/__vite_rsc_assets_manifest.js");
  const assets = [...manifest.matchAll(/"\/assets\/([^"]+\.js)"/g)].map(
    (match) => match[1],
  );

  assert.ok(assets.length > 0);
  await Promise.all(
    assets.map((asset) =>
      access(new URL(`../dist/client/assets/${asset}`, import.meta.url)),
    ),
  );
});

test("super admin settings are backed by protected APIs, audit, permissions, backup and encrypted 2FA", async () => {
  const [
    page,
    settingsUi,
    settingsApi,
    bootstrap,
    auth,
    totp,
    secretBox,
    backupApi,
    backupHelper,
    timeTravelApi,
    viteConfig,
  ] = await Promise.all([
    read("app/page.tsx"),
    read("app/components/SettingsModule.tsx"),
    read("app/api/settings/route.ts"),
    read("db/bootstrap.ts"),
    read("app/lib/auth.ts"),
    read("app/lib/totp.ts"),
    read("app/lib/secret-box.ts"),
    read("app/api/settings/database-backup/route.ts"),
    read("app/lib/system-backup.ts"),
    read("app/api/settings/time-travel/route.ts"),
    read("vite.config.ts"),
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
  assert.match(settingsUi, /Cloudflare D1 Time Travel/);
  assert.match(settingsUi, /এখনই ব্যাকআপ নিন/);
  assert.match(settingsUi, /নির্বাচিত ব্যাকআপ রিস্টোর/);
  assert.match(settingsUi, /safety backup download/);
  assert.match(settingsUi, /\/api\/settings\/time-travel/);
  assert.match(settingsUi, /Cloudflare থেকে রিস্টোর করুন/);
  assert.match(settingsUi, /timeTravelConfirmation\s*!==\s*"RESTORE"/);
  assert.doesNotMatch(settingsUi, /label="Scheduled backup চালু"/);
  assert.match(backupApi, /requireSuperAdmin/);
  assert.match(backupApi, /Content-Disposition/);
  assert.match(backupApi, /backup\.downloaded/);
  assert.match(backupApi, /backup\.restored/);
  assert.match(
    backupHelper,
    /excludedTables: \["sessions", "login_attempts"\]/,
  );
  assert.match(backupHelper, /await db\.batch\(statements\)/);
  assert.match(backupHelper, /json_each\(\?\)/);
  assert.match(timeTravelApi, /requireSuperAdmin/);
  assert.match(timeTravelApi, /CLOUDFLARE_D1_API_TOKEN/);
  assert.match(timeTravelApi, /preview\.bookmark !== expectedBookmark/);
  assert.match(timeTravelApi, /previousBookmark: restored\.previous_bookmark/);
  assert.match(timeTravelApi, /Authorization: `Bearer \$\{apiToken\}`/);
  assert.doesNotMatch(settingsUi, /CLOUDFLARE_D1_API_TOKEN/);
  assert.match(viteConfig, /CLOUDFLARE_ACCOUNT_ID/);
  assert.match(viteConfig, /CLOUDFLARE_D1_DATABASE_ID/);
  assert.doesNotMatch(viteConfig, /CLOUDFLARE_D1_API_TOKEN/);
});

test("area school list refreshes from the database after a Settings edit", async () => {
  const [dashboard, schoolsApi, settingsUi, settingsStyles, bootstrap, schoolSettingsApi, areaSettingsApi, settingsApi] =
    await Promise.all([
      read("app/components/DashboardApp.tsx"),
      read("app/api/schools/route.ts"),
      read("app/components/SettingsModule.tsx"),
      read("app/components/settings-module.css"),
      read("db/bootstrap.ts"),
      read("app/api/settings/schools/route.ts"),
      read("app/api/settings/areas/route.ts"),
      read("app/api/settings/route.ts"),
    ]);
  assert.match(dashboard, /fetch\(`\/api\/schools`/);
  assert.match(dashboard, /school\.name_bn/);
  assert.match(dashboard, /school-data-updated/);
  assert.match(dashboard, /schools: h/);
  assert.match(dashboard, /\? schools\.length/);
  assert.match(dashboard, /schools\.filter\(\(school\) => school\.areaName === r\)\.length/);
  assert.match(dashboard, /শিক্ষা অফিস থেকে যাচাইকৃত/);
  assert.match(dashboard, /D\.format\(h\.length\).*বিদ্যালয়/);
  assert.doesNotMatch(dashboard, /Excel থেকে যাচাইকৃত/);
  assert.doesNotMatch(dashboard, /r === `সব অঞ্চল`\s*\? 126/);
  assert.match(schoolsApi, /a\.name_bn AS area_name/);
  assert.match(
    settingsUi,
    /dispatchEvent\(new Event\("school-data-updated"\)\)/,
  );
  assert.match(bootstrap, /serial_number/);
  assert.match(schoolsApi, /COALESCE\(s\.serial_number, 999999\)/);
  assert.match(dashboard, /school\.serial_number/);
  assert.match(settingsUi, /বিদ্যালয়ের ক্রমিক/);
  assert.match(settingsUi, /নতুন বিদ্যালয় যোগ করুন/);
  assert.match(settingsUi, /className="school-form-disclosure"/);
  assert.match(settingsUi, /open=\{formOpen\}/);
  assert.match(settingsUi, /if \(editing\) setFormOpen\(true\)/);
  assert.match(settingsUi, /event\.preventDefault\(\);[\s\S]*?setFormOpen\(\(current\) => !current\)/);
  assert.match(settingsUi, /className="school-form-disclosure-action"/);
  assert.match(settingsStyles, /\.school-form-disclosure\[open\]/);
  assert.match(settingsUi, /বিদ্যালয়ের তালিকা ও অঞ্চল স্থানান্তর/);
  assert.match(settingsUi, /inputMode="numeric"/);
  assert.match(settingsUi, /pattern="\[0-9\]\{11\}"/);
  assert.match(settingsUi, /form\.is_active !== undefined/);
  assert.match(settingsUi, /প্রধান শিক্ষকের নাম/);
  assert.match(settingsUi, /form\.union_name/);
  assert.match(settingsUi, /form\.cluster_name/);
  assert.match(settingsUi, />ইউনিয়ন</);
  assert.match(settingsUi, />ক্লাস্টার</);
  assert.match(schoolSettingsApi, /union_name=\?, cluster_name=\?/);
  assert.match(schoolSettingsApi, /unionName, clusterName/);
  assert.match(bootstrap, /ALTER TABLE schools ADD COLUMN \$\{column\}/);
  assert.match(settingsUi, /নতুন বিদ্যালয় সফলভাবে যোগ করা হয়েছে/);
  assert.match(settingsStyles, /\.school-form-grid input,[\s\S]*?background: #fff;/);
  assert.match(settingsStyles, /border: 1\.5px solid #b6d2ca/);
  assert.match(settingsStyles, /\.school-form-grid input:focus,[\s\S]*?box-shadow:/);
  assert.match(schoolSettingsApi, /duplicateSerial/);
  assert.match(schoolSettingsApi, /\^\\d\{11\}\$/);
  assert.match(schoolSettingsApi, /areas WHERE code=\? AND is_active=1 LIMIT 1/);
  assert.match(settingsUi, /শেষ সতর্কতা:/);
  assert.match(settingsUi, /permanent=1/);
  assert.match(settingsUi, /স্থায়ীভাবে মুছুন/);
  assert.match(settingsUi, /remove\("schools", x\.emis_code, !x\.is_active\)/);
  assert.match(schoolSettingsApi, /params\.get\("permanent"\) === "1"/);
  assert.match(schoolSettingsApi, /school_demand_history WHERE school_emis_code=\?/);
  assert.match(schoolSettingsApi, /distribution_reports WHERE school_emis_code=\?/);
  assert.match(schoolSettingsApi, /স্থায়ীভাবে মুছতে বিদ্যালয়টি আগে নিষ্ক্রিয় করুন/);
  assert.match(schoolSettingsApi, /DELETE FROM users WHERE id=\?/);
  assert.match(schoolSettingsApi, /DELETE FROM schools WHERE emis_code=\?/);
  assert.match(schoolSettingsApi, /await db\.batch\(statements\)/);
  assert.match(schoolSettingsApi, /school\.deleted/);
  assert.doesNotMatch(settingsUi, /placeholder="কোড"/);
  assert.doesNotMatch(settingsUi, /<small>\{x\.code\}<\/small>/);
  assert.match(settingsUi, /অন্য অঞ্চল নির্বাচন করুন/);
  assert.match(settingsUi, /transferAreaAssignments/);
  assert.match(settingsUi, /const \[open, setOpen\] = useState\(false\)/);
  assert.match(settingsUi, /aria-expanded=\{open\}/);
  assert.match(settingsUi, /অঞ্চল ব্যবস্থাপনা খুলুন/);
  assert.match(settingsUi, /open && \(/);
  assert.match(settingsUi, /disabled=\{x\.school_count > 0 \|\| x\.user_count > 0\}/);
  assert.match(areaSettingsApi, /crypto\.randomUUID/);
  assert.match(areaSettingsApi, /export async function PATCH/);
  assert.match(areaSettingsApi, /await db\.batch/);
  assert.match(areaSettingsApi, /UPDATE schools SET area_code=/);
  assert.match(areaSettingsApi, /SELECT emis_code FROM schools WHERE area_code=\? LIMIT 1/);
  assert.match(areaSettingsApi, /area_expenses WHERE area_code=/);
  assert.match(areaSettingsApi, /DELETE FROM areas WHERE code=/);
  assert.match(areaSettingsApi, /area\.deleted/);
  assert.doesNotMatch(areaSettingsApi, /area\.deactivated/);
  assert.match(areaSettingsApi, /status: 409/);
  assert.match(settingsApi, /AS school_count/);
});

test("monthly meal planning is persisted, protected, audited and used by daily distribution", async () => {
  const [
    bootstrap,
    schema,
    settingsUi,
    plannerUi,
    plannerStyles,
    plannerApi,
    dailyApi,
    distribution,
    priceHelper,
  ] = await Promise.all([
    read("db/bootstrap.ts"),
    read("db/schema.ts"),
    read("app/components/SettingsModule.tsx"),
    read("app/components/MealPlanningSettings.tsx"),
    read("app/components/meal-planning-settings.css"),
    read("app/api/settings/meal-plans/route.ts"),
    read("app/api/meal-plan/route.ts"),
    read("app/components/SchoolDistributionAdjustment.tsx"),
    read("app/lib/meal-prices.ts"),
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
  assert.match(plannerUi, /পণ্যের ক্রয়মূল্য/);
  assert.match(plannerUi, /রেট সংরক্ষণ করুন/);
  assert.match(plannerUi, /action:"save-prices"/);
  assert.match(plannerUi, /বনরুটির প্রতি পিস ক্রয়মূল্য/);
  assert.match(plannerUi, /চলমান ও Draft পরিকল্পনা/);
  assert.match(plannerUi, /পরিকল্পনার ইতিহাস/);
  assert.match(plannerUi, /className="meal-plan-picker"/);
  assert.match(plannerUi, /<details className="meal-config-disclosure meal-price-settings">/);
  assert.match(plannerUi, /<details className="meal-config-disclosure meal-period-builder">/);
  assert.doesNotMatch(plannerUi, /<details[^>]*\sopen/);
  assert.match(plannerUi, /className="meal-disclosure-action"/);
  assert.match(plannerStyles, /\.meal-config-disclosure\[open\]/);
  assert.match(plannerUi, /className="meal-plan-info"/);
  assert.match(plannerUi, /className="meal-plan-actions"/);
  assert.doesNotMatch(plannerUi, /একটি মাস বাছুন/);
  assert.doesNotMatch(plannerUi, /<label>পরিকল্পনা<select/);
  assert.match(plannerStyles, /\.meal-plan-toolbar \{[\s\S]*?grid-template-columns:/);
  assert.match(plannerUi, /এটি সংরক্ষিত ইতিহাস; শুধু দেখা যাবে/);
  assert.match(plannerUi, /অন্য মাসের Active পরিকল্পনাগুলো অপরিবর্তিত আছে/);
  assert.doesNotMatch(plannerUi, /selectedItems\.includes\(food\.code\)&&<Check\/>/);
  assert.match(plannerStyles, /\.meal-food-list label\{grid-template-columns:auto 1fr\}/);
  assert.match(plannerStyles, /\.meal-status\.history/);
  assert.match(plannerApi, /requireSuperAdmin/);
  assert.match(plannerApi, /meal_plan\.day_saved/);
  assert.match(plannerApi, /meal_prices\.updated/);
  assert.match(plannerApi, /end_date < date\('now','\+6 hours'\) THEN 'history'/);
  assert.match(plannerApi, /status='active' AND id<>\? AND start_date<=\? AND end_date>=\?/);
  assert.match(plannerApi, /এই সময়সীমায়.*ইতিমধ্যে Active আছে/);
  assert.match(plannerApi, /ইতিমধ্যে Active আছে.*status: 409/s);
  assert.match(plannerApi, /ইতিহাসে থাকা পরিকল্পনা Draft করা যাবে না/);
  assert.doesNotMatch(plannerApi, /UPDATE meal_plan_periods SET status='draft'.*WHERE status='active' AND id<>\?/s);
  assert.match(plannerApi, /MEAL_PRICE_SETTING_KEYS/);
  assert.match(priceHelper, /DEFAULT_MEAL_UNIT_PRICES/);
  assert.match(priceHelper, /meal_price_bun/);
  assert.match(priceHelper, /price > 1000/);
  assert.match(plannerApi, /status='active'/);
  assert.match(dailyApi, /getAuthUser/);
  assert.match(dailyApi, /source: "configured"/);
  assert.match(dailyApi, /searchParams\.get\("month"\)/);
  assert.match(dailyApi, /SELECT plan_date,items_json FROM meal_plan_days/);
  assert.match(dailyApi, /getMealUnitPrices/);
  assert.match(dailyApi, /unitPrices/);
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
  assert.match(dashboard, /monthlyUnitPrices/);
  assert.match(dashboard, /unitPrices: monthlyUnitPrices/);
  assert.match(dashboard, /n\.বনরুটি \* unitPrices\.bun/);
  assert.doesNotMatch(dashboard, /unitPrices = \{ bun: 13\.5, egg: 10, banana: 6 \}/);
  assert.match(dashboard, /monthlyPlanDays/);
  assert.match(dashboard, /setMonthlyPlanDays\(payload\.days \?\? \[\]\)/);
  assert.match(
    dashboard,
    /monthlyPlanDays\.find\(\(day\) => day\.date === c\)/,
  );
  assert.match(dashboard, /mealCodesToRoutineNames/);
  assert.match(
    dashboard,
    /মাসিক খাবার পরিকল্পনায় এই তারিখে কোনো খাবার নির্ধারিত নেই/,
  );
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
  assert.match(
    dashboard,
    /!\[`areas`, `stock`, `suppliers`\]\.includes\(n\) &&[\s\S]*?\(0, E\.jsxs\)\(`div`, \{[\s\S]*?className: `global-filters no-print`/,
  );
});

test("every dashboard view shares the mobile-first system layout", async () => {
  const dashboard = await read("app/components/DashboardApp.tsx");
  const mobile = await read("app/components/mobile-system.css");
  const mobileNavigation = await read("app/components/mobile-navigation.css");
  const layout = await read("app/layout.tsx");

  assert.match(dashboard, /import "\.\/mobile-system\.css"/);
  assert.match(layout, /viewportFit: "cover"/);
  assert.match(
    mobile,
    /\.metric-grid \{[\s\S]*?grid-template-columns: repeat\(2/,
  );
  assert.match(
    mobile,
    /\.table-panel \.table-scroll > table > tbody > tr \{[\s\S]*?display: grid/,
  );
  assert.match(mobile, /\.sidebar > \.account-user-card/);
  assert.match(
    mobileNavigation,
    /\.sidebar > \.account-user-card \{[\s\S]*?bottom: auto !important;[\s\S]*?right: auto !important;[\s\S]*?top: auto !important;/,
  );
  assert.doesNotMatch(mobile, /sidebar-foot:has\(\.settings-launcher\)/);
  assert.match(
    mobile,
    /button,[\s\S]*?input,[\s\S]*?select,[\s\S]*?textarea,[\s\S]*?min-height: 44px/,
  );
  assert.match(mobile, /font-size: 16px/);
  assert.match(mobile, /safe-area-inset-bottom/);
  assert.match(mobile, /@media \(orientation: landscape\)/);
});

test("daily distribution PDF delivery is configurable, scheduled and secret-safe", async () => {
  const settings = await read("app/components/SettingsModule.tsx");
  const settingsApi = await read("app/api/settings/route.ts");
  const adminSettings = await read("app/lib/admin-settings.ts");
  const delivery = await read("app/lib/daily-distribution-delivery.ts");
  const deliveryApi = await read("app/api/settings/report-delivery/route.ts");
  const worker = await read("worker/index.ts");
  const vite = await read("vite.config.ts");
  const bootstrap = await read("db/bootstrap.ts");
  const schema = await read("db/schema.ts");

  assert.match(settings, /দৈনিক স্কুলভিত্তিক PDF রিপোর্ট/);
  assert.match(settings, /RecipientListEditor/);
  assert.match(settings, /mr\.ashequl@gmail\.com|daily_report_emails/);
  assert.match(settings, /Telegram Chat ID \/ @channel/);
  assert.match(settings, /telegram_bot_token/);
  assert.match(settings, /এখনই টেস্ট PDF পাঠান/);
  assert.match(adminSettings, /daily_report_emails/);
  assert.match(adminSettings, /telegram_destinations/);
  assert.match(settingsApi, /telegram_bot_token/);
  assert.match(settingsApi, /requireSuperAdmin/);
  assert.match(deliveryApi, /requireSuperAdmin/);
  assert.match(delivery, /env\.BROWSER\.quickAction\("pdf"/);
  assert.match(delivery, /Anek Bangla Report/);
  assert.match(delivery, /@page\{size:A4 portrait;margin:6mm\}/);
  assert.match(delivery, /font-size:6\.8pt/);
  assert.match(delivery, /padding:\.8mm \.9mm/);
  assert.match(delivery, /th:nth-child\(6\)\{width:48mm\}/);
  assert.match(delivery, /class="status-pill"/);
  assert.match(delivery, /statusLabel: "বনরুটি"/);
  assert.match(delivery, /statusLabel: "সিদ্ধ ডিম"/);
  assert.match(delivery, /statusDifferenceItems\.join\(" এবং "\)/);
  assert.match(delivery, /"সম্পূর্ণ প্রাপ্ত"/);
  assert.match(delivery, /`effective_received_\$\{code\}`/);
  assert.match(delivery, /`outstanding_shortage_\$\{code\}`/);
  assert.match(delivery, /`outstanding_excess_\$\{code\}`/);
  assert.doesNotMatch(delivery, /স্বয়ংক্রিয়ভাবে সম্পূর্ণ প্রাপ্ত/);
  assert.match(delivery, /env\.EMAIL\.send/);
  assert.match(delivery, /sendDocument/);
  assert.match(delivery, /alreadySent/);
  assert.match(delivery, /const mealItems = await getMealItems\(db, date\)/);
  assert.match(delivery, /!isTest && mealItems\.length === 0/);
  assert.match(delivery, /schoolClosed: true/);
  assert.match(delivery, /createPdf\(env, date, mealItems\)/);
  assert.match(delivery, /report_delivery_failed/);
  assert.match(worker, /async scheduled\(/);
  assert.match(worker, /deliverDailyDistributionReport/);
  assert.match(vite, /crons: \["0 8 \* \* \*", "0 10 \* \* \*"\]/);
  assert.match(vite, /^  browser: \{/m);
  assert.match(vite, /^    binding: "BROWSER",$/m);
  assert.match(vite, /^  send_email: \[$/m);
  assert.match(vite, /^      name: "EMAIL",$/m);
  assert.match(bootstrap, /daily_report_emails: '\["mr\.ashequl@gmail\.com"\]'/);
  assert.match(bootstrap, /CREATE TABLE IF NOT EXISTS report_delivery_runs/);
  assert.match(schema, /reportDeliveryRunsTable/);
});
