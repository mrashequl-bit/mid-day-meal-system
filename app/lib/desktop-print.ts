"use client";

let activePrintCleanup: (() => void) | null = null;

export function printDesktopLayout(scopeClass?: string, onComplete?: () => void) {
  activePrintCleanup?.();

  const classes = ["desktop-print-layout", scopeClass].filter(Boolean) as string[];
  const previousTitle = document.title;
  let cleaned = false;
  const printMedia = window.matchMedia("print");

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    document.body.classList.remove(...classes);
    window.removeEventListener("afterprint", cleanup);
    printMedia.removeEventListener?.("change", handlePrintMediaChange);
    document.title = previousTitle;
    activePrintCleanup = null;
    onComplete?.();
  };

  const handlePrintMediaChange = (event: MediaQueryListEvent) => {
    if (!event.matches) cleanup();
  };

  activePrintCleanup = cleanup;
  document.title = "";
  document.body.classList.add(...classes);
  window.addEventListener("afterprint", cleanup, { once: true });
  printMedia.addEventListener?.("change", handlePrintMediaChange);

  try {
    window.print();
  } catch (error) {
    cleanup();
    throw error;
  }

  return cleanup;
}
