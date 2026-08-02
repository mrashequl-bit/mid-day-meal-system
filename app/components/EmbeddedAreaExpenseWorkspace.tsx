"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AdminExpenseManagementPage } from "./AdminExpenseManagementPage";
import "./embedded-area-expense-workspace.css";

const OPEN_EVENT = "open-area-expense-workspace";

type WorkspaceEvent = CustomEvent<{ areaCode?: string; expenseId?: number; expenseDate?: string }>;

export function EmbeddedAreaExpenseWorkspace() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [areaCode, setAreaCode] = useState("");
  const [expenseId, setExpenseId] = useState<number | undefined>();
  const [expenseDate, setExpenseDate] = useState("");

  useEffect(() => {
    let workspaceHost: HTMLElement | null = null;

    function syncWorkspaceHost() {
      const areasPanel = document.querySelector(".areas-panel");
      if (!areasPanel) {
        workspaceHost?.remove();
        workspaceHost = null;
        setHost(null);
        return;
      }

      if (
        workspaceHost?.isConnected &&
        areasPanel.nextElementSibling === workspaceHost
      ) {
        return;
      }

      workspaceHost?.remove();
      workspaceHost = document.createElement("div");
      workspaceHost.id = "embedded-area-expense-workspace";
      workspaceHost.className = "embedded-area-expense-host";
      areasPanel.insertAdjacentElement("afterend", workspaceHost);
      setHost(workspaceHost);
    }

    const observer = new MutationObserver(syncWorkspaceHost);
    syncWorkspaceHost();
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      workspaceHost?.remove();
    };
  }, []);

  useEffect(() => {
    function closeForAnotherMenu(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const navButton = target.closest<HTMLButtonElement>(".sidebar nav button");
      if (!navButton) return;
      const label =
        navButton.getAttribute("aria-label") ||
        navButton.getAttribute("title") ||
        navButton.textContent ||
        "";
      if (label.includes("অঞ্চল")) return;
      setOpen(false);
      setAreaCode("");
    }

    document.addEventListener("click", closeForAnotherMenu);
    return () => document.removeEventListener("click", closeForAnotherMenu);
  }, []);

  useEffect(() => {
    function openWorkspace(event: Event) {
      const { areaCode: nextAreaCode = "", expenseId: nextExpenseId, expenseDate: nextExpenseDate = "" } = (event as WorkspaceEvent).detail || {};
      if (!document.querySelector(".areas-panel")) {
        const areasNavButton = Array.from(
          document.querySelectorAll<HTMLButtonElement>(".sidebar nav button"),
        ).find(
          (button) =>
            button.getAttribute("title") === "অঞ্চল" ||
            button.textContent?.includes("অঞ্চল"),
        );
        areasNavButton?.click();
      }

      setAreaCode(nextAreaCode);
      setExpenseId(nextExpenseId);
      setExpenseDate(nextExpenseDate);
      setOpen(true);

      let attempts = 0;
      const scrollWhenReady = () => {
        const workspace = document.getElementById("embedded-area-expense-workspace");
        if (workspace) {
          workspace.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          return;
        }
        attempts += 1;
        if (attempts < 20) window.setTimeout(scrollWhenReady, 50);
      };
      window.requestAnimationFrame(scrollWhenReady);
    }

    window.addEventListener(OPEN_EVENT, openWorkspace);
    return () => window.removeEventListener(OPEN_EVENT, openWorkspace);
  }, []);

  if (!host || !open) return null;

  return createPortal(
    <section className="embedded-area-expense-workspace" aria-label="অঞ্চলভিত্তিক খরচ ব্যবস্থাপনা">
      <div className="embedded-expense-toolbar no-print">
        <div>
          <strong>অঞ্চলভিত্তিক খরচ ব্যবস্থাপনা</strong>
          <span>নির্বাচিত অঞ্চলের রিপোর্ট, পেমেন্ট ও লেজার</span>
        </div>
      </div>
      <AdminExpenseManagementPage initialAreaCode={areaCode} initialExpenseId={expenseId} initialExpenseDate={expenseDate} />
    </section>,
    host,
  );
}
