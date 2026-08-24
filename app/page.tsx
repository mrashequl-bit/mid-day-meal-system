import { redirect } from "next/navigation";
import { DashboardApp } from "./components/DashboardApp";
import { AccountProfileCard } from "./components/AccountProfileCard";
import { ReportDashboardWidgets } from "./components/ReportDashboardWidgets";
import { NotificationCenter } from "./components/NotificationCenter";
import { SettingsModule } from "./components/SettingsModule";
import { SystemBrandSync } from "./components/SystemBrandSync";
import { AreaAccountPage } from "./components/AreaAccountPage";
import { EmbeddedAreaExpenseWorkspace } from "./components/EmbeddedAreaExpenseWorkspace";
import { areas } from "./data/schools";
import { getAuthUser } from "./lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "মিড-ডে মিল ব্যবস্থাপনা",
  description:
    "দুর্গাপুর উপজেলার প্রাথমিক বিদ্যালয়ের মিড-ডে মিল সরবরাহ ব্যবস্থাপনা",
};

export default async function Home() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  const userArea = areas.find((area) => area.code === user.areaCode);

  return (
    <>
      {user.role === "area_manager" && (
        <style dangerouslySetInnerHTML={{ __html: `
          .sidebar nav button:nth-child(5),
          .sidebar nav button:nth-child(6),
          .sidebar nav button:nth-child(7) { display: none !important; }
          .table-scroll table th.no-print,
          .table-scroll table td.no-print,
          .area-manager .button-secondary { display: none !important; }
        `}} />
      )}
      <AccountProfileCard
        fallbackName={user.name || "User"}
        fallbackEmail={user.mobile || ""}
        showSettings={user.role === "super_admin"}
      />
      <SystemBrandSync />
      <DashboardApp
        userName={user.name || "User"}
        userEmail={user.mobile || ""}
        userRole={user.role || ""}
        userAreaCode={user.areaCode || ""}
      />
      {user.role !== "area_manager" && <EmbeddedAreaExpenseWorkspace />}
      <ReportDashboardWidgets
        accountRole={user.role || ""}
        userAreaCode={user.areaCode || ""}
      />
      <AreaAccountPage
        enabled={user.role === "area_manager"}
        areaName={userArea?.name}
      />
      <NotificationCenter />
      {user.role === "super_admin" && <SettingsModule />}
    </>
  );
}
