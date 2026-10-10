"use client";
import { useEffect } from "react";

export function SystemBrandSync() {
  useEffect(() => {
    const controller = new AbortController();

    async function sync() {
      const response = await fetch("/api/settings/public", {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) return;

      const s = await response.json() as Record<string, string>;
      if (controller.signal.aborted) return;

      const set = (selector: string, value?: string) => {
        const node = document.querySelector<HTMLElement>(selector);
        if (node && value) node.textContent = value;
      };
      const projectName = s.project_name || s.institution_name;

      set(".topbar p", s.institution_name);
      set(".topbar small", s.address);
      set(".brand strong", projectName);
      set(".tiffin-brand strong",projectName);
      document.title = projectName || document.title;

      const seal = document.querySelector<HTMLElement>(".brand-seal");
      if (seal && s.logo_data_url) {
        seal.textContent = "";
        seal.style.backgroundImage = `url(${s.logo_data_url})`;
        seal.style.backgroundSize = "cover";
        seal.style.backgroundPosition = "center";
      }

      const tiffinLogo = document.querySelector<HTMLImageElement>(".tiffin-brand-logo");
      if (tiffinLogo && s.logo_data_url) tiffinLogo.src=s.logo_data_url;
    }

    const handleSettingsUpdate = () => {
      void sync().catch(() => undefined);
    };

    handleSettingsUpdate();
    addEventListener("system-settings-updated", handleSettingsUpdate);
    return () => {
      controller.abort();
      removeEventListener("system-settings-updated", handleSettingsUpdate);
    };
  }, []);

  return null;
}
