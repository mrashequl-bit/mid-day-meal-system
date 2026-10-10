// @ts-nocheck
/* eslint-disable */
"use client";
import "./DashboardApp.css";
import "./sidebar-collapse.css";
import "./mobile-navigation.css";
import "./header-cleanup.css";
import "./distribution-redesign.css";
import "./index.css";
import "./mobile-system.css";
import * as React from "react";
import * as JSXRuntime from "react/jsx-runtime";
import {
  Boxes,
  CalendarRange,
  ClipboardList,
  FileChartColumn,
  Handshake,
  House,
  MapPinned,
} from "lucide-react";
import { SchoolDistributionAdjustment } from "./SchoolDistributionAdjustment";
import { ErrorBoundary } from "./ErrorBoundary";
import { areas, schools } from "../data/schools";
import { formatDateDMY } from "../lib/date-format";
import { printDesktopLayout } from "../lib/desktop-print";
import { getDhakaClock } from "../lib/distribution-reporting-window";
const l = React;
const E = JSXRuntime;
const m = Boxes;
const h = CalendarRange;
const y = FileChartColumn;
const b = Handshake;
const S = MapPinned;
const w = areas;
const T = schools;
const D = new Intl.NumberFormat(`bn-BD`),
  O = new Intl.NumberFormat(`bn-BD`, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
  k = { format: formatDateDMY },
  A = {
    0: [`বনরুটি`, `সিদ্ধ ডিম`],
    1: [`বনরুটি`],
    2: [`কলা`],
    3: [`বনরুটি`, `সিদ্ধ ডিম`],
    4: [`বনরুটি`, `সিদ্ধ ডিম`],
    5: [],
    6: [],
  },
  j = [
    { id: `dashboard`, label: `হোম`, icon: House },
    { id: `areas`, label: `অঞ্চল`, icon: S },
    { id: `account`, label: `হিসাব`, icon: ClipboardList },
    { id: `distribution`, label: `বিতরণ`, icon: h },
    { id: `stock`, label: `স্টক`, icon: m },
    { id: `suppliers`, label: `সরবরাহকারী`, icon: b },
    { id: `reports`, label: `রিপোর্ট`, icon: y },
  ];
function M(e) {
  return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, `0`)}-${String(e.getDate()).padStart(2, `0`)}`;
}
function N(e) {
  return (e.length === 11 ? `${e.slice(0, 5)} ${e.slice(5)}` : e).replace(
    /\d/g,
    (e) => `০১২৩৪৫৬৭৮৯`[Number(e)],
  );
}
function P(e, t) {
  return e instanceof Error && e.message ? e.message : t;
}
function F(e) {
  return `৳${O.format(e / 100)}`;
}
var I = {
    bun: { name: `বনরুটি`, unit: `পিস`, routineName: `বনরুটি` },
    egg: { name: `সিদ্ধ ডিম`, unit: `পিস`, routineName: `সিদ্ধ ডিম` },
    banana: { name: `কলা`, unit: `টি`, routineName: `কলা` },
  },
  L = {
    opening: `স্টক আছে`,
    stock_in: `ক্রয়`,
    stock_out: `বিতরণ`,
    damaged: `নষ্ট`,
    returned: `ফেরত`,
    adjustment_add: `সমন্বয় যোগ`,
    adjustment_sub: `সমন্বয় বিয়োগ`,
  },
  stockEntryTransactionTypes = [
    `opening`,
    `stock_in`,
    `stock_out`,
    `damaged`,
    `returned`,
  ];
function mealCodesToRoutineNames(codes) {
  return (codes ?? []).map((code) => I[code]?.routineName).filter(Boolean);
}
function formatStockPlanDate(e) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) return ``;
  let [t, n, r] = e.split(`-`).map(Number),
    i = new Date(`${e}T00:00:00+06:00`),
    a = new Intl.DateTimeFormat(`bn-BD`, {
      month: `long`,
      timeZone: `Asia/Dhaka`,
    }).format(i);
  return `${a} ${D.format(r)}, ${N(String(t))}`;
}
function formatStockPlanWeekday(e) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e)) return ``;
  return new Intl.DateTimeFormat(`bn-BD`, {
    weekday: `long`,
    timeZone: `Asia/Dhaka`,
  }).format(new Date(`${e}T00:00:00+06:00`));
}
function parseStockAreaCodes(e) {
  if (!e) return [];
  if (Array.isArray(e)) return e.map(String).filter(Boolean);
  if (typeof e !== `string`) return [];
  if (!e.startsWith(`[`)) return [e];
  try {
    let t = JSON.parse(e);
    return Array.isArray(t) ? t.map(String).filter(Boolean) : [];
  } catch {
    return [e];
  }
}
function formatStockAreaNames(e) {
  return parseStockAreaCodes(e)
    .map((e) => w.find((t) => t.code === e)?.name || e)
    .join(`, `);
}
function z({ label: e, value: t, note: n, tone: r = `green` }) {
  return (0, E.jsxs)(`article`, {
    className: `metric-card metric-${r}`,
    children: [
      (0, E.jsx)(`span`, { className: `metric-mark`, "aria-hidden": `true` }),
      (0, E.jsx)(`p`, { children: e }),
      (0, E.jsx)(`strong`, { children: t }),
      (0, E.jsx)(`small`, { children: n }),
    ],
  });
}
function B({ userName: e, userEmail: t, userRole: accountRole, userAreaCode: userAreaCode, userSchoolEmis }) {
  let [n, r] = (0, l.useState)(`dashboard`), [cssReady, setCssReady] = (0, l.useState)(!1),
    [sidebarCollapsed, setSidebarCollapsed] = (0, l.useState)(!1),
    [isMounted, setIsMounted] = (0, l.useState)(!1),
    _mountEffect = (0, l.useEffect)(() => {
      let savedTab = sessionStorage.getItem('activeTab');
      let canOpenSavedTab = accountRole !== 'tiffin_manager' || savedTab === 'dashboard' || savedTab === 'distribution';
      if (savedTab && savedTab !== 'dashboard' && canOpenSavedTab) r(savedTab);
      let savedSidebar = sessionStorage.getItem('sidebarCollapsed');
      if (savedSidebar === 'true') setSidebarCollapsed(!0);
      setIsMounted(!0); setTimeout(() => setCssReady(!0), 50);
    }, []),
    _syncEffect = (0, l.useEffect)(() => {
      if (isMounted) {
        sessionStorage.setItem('activeTab', n);
        sessionStorage.setItem('sidebarCollapsed', sidebarCollapsed ? 'true' : 'false');
      }
    }, [n, sidebarCollapsed, isMounted]),
    [i, a] = (0, l.useState)(accountRole === 'area_manager' ? (w.find(x => x.code === userAreaCode)?.name || `সব অঞ্চল`) : `সব অঞ্চল`),
    [o, s] = (0, l.useState)(`সব পণ্য`),
    [c, u] = (0, l.useState)(M(new Date())),
    [d, f] = (0, l.useState)(``),
    [p, m] = (0, l.useState)(1),
    [h, g] = (0, l.useState)(T),
    _schoolDataEffect = (0, l.useEffect)(() => {
      let cancelled = !1;
      async function loadSchoolData() {
        try {
          let response = await fetch(`/api/schools`, { cache: `no-store` });
          if (!response.ok) return;
          let payload = await response.json(), rows = payload.schools ?? [];
          if (!cancelled && Array.isArray(rows)) {
            g(rows.map((school, index) => ({
              serial: Number(school.serial_number ?? index + 1),
              name: school.name_bn,
              emisCode: school.emis_code,
              headTeacher: school.head_teacher ?? ``,
              legacyMobile: school.legacy_mobile ?? ``,
              unionName: school.union_name ?? ``,
              dailyDemand: Number(school.current_daily_demand ?? 0),
              areaName: school.area_name ?? w.find((area) => area.code === school.area_code)?.name ?? ``,
              areaCode: school.area_code,
            })));
          }
        } catch {
          // Keep the bundled fallback dataset when the database is temporarily unavailable.
        }
      }
      loadSchoolData();
      window.addEventListener(`school-data-updated`, loadSchoolData);
      return () => {
        cancelled = !0;
        window.removeEventListener(`school-data-updated`, loadSchoolData);
      };
    }, []),
    [monthlyPlanCounts, setMonthlyPlanCounts] = (0, l.useState)(null),
    [monthlyRemainingCounts, setMonthlyRemainingCounts] = (0, l.useState)(null),
    [monthlyPlanDays, setMonthlyPlanDays] = (0, l.useState)(null),
    [monthlyPlanName, setMonthlyPlanName] = (0, l.useState)(``),
    [monthlyUnitPrices, setMonthlyUnitPrices] = (0, l.useState)({ bun: 13.5, egg: 10, banana: 6 }),
    _monthlyPlanEffect = (0, l.useEffect)(() => {
      let cancelled = !1;
      async function loadMonthlyPlan() {
        try {
          let month = c.slice(0, 7),
            response = await fetch(`/api/meal-plan?month=${month}`, { cache: `no-store` });
          if (!response.ok) throw Error(`monthly plan unavailable`);
          let payload = await response.json();
          if (cancelled) return;
          setMonthlyUnitPrices(payload.unitPrices ?? { bun: 13.5, egg: 10, banana: 6 });
          if (payload.source !== `configured`) {
            setMonthlyPlanCounts(null);
            setMonthlyRemainingCounts(null);
            setMonthlyPlanDays(null);
            setMonthlyPlanName(``);
            return;
          }
          let counts = { bun: 0, egg: 0, banana: 0 },
            remainingCounts = { bun: 0, egg: 0, banana: 0 },
            today = getDhakaClock().date;
          for (let day of payload.days ?? []) {
            for (let code of new Set(day.items ?? [])) {
              if (Object.prototype.hasOwnProperty.call(counts, code)) {
                counts[code] += 1;
                if (day.date > today) remainingCounts[code] += 1;
              }
            }
          }
          setMonthlyPlanCounts(counts);
          setMonthlyRemainingCounts(remainingCounts);
          setMonthlyPlanDays(payload.days ?? []);
          setMonthlyPlanName(payload.periodName ?? ``);
        } catch {
          if (!cancelled) {
            setMonthlyPlanCounts(null);
            setMonthlyRemainingCounts(null);
            setMonthlyPlanDays(null);
            setMonthlyPlanName(``);
          }
        }
      }
      loadMonthlyPlan();
      window.addEventListener(`meal-plan-updated`, loadMonthlyPlan);
      return () => {
        cancelled = !0;
        window.removeEventListener(`meal-plan-updated`, loadMonthlyPlan);
      };
    }, [c]),
    [x, S] = (0, l.useState)(``),
    O = (0, l.useMemo)(() => {
      let e = d.trim().toLocaleLowerCase(`bn`);
      return h.filter((t) => {
        let n = i === `সব অঞ্চল` || t.areaName === i,
          r =
            !e ||
            t.name.toLocaleLowerCase(`bn`).includes(e) ||
            t.emisCode.includes(e) ||
            t.headTeacher.toLocaleLowerCase(`bn`).includes(e) ||
            (t.legacyMobile ?? ``).includes(e) ||
            (t.unionName ?? ``).toLocaleLowerCase(`bn`).includes(e);
        return n && r;
      });
    }, [i, d, h]),
    N = (0, l.useMemo)(
      () => {
        if (accountRole === 'area_manager') {
          let managerAreaName = w.find(a => a.code === userAreaCode)?.name;
          return h.filter(e => e.areaName === managerAreaName);
        }
        return i === `সব অঞ্চল` ? h : h.filter((e) => e.areaName === i);
      },
      [i, h, accountRole, userAreaCode],
    ).reduce((e, t) => e + t.dailyDemand, 0),
    P = (0, l.useMemo)(() => new Date(`${c}T12:00:00`), [c]),
    F = monthlyPlanDays === null
      ? (A[P.getDay()] ?? [])
      : mealCodesToRoutineNames(monthlyPlanDays.find((day) => day.date === c)?.items),
    I = o === `সব পণ্য` ? F : F.filter((e) => e === o),
    L = (0, l.useMemo)(() => {
      let e = P.getFullYear(),
        t = P.getMonth(),
        n = { বনরুটি: 0, "সিদ্ধ ডিম": 0, কলা: 0 };
      if (monthlyPlanCounts) {
        n.বনরুটি = (monthlyPlanCounts.bun ?? 0) * N;
        n["সিদ্ধ ডিম"] = (monthlyPlanCounts.egg ?? 0) * N;
        n.কলা = (monthlyPlanCounts.banana ?? 0) * N;
        return n;
      }
      for (let r = 1; r <= 31; r += 1) {
        let i = new Date(e, t, r, 12);
        if (i.getMonth() !== t) break;
        for (let e of A[i.getDay()] ?? []) n[e] += N;
      }
      return n;
    }, [P, N, monthlyPlanCounts]),
    R = Math.max(1, Math.ceil(O.length / 12)),
    z = O.slice((Math.min(p, R) - 1) * 12, Math.min(p, R) * 12);
  function B(e) {
    if (accountRole === `tiffin_manager` && e !== `dashboard` && e !== `distribution`) return;
    (r(e), S(``));
  }
  function J(e) {
    (a(e), m(1));
  }
  function Y(e) {
    let t = [
        [
          `ক্রমিক`,
          `অঞ্চল`,
          `বিদ্যালয়ের নাম`,
          `EMIS কোড`,
          `ইউনিয়ন`,
          `প্রধান শিক্ষক`,
          `মোবাইল নম্বর`,
          `একদিনের এক আইটেমের চাহিদা`,
        ],
        ...e.map((e) => [
          e.serial,
          e.areaName,
          e.name,
          e.emisCode,
          e.unionName || ``,
          e.headTeacher,
          formatSchoolMobile(e.legacyMobile),
          e.dailyDemand,
        ]),
      ].map((e) =>
        e.map((e) => `"${String(e).replaceAll(`"`, `""`)}"`).join(`,`),
      ).join(`
`),
      n = new Blob([`\uFEFF${t}`], { type: `text/csv;charset=utf-8` }),
      r = URL.createObjectURL(n),
      i = document.createElement(`a`);
    ((i.href = r),
      (i.download = `school-demand-report.csv`),
      i.click(),
      URL.revokeObjectURL(r));
  }
  return (0, E.jsxs)(`div`, {
    suppressHydrationWarning: !0, style: { visibility: isMounted ? "visible" : "hidden", opacity: isMounted ? 1 : 0 }, className: (sidebarCollapsed ? `app-shell sidebar-is-collapsed` : `app-shell`) + (cssReady ? `` : ` no-transition`),
    children: [
      (0, E.jsxs)(`aside`, {
        suppressHydrationWarning: !0, className: sidebarCollapsed ? `sidebar sidebar-collapsed no-print` : `sidebar no-print`,
        children: [
          (0, E.jsxs)(`div`, {
            className: `brand`,
            children: [
              (0, E.jsx)(`span`, { className: `brand-seal`, children: `মি` }),
              (0, E.jsxs)(`div`, {
                children: [
                  (0, E.jsx)(`strong`, { children: `মিড-ডে মিল` }),
                  (0, E.jsx)(`small`, { children: `সরবরাহ ব্যবস্থাপনা` }),
                ],
              }),
            ],
          }),
          (0, E.jsx)(`button`, {
            className: `desktop-sidebar-toggle`,
            type: `button`,
            "aria-label": sidebarCollapsed
              ? `সাইডবার ওপেন করুন`
              : `সাইডবার ক্লোজ করুন`,
            "aria-expanded": !sidebarCollapsed,
            onClick: () => setSidebarCollapsed((e) => !e),
            children: sidebarCollapsed ? `›` : `‹`,
          }),
          (0, E.jsx)(`nav`, {
            "aria-label": `প্রধান মেনু`,
            children: (accountRole === `tiffin_manager`
              ? j.filter((e) => e.id === `dashboard` || e.id === `distribution`)
              : accountRole === `area_manager`
                ? j
                : j.filter((e) => e.id !== `account`)).map((e) => {
              let t = e.icon;
              return (0, E.jsxs)(
                `button`,
                {
                  "aria-current": n === e.id ? `page` : void 0,
                  "aria-label": e.label,
                  className: n === e.id ? `nav-active` : ``,
                  onClick: () =>
                    e.id === `account`
                      ? window.dispatchEvent(
                          new CustomEvent(`area-account-open`),
                        )
                      : B(e.id),
                  title: e.label,
                  type: `button`,
                  children: [
                    (0, E.jsx)(`span`, {
                      className: `nav-icon`,
                      "aria-hidden": `true`,
                      children: (0, E.jsx)(t, {}),
                    }),
                    (0, E.jsx)(`span`, {
                      className: `nav-label`,
                      children: e.label,
                    }),
                  ],
                },
                e.id,
              );
            }),
          }),
          (0, E.jsxs)(`div`, {
            className: `sidebar-foot`,
            role: `status`,
            title: `সিস্টেম সচল — সর্বশেষ ডেটা: ${D.format(h.length)} বিদ্যালয়`,
            children: [
              (0, E.jsx)(`span`, { className: `live-dot` }),
              (0, E.jsxs)(`p`, {
                children: [
                  (0, E.jsx)(`strong`, { children: `সিস্টেম সচল` }),
                  (0, E.jsx)(`small`, {
                    children: `সর্বশেষ ডেটা: ${D.format(h.length)} বিদ্যালয়`,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      (0, E.jsxs)(`main`, {
        className: `app-main`,
        children: [
          (0, E.jsxs)(`header`, {
            className: `topbar no-print`,
            children: [
              (0, E.jsxs)(`div`, {
                children: [
                  (0, E.jsx)(`button`, {
                    className: `mobile-menu`,
                    type: `button`,
                    onClick: () => r(`dashboard`),
                    "aria-label": `ড্যাশবোর্ডে যান`,
                    children: `মি`,
                  }),
                  (0, E.jsx)(`p`, { children: `মিড-ডে মিল অপারেশন` }),
                  (0, E.jsx)(`small`, { children: `দুর্গাপুর উপজেলা, নেত্রকোণা` }),
                ],
              }),
              (0, E.jsxs)(`div`, {
                className: `top-actions`,
                children: [
                  (0, E.jsx)(`button`, {
                    className: `alert-button`,
                    type: `button`,
                    "aria-label": `নোটিফিকেশন`,
                    children: `৩`,
                  }),
                ],
              }),
            ],
          }),
          x &&
            (0, E.jsxs)(`div`, {
              className: `notice`,
              role: `status`,
              children: [
                x,
                (0, E.jsx)(`button`, {
                  type: `button`,
                  onClick: () => S(``),
                  children: `বন্ধ`,
                }),
              ],
            }),
          (0, E.jsxs)(`section`, {
            className: `page-head`,
            children: [
              (0, E.jsxs)(`div`, {
                children: [
                  (0, E.jsx)(`p`, {
                    className: `eyebrow`,
                    children: `মিড-ডে মিল অপারেশন`,
                  }),
                  (0, E.jsx)(`h1`, {
                    children: j.find((e) => e.id === n)?.label,
                  }),
                ],
              }),
              ![`areas`, `stock`, `suppliers`].includes(n) &&
                (0, E.jsxs)(`div`, {
                  className: `global-filters no-print`,
                  children: [
                  (0, E.jsxs)(`label`, {
                    children: [
                      `তারিখ`,
                      (0, E.jsx)(`input`, {
                        type: `date`,
                        lang: `en-GB`,
                        value: c,
                        onChange: (e) => u(e.target.value),
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`label`, {
                    children: [
                      `অঞ্চল`,
                      (0, E.jsxs)(`select`, {
                        value: i,
                        onChange: (e) => J(e.target.value),
                        children: [
                          (0, E.jsx)(`option`, { children: `সব অঞ্চল` }),
                          w.map((e) =>
                            (0, E.jsx)(`option`, { children: e.name }, e.code),
                          ),
                        ],
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`label`, {
                    children: [
                      `পণ্য`,
                      (0, E.jsxs)(`select`, {
                        value: o,
                        onChange: (e) => s(e.target.value),
                        children: [
                          (0, E.jsx)(`option`, { children: `সব পণ্য` }),
                          (0, E.jsx)(`option`, { children: `বনরুটি` }),
                          (0, E.jsx)(`option`, { children: `সিদ্ধ ডিম` }),
                          (0, E.jsx)(`option`, { children: `কলা` }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          n === `dashboard` &&
            (0, E.jsx)(V, {
              dailyDemand: N,
              activeItems: I,
              monthlyTotals: L,
              monthlyPlanName,
              monthlyPlanCounts,
              monthlyRemainingCounts,
              areaFilter: i,
              schools: h,
              unitPrices: monthlyUnitPrices,
            }),
          n === `areas` &&
            (0, E.jsxs)(E.Fragment, {
              children: [
                (0, E.jsx)(H, {
                  onAreaSelect: (e) => {
                    (J(e),
                      setTimeout(() => {
                        document
                          .getElementById(`schools-section`)
                          ?.scrollIntoView({ behavior: `smooth` });
                      }, 100));
                  },
                }),
                (0, E.jsx)(`div`, {
                  id: `schools-section`,
                  style: { marginTop: `32px` },
                  children: (0, E.jsx)(U, {
                    query: d,
                    setQuery: (e) => {
                      (f(e), m(1));
                    },
                    schools: z,
                    total: O.length,
                    page: Math.min(p, R),
                    pageCount: R,
                    setPage: m,
                    onExport: () => Y(O),
                  }),
                }),
              ],
            }),
          n === `distribution` &&
            (0, E.jsx)(W, {
              activeDate: P,
              dailyDemand: N,
              items: I,
              areaFilter: i,
              accountRole,
              userAreaCode,
              userSchoolEmis,
            }),
          n === `stock` &&
            (0, E.jsx)(G, {
              dailyDemand: N,
              startDate: P,
              areaFilter: i,
              schools: h,
            }),
          n === `reports` &&
            (0, E.jsx)(K, {
              dailyDemand: N,
              areaFilter: i,
              onExport: () => Y(O),
            }),
          n === `suppliers` && (0, E.jsx)(q, {}),
        ],
      }),
    ],
  });
}
const bengaliNumberWords = [
  `শূন্য`, `এক`, `দুই`, `তিন`, `চার`, `পাঁচ`, `ছয়`, `সাত`, `আট`, `নয়`,
  `দশ`, `এগারো`, `বারো`, `তেরো`, `চৌদ্দ`, `পনেরো`, `ষোলো`, `সতেরো`, `আঠারো`, `উনিশ`,
  `বিশ`, `একুশ`, `বাইশ`, `তেইশ`, `চব্বিশ`, `পঁচিশ`, `ছাব্বিশ`, `সাতাশ`, `আটাশ`, `ঊনত্রিশ`,
  `ত্রিশ`, `একত্রিশ`, `বত্রিশ`, `তেত্রিশ`, `চৌত্রিশ`, `পঁয়ত্রিশ`, `ছত্রিশ`, `সাঁইত্রিশ`, `আটত্রিশ`, `ঊনচল্লিশ`,
  `চল্লিশ`, `একচল্লিশ`, `বিয়াল্লিশ`, `তেতাল্লিশ`, `চুয়াল্লিশ`, `পঁয়তাল্লিশ`, `ছেচল্লিশ`, `সাতচল্লিশ`, `আটচল্লিশ`, `ঊনপঞ্চাশ`,
  `পঞ্চাশ`, `একান্ন`, `বাহান্ন`, `তিপ্পান্ন`, `চুয়ান্ন`, `পঞ্চান্ন`, `ছাপ্পান্ন`, `সাতান্ন`, `আটান্ন`, `ঊনষাট`,
  `ষাট`, `একষট্টি`, `বাষট্টি`, `তেষট্টি`, `চৌষট্টি`, `পঁয়ষট্টি`, `ছেষট্টি`, `সাতষট্টি`, `আটষট্টি`, `ঊনসত্তর`,
  `সত্তর`, `একাত্তর`, `বাহাত্তর`, `তিয়াত্তর`, `চুয়াত্তর`, `পঁচাত্তর`, `ছিয়াত্তর`, `সাতাত্তর`, `আটাত্তর`, `ঊনআশি`,
  `আশি`, `একাশি`, `বিরাশি`, `তিরাশি`, `চুরাশি`, `পঁচাশি`, `ছিয়াশি`, `সাতাশি`, `আটাশি`, `ঊননব্বই`,
  `নব্বই`, `একানব্বই`, `বিরানব্বই`, `তিরানব্বই`, `চুরানব্বই`, `পঁচানব্বই`, `ছিয়ানব্বই`, `সাতানব্বই`, `আটানব্বই`, `নিরানব্বই`,
];

function integerToBengaliWords(value) {
  let number = Math.floor(Math.abs(value));
  if (number < 100) return bengaliNumberWords[number];
  let parts = [];
  for (let [divisor, label] of [[10000000, `কোটি`], [100000, `লক্ষ`], [1000, `হাজার`], [100, `শত`]]) {
    if (number >= divisor) {
      let amount = Math.floor(number / divisor);
      parts.push(`${integerToBengaliWords(amount)} ${label}`);
      number %= divisor;
    }
  }
  if (number) parts.push(bengaliNumberWords[number]);
  return parts.join(` `);
}

function moneyToBengaliWords(value) {
  let totalPaisa = Math.round(Math.max(0, value) * 100),
    taka = Math.floor(totalPaisa / 100),
    paisa = totalPaisa % 100,
    result = `${integerToBengaliWords(taka)} টাকা`;
  if (paisa) result += ` ${integerToBengaliWords(paisa)} পয়সা`;
  return `${result} মাত্র`;
}

function V({
  dailyDemand: e,
  activeItems: t,
  monthlyTotals: n,
  monthlyPlanName,
  monthlyPlanCounts,
  monthlyRemainingCounts,
  areaFilter: r,
  schools,
  unitPrices,
}) {
  let i = t.length > 0 ? t.join(` ও `) : `আজ বিতরণ নেই`,
    a = Math.max(...w.map((e) => e.dailyDemand)),
    remainingItemCosts = {
      bun: e * (monthlyRemainingCounts?.bun ?? 0) * unitPrices.bun,
      egg: e * (monthlyRemainingCounts?.egg ?? 0) * unitPrices.egg,
      banana: e * (monthlyRemainingCounts?.banana ?? 0) * unitPrices.banana,
    },
    remainingPurchaseCost = remainingItemCosts.bun + remainingItemCosts.egg + remainingItemCosts.banana;
  return (0, E.jsxs)(E.Fragment, {
    children: [
      (0, E.jsxs)(`div`, {
        className: `metric-grid`,
        children: [
          (0, E.jsx)(z, {
            label: `মোট অঞ্চল`,
            value: r === `সব অঞ্চল` ? D.format(8) : D.format(1),
            note: `সক্রিয় অঞ্চল প্রস্তুত`,
          }),
          (0, E.jsx)(z, {
            label: `মোট বিদ্যালয়`,
            value: D.format(
              r === `সব অঞ্চল`
                ? schools.length
                : schools.filter((school) => school.areaName === r).length,
            ),
            note: `শিক্ষা অফিস থেকে যাচাইকৃত`,
            tone: `navy`,
          }),
          (0, E.jsx)(z, {
            label: `দৈনিক এক-আইটেম চাহিদা`,
            value: D.format(e),
            note: `পিস / নির্বাচিত অঞ্চল`,
            tone: `amber`,
          }),
          (0, E.jsx)(z, {
            label: `আজকের রুটিন`,
            value: i,
            note: t.length
              ? `পরিকল্পনা তৈরির জন্য প্রস্তুত`
              : `শুক্র/শনিবার বা বন্ধের দিন`,
            tone: t.length ? `green` : `red`,
          }),
        ],
      }),
      (0, E.jsxs)(`div`, {
        className: `dashboard-columns`,
        children: [
          (0, E.jsxs)(`section`, {
            className: `panel chart-panel`,
            children: [
              (0, E.jsxs)(`div`, {
                className: `panel-head`,
                children: [
                  (0, E.jsxs)(`div`, {
                    children: [
                      (0, E.jsx)(`p`, {
                        className: `eyebrow`,
                        children: `চাহিদা বণ্টন`,
                      }),
                      (0, E.jsx)(`h2`, {
                        children: `অঞ্চলভিত্তিক দৈনিক চাহিদা`,
                      }),
                    ],
                  }),
                  (0, E.jsx)(`span`, {
                    className: `status-badge status-good`,
                    children: `৮ অঞ্চল`,
                  }),
                ],
              }),
              (0, E.jsx)(`div`, {
                className: `bar-chart`,
                "aria-label": `অঞ্চলভিত্তিক চাহিদার চার্ট`,
                children: w.map((e) =>
                  (0, E.jsxs)(
                    `div`,
                    {
                      className: `bar-row`,
                      children: [
                        (0, E.jsxs)(`div`, {
                          children: [
                            (0, E.jsx)(`strong`, { children: e.name }),
                            (0, E.jsx)(`small`, { children: `অঞ্চলভিত্তিক চাহিদা` }),
                          ],
                        }),
                        (0, E.jsx)(`span`, {
                          children: (0, E.jsx)(`i`, {
                            style: {
                              width: `${Math.max(8, (e.dailyDemand / a) * 100)}%`,
                            },
                          }),
                        }),
                        (0, E.jsx)(`b`, { children: D.format(e.dailyDemand) }),
                      ],
                    },
                    e.code,
                  ),
                ),
              }),
            ],
          }),
          (0, E.jsxs)(`section`, {
            className: `panel`,
            children: [
              (0, E.jsx)(`div`, {
                className: `panel-head`,
                children: (0, E.jsxs)(`div`, {
                  children: [
                    (0, E.jsx)(`p`, {
                      className: `eyebrow`,
                      children: `মাসিক পরিকল্পনা`,
                    }),
                    (0, E.jsx)(`h2`, { children: monthlyPlanName || `চলমান মাস` }),
                  ],
                }),
              }),
              (0, E.jsxs)(`div`, {
                className: `item-summary`,
                children: [
                  (0, E.jsxs)(`article`, {
                    children: [
                      (0, E.jsx)(`span`, {
                        className: `item-icon bun`,
                        children: `ব`,
                      }),
                      (0, E.jsxs)(`div`, {
                        children: [
                          (0, E.jsx)(`p`, { children: `বনরুটি (${D.format(monthlyPlanCounts?.bun ?? 0)} দিন)` }),
                          (0, E.jsx)(`strong`, {
                            children: D.format(n.বনরুটি),
                          }),
                          (0, E.jsx)(`small`, { children: `পিস` }),
                          (0, E.jsx)(`small`, {
                            className: `item-purchase-cost`,
                            children: `ক্রয়মূল্য: ৳${D.format(n.বনরুটি * unitPrices.bun)}`,
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`article`, {
                    children: [
                      (0, E.jsx)(`span`, {
                        className: `item-icon egg`,
                        children: `ডি`,
                      }),
                      (0, E.jsxs)(`div`, {
                        children: [
                          (0, E.jsx)(`p`, { children: `সিদ্ধ ডিম (${D.format(monthlyPlanCounts?.egg ?? 0)} দিন)` }),
                          (0, E.jsx)(`strong`, {
                            children: D.format(n[`সিদ্ধ ডিম`]),
                          }),
                          (0, E.jsx)(`small`, { children: `পিস` }),
                          (0, E.jsx)(`small`, {
                            className: `item-purchase-cost`,
                            children: `ক্রয়মূল্য: ৳${D.format(n[`সিদ্ধ ডিম`] * unitPrices.egg)}`,
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`article`, {
                    children: [
                      (0, E.jsx)(`span`, {
                        className: `item-icon banana`,
                        children: `ক`,
                      }),
                      (0, E.jsxs)(`div`, {
                        children: [
                          (0, E.jsx)(`p`, { children: `কলা (${D.format(monthlyPlanCounts?.banana ?? 0)} দিন)` }),
                          (0, E.jsx)(`strong`, { children: D.format(n.কলা) }),
                          (0, E.jsx)(`small`, { children: `টি` }),
                          (0, E.jsx)(`small`, {
                            className: `item-purchase-cost`,
                            children: `ক্রয়মূল্য: ৳${D.format(n.কলা * unitPrices.banana)}`,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, E.jsxs)(`div`, {
                className: `formula-note`,
                children: [
                  (0, E.jsx)(`strong`, { children: `মাসের বাকি দিনের পণ্য ক্রয় বাবদ খরচ` }),
                  (0, E.jsxs)(`ul`, {
                    className: `remaining-purchase-breakdown`,
                    children: [
                      (0, E.jsxs)(`li`, { children: [(0, E.jsx)(`span`, { children: `বনরুটি (${D.format(monthlyRemainingCounts?.bun ?? 0)} দিন)` }), (0, E.jsx)(`b`, { children: `৳${D.format(remainingItemCosts.bun)}` })] }),
                      (0, E.jsxs)(`li`, { children: [(0, E.jsx)(`span`, { children: `সিদ্ধ ডিম (${D.format(monthlyRemainingCounts?.egg ?? 0)} দিন)` }), (0, E.jsx)(`b`, { children: `৳${D.format(remainingItemCosts.egg)}` })] }),
                      (0, E.jsxs)(`li`, { children: [(0, E.jsx)(`span`, { children: `কলা (${D.format(monthlyRemainingCounts?.banana ?? 0)} দিন)` }), (0, E.jsx)(`b`, { children: `৳${D.format(remainingItemCosts.banana)}` })] }),
                    ],
                  }),
                  (0, E.jsxs)(`p`, {
                    className: `remaining-purchase-total`,
                    children: [
                      (0, E.jsx)(`b`, { children: `মোট প্রয়োজন: ৳${D.format(remainingPurchaseCost)}` }),
                      (0, E.jsx)(`span`, { children: ` (কথায়: ${moneyToBengaliWords(remainingPurchaseCost)})` }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      (0, E.jsxs)(`section`, {
        className: `panel action-panel`,
        children: [
          (0, E.jsxs)(`div`, {
            children: [
              (0, E.jsx)(`p`, {
                className: `eyebrow`,
                children: `আজকের করণীয়`,
              }),
              (0, E.jsx)(`h2`, { children: `অপারেশনাল সতর্কতা` }),
            ],
          }),
          (0, E.jsxs)(`div`, {
            className: `action-list`,
            children: [
              (0, E.jsxs)(`article`, {
                className: `action-warning`,
                children: [
                  (0, E.jsx)(`span`, { children: `১` }),
                  (0, E.jsxs)(`p`, {
                    children: [
                      (0, E.jsx)(`strong`, {
                        children: `আজকের বিতরণের রিপোর্ট করুন`,
                      }),
                      (0, E.jsx)(`small`, {
                        children: `দুপুর ২টার আগে রিপোর্ট সম্পন্ন করুন`,
                      }),
                    ],
                  }),
                ],
              }),
              (0, E.jsxs)(`article`, {
                children: [
                  (0, E.jsx)(`span`, { children: `২` }),
                  (0, E.jsxs)(`p`, {
                    children: [
                      (0, E.jsx)(`strong`, {
                        children: `প্রতিদিনের খরচ এন্ট্রি`,
                      }),
                      (0, E.jsx)(`small`, {
                        children: `আজকের খরচ ও পেমেন্ট রিকোয়েস্ট জমা দিন`,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function H({ onAreaSelect: e }) {
  let [t, n] = (0, l.useState)(null),
    [r, i] = (0, l.useState)(M(new Date())),
    [a, o] = (0, l.useState)(`অটো`),
    [s, c] = (0, l.useState)(``),
    [u, d] = (0, l.useState)(``),
    [f, p] = (0, l.useState)(!1),
    [m, h] = (0, l.useState)(``);
  async function g(e) {
    (e.preventDefault(), p(!0), h(``));
    try {
      let e = await fetch(`/api/expenses`, {
          method: `POST`,
          headers: { "Content-Type": `application/json` },
          body: JSON.stringify({
            areaCode: t,
            expenseDate: r,
            vehicleType: a,
            amountPoisha: Math.round(Number(s) * 100),
            note: u,
          }),
        }),
        i = await e.json();
      if (!e.ok) throw Error(i.error || `খরচ যোগ করা যায়নি।`);
      (h(`খরচ সফলভাবে যোগ করা হয়েছে।`),
        c(``),
        d(``),
        setTimeout(() => {
          (n(null), h(``));
        }, 1500));
    } catch (e) {
      h(P(e, `খরচ যোগ করা যায়নি।`));
    } finally {
      p(!1);
    }
  }
  return (0, E.jsxs)(`section`, {
    className: `panel areas-panel`,
    children: [
      (0, E.jsxs)(`div`, {
        className: `panel-head areas-panel-head`,
        children: [
          (0, E.jsx)(`div`, {
            children: (0, E.jsx)(`h2`, { children: `৮টি কার্যক্রম অঞ্চল` }),
          }),
          (0, E.jsxs)(`span`, {
            className: `status-badge status-good`,
            children: [
              D.format(w.filter((e) => e.managerName).length),
              ` জন দায়িত্বপ্রাপ্ত`,
              w.filter((e) => !e.managerName).length > 0 &&
                ` · ${D.format(w.filter((e) => !e.managerName).length)} পদ খালি`,
            ],
          }),
        ],
      }),
      (0, E.jsx)(`div`, {
        className: `area-grid`,
        children: w.map((t, r) =>
          (0, E.jsxs)(
            `article`,
            {
              children: [
                (0, E.jsx)(`span`, {
                  className: `area-number`,
                  children: D.format(r + 1),
                }),
                (0, E.jsx)(`h3`, { children: t.name }),
                (0, E.jsxs)(`div`, {
                  className: `area-manager`,
                  children: [
                    (0, E.jsx)(`small`, { children: `এরিয়া ম্যানেজার` }),
                    t.managerName
                      ? (0, E.jsxs)(E.Fragment, {
                          children: [
                            (0, E.jsx)(`strong`, { children: t.managerName }),
                            (0, E.jsx)(`a`, {
                              href: `tel:${t.managerMobile}`,
                              children: N(t.managerMobile ?? ``),
                            }),
                            (0, E.jsx)(`button`, {
                              type: `button`,
                              className: `button-secondary`,
                              style: {
                                marginTop: `8px`,
                                width: `100%`,
                                fontSize: `11px`,
                                padding: `4px`,
                              },
                              onClick: () => {
                                window.dispatchEvent(
                                  new CustomEvent(`open-area-expense-workspace`, {
                                    detail: { areaCode: t.code },
                                  }),
                                );
                              },
                              children: `খরচের হিসাব`,
                            }),
                          ],
                        })
                      : (0, E.jsx)(`span`, {
                          className: `manager-vacant`,
                          children: `পদ খালি`,
                        }),
                  ],
                }),
                (0, E.jsxs)(`div`, {
                  children: [
                    (0, E.jsxs)(`span`, {
                      children: [
                        (0, E.jsx)(`small`, { children: `বিদ্যালয়` }),
                        (0, E.jsx)(`strong`, {
                          children: D.format(t.schoolCount),
                        }),
                      ],
                    }),
                    (0, E.jsxs)(`span`, {
                      children: [
                        (0, E.jsx)(`small`, { children: `দৈনিক চাহিদা` }),
                        (0, E.jsx)(`strong`, {
                          children: D.format(t.dailyDemand),
                        }),
                      ],
                    }),
                  ],
                }),
                (0, E.jsx)(`button`, {
                  type: `button`,
                  onClick: () => e(t.name),
                  children: `বিদ্যালয় দেখুন`,
                }),
              ],
            },
            t.code,
          ),
        ),
      }),
      t &&
        (0, E.jsx)(`div`, {
          className: `modal-backdrop`,
          role: `presentation`,
          children: (0, E.jsxs)(`section`, {
            className: `modal`,
            role: `dialog`,
            "aria-modal": `true`,
            children: [
              (0, E.jsx)(`p`, {
                className: `eyebrow`,
                children: `খরচের হিসাব এন্ট্রি`,
              }),
              (0, E.jsx)(`h2`, { children: w.find((e) => e.code === t)?.name }),
              (0, E.jsxs)(`p`, {
                children: [
                  `ম্যানেজার: `,
                  w.find((e) => e.code === t)?.managerName || `পদ খালি`,
                ],
              }),
              m &&
                (0, E.jsx)(`p`, {
                  style: {
                    color: m.includes(`সফল`) ? `var(--green)` : `var(--red)`,
                  },
                  children: m,
                }),
              (0, E.jsxs)(`form`, {
                onSubmit: g,
                style: {
                  display: `flex`,
                  flexDirection: `column`,
                  gap: `16px`,
                  marginTop: `16px`,
                },
                children: [
                  (0, E.jsxs)(`label`, {
                    children: [
                      `তারিখ *`,
                      (0, E.jsx)(`input`, {
                        type: `date`,
                        lang: `en-GB`,
                        required: !0,
                        value: r,
                        onChange: (e) => i(e.target.value),
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`label`, {
                    children: [
                      `যানবাহনের ধরন / খরচ *`,
                      (0, E.jsxs)(`select`, {
                        value: a,
                        onChange: (e) => o(e.target.value),
                        style: {
                          background: `#f8fbf9`,
                          border: `1px solid var(--line)`,
                          borderRadius: `8px`,
                          color: `var(--ink)`,
                          minHeight: `36px`,
                          padding: `7px 10px`,
                          fontSize: `14px`,
                          width: `100%`,
                        },
                        children: [
                          (0, E.jsx)(`option`, {
                            value: `অটো`,
                            children: `অটো`,
                          }),
                          (0, E.jsx)(`option`, {
                            value: `ভ্যান`,
                            children: `ভ্যান`,
                          }),
                          (0, E.jsx)(`option`, {
                            value: `মোটরসাইকেল`,
                            children: `মোটরসাইকেল`,
                          }),
                          (0, E.jsx)(`option`, {
                            value: `নৌকা`,
                            children: `নৌকা`,
                          }),
                          (0, E.jsx)(`option`, {
                            value: `পোর্টার`,
                            children: `পোর্টার`,
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`label`, {
                    children: [
                      `পরিমাণ (টাকা) *`,
                      (0, E.jsx)(`input`, {
                        type: `number`,
                        step: `0.01`,
                        required: !0,
                        value: s,
                        onChange: (e) => c(e.target.value),
                        placeholder: `যেমন: 150`,
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`label`, {
                    children: [
                      `মন্তব্য (ঐচ্ছিক)`,
                      (0, E.jsx)(`input`, {
                        type: `text`,
                        value: u,
                        onChange: (e) => d(e.target.value),
                        placeholder: `কোথা থেকে কোথায় ইত্যাদি`,
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`div`, {
                    className: `modal-actions`,
                    children: [
                      (0, E.jsx)(`button`, {
                        type: `button`,
                        className: `button-secondary`,
                        onClick: () => n(null),
                        children: `বাতিল`,
                      }),
                      (0, E.jsx)(`button`, {
                        type: `submit`,
                        className: `button-primary`,
                        disabled: f,
                        children: `সেভ করুন`,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}
function formatSchoolMobile(value) {
  let mobile = String(value ?? ``).trim();
  if (!mobile) return ``;
  return /^1\d{9}$/.test(mobile) ? `0${mobile}` : mobile;
}

function U({
  query: e,
  setQuery: t,
  schools: n,
  total: r,
  page: i,
  pageCount: a,
  setPage: o,
  onExport: c,
}) {
  return (0, E.jsxs)(`section`, {
    className: `panel table-panel`,
    children: [
      (0, E.jsxs)(`div`, {
        className: `table-toolbar no-print`,
        children: [
          (0, E.jsxs)(`label`, {
            className: `search-field`,
            children: [
              (0, E.jsx)(`span`, { children: `খুঁজুন` }),
              (0, E.jsx)(`input`, {
                value: e,
                onChange: (e) => t(e.target.value),
                placeholder: `বিদ্যালয়, EMIS, প্রধান শিক্ষক, মোবাইল বা ইউনিয়ন`,
              }),
            ],
          }),
          (0, E.jsxs)(`div`, {
            children: [
              (0, E.jsxs)(`span`, {
                className: `result-count`,
                children: [D.format(r), `টি ফলাফল`],
              }),
              (0, E.jsx)(`button`, {
                className: `button-secondary hide-on-mobile`,
                type: `button`,
                onClick: c,
                children: `Excel/CSV`,
              }),
            ],
          }),
        ],
      }),
      (0, E.jsx)(`div`, {
        className: `table-scroll`,
        children: (0, E.jsxs)(`table`, {
          children: [
            (0, E.jsx)(`thead`, {
              children: (0, E.jsxs)(`tr`, {
                children: [
                  (0, E.jsx)(`th`, { children: `ক্রমিক` }),
                  (0, E.jsx)(`th`, { children: `বিদ্যালয়` }),
                  (0, E.jsx)(`th`, { children: `EMIS কোড` }),
                  (0, E.jsx)(`th`, { children: `অঞ্চল` }),
                  (0, E.jsx)(`th`, { children: `ইউনিয়ন` }),
                  (0, E.jsx)(`th`, { children: `প্রধান শিক্ষক` }),
                  (0, E.jsx)(`th`, { children: `মোবাইল নম্বর` }),
                  (0, E.jsx)(`th`, {
                    className: `number-cell`,
                    children: `একদিনের চাহিদা`,
                  }),
                ],
              }),
            }),
            (0, E.jsx)(`tbody`, {
              children: n.map((e) =>
                (0, E.jsxs)(
                  `tr`,
                  {
                    children: [
                      (0, E.jsx)(`td`, { children: D.format(e.serial) }),
                      (0, E.jsxs)(`td`, {
                        children: [
                          (0, E.jsx)(`strong`, { children: e.name }),
                          (0, E.jsx)(`small`, { children: e.areaName }),
                        ],
                      }),
                      (0, E.jsx)(`td`, {
                        className: `mono`,
                        children: e.emisCode,
                      }),
                      (0, E.jsx)(`td`, {
                        children: (0, E.jsx)(`span`, {
                          className: `status-badge`,
                          children: e.areaName,
                        }),
                      }),
                      (0, E.jsx)(`td`, { children: e.unionName || `—` }),
                      (0, E.jsx)(`td`, { children: e.headTeacher }),
                      (0, E.jsx)(`td`, {
                        className: `mono`,
                        children: formatSchoolMobile(e.legacyMobile) || `—`,
                      }),
                      (0, E.jsxs)(`td`, {
                        className: `number-cell`,
                        children: [
                          (0, E.jsx)(`strong`, {
                            children: D.format(e.dailyDemand),
                          }),
                          ` পিস`,
                        ],
                      }),
                    ],
                  },
                  e.emisCode,
                ),
              ),
            }),
          ],
        }),
      }),
      (0, E.jsxs)(`div`, {
        className: `pagination no-print`,
        children: [
          (0, E.jsx)(`button`, {
            type: `button`,
            disabled: i <= 1,
            onClick: () => o(i - 1),
            children: `আগের পাতা`,
          }),
          (0, E.jsxs)(`span`, {
            children: [`পাতা `, D.format(i), ` / `, D.format(a)],
          }),
          (0, E.jsx)(`button`, {
            type: `button`,
            disabled: i >= a,
            onClick: () => o(i + 1),
            children: `পরের পাতা`,
          }),
        ],
      }),
    ],
  });
}
function W({
  activeDate: e,
  dailyDemand: t,
  items: n,
  areaFilter: r,
  accountRole,
  userAreaCode,
  userSchoolEmis,
}) {
  let [selectedDailyDate, setSelectedDailyDate] = (0, l.useState)(M(new Date(e))),
    [dailyPlanCodes, setDailyPlanCodes] = (0, l.useState)(null),
    [weeklyPlanDays, setWeeklyPlanDays] = (0, l.useState)([]),
    _activeDateSyncEffect = (0, l.useEffect)(() => setSelectedDailyDate(M(new Date(e))), [e]),
    _dailyPlanEffect = (0, l.useEffect)(() => {
      let cancelled = !1;
      async function loadDailyPlan() {
        try {
          let response = await fetch(`/api/meal-plan?date=${encodeURIComponent(selectedDailyDate)}`, { cache: `no-store` });
          if (!response.ok) throw Error(`daily meal plan unavailable`);
          let payload = await response.json();
          if (!cancelled) setDailyPlanCodes(payload.source === `configured` ? (payload.items ?? []).map((item) => item.code) : null);
        } catch {
          if (!cancelled) setDailyPlanCodes(null);
        }
      }
      loadDailyPlan();
      window.addEventListener(`meal-plan-updated`, loadDailyPlan);
      return () => {
        cancelled = !0;
        window.removeEventListener(`meal-plan-updated`, loadDailyPlan);
      };
    }, [selectedDailyDate]),
    weekStart = (0, l.useMemo)(() => {
      let date = new Date(`${selectedDailyDate}T12:00:00`);
      date.setDate(date.getDate() - date.getDay());
      date.setHours(12, 0, 0, 0);
      return date;
    }, [selectedDailyDate]),
    weekDates = (0, l.useMemo)(() =>
      Array.from({ length: 7 }, (_, index) => {
        let date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        return M(date);
      }), [weekStart]),
    _weeklyPlanEffect = (0, l.useEffect)(() => {
      let cancelled = !1;
      async function loadWeeklyPlan() {
        try {
          let months = [...new Set(weekDates.map((date) => date.slice(0, 7)))],
            payloads = await Promise.all(months.map(async (month) => {
              let response = await fetch(`/api/meal-plan?month=${month}`, { cache: `no-store` });
              if (!response.ok) throw Error(`weekly meal plan unavailable`);
              return response.json();
            }));
          if (cancelled) return;
          setWeeklyPlanDays(payloads
            .filter((payload) => payload.source === `configured`)
            .flatMap((payload) => payload.days ?? []));
        } catch {
          if (!cancelled) setWeeklyPlanDays([]);
        }
      }
      loadWeeklyPlan();
      window.addEventListener(`meal-plan-updated`, loadWeeklyPlan);
      return () => {
        cancelled = !0;
        window.removeEventListener(`meal-plan-updated`, loadWeeklyPlan);
      };
    }, [weekDates.join(`,`)]),
    weeklyItemsByDate = new Map(weeklyPlanDays.map((day) => [day.date, day.items ?? []])),
    routineDays = weekDates.map((date, index) => {
      let items = weeklyItemsByDate.get(date) ?? [],
        validItems = items.filter((code) => I[code]);
      return [
        [`রবিবার`, `সোমবার`, `মঙ্গলবার`, `বুধবার`, `বৃহস্পতিবার`, `শুক্রবার`, `শনিবার`][index],
        validItems.length ? validItems.map((code) => I[code].routineName).join(` + `) : `বিদ্যালয় বন্ধ`,
        date,
        validItems.length > 0,
      ];
    }),
    dailyItems = dailyPlanCodes === null ? n : mealCodesToRoutineNames(dailyPlanCodes),
    dailyDate = new Date(`${selectedDailyDate}T12:00:00`);
  return (0, E.jsxs)(`div`, {
    className: `distribution-layout`,
    children: [
      (0, E.jsxs)(`section`, {
        className: `combined-plan-widget distribution-card`,
        children: [
          (0, E.jsxs)(`div`, {
            className: `routine-panel-inner`,
            children: [
          (0, E.jsxs)(`div`, {
            className: `panel-head distribution-panel-head`,
            children: [
              (0, E.jsxs)(`div`, {
                children: [
                  
                  (0, E.jsx)(`h2`, { children: `সাপ্তাহিক খাবারের রুটিন` }),
                ],
              }),
            ],
          }),
          (0, E.jsx)(`div`, {
            className: `routine-list`,
            children: routineDays.map(([e, t, date, hasFood]) =>
              (0, E.jsxs)(
                `article`,
                {
                  className: `routine-day-card ${hasFood ? `is-planned` : `is-closed`}`,
                  children: [
                    (0, E.jsxs)(`div`, {
                      className: `routine-day-meta`,
                      children: [
                        (0, E.jsx)(`strong`, {
                          className: `routine-day`,
                          children: e,
                        }),
                        (0, E.jsx)(`span`, { children: Number(date.slice(-2)) }),
                      ],
                    }),
                    (0, E.jsx)(`p`, { className: `routine-food`, children: t }),
                  ],
                },
                date,
              ),
            ),
          }),
        ],
      }),
      (0, E.jsxs)(`div`, {
        className: `daily-plan-panel-inner`,
        children: [
          (0, E.jsxs)(`div`, {
            className: `panel-head distribution-panel-head`,
            children: [
              (0, E.jsxs)(`div`, {
                children: [
                  (0, E.jsx)(`p`, {
                    className: `eyebrow`,
                    children: `দৈনিক পরিকল্পনা`,
                  }),
                  (0, E.jsx)(`h2`, { children: k.format(dailyDate) }),
                ],
              }),
            ],
          }),
          dailyItems.length
            ? (0, E.jsxs)(E.Fragment, {
                children: [
                  (0, E.jsxs)(`p`, {
                    className: `plan-intro`,
                    children: [
                      `নির্বাচিত `,
                      r === `সব অঞ্চল` ? `সব অঞ্চলের` : r + ` অঞ্চলের`,
                      ` `,
                      `অনুমোদিত দৈনিক চাহিদা অনুযায়ী পরিকল্পনা।`,
                    ],
                  }),
                  (0, E.jsx)(`div`, {
                    className: `daily-plan-cards`,
                    children: dailyItems.map((e) =>
                      (0, E.jsxs)(
                        `article`,
                        {
                          children: [
                            (0, E.jsxs)(`div`, {
                              children: [
                                (0, E.jsx)(`p`, { children: e }),
                                (0, E.jsx)(`strong`, { children: D.format(t) }),
                                (0, E.jsx)(`small`, {
                                  children: e === `কলা` ? `টি` : `পিস`,
                                }),
                              ],
                            }),
                            (0, E.jsx)(`b`, { children: `পরিকল্পিত` }),
                          ],
                        },
                        e,
                      ),
                    ),
                  }),
                  (0, E.jsxs)(`div`, {
                    className: `distribution-total`,
                    children: [
                      (0, E.jsx)(`span`, { children: `মোট আইটেম সংখ্যা` }),
                      (0, E.jsx)(`strong`, {
                        children: D.format(t * dailyItems.length),
                      }),
                    ],
                  }),
                ],
              })
            : (0, E.jsxs)(`div`, {
                className: `empty-state`,
                children: [
                  (0, E.jsx)(`strong`, {
                    children: `এই দিনে কোনো বিতরণ নির্ধারিত নেই`,
                  }),
                  (0, E.jsx)(`p`, {
                    children: `মাসিক খাবার পরিকল্পনায় এই তারিখে কোনো খাবার নির্ধারিত নেই।`,
                  }),
                ],
              }),
        ],
      }),
    ],
  }),
  (0, E.jsx)(ErrorBoundary, {
        children: (0, E.jsx)(SchoolDistributionAdjustment, {
          accountRole: accountRole,
          userAreaCode: userAreaCode,
          userSchoolEmis: userSchoolEmis,
          onDateChange: setSelectedDailyDate,
        })
      }),
    ],
  });
}
function G({ dailyDemand: e, startDate: t, areaFilter: n, schools: stockSchools = T }) {
  let [r, i] = (0, l.useState)([
      {
        itemCode: `bun`,
        itemName: `বনরুটি`,
        unit: `পিস`,
        currentQuantity: 0,
        minimumLevel: 0,
      },
      {
        itemCode: `egg`,
        itemName: `সিদ্ধ ডিম`,
        unit: `পিস`,
        currentQuantity: 0,
        minimumLevel: 0,
      },
      {
        itemCode: `banana`,
        itemName: `কলা`,
        unit: `টি`,
        currentQuantity: 0,
        minimumLevel: 0,
      },
    ]),
    [a, o] = (0, l.useState)([]),
    [s, c] = (0, l.useState)([]),
    [u, d] = (0, l.useState)(1),
    [f, p] = (0, l.useState)(3),
    [m, h] = (0, l.useState)(`bun`),
    [g, _] = (0, l.useState)(`opening`),
    [v, y] = (0, l.useState)(``),
    [b, x] = (0, l.useState)(M(new Date())),
    [S, C] = (0, l.useState)(``),
    [suppId, setSuppId] = (0, l.useState)(``),
    [O, A] = (0, l.useState)(``),
    [j, N] = (0, l.useState)(``),
    [z, B] = (0, l.useState)(null),
    [V, H] = (0, l.useState)(``),
    [U, W] = (0, l.useState)(!1),
    [stockOutAreas, setStockOutAreas] = (0, l.useState)([]),
    [stockLedgerItem, setStockLedgerItem] = (0, l.useState)(`all`),
    [stockLedgerFrom, setStockLedgerFrom] = (0, l.useState)(``),
    [stockLedgerTo, setStockLedgerTo] = (0, l.useState)(``),
    [stockLedgerPage, setStockLedgerPage] = (0, l.useState)(1),
    [stockPlannerOpen, setStockPlannerOpen] = (0, l.useState)(!1),
    [stockPlanDays, setStockPlanDays] = (0, l.useState)([]),
    stockReferenceDate = M(t);
  async function G() {
    let e = await fetch(`/api/stock`);
    if (!e.ok) throw Error(`Stock unavailable`);
    let t = await e.json();
    (i(t.balances), o(t.transactions), c(t.suppliers));
  }
  (0, l.useEffect)(() => {
    let e = !0;
    return (
      fetch(`/api/stock`)
        .then((e) => {
          if (!e.ok) throw Error(`Stock unavailable`);
          return e.json();
        })
        .then((t) => {
          e && (i(t.balances), o(t.transactions), c(t.suppliers));
        })
        .catch(() => {
          e &&
            H(
              `Stock database প্রস্তুত আছে; local connection পুনরায় চালু হলে balance দেখা যাবে।`,
            );
        }),
      () => {
        e = !1;
      }
    );
  }, []);
  (0, l.useEffect)(() => {
    let e = !1;
    async function t() {
      try {
        let t = new Date(`${stockReferenceDate}T00:00:00Z`),
          n = stockReferenceDate.slice(0, 7),
          r = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 1))
            .toISOString()
            .slice(0, 7),
          i = await Promise.all(
            [n, r].map(async (e) => {
              let t = await fetch(`/api/meal-plan?month=${e}`, {
                cache: `no-store`,
              });
              if (!t.ok) throw Error(`meal plan unavailable`);
              return t.json();
            }),
          ),
          a = i
            .flatMap((e) => e.days ?? [])
            .filter(
              (e) =>
                e.date >= stockReferenceDate &&
                Array.isArray(e.items) &&
                e.items.length > 0,
            )
            .sort((e, t) => e.date.localeCompare(t.date));
        e || setStockPlanDays(a);
      } catch {
        e || setStockPlanDays([]);
      }
    }
    return (
      t(),
      window.addEventListener(`meal-plan-updated`, t),
      () => {
        e = !0;
        window.removeEventListener(`meal-plan-updated`, t);
      }
    );
  }, [stockReferenceDate]);
  let K =
      g === `stock_in`
        ? Math.round((Number(v) || 0) * (Number(O) || 0) * 100)
        : 0,
    q = Math.round((Number(j) || 0) * 100),
    J = K - q,
    Y = s.find((e) => e.id === Number(suppId)),
    areaDailyDemandByCode = stockSchools.reduce((e, t) => {
      if (t.areaCode) e[t.areaCode] = (e[t.areaCode] ?? 0) + Number(t.dailyDemand || 0);
      return e;
    }, {}),
    X = { bun: u, egg: f, banana: 1 },
    nextStockDistribution = stockPlanDays.find(
      (e) => e.date > stockReferenceDate && e.items.length > 0,
    ),
    nextStockDistributionLabel = nextStockDistribution
      ? `পরবর্তী বিতরণ ${formatStockPlanDate(nextStockDistribution.date)} রোজঃ ${formatStockPlanWeekday(nextStockDistribution.date)}`
      : `পরবর্তী বিতরণের তারিখ নির্ধারিত নেই`,
    Z = Object.keys(I).map((n) => {
      let i = I[n],
        a = X[n],
        o = stockPlanDays
          .filter((e) => e.items.includes(n))
          .slice(0, a)
          .map((e) => new Date(`${e.date}T00:00:00+06:00`)),
        s = e * o.length,
        c = r.find((e) => e.itemCode === n)?.currentQuantity ?? 0;
      return {
        itemCode: n,
        ...i,
        coverage: a,
        dates: o,
        requiredQuantity: s,
        currentQuantity: c,
        purchaseQuantity: Math.max(0, s - c),
        surplusQuantity: Math.max(0, c - s),
      };
    }),
    filteredStockLedger = a.filter((e) =>
      (stockLedgerItem === `all` || e.itemCode === stockLedgerItem) &&
      (!stockLedgerFrom || e.transactionDate >= stockLedgerFrom) &&
      (!stockLedgerTo || e.transactionDate <= stockLedgerTo),
    ),
    stockLedgerPageCount = Math.max(1, Math.ceil(filteredStockLedger.length / 10)),
    currentStockLedgerPage = Math.min(stockLedgerPage, stockLedgerPageCount),
    paginatedStockLedger = filteredStockLedger.slice(
      (currentStockLedgerPage - 1) * 10,
      currentStockLedgerPage * 10,
    );
  async function Q(e) {
    e.preventDefault();
    let t = Number(v);
    if (!Number.isInteger(t) || t <= 0) {
      H(`পরিমাণ শূন্যের চেয়ে বড় পূর্ণ সংখ্যা হতে হবে।`);
      return;
    }
    if (g === `stock_out` && stockOutAreas.length === 0) {
      H(`বিতরণের জন্য অন্তত একটি অঞ্চল নির্বাচন করুন।`);
      return;
    }
    if (g === `stock_in` && !suppId) {
      H(`ক্রয়ের জন্য সরবরাহকারী নির্বাচন করুন।`);
      return;
    }
    if (g === `stock_in` && Number(O) < 0) {
      H(`সঠিক ক্রয়দর লিখুন।`);
      return;
    }
    (W(!0), H(``));
    try {
      let e = await fetch(`/api/stock`, {
        method: z ? `PATCH` : `POST`,
        headers: { "content-type": `application/json` },
        body: JSON.stringify({
          id: z,
          itemCode: m,
          transactionType: g,
          quantity: t,
          transactionDate: b,
          note: S,
          supplierId: g === `stock_in` ? Number(suppId) : null,
          areaCodes: g === `stock_out` ? stockOutAreas : [],
          unitPricePoisha:
            g === `stock_in` ? Math.round((Number(O) || 0) * 100) : 0,
          paidAmountPoisha: g === `stock_in` ? q : 0,
        }),
      });
      let responseText = await e.text(), n = { error: ``, currentQuantity: 0 };
      if (!responseText) {
        throw Error(`সার্ভার থেকে কোনো উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।`);
      }
      try {
        n = JSON.parse(responseText);
      } catch {
        throw Error(`সার্ভার থেকে সঠিক উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।`);
      }
      if (!e.ok)
        throw n.error === `INSUFFICIENT_STOCK`
          ? Error(
              `পর্যাপ্ত স্টক নেই। বর্তমান মজুদ ${D.format(n.currentQuantity ?? 0)}।`,
            )
          : Error(n.error || `Stock entry সংরক্ষণ করা যায়নি।`);
      (await G(),
        y(``),
        C(``),
        setSuppId(``),
        setStockOutAreas([]),
        A(``),
        N(``),
        B(null),
        H(
          z
            ? `লেনদেন ও সংশ্লিষ্ট হিসাব সফলভাবে আপডেট হয়েছে।`
            : `Stock transaction সফলভাবে সংরক্ষিত হয়েছে।`,
        ));
    } catch (e) {
      H(e instanceof Error ? e.message : `Stock entry সংরক্ষণ করা যায়নি।`);
    } finally {
      W(!1);
    }
  }
  function ee(e) {
    (B(e.id),
      h(e.itemCode),
      _(e.transactionType),
      y(String(e.quantity)),
      x(e.transactionDate),
      C(e.note ?? ``),
      setSuppId(e.supplierId ? String(e.supplierId) : ``),
      setStockOutAreas(parseStockAreaCodes(e.areaCode)),
      A(e.unitPricePoisha ? String(e.unitPricePoisha / 100) : ``),
      N(e.paidAmountPoisha ? String(e.paidAmountPoisha / 100) : ``),
      H(`সম্পাদনার জন্য লেনদেনের তথ্য ফর্মে লোড হয়েছে`));
  }
  async function te() {
    if (z && confirm(`আপনি কি নিশ্চিত যে এই লেনদেনটি মুছে ফেলতে চান?`)) {
      (W(!0), H(``));
      try {
        let e = await fetch(`/api/stock?id=${z}`, { method: `DELETE` }),
          responseText = await e.text(),
          t = { error: `` };
        if (responseText) {
          try {
            t = JSON.parse(responseText);
          } catch {
            throw Error(`সার্ভার থেকে সঠিক উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।`);
          }
        }
        if (!e.ok) throw Error(t.error || `মুছে ফেলা যায়নি।`);
        (H(`লেনদেনটি মুছে ফেলা হয়েছে।`), $(), await G());
      } catch (e) {
        H(P(e, `মুছে ফেলা যায়নি।`));
      } finally {
        W(!1);
      }
    }
  }
  function $() {
    (B(null),
      y(``),
      C(``),
      setSuppId(``),
      setStockOutAreas([]),
      A(``),
      N(``),
      H(``));
  }
  function printStockLedger() {
    printDesktopLayout(`printing-stock-ledger`);
  }
  return (0, E.jsxs)(`div`, {
    className: `stock-workspace`,
    children: [
      (0, E.jsxs)(`section`, {
        className: stockPlannerOpen
          ? `panel stock-planner is-open`
          : `panel stock-planner`,
        children: [
          (0, E.jsxs)(`div`, {
            className: `panel-head`,
            children: [
              (0, E.jsxs)(`div`, {
                children: [
                  (0, E.jsx)(`h2`, { children: `কত দিনের পণ্য একসাথে কিনবেন?` }),
                  (0, E.jsx)(`p`, {
                    className: `panel-subtitle`,
                    children: nextStockDistributionLabel,
                  }),
                ],
              }),
              (0, E.jsxs)(`button`, {
                className: stockPlannerOpen
                  ? `button-secondary stock-planner-toggle is-open`
                  : `button-primary stock-planner-toggle`,
                type: `button`,
                "aria-expanded": stockPlannerOpen,
                onClick: () => setStockPlannerOpen((e) => !e),
                children: [
                  (0, E.jsx)(`span`, {
                    "aria-hidden": `true`,
                    children: stockPlannerOpen ? `−` : `+`,
                  }),
                  stockPlannerOpen
                    ? `ক্রয় পরিকল্পনা বন্ধ করুন`
                    : `ক্রয় পরিকল্পনা খুলুন`,
                ],
              }),
            ],
          }),
          (0, E.jsxs)(`div`, {
            className: `coverage-controls no-print`,
            children: [
              (0, E.jsxs)(`label`, {
                children: [
                  `বনরুটি কেনার পরিধি`,
                  (0, E.jsxs)(`select`, {
                    value: u,
                    onChange: (e) => d(Number(e.target.value)),
                    children: [
                      (0, E.jsx)(`option`, {
                        value: 1,
                        children: `১ দিনের বিতরণ`,
                      }),
                      (0, E.jsx)(`option`, {
                        value: 2,
                        children: `২ দিনের বিতরণ`,
                      }),
                      (0, E.jsx)(`option`, {
                        value: 3,
                        children: `৩ দিনের বিতরণ`,
                      }),
                      (0, E.jsx)(`option`, {
                        value: 4,
                        children: `৪ দিনের বিতরণ`,
                      }),
                    ],
                  }),
                ],
              }),
              (0, E.jsxs)(`label`, {
                children: [
                  `সিদ্ধ ডিম কেনার পরিধি`,
                  (0, E.jsxs)(`select`, {
                    value: f,
                    onChange: (e) => p(Number(e.target.value)),
                    children: [
                      (0, E.jsx)(`option`, {
                        value: 1,
                        children: `১ দিনের বিতরণ`,
                      }),
                      (0, E.jsx)(`option`, {
                        value: 2,
                        children: `২ দিনের বিতরণ`,
                      }),
                      (0, E.jsx)(`option`, {
                        value: 3,
                        children: `৩ দিনের বিতরণ`,
                      }),
                    ],
                  }),
                ],
              }),
              (0, E.jsxs)(`label`, {
                children: [
                  `কলা কেনার পরিধি`,
                  (0, E.jsx)(`select`, {
                    disabled: !0,
                    value: 1,
                    children: (0, E.jsx)(`option`, {
                      value: 1,
                      children: `সপ্তাহের মঙ্গলবার—১ দিন`,
                    }),
                  }),
                ],
              }),
            ],
          }),
          (0, E.jsx)(`div`, {
            className: `procurement-grid`,
            children: Z.map((e) =>
              (0, E.jsxs)(
                `article`,
                {
                  className: `procurement-card item-${e.itemCode}`,
                  children: [
                    (0, E.jsxs)(`div`, {
                      className: `procurement-title`,
                      children: [
                        (0, E.jsx)(`span`, { children: e.name.slice(0, 1) }),
                        (0, E.jsxs)(`div`, {
                          children: [
                            (0, E.jsx)(`h3`, { children: e.name }),
                            (0, E.jsxs)(`p`, {
                              children: [
                                D.format(e.coverage),
                                ` দিনের বিতরণ কভারেজ`,
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, E.jsx)(`div`, {
                      className: `date-chips`,
                      children: e.dates.map((e) =>
                        (0, E.jsx)(
                          `span`,
                          {
                            children: `${formatStockPlanDate(M(e))} রোজঃ ${formatStockPlanWeekday(M(e))}`,
                          },
                          M(e),
                        ),
                      ),
                    }),
                    (0, E.jsxs)(`dl`, {
                      children: [
                        (0, E.jsxs)(`div`, {
                          children: [
                            (0, E.jsx)(`dt`, { children: `পরিকল্পিত চাহিদা` }),
                            (0, E.jsx)(`dd`, {
                              children: D.format(e.requiredQuantity),
                            }),
                          ],
                        }),
                        (0, E.jsxs)(`div`, {
                          children: [
                            (0, E.jsx)(`dt`, {
                              children: `বর্তমান ব্যবহারযোগ্য স্টক`,
                            }),
                            (0, E.jsx)(`dd`, {
                              children: D.format(e.currentQuantity),
                            }),
                          ],
                        }),
                        (0, E.jsxs)(`div`, {
                          className: `purchase-row`,
                          children: [
                            (0, E.jsx)(`dt`, { children: `এখন কিনতে হবে` }),
                            (0, E.jsxs)(`dd`, {
                              children: [
                                D.format(e.purchaseQuantity),
                                ` `,
                                e.unit,
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, E.jsx)(`p`, {
                      className:
                        e.purchaseQuantity > 0
                          ? `stock-warning`
                          : `stock-ready`,
                      children:
                        e.purchaseQuantity > 0
                          ? `ঘাটতি ${D.format(e.purchaseQuantity)} ${e.unit}`
                          : `পর্যাপ্ত—অতিরিক্ত ${D.format(e.surplusQuantity)} ${e.unit}`,
                    }),
                  ],
                },
                e.itemCode,
              ),
            ),
          }),
        ],
      }),
      (0, E.jsxs)(`div`, {
        className: `stock-lower-grid`,
        children: [
          (0, E.jsxs)(`section`, {
            className: `panel stock-entry-panel`,
            children: [
              (0, E.jsx)(`div`, {
                className: `panel-head`,
                children: (0, E.jsxs)(`div`, {
                  children: [
                    (0, E.jsx)(`h2`, {
                      children: z
                        ? `সাম্প্রতিক লেনদেন সম্পাদনা`
                        : `স্টক ও ক্রয় এন্ট্রি`,
                    }),
                  ],
                }),
              }),
              V &&
                (0, E.jsx)(`div`, {
                  className: `stock-message`,
                  role: `status`,
                  children: V,
                }),
              (0, E.jsxs)(`form`, {
                className: `stock-form`,
                onSubmit: Q,
                children: [
                  (0, E.jsxs)(`label`, {
                    children: [
                      `পণ্য`,
                      (0, E.jsxs)(`select`, {
                        value: m,
                        onChange: (e) => {
                          (h(e.target.value), setSuppId(``));
                        },
                        children: [
                          (0, E.jsx)(`option`, {
                            value: `bun`,
                            children: `বনরুটি`,
                          }),
                          (0, E.jsx)(`option`, {
                            value: `egg`,
                            children: `সিদ্ধ ডিম`,
                          }),
                          (0, E.jsx)(`option`, {
                            value: `banana`,
                            children: `কলা`,
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`label`, {
                    children: [
                      `লেনদেনের ধরন`,
                      (0, E.jsx)(`select`, {
                        value: g,
                        onChange: (e) => {
                          let t = e.target.value;
                          (_(t),
                            t !== `stock_in` && (setSuppId(``), A(``), N(``)),
                            t !== `stock_out` &&
                              (setStockOutAreas([]), g === `stock_out` && y(``)),
                            t === `stock_out` &&
                              stockOutAreas.length > 0 &&
                              y(
                                String(
                                  stockOutAreas.reduce(
                                    (sum, code) => sum + (areaDailyDemandByCode[code] ?? 0),
                                    0,
                                  ),
                                ),
                              ));
                        },
                        children: stockEntryTransactionTypes.map((e) =>
                          (0, E.jsx)(`option`, { value: e, children: L[e] }, e),
                        ),
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`label`, {
                    children: [
                      `তারিখ`,
                      (0, E.jsx)(`input`, {
                        type: `date`,
                        lang: `en-GB`,
                        value: b,
                        onChange: (e) => x(e.target.value),
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`label`, {
                    children: [
                      `পরিমাণ`,
                      (0, E.jsx)(`input`, {
                        min: `1`,
                        inputMode: `numeric`,
                        type: `number`,
                        value: v,
                        onChange: (e) => y(e.target.value),
                        placeholder: `যেমন ১৭৩৯০`,
                      }),
                    ],
                  }),
                  g === `stock_in` &&
                    (0, E.jsxs)(E.Fragment, {
                      children: [
                        (0, E.jsxs)(`label`, {
                          className: `stock-note`,
                          children: [
                            `সরবরাহকারী`,
                            (0, E.jsxs)(`select`, {
                              required: !0,
                              value: suppId,
                              onChange: (e) => {
                                let t = e.target.value;
                                setSuppId(t);
                              },
                              children: [
                                (0, E.jsx)(`option`, {
                                  value: ``,
                                  children: `সরবরাহকারী নির্বাচন করুন`,
                                }),
                                s
                                  .filter((e) => e.itemCode === m)
                                  .map((e) =>
                                    (0, E.jsx)(
                                      `option`,
                                      { value: e.id, children: e.name },
                                      e.id,
                                    ),
                                  ),
                              ],
                            }),
                            !s.some((e) => e.itemCode === m) &&
                              (0, E.jsx)(`small`, {
                                className: `field-help`,
                                children: `নিচের সরবরাহকারী অংশ থেকে আগে এই পণ্যের সরবরাহকারী যোগ করুন।`,
                              }),
                            Y &&
                              (0, E.jsxs)(`span`, {
                                className: `selected-supplier-info`,
                                children: [
                                  (0, E.jsx)(`strong`, { children: Y.name }),
                                  (0, E.jsx)(`small`, {
                                    children:
                                      [Y.ownerName, Y.mobile, Y.address]
                                        .filter(Boolean)
                                        .join(` · `) ||
                                      `যোগাযোগের তথ্য দেওয়া হয়নি`,
                                  }),
                                ],
                              }),
                          ],
                        }),
                        (0, E.jsxs)(`label`, {
                          children: [
                            `প্রতি `,
                            I[m].unit,
                            ` ক্রয়দর (৳)`,
                            (0, E.jsx)(`input`, {
                              min: `0`,
                              step: `0.01`,
                              inputMode: `decimal`,
                              type: `number`,
                              value: O,
                              onChange: (e) => A(e.target.value),
                              placeholder: `যেমন ১২.৫০`,
                            }),
                          ],
                        }),
                        (0, E.jsxs)(`label`, {
                          children: [
                            `নগদ প্রদান (৳)`,
                            (0, E.jsx)(`input`, {
                              min: `0`,
                              step: `0.01`,
                              inputMode: `decimal`,
                              type: `number`,
                              value: j,
                              onChange: (e) => N(e.target.value),
                              placeholder: `যেমন ১০০০০`,
                            }),
                          ],
                        }),
                        (0, E.jsxs)(`div`, {
                          className: `purchase-calculation stock-note`,
                          children: [
                            (0, E.jsxs)(`span`, {
                              children: [
                                `মোট মূল্য`,
                                (0, E.jsx)(`strong`, { children: F(K) }),
                              ],
                            }),
                            (0, E.jsxs)(`span`, {
                              children: [
                                `নগদ প্রদান`,
                                (0, E.jsx)(`strong`, { children: F(q) }),
                              ],
                            }),
                            (0, E.jsxs)(`span`, {
                              className: J > 0 ? `amount-due` : (J < 0 ? `amount-advance` : ``),
                              children: [
                                J < 0 ? `অগ্রিম/সমন্বয়` : `বাকি`,
                                (0, E.jsx)(`strong`, { children: F(Math.abs(J)) }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  g === `stock_out` &&
                    (0, E.jsxs)(`label`, {
                      className: `stock-note`,
                      children: [
                        `অঞ্চল (যেখানে বিতরণ করা হলো)`,
                        (0, E.jsx)(`div`, {
                          className: `stock-area-picker`,
                          role: `group`,
                          'aria-label': `বিতরণের অঞ্চল নির্বাচন`,
                          children: w.map((area) =>
                            (0, E.jsxs)(
                              `label`,
                              {
                                children: [
                                  (0, E.jsx)(`input`, {
                                    type: `checkbox`,
                                    checked: stockOutAreas.includes(area.code),
                                    onChange: (e) => {
                                      let nextAreas = e.target.checked
                                        ? [...stockOutAreas, area.code]
                                        : stockOutAreas.filter((code) => code !== area.code);
                                      (setStockOutAreas(nextAreas),
                                        y(
                                          nextAreas.length
                                            ? String(
                                                nextAreas.reduce(
                                                  (sum, code) =>
                                                    sum + (areaDailyDemandByCode[code] ?? 0),
                                                  0,
                                                ),
                                              )
                                            : ``,
                                        ));
                                    },
                                  }),
                                  (0, E.jsx)(`span`, { children: area.name }),
                                ],
                              },
                              area.code,
                            ),
                          ),
                        }),
                      ],
                    }),
                  (0, E.jsxs)(`label`, {
                    className: `stock-note`,
                    children: [
                      `মন্তব্য`,
                      (0, E.jsx)(`input`, {
                        value: S,
                        onChange: (e) => C(e.target.value),
                        placeholder: `চালান, সরবরাহকারী বা সমন্বয়ের কারণ`,
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`div`, {
                    className: `stock-form-actions stock-note`,
                    children: [
                      (0, E.jsx)(`button`, {
                        className: `button-primary`,
                        type: `submit`,
                        disabled: U,
                        children: U
                          ? `সংরক্ষণ হচ্ছে…`
                          : z
                            ? `পরিবর্তন সংরক্ষণ`
                            : `লেনদেন সংরক্ষণ`,
                      }),
                      z &&
                        (0, E.jsxs)(E.Fragment, {
                          children: [
                            (0, E.jsx)(`button`, {
                              className: `button-secondary`,
                              type: `button`,
                              onClick: $,
                              children: `সম্পাদনা বাতিল`,
                            }),
                            (0, E.jsx)(`button`, {
                              className: `button-secondary`,
                              type: `button`,
                              style: {
                                color: `var(--color-status-danger)`,
                                borderColor: `var(--color-status-danger)`,
                              },
                              onClick: te,
                              children: `মুছে ফেলুন`,
                            }),
                          ],
                        }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          (0, E.jsxs)(`section`, {
            className: `panel stock-ledger`,
            children: [
              (0, E.jsxs)(`div`, {
                className: `panel-head`,
                style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                children: [
                  (0, E.jsxs)(`div`, {
                    children: [
                      (0, E.jsx)(`h2`, { children: `সাম্প্রতিক লেনদেন` }),
                    ],
                  }),
                  (0, E.jsx)(`button`, {
                    className: `button-secondary no-print`,
                    onClick: printStockLedger,
                    disabled: filteredStockLedger.length === 0,
                    style: { padding: '4px 12px', fontSize: '12px' },
                    children: `প্রিন্ট করুন`
                  })
                ]
              }),
              (0, E.jsxs)(`div`, {
                className: `stock-ledger-toolbar no-print`,
                children: [
                  (0, E.jsxs)(`label`, {
                    children: [
                      `শুরুর তারিখ`,
                      (0, E.jsx)(`input`, {
                        type: `date`,
                        lang: `en-GB`,
                        value: stockLedgerFrom,
                        max: stockLedgerTo || undefined,
                        onChange: (e) => {
                          setStockLedgerFrom(e.target.value);
                          setStockLedgerPage(1);
                        },
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`label`, {
                    children: [
                      `শেষ তারিখ`,
                      (0, E.jsx)(`input`, {
                        type: `date`,
                        lang: `en-GB`,
                        value: stockLedgerTo,
                        min: stockLedgerFrom || undefined,
                        onChange: (e) => {
                          setStockLedgerTo(e.target.value);
                          setStockLedgerPage(1);
                        },
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`label`, {
                    children: [
                      `পণ্য`,
                      (0, E.jsxs)(`select`, {
                        value: stockLedgerItem,
                        onChange: (e) => {
                          setStockLedgerItem(e.target.value);
                          setStockLedgerPage(1);
                        },
                        children: [
                          (0, E.jsx)(`option`, { value: `all`, children: `সব পণ্য` }),
                          (0, E.jsx)(`option`, { value: `bun`, children: I.bun.name }),
                          (0, E.jsx)(`option`, { value: `egg`, children: I.egg.name }),
                          (0, E.jsx)(`option`, { value: `banana`, children: I.banana.name }),
                        ],
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`span`, {
                    className: `stock-ledger-result-count`,
                    children: [D.format(filteredStockLedger.length), `টি লেনদেন`],
                  }),
                ],
              }),
              filteredStockLedger.length
                ? (0, E.jsx)(`div`, {
                    className: `ledger-list screen-only`,
                    children: paginatedStockLedger
                      .map((e) =>
                        (0, E.jsxs)(
                          `article`,
                          {
                            children: [
                              (0, E.jsx)(`span`, {
                                className: `ledger-type ledger-${e.transactionType}`,
                                children: I[e.itemCode].name.slice(0, 1),
                              }),
                              (0, E.jsxs)(`p`, {
                                children: [
                                  (0, E.jsx)(`strong`, {
                                    children: I[e.itemCode].name,
                                  }),
                                  (0, E.jsxs)(`small`, {
                                    children: [
                                      L[e.transactionType],
                                      ` · `,
                                      e.transactionDate,
                                      e.transactionType === 'stock_out' && e.areaCode
                                        ? ` · ${formatStockAreaNames(e.areaCode) || 'অজানা অঞ্চল'}`
                                        : ''
                                    ],
                                  }),
                                  e.supplierName &&
                                    (0, E.jsx)(`small`, {
                                      children: e.supplierName,
                                    }),
                                ],
                              }),
                              (0, E.jsxs)(`div`, {
                                className: `ledger-amount`,
                                children: [
                                  (0, E.jsx)(`strong`, {
                                    children: D.format(e.quantity),
                                  }),
                                  e.transactionType === `stock_in`
                                    ? (0, E.jsxs)(E.Fragment, {
                                        children: [
                                          (0, E.jsxs)(`small`, {
                                            children: [
                                              `মোট `,
                                              F(e.totalAmountPoisha),
                                            ],
                                          }),
                                          (0, E.jsxs)(`small`, {
                                            className: e.dueAmountPoisha
                                              ? `amount-due`
                                              : ``,
                                            children: [
                                              `বাকি `,
                                              F(e.dueAmountPoisha),
                                            ],
                                          }),
                                        ],
                                      })
                                    : (0, E.jsxs)(`small`, {
                                        children: [
                                          `Balance `,
                                          D.format(e.newBalance),
                                        ],
                                      }),
                                ],
                              }),
                              stockEntryTransactionTypes.includes(e.transactionType)
                                ? (0, E.jsx)(`button`, {
                                    className: `ledger-edit button-secondary`,
                                    type: `button`,
                                    onClick: () => ee(e),
                                    children: `এডিট`,
                                  })
                                : (0, E.jsx)(`span`, {
                                    className: `ledger-edit-placeholder`,
                                    "aria-hidden": `true`,
                                  }),
                              (0, E.jsxs)(`div`, {
                                className: `ledger-balance`,
                                children: [
                                  (0, E.jsx)(`small`, { children: `Balance` }),
                                  (0, E.jsx)(`strong`, {
                                    children: D.format(e.newBalance),
                                  }),
                                ],
                              }),
                            ],
                          },
                          e.id,
                        ),
                      ),
                  })
                : (0, E.jsxs)(`div`, {
                    className: `ledger-empty screen-only`,
                    children: [
                      (0, E.jsx)(`strong`, {
                        children: `কোনো লেনদেন পাওয়া যায়নি`,
                      }),
                      (0, E.jsx)(`p`, {
                        children: `তারিখ বা পণ্য ফিল্টার পরিবর্তন করে আবার দেখুন।`,
                      }),
                    ],
                  }),
              filteredStockLedger.length > 0 &&
                (0, E.jsxs)(`div`, {
                  className: `stock-ledger-pagination no-print`,
                  children: [
                    (0, E.jsx)(`button`, {
                      type: `button`,
                      className: `button-secondary`,
                      disabled: currentStockLedgerPage <= 1,
                      onClick: () => setStockLedgerPage((e) => Math.max(1, e - 1)),
                      children: `আগের`,
                    }),
                    (0, E.jsxs)(`span`, {
                      children: [
                        `পৃষ্ঠা `,
                        D.format(currentStockLedgerPage),
                        ` / `,
                        D.format(stockLedgerPageCount),
                        ` · প্রতি পেইজে ১০টি`,
                      ],
                    }),
                    (0, E.jsx)(`button`, {
                      type: `button`,
                      className: `button-secondary`,
                      disabled: currentStockLedgerPage >= stockLedgerPageCount,
                      onClick: () => setStockLedgerPage((e) => Math.min(stockLedgerPageCount, e + 1)),
                      children: `পরের`,
                    }),
                  ],
                }),
              (0, E.jsxs)(`div`, {
                className: `stock-ledger-print print-only`,
                children: [
                  (0, E.jsx)(`h1`, { children: `সাম্প্রতিক স্টক লেনদেন` }),
                  (0, E.jsxs)(`p`, {
                    children: [
                      stockLedgerItem === `all` ? `সব পণ্য` : I[stockLedgerItem].name,
                      ` · `,
                      stockLedgerFrom || `শুরু থেকে`,
                      ` — `,
                      stockLedgerTo || `বর্তমান পর্যন্ত`,
                      ` · মোট `,
                      D.format(filteredStockLedger.length),
                      `টি লেনদেন`,
                    ],
                  }),
                  (0, E.jsxs)(`table`, {
                    children: [
                      (0, E.jsx)(`thead`, {
                        children: (0, E.jsxs)(`tr`, {
                          children: [
                            (0, E.jsx)(`th`, { children: `তারিখ` }),
                            (0, E.jsx)(`th`, { children: `পণ্য` }),
                            (0, E.jsx)(`th`, { children: `লেনদেন` }),
                            (0, E.jsx)(`th`, { children: `পরিমাণ` }),
                            (0, E.jsx)(`th`, { children: `বিস্তারিত` }),
                            (0, E.jsx)(`th`, { children: `মজুত` }),
                          ],
                        }),
                      }),
                      (0, E.jsx)(`tbody`, {
                        children: filteredStockLedger.map((e) =>
                          (0, E.jsxs)(
                            `tr`,
                            {
                              children: [
                                (0, E.jsx)(`td`, { children: e.transactionDate }),
                                (0, E.jsx)(`td`, { children: I[e.itemCode].name }),
                                (0, E.jsx)(`td`, { children: L[e.transactionType] }),
                                (0, E.jsx)(`td`, { children: D.format(e.quantity) }),
                                (0, E.jsx)(`td`, {
                                  children:
                                    e.supplierName ||
                                    (e.areaCode ? formatStockAreaNames(e.areaCode) : ``) ||
                                    e.note ||
                                    `—`,
                                }),
                                (0, E.jsx)(`td`, { children: D.format(e.newBalance) }),
                              ],
                            },
                            `print-${e.id}`,
                          ),
                        ),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function K({ dailyDemand: e, areaFilter: t, onExport: n }) {
  let i = { bun: 10, egg: 12, banana: 8 },
    a = { bun: `বনরুটি`, egg: `ডিম`, banana: `কলা` },
    [o, s] = (0, l.useState)([]),
    [c, u] = (0, l.useState)(M(new Date()).slice(0, 7)),
    [expensePeriod, setExpensePeriod] = (0, l.useState)(`month`),
    [expenseDateFilter, setExpenseDateFilter] = (0, l.useState)(M(new Date())),
    [d, f] = (0, l.useState)(null),
    [p, m] = (0, l.useState)(``),
    [h, g] = (0, l.useState)(``),
    [_, v] = (0, l.useState)(``),
    [y, b] = (0, l.useState)(``),
    [x, S] = (0, l.useState)(!1),
    C = (0, l.useCallback)(() => {
      let e = new URLSearchParams({ period: expensePeriod });
      (expensePeriod === `month`
        ? e.set(`month`, c)
        : e.set(`date`, expenseDateFilter));
      fetch(`/api/expenses?${e.toString()}`)
        .then((e) => e.json())
        .then((e) => {
          s(e.expenses || []);
        })
        .catch(console.error);
    }, [c, expenseDateFilter, expensePeriod]);
  (0, l.useEffect)(() => {
    C();
  }, [C]);
  async function T(e) {
    if ((e.preventDefault(), d)) {
      S(!0);
      try {
        if (
          !(
            await fetch(`/api/expenses`, {
              method: `POST`,
              headers: { "Content-Type": `application/json` },
              body: JSON.stringify({
                id: d.id,
                areaCode: d.areaCode,
                expenseDate: p,
                vehicleType: h,
                amountPoisha: Math.round(Number(_) * 100),
                note: y,
              }),
            })
          ).ok
        )
          throw Error(`আপডেট করা যায়নি`);
        (f(null), C());
      } catch (e) {
        alert(P(e, `আপডেট করা যায়নি`));
      } finally {
        S(!1);
      }
    }
  }
  async function A(e) {
    if (confirm(`আপনি কি নিশ্চিত যে এই হিসাবটি মুছে ফেলতে চান?`))
      try {
        if (!(await fetch(`/api/expenses?id=${e}`, { method: `DELETE` })).ok)
          throw Error(`মুছে ফেলা যায়নি`);
        C();
      } catch (e) {
        alert(P(e, `মুছে ফেলা যায়নি`));
      }
  }
  let j = (e) => {
      let t = 0,
        n = 0;
      return (
        r.forEach((r) => {
          r.areaName === e &&
            r.type === `shortage` &&
            ((t += r.quantity * (i[r.itemCode] || 0)), (n += r.quantity));
        }),
        { amount: t, count: n }
      );
    },
    N = (() => {
      let e = {};
      return (
        o.forEach((t) => {
          (e[t.areaCode] || (e[t.areaCode] = 0),
            (e[t.areaCode] += t.amountPoisha / 100));
        }),
        e
      );
    })(),
    F = Object.values(N).reduce((e, t) => e + t, 0),
    expenseRangeLabel = (() => {
      if (expensePeriod === `month`)
        return `মাসের হিসাব: ${k.format(new Date(c + `-01`))}`;
      let e = new Date(expenseDateFilter),
        t = new Date(e);
      if (expensePeriod === `day`)
        return `দিনের হিসাব: ${k.format(e)}`;
      t.setDate(e.getDate() - ((e.getDay() + 6) % 7));
      let n = new Date(t);
      return (
        n.setDate(t.getDate() + 6),
        `সাপ্তাহিক হিসাব: ${k.format(t)} - ${k.format(n)}`
      );
    })();
  return (0, E.jsxs)(`section`, {
    className: `panel report-preview`,
    children: [
      (0, E.jsxs)(`div`, {
        className: `report-actions no-print`,
        children: [
          (0, E.jsxs)(`div`, {
            children: [
              (0, E.jsx)(`p`, { className: `eyebrow`, children: `Preview` }),
              (0, E.jsx)(`h2`, { children: `রিপোর্ট` }),
            ],
          }),
          (0, E.jsxs)(`div`, {
            children: [
              (0, E.jsx)(`button`, {
                className: `button-secondary hide-on-mobile`,
                type: `button`,
                onClick: n,
                children: `Excel/CSV`,
              }),
              (0, E.jsx)(`button`, {
                className: `button-primary`,
                type: `button`,
                onClick: () => printDesktopLayout(),
                children: `PDF / প্রিন্ট`,
              }),
            ],
          }),
        ],
      }),
      (0, E.jsxs)(`div`, {
        className: `print-report`,
        children: [
          (0, E.jsx)(`p`, {
            children: `সরকারি প্রাথমিক বিদ্যালয়ে মিড-ডে মিল কর্মসূচি`,
          }),
          (0, E.jsx)(`h2`, {
            children: `একদিনের এক আইটেমের চাহিদা সারসংক্ষেপ`,
          }),
          (0, E.jsxs)(`span`, {
            children: [`দুর্গাপুর উপজেলা, নেত্রকোণা · `, t],
          }),
          (0, E.jsxs)(`table`, {
            children: [
              (0, E.jsx)(`thead`, {
                children: (0, E.jsxs)(`tr`, {
                  children: [
                    (0, E.jsx)(`th`, { children: `অঞ্চল` }),
                    (0, E.jsx)(`th`, { children: `Code` }),
                    (0, E.jsx)(`th`, { children: `বিদ্যালয়` }),
                    (0, E.jsx)(`th`, { children: `দৈনিক চাহিদা` }),
                    (0, E.jsx)(`th`, { children: `সাপ্তাহিক রুটি` }),
                    (0, E.jsx)(`th`, { children: `সাপ্তাহিক ডিম` }),
                    (0, E.jsx)(`th`, { children: `সাপ্তাহিক কলা` }),
                  ],
                }),
              }),
              (0, E.jsx)(`tbody`, {
                children: w
                  .filter((e) => t === `সব অঞ্চল` || e.name === t)
                  .map((e) =>
                    (0, E.jsxs)(
                      `tr`,
                      {
                        children: [
                          (0, E.jsx)(`td`, { children: e.name }),
                          (0, E.jsx)(`td`, {
                            children: D.format(e.schoolCount),
                          }),
                          (0, E.jsx)(`td`, {
                            children: D.format(e.dailyDemand),
                          }),
                          (0, E.jsx)(`td`, {
                            children: D.format(e.dailyDemand * 4),
                          }),
                          (0, E.jsx)(`td`, {
                            children: D.format(e.dailyDemand * 3),
                          }),
                          (0, E.jsx)(`td`, {
                            children: D.format(e.dailyDemand),
                          }),
                        ],
                      },
                      e.code,
                    ),
                  ),
              }),
              (0, E.jsx)(`tfoot`, {
                children: (0, E.jsxs)(`tr`, {
                  children: [
                    (0, E.jsx)(`th`, { colSpan: 3, children: `মোট` }),
                    (0, E.jsx)(`th`, { children: D.format(e) }),
                    (0, E.jsx)(`th`, { children: D.format(e * 4) }),
                    (0, E.jsx)(`th`, { children: D.format(e * 3) }),
                    (0, E.jsx)(`th`, { children: D.format(e) }),
                  ],
                }),
              }),
            ],
          }),
          r.length > 0 &&
            (0, E.jsxs)(`div`, {
              style: { marginTop: `40px` },
              children: [
                (0, E.jsx)(`h2`, {
                  children: `মাসিক শর্টেজ এবং ক্ষতিপূরণ (Cash Compensation)`,
                }),
                (0, E.jsx)(`p`, {
                  style: {
                    fontSize: `12px`,
                    color: `var(--muted)`,
                    marginBottom: `10px`,
                  },
                  children: `* গড় ক্রয়মূল্য ধরা হয়েছে: বনরুটি (১০৳), ডিম (১২৳), কলা (৮৳)`,
                }),
                (0, E.jsxs)(`table`, {
                  children: [
                    (0, E.jsx)(`thead`, {
                      children: (0, E.jsxs)(`tr`, {
                        children: [
                          (0, E.jsx)(`th`, { children: `অঞ্চল` }),
                          (0, E.jsx)(`th`, { children: `শর্টেজ পরিমাণ (মোট)` }),
                          (0, E.jsx)(`th`, {
                            children: `প্রাপ্য ক্ষতিপূরণ (নগদ টাকা)`,
                          }),
                          (0, E.jsx)(`th`, { children: `বিস্তারিত` }),
                        ],
                      }),
                    }),
                    (0, E.jsx)(`tbody`, {
                      children: w
                        .filter((e) => t === `সব অঞ্চল` || e.name === t)
                        .map((e) => {
                          let t = j(e.name);
                          if (t.count === 0) return null;
                          let n = r.filter(
                            (t) =>
                              t.areaName === e.name && t.type === `shortage`,
                          );
                          return (0, E.jsxs)(
                            `tr`,
                            {
                              children: [
                                (0, E.jsx)(`td`, { children: e.name }),
                                (0, E.jsxs)(`td`, {
                                  style: {
                                    color: `var(--red)`,
                                    fontWeight: `bold`,
                                  },
                                  children: [D.format(t.count), ` টি`],
                                }),
                                (0, E.jsxs)(`td`, {
                                  style: { fontWeight: `bold` },
                                  children: [O.format(t.amount), ` ৳`],
                                }),
                                (0, E.jsx)(`td`, {
                                  style: {
                                    fontSize: `11px`,
                                    color: `var(--muted)`,
                                  },
                                  children: n.map((e, t) =>
                                    (0, E.jsxs)(
                                      `div`,
                                      {
                                        children: [
                                          k.format(new Date(e.date)),
                                          `: `,
                                          a[e.itemCode],
                                          ` (`,
                                          D.format(e.quantity),
                                          `) - `,
                                          e.note,
                                        ],
                                      },
                                      t,
                                    ),
                                  ),
                                }),
                              ],
                            },
                            e.code,
                          );
                        }),
                    }),
                  ],
                }),
              ],
            }),
          (0, E.jsxs)(`div`, {
            style: { marginTop: `40px` },
            children: [
              (0, E.jsxs)(`div`, {
                style: {
                  display: `flex`,
                  justifyContent: `space-between`,
                  alignItems: `center`,
                  marginBottom: `10px`,
                },
                children: [
                  (0, E.jsx)(`h2`, {
                    children: `অঞ্চলভিত্তিক যানবাহন ও অন্যান্য খরচের রিপোর্ট`,
                  }),
                  (0, E.jsxs)(`div`, {
                    className: `no-print`,
                    style: {
                      display: `flex`,
                      gap: `8px`,
                      alignItems: `center`,
                      flexWrap: `wrap`,
                    },
                    children: [
                      (0, E.jsxs)(`select`, {
                        value: expensePeriod,
                        onChange: (e) => setExpensePeriod(e.target.value),
                        style: {
                          padding: `6px 8px`,
                          borderRadius: `6px`,
                          border: `1px solid #ccc`,
                          background: `#fff`,
                        },
                        children: [
                          (0, E.jsx)(`option`, {
                            value: `day`,
                            children: `দিনভিত্তিক`,
                          }),
                          (0, E.jsx)(`option`, {
                            value: `week`,
                            children: `সাপ্তাহিক`,
                          }),
                          (0, E.jsx)(`option`, {
                            value: `month`,
                            children: `মাসিক`,
                          }),
                        ],
                      }),
                      expensePeriod === `month`
                        ? (0, E.jsx)(`input`, {
                            type: `month`,
                            value: c,
                            onChange: (e) => u(e.target.value),
                            style: {
                              padding: `6px 8px`,
                              borderRadius: `6px`,
                              border: `1px solid #ccc`,
                            },
                          })
                        : (0, E.jsx)(`input`, {
                            type: `date`,
                            lang: `en-GB`,
                            value: expenseDateFilter,
                            onChange: (e) =>
                              setExpenseDateFilter(e.target.value),
                            style: {
                              padding: `6px 8px`,
                              borderRadius: `6px`,
                              border: `1px solid #ccc`,
                            },
                          }),
                    ],
                  }),
                ],
              }),
              (0, E.jsxs)(`p`, {
                style: {
                  fontSize: `12px`,
                  color: `var(--muted)`,
                  marginBottom: `10px`,
                },
                children: expenseRangeLabel,
              }),
              (0, E.jsx)(`h3`, {
                style: {
                  marginTop: `20px`,
                  marginBottom: `10px`,
                  fontSize: `14px`,
                },
                children: `১. অঞ্চলভিত্তিক সারসংক্ষেপ`,
              }),
              (0, E.jsxs)(`table`, {
                children: [
                  (0, E.jsx)(`thead`, {
                    children: (0, E.jsxs)(`tr`, {
                      children: [
                        (0, E.jsx)(`th`, { children: `অঞ্চল` }),
                        (0, E.jsx)(`th`, { children: `Area Manager` }),
                        (0, E.jsx)(`th`, { children: `মোট খরচ` }),
                      ],
                    }),
                  }),
                  (0, E.jsx)(`tbody`, {
                    children: w
                      .filter((e) => t === `সব অঞ্চল` || e.name === t)
                      .map((e) => {
                        let t = N[e.code] || 0;
                        return t === 0
                          ? null
                          : (0, E.jsxs)(
                              `tr`,
                              {
                                children: [
                                  (0, E.jsx)(`td`, { children: e.name }),
                                  (0, E.jsx)(`td`, {
                                    children: e.managerName || `পদ খালি`,
                                  }),
                                  (0, E.jsxs)(`td`, {
                                    style: { fontWeight: `bold` },
                                    children: [O.format(t), ` ৳`],
                                  }),
                                ],
                              },
                              e.code,
                            );
                      }),
                  }),
                  (0, E.jsx)(`tfoot`, {
                    children: (0, E.jsxs)(`tr`, {
                      children: [
                        (0, E.jsx)(`th`, {
                          colSpan: 2,
                          children: `সর্বমোট খরচ`,
                        }),
                        (0, E.jsxs)(`th`, { children: [O.format(F), ` ৳`] }),
                      ],
                    }),
                  }),
                ],
              }),
              (0, E.jsx)(`h3`, {
                style: {
                  marginTop: `30px`,
                  marginBottom: `10px`,
                  fontSize: `14px`,
                },
                children: `২. প্রতিদিনের বিস্তারিত খরচের তালিকা`,
              }),
              (0, E.jsxs)(`table`, {
                children: [
                  (0, E.jsx)(`thead`, {
                    children: (0, E.jsxs)(`tr`, {
                      children: [
                        (0, E.jsx)(`th`, { children: `তারিখ` }),
                        (0, E.jsx)(`th`, { children: `অঞ্চল` }),
                        (0, E.jsx)(`th`, { children: `যানবাহনের ধরন` }),
                        (0, E.jsx)(`th`, { children: `পরিমাণ` }),
                        (0, E.jsx)(`th`, { children: `মন্তব্য` }),
                        (0, E.jsx)(`th`, {
                          className: `no-print`,
                          children: `অ্যাকশন`,
                        }),
                      ],
                    }),
                  }),
                  (0, E.jsxs)(`tbody`, {
                    children: [
                      o
                        .filter(
                          (e) =>
                            t === `সব অঞ্চল` ||
                            w.find((t) => t.code === e.areaCode)?.name === t,
                        )
                        .map((e) =>
                          (0, E.jsxs)(
                            `tr`,
                            {
                              children: [
                                (0, E.jsx)(`td`, {
                                  children: k.format(new Date(e.expenseDate)),
                                }),
                                (0, E.jsx)(`td`, {
                                  children:
                                    w.find((t) => t.code === e.areaCode)
                                      ?.name || `অঞ্চল পাওয়া যায়নি`,
                                }),
                                (0, E.jsx)(`td`, { children: e.vehicleType }),
                                (0, E.jsxs)(`td`, {
                                  children: [
                                    O.format(e.amountPoisha / 100),
                                    ` ৳`,
                                  ],
                                }),
                                (0, E.jsx)(`td`, { children: e.note || `-` }),
                                (0, E.jsxs)(`td`, {
                                  className: `no-print`,
                                  children: [
                                    (0, E.jsx)(`button`, {
                                      type: `button`,
                                      onClick: () => {
                                        (f(e),
                                          m(e.expenseDate),
                                          g(e.vehicleType),
                                          v((e.amountPoisha / 100).toString()),
                                          b(e.note || ``));
                                      },
                                      style: {
                                        marginRight: `8px`,
                                        cursor: `pointer`,
                                        background: `none`,
                                        border: `none`,
                                        color: `var(--accent)`,
                                      },
                                      children: `এডিট`,
                                    }),
                                    (0, E.jsx)(`button`, {
                                      type: `button`,
                                      onClick: () => A(e.id),
                                      style: {
                                        cursor: `pointer`,
                                        background: `none`,
                                        border: `none`,
                                        color: `var(--red)`,
                                      },
                                      children: `মুছে ফেলুন`,
                                    }),
                                  ],
                                }),
                              ],
                            },
                            e.id,
                          ),
                        ),
                      o.length === 0 &&
                        (0, E.jsx)(`tr`, {
                          children: (0, E.jsx)(`td`, {
                            colSpan: 6,
                            style: { textAlign: `center` },
                            children: `কোনো খরচের তথ্য পাওয়া যায়নি।`,
                          }),
                        }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          (0, E.jsxs)(`div`, {
            className: `signatures`,
            children: [
              (0, E.jsx)(`span`, { children: `প্রস্তুতকারী` }),
              (0, E.jsx)(`span`, { children: `যাচাইকারী` }),
              (0, E.jsx)(`span`, { children: `অনুমোদনকারী` }),
            ],
          }),
        ],
      }),
      d &&
        (0, E.jsx)(`div`, {
          className: `modal-backdrop no-print`,
          role: `presentation`,
          children: (0, E.jsxs)(`section`, {
            className: `modal`,
            role: `dialog`,
            "aria-modal": `true`,
            children: [
              (0, E.jsx)(`p`, {
                className: `eyebrow`,
                children: `খরচের হিসাব এডিট`,
              }),
              (0, E.jsx)(`h2`, {
                children: w.find((e) => e.code === d.areaCode)?.name,
              }),
              (0, E.jsxs)(`form`, {
                onSubmit: T,
                style: {
                  display: `flex`,
                  flexDirection: `column`,
                  gap: `16px`,
                  marginTop: `16px`,
                },
                children: [
                  (0, E.jsxs)(`label`, {
                    children: [
                      `তারিখ *`,
                      (0, E.jsx)(`input`, {
                        type: `date`,
                        lang: `en-GB`,
                        required: !0,
                        value: p,
                        onChange: (e) => m(e.target.value),
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`label`, {
                    children: [
                      `যানবাহনের ধরন / খরচ *`,
                      (0, E.jsxs)(`select`, {
                        value: h,
                        onChange: (e) => g(e.target.value),
                        style: {
                          background: `#f8fbf9`,
                          border: `1px solid var(--line)`,
                          borderRadius: `8px`,
                          color: `var(--ink)`,
                          minHeight: `36px`,
                          padding: `7px 10px`,
                          fontSize: `14px`,
                          width: `100%`,
                        },
                        children: [
                          (0, E.jsx)(`option`, {
                            value: `অটো`,
                            children: `অটো`,
                          }),
                          (0, E.jsx)(`option`, {
                            value: `ভ্যান`,
                            children: `ভ্যান`,
                          }),
                          (0, E.jsx)(`option`, {
                            value: `মোটরসাইকেল`,
                            children: `মোটরসাইকেল`,
                          }),
                          (0, E.jsx)(`option`, {
                            value: `নৌকা`,
                            children: `নৌকা`,
                          }),
                          (0, E.jsx)(`option`, {
                            value: `পোর্টার`,
                            children: `পোর্টার`,
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`label`, {
                    children: [
                      `পরিমাণ (টাকা) *`,
                      (0, E.jsx)(`input`, {
                        type: `number`,
                        step: `0.01`,
                        required: !0,
                        value: _,
                        onChange: (e) => v(e.target.value),
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`label`, {
                    children: [
                      `মন্তব্য (ঐচ্ছিক)`,
                      (0, E.jsx)(`input`, {
                        type: `text`,
                        value: y,
                        onChange: (e) => b(e.target.value),
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`div`, {
                    className: `modal-actions`,
                    children: [
                      (0, E.jsx)(`button`, {
                        type: `button`,
                        className: `button-secondary`,
                        onClick: () => f(null),
                        children: `বাতিল`,
                      }),
                      (0, E.jsx)(`button`, {
                        type: `submit`,
                        className: `button-primary`,
                        disabled: x,
                        children: `আপডেট করুন`,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}
function q() {
  let [e, t] = (0, l.useState)([]),
    [n, r] = (0, l.useState)(`bun`),
    [i, a] = (0, l.useState)(``),
    [o, s] = (0, l.useState)(``),
    [c, u] = (0, l.useState)(``),
    [d, f] = (0, l.useState)(``),
    [openingBalance, setOpeningBalance] = (0, l.useState)(``),
    [p, m] = (0, l.useState)(null),
    [h, g] = (0, l.useState)(``),
    [_, v] = (0, l.useState)(!1),
    [ledg, setLedg] = (0, l.useState)(null),
    [supplierFormOpen, setSupplierFormOpen] = (0, l.useState)(!1);
  async function y() {
    let e = await fetch(`/api/stock`);
    if (!e.ok) throw Error(`Stock unavailable`);
    t((await e.json()).suppliers || []);
  }
  (0, l.useEffect)(() => {
    let e = !1;
    return (
      fetch(`/api/stock`)
        .then((e) => {
          if (!e.ok) throw Error(`Stock unavailable`);
          return e.json();
        })
        .then((n) => {
          e || t(n.suppliers || []);
        })
        .catch(console.error),
      () => {
        e = !0;
      }
    );
  }, []);
  async function b(e) {
    if ((e.preventDefault(), !i.trim())) {
      g(`সরবরাহকারীর নাম লিখুন।`);
      return;
    }
    (v(!0), g(``));
    try {
      let e = await fetch(`/api/stock`, {
          method: `POST`,
          headers: { "content-type": `application/json` },
          body: JSON.stringify({
            kind: `supplier`,
            id: p,
            itemCode: n,
            name: i,
            ownerName: o,
            mobile: c,
            address: d,
            defaultUnitPricePoisha: 0,
            openingBalancePoisha: Math.round(Number(openingBalance || 0) * 100),
          }),
        }),
        t = await e.json();
      if (!e.ok) throw Error(t.error || `সরবরাহকারী সংরক্ষণ করা যায়নি।`);
      (await y(),
        g(
          p ? `সরবরাহকারী আপডেট হয়েছে!` : `সরবরাহকারীর তথ্য সফলভাবে যোগ হয়েছে।`,
        ),
        x());
    } catch (e) {
      g(e instanceof Error ? e.message : `সরবরাহকারী সংরক্ষণ করা যায়নি।`);
    } finally {
      v(!1);
    }
  }
  function x() {
    (m(null),
      a(``),
      s(``),
      u(``),
      f(``),
      setOpeningBalance(``),
      setSupplierFormOpen(!1));
  }
  return (0, E.jsx)(`div`, {
    className: `stock-workspace`,
    children: (0, E.jsxs)(`section`, {
      className: `panel supplier-panel`,
      children: [
        (0, E.jsxs)(`div`, {
          className: `panel-head`,
          children: [
            (0, E.jsxs)(`div`, {
              children: [
                (0, E.jsx)(`h2`, {
                  children: `পণ্যভিত্তিক সরবরাহকারী ও আলাদা হিসাব`,
                }),
                (0, E.jsx)(`p`, {
                  className: `panel-subtitle`,
                  children: `বনরুটি, ডিম ও কলার ক্রয়, নগদ প্রদান এবং বাকি আলাদাভাবে দেখা যাবে।`,
                }),
              ],
            }),
            (0, E.jsxs)(`button`, {
              className: supplierFormOpen
                ? `button-secondary supplier-form-toggle is-open`
                : `button-primary supplier-form-toggle`,
              type: `button`,
              "aria-expanded": supplierFormOpen,
              "aria-controls": `supplier-entry-form`,
              onClick: () => {
                supplierFormOpen
                  ? x()
                  : (x(), setSupplierFormOpen(!0));
              },
              children: [
                (0, E.jsx)(`span`, {
                  "aria-hidden": `true`,
                  children: supplierFormOpen ? `−` : `+`,
                }),
                supplierFormOpen ? `ফর্ম বন্ধ করুন` : `নতুন সরবরাহকারী যোগ করুন`,
              ],
            }),
          ],
        }),
        (0, E.jsx)(`div`, {
          className: supplierFormOpen
            ? `supplier-form-shell is-open`
            : `supplier-form-shell`,
          "aria-hidden": !supplierFormOpen,
          inert: !supplierFormOpen ? !0 : void 0,
          children: (0, E.jsxs)(`form`, {
            id: `supplier-entry-form`,
            className: `supplier-form`,
            onSubmit: b,
            children: [
            (0, E.jsxs)(`label`, {
              children: [
                `পণ্য`,
                (0, E.jsxs)(`select`, {
                  value: n,
                  onChange: (e) => r(e.target.value),
                  children: [
                    (0, E.jsx)(`option`, { value: `bun`, children: `বনরুটি` }),
                    (0, E.jsx)(`option`, {
                      value: `egg`,
                      children: `সিদ্ধ ডিম`,
                    }),
                    (0, E.jsx)(`option`, { value: `banana`, children: `কলা` }),
                  ],
                }),
              ],
            }),
            (0, E.jsxs)(`label`, {
              children: [
                `সরবরাহকারীর নাম *`,
                (0, E.jsx)(`input`, {
                  required: !0,
                  value: i,
                  onChange: (e) => a(e.target.value),
                  placeholder: `প্রতিষ্ঠান বা সরবরাহকারীর নাম`,
                }),
              ],
            }),
            (0, E.jsxs)(`label`, {
              children: [
                `মালিক/যোগাযোগ ব্যক্তি`,
                (0, E.jsx)(`input`, {
                  value: o,
                  onChange: (e) => s(e.target.value),
                  placeholder: `নাম`,
                }),
              ],
            }),
            (0, E.jsxs)(`label`, {
              children: [
                `মোবাইল`,
                (0, E.jsx)(`input`, {
                  inputMode: `numeric`,
                  value: c,
                  onChange: (e) => u(e.target.value),
                  placeholder: `01XXXXXXXXX`,
                }),
              ],
            }),
            (0, E.jsxs)(`label`, {
              className: `supplier-address`,
              children: [
                `ঠিকানা`,
                (0, E.jsx)(`input`, {
                  value: d,
                  onChange: (e) => f(e.target.value),
                  placeholder: `সংক্ষিপ্ত ঠিকানা`,
                }),
              ],
            }),
            (0, E.jsxs)('label', {
              children: [
                'প্রারম্ভিক জের (বকেয়া)',
                (0, E.jsx)('input', {
                  type: 'number',
                  min: '0',
                  value: openingBalance,
                  onChange: e => setOpeningBalance(e.target.value),
                  placeholder: 'আগের বকেয়া থাকলে লিখুন'
                })
              ]
            }),
            (0, E.jsxs)(`div`, {
              className: `stock-form-actions`,
              children: [
                (0, E.jsx)(`button`, {
                  className: `button-primary`,
                  type: `submit`,
                  disabled: _,
                  children: p ? `আপডেট করুন` : `সরবরাহকারী যোগ করুন`,
                }),
                p &&
                  (0, E.jsx)(`button`, {
                    className: `button-secondary`,
                    type: `button`,
                    onClick: x,
                    children: `বাতিল`,
                  }),
              ],
            }),
            ],
          }),
        }),
        h && (0, E.jsx)(`p`, { className: `stock-message`, children: h }),
        (0, E.jsx)(`div`, {
          className: `supplier-account-grid`,
          children: Object.keys(I).map((t) => {
            let n = e.filter((e) => e.itemCode === t),
              i = n.reduce(
                (e, t) => ({
                  purchase: e.purchase + Number(t.totalPurchasePoisha || 0),
                  paid: e.paid + Number(t.totalPaidPoisha || 0),
                  due: e.due + Number(t.totalDuePoisha || 0),
                }),
                { purchase: 0, paid: 0, due: 0 },
              );
            return (0, E.jsxs)(
              `article`,
              {
                className: `supplier-account item-${t}`,
                children: [
                  (0, E.jsxs)(`div`, {
                    className: `supplier-account-head`,
                    children: [
                      (0, E.jsxs)(`div`, {
                        children: [
                          (0, E.jsx)(`small`, {
                            children: `পণ্যের আলাদা হিসাব`,
                          }),
                          (0, E.jsx)(`h3`, { children: I[t].name }),
                        ],
                      }),
                      (0, E.jsxs)(`strong`, {
                        children: [D.format(n.length), ` সরবরাহকারী`],
                      }),
                    ],
                  }),
                  (0, E.jsxs)(`dl`, {
                    className: `supplier-totals`,
                    children: [
                      (0, E.jsxs)(`div`, {
                        children: [
                          (0, E.jsx)(`dt`, { children: `মোট ক্রয়` }),
                          (0, E.jsx)(`dd`, { children: F(i.purchase) }),
                        ],
                      }),
                      (0, E.jsxs)(`div`, {
                        children: [
                          (0, E.jsx)(`dt`, { children: `নগদ প্রদান` }),
                          (0, E.jsx)(`dd`, { children: F(i.paid) }),
                        ],
                      }),
                      (0, E.jsxs)(`div`, {
                        children: [
                          (0, E.jsx)(`dt`, { children: `মোট বাকি` }),
                          (0, E.jsx)(`dd`, {
                            className: i.due ? `amount-due` : ``,
                            children: F(i.due),
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, E.jsx)(`div`, {
                    className: `supplier-list`,
                    children: n.length
                      ? n.map((e) =>
                          (0, E.jsxs)(
                            `div`,
                            {
                              children: [
                                (0, E.jsxs)(`p`, {
                                  children: [
                                    (0, E.jsx)(`strong`, { children: e.name }),
                                    (0, E.jsx)(`small`, {
                                      children:
                                        [e.ownerName, e.mobile]
                                          .filter(Boolean)
                                          .join(` · `) ||
                                        `যোগাযোগের তথ্য দেওয়া হয়নি`,
                                    }),
                                  ],
                                }),
                                (0, E.jsx)(`button`, {
                                  type: `button`,
                                  className: `button-secondary`,
                                  style: {
                                    padding: `4px 8px`,
                                    fontSize: `11px`,
                                    height: `auto`,
                                  },
                                  onClick: () => {
                                    (m(e.id),
                                      r(e.itemCode),
                                      a(e.name),
                                      s(e.ownerName || ``),
                                      u(e.mobile || ``),
                                      f(e.address || ``),
                                      setOpeningBalance(e.openingBalancePoisha ? String(e.openingBalancePoisha / 100) : ``),
                                      setSupplierFormOpen(!0));
                                    let t =
                                      document.querySelector(`.supplier-form`);
                                    t &&
                                      window.scrollTo({
                                        top:
                                          t.getBoundingClientRect().top +
                                          window.scrollY -
                                          100,
                                        behavior: `smooth`,
                                      });
                                  },
                                  children: `এডিট`,
                                }),
                                (0, E.jsx)(`button`, {
                                  type: `button`,
                                  className: `button-primary`,
                                  style: {
                                    padding: `4px 8px`,
                                    fontSize: `11px`,
                                    height: `auto`,
                                    marginLeft: `8px`
                                  },
                                  onClick: () => setLedg(e),
                                  children: `লেজার দেখুন`
                                }),
                                (0, E.jsxs)(`span`, {
                                  children: [
                                    (0, E.jsxs)(`small`, {
                                      children: [
                                        `ক্রয় `,
                                        F(Number(e.totalPurchasePoisha)),
                                      ],
                                    }),
                                    (0, E.jsxs)(`strong`, {
                                      children: [
                                        `বাকি `,
                                        F(Number(e.totalDuePoisha)),
                                      ],
                                    }),

                                  ],
                                }),
                              ],
                            },
                            e.id,
                          ),
                        )
                      : (0, E.jsx)(`p`, {
                          className: `supplier-empty`,
                          children: `এখনো কোনো সরবরাহকারী যোগ করা হয়নি।`,
                        }),
                  }),
                ],
              },
              t,
            );
          }),
        }),
        ledg && (0, E.jsx)(SupplierLedgerModal, { supplier: ledg, onClose: () => setLedg(null) }),
      ],
    }),
  });
}
export { B as DashboardApp };

function SupplierLedgerModal({ supplier, onClose }) {
  const [ledger, setLedger] = (0, l.useState)([]);
  const [loading, setLoading] = (0, l.useState)(true);
  const [filter, setFilter] = (0, l.useState)('month');
  const [customStart, setCustomStart] = (0, l.useState)('');
  const [customEnd, setCustomEnd] = (0, l.useState)('');

  (0, l.useEffect)(() => {
    fetch(`/api/suppliers/${supplier.id}/ledger`)
      .then(r => r.json())
      .then(d => { setLedger(d.ledger || []); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  }, [supplier.id]);

  const now = new Date();
  let filtered = ledger;
  let startDate = null;
  let endDate = null;
  if (filter === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (filter === 'week') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  } else if (filter === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (filter === 'custom' && customStart) {
    startDate = new Date(customStart);
    if (customEnd) {
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    }
  }

  let openingBalance = 0;
  if (startDate) {
    const prior = ledger.filter(r => new Date(r.date) < startDate);
    openingBalance = prior.length ? prior[prior.length - 1].balance : 0;
    filtered = ledger.filter(r => new Date(r.date) >= startDate && (!endDate || new Date(r.date) <= endDate));
  } else {
    filtered = ledger;
  }

  let totalPurchase = 0;
  let totalPaid = 0;
  filtered.forEach(r => {
    if (r.type === 'purchase') totalPurchase += r.amount;
    else totalPaid += r.amount;
  });
  let currentBalance = openingBalance + totalPurchase - totalPaid;

  return (0, E.jsx)('div', {
    className: 'modal-overlay',
    style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, overflowY: 'auto', padding: '2rem' },
    children: (0, E.jsxs)('div', {
      className: 'modal-content ledger-modal print-only-container',
      style: { background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '1000px', margin: '0 auto' },
      children: [
        (0, E.jsx)('style', {
          children: `
            @media print {
              body * { visibility: hidden; }
              .print-only-container, .print-only-container * { visibility: visible; }
              .print-only-container { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
              .no-print { display: none !important; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: right; }
              th { background: #eee; text-align: center; }
              .text-left { text-align: left !important; }
              .text-center { text-align: center !important; }
            }
          `
        }),
        (0, E.jsxs)('div', {
          className: 'no-print',
          style: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' },
          children: [
            (0, E.jsx)('h2', { children: `${I[supplier.itemCode].name} সাপ্লায়ার লেজার` }),
            (0, E.jsx)('button', { className: 'button-secondary', onClick: onClose, children: 'বন্ধ করুন' })
          ]
        }),
        (0, E.jsxs)('div', {
          className: 'no-print',
          style: { display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' },
          children: [
            (0, E.jsxs)('label', {
              children: [
                'ফিল্টার: ',
                (0, E.jsxs)('select', {
                  value: filter,
                  onChange: e => setFilter(e.target.value),
                  children: [
                    (0, E.jsx)('option', { value: 'all', children: 'সব সময়' }),
                    (0, E.jsx)('option', { value: 'today', children: 'আজ' }),
                    (0, E.jsx)('option', { value: 'week', children: 'চলতি সপ্তাহ' }),
                    (0, E.jsx)('option', { value: 'month', children: 'চলতি মাস' }),
                    (0, E.jsx)('option', { value: 'custom', children: 'কাস্টম' })
                  ]
                })
              ]
            }),
            filter === 'custom' && (0, E.jsxs)(E.Fragment, {
              children: [
                (0, E.jsx)('input', { type: 'date', lang: 'en-GB', value: customStart, onChange: e => setCustomStart(e.target.value) }),
                (0, E.jsx)('input', { type: 'date', lang: 'en-GB', value: customEnd, onChange: e => setCustomEnd(e.target.value) })
              ]
            }),
            (0, E.jsx)('button', { className: 'button-primary', onClick: () => printDesktopLayout(), children: 'প্রিন্ট করুন' })
          ]
        }),
        (0, E.jsxs)('div', {
          style: { textAlign: 'center', marginBottom: '1.5rem' },
          children: [
            (0, E.jsx)('h1', { style: { margin: '0 0 10px 0' }, children: `${I[supplier.itemCode].name} সাপ্লায়ার লেজার` }),
            (0, E.jsxs)('div', {
              style: { display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '10px' },
              children: [
                (0, E.jsx)('strong', { children: `হিসাবের নাম: ${I[supplier.itemCode].name}` }),
                (0, E.jsx)('strong', { children: `সাপ্লায়ারের নাম: ${supplier.name}` }),
                (0, E.jsx)('strong', { children: startDate ? `শুরুর তারিখ: ${formatDateDMY(startDate)}` : '' })
              ]
            })
          ]
        }),
        (0, E.jsxs)('div', {
          style: { display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', background: '#f5f5f5', padding: '10px', borderRadius: '4px' },
          children: [
            (0, E.jsxs)('span', { children: ['পূর্বের জের: ', (0, E.jsx)('strong', { children: F(openingBalance) })] }),
            (0, E.jsxs)('span', { children: ['মোট ক্রয়: ', (0, E.jsx)('strong', { children: F(totalPurchase) })] }),
            (0, E.jsxs)('span', { children: ['মোট পরিশোধ: ', (0, E.jsx)('strong', { children: F(totalPaid) })] }),
            (0, E.jsxs)('span', { children: ['বর্তমান জের: ', (0, E.jsx)('strong', { children: F(currentBalance) })] })
          ]
        }),
        (0, E.jsxs)('table', {
          style: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
          children: [
            (0, E.jsx)('thead', {
              children: (0, E.jsxs)('tr', {
                children: [
                  (0, E.jsx)('th', { className: 'text-left', style: { border: '1px solid #ccc', padding: '8px' }, children: 'তারিখ' }),
                  (0, E.jsx)('th', { className: 'text-left', style: { border: '1px solid #ccc', padding: '8px' }, children: 'বিবরণ' }),
                  (0, E.jsx)('th', { className: 'text-center', style: { border: '1px solid #ccc', padding: '8px' }, children: 'রেফারেন্স' }),
                  (0, E.jsx)('th', { className: 'text-right', style: { border: '1px solid #ccc', padding: '8px' }, children: 'পরিমাণ' }),
                  (0, E.jsx)('th', { className: 'text-right', style: { border: '1px solid #ccc', padding: '8px' }, children: 'একক মূল্য' }),
                  (0, E.jsx)('th', { className: 'text-right', style: { border: '1px solid #ccc', padding: '8px' }, children: 'ক্রয় মূল্য' }),
                  (0, E.jsx)('th', { className: 'text-right', style: { border: '1px solid #ccc', padding: '8px' }, children: 'পরিশোধ' }),
                  (0, E.jsx)('th', { className: 'text-right', style: { border: '1px solid #ccc', padding: '8px' }, children: 'অবশিষ্ট' }),
                  (0, E.jsx)('th', { className: 'text-left', style: { border: '1px solid #ccc', padding: '8px' }, children: 'নোট' })
                ]
              })
            }),
            (0, E.jsx)('tbody', {
              children: loading ? (0, E.jsx)('tr', { children: (0, E.jsx)('td', { colSpan: 9, className: 'text-center', style: { padding: '20px' }, children: 'লোড হচ্ছে...' }) })
              : filtered.length === 0 ? (0, E.jsx)('tr', { children: (0, E.jsx)('td', { colSpan: 9, className: 'text-center', style: { padding: '20px' }, children: 'কোনো লেনদেন পাওয়া যায়নি' }) })
              : (() => {
                let runBal = openingBalance;
                return filtered.map(row => {
                  if (row.type === 'purchase') runBal += row.amount;
                  else runBal -= row.amount;
                  return (0, E.jsxs)('tr', {
                    key: (row.id || 0) + '-' + row.createdAt,
                    children: [
                      (0, E.jsx)('td', { className: 'text-left', style: { border: '1px solid #ccc', padding: '8px' }, children: formatDateDMY(row.date) }),
                      (0, E.jsx)('td', { className: 'text-left', style: { border: '1px solid #ccc', padding: '8px' }, children: row.note === 'প্রারম্ভিক জের' ? 'প্রারম্ভিক জের' : (row.type === 'purchase' ? I[supplier.itemCode].name : 'জমা/পরিশোধ') }),
                      (0, E.jsx)('td', { className: 'text-center', style: { border: '1px solid #ccc', padding: '8px' }, children: row.id || '' }),
                      (0, E.jsx)('td', { className: 'text-right', style: { border: '1px solid #ccc', padding: '8px' }, children: row.quantity ? D.format(row.quantity) : '' }),
                      (0, E.jsx)('td', { className: 'text-right', style: { border: '1px solid #ccc', padding: '8px' }, children: row.unitPricePoisha ? F(row.unitPricePoisha) : '' }),
                      (0, E.jsx)('td', { className: 'text-right', style: { border: '1px solid #ccc', padding: '8px' }, children: row.type === 'purchase' ? F(row.amount) : '' }),
                      (0, E.jsx)('td', { className: 'text-right', style: { border: '1px solid #ccc', padding: '8px' }, children: row.type === 'purchase' ? '' : F(row.amount) }),
                      (0, E.jsx)('td', { className: 'text-right', style: { border: '1px solid #ccc', padding: '8px' }, children: F(runBal) }),
                      (0, E.jsx)('td', { className: 'text-left', style: { border: '1px solid #ccc', padding: '8px' }, children: row.note || '' })
                    ]
                  });
                });
              })()
            })
          ]
        })
      ]
    })
  });
}







