// @ts-nocheck
/* eslint-disable */
"use client";
import "./DashboardApp.css";
import "./sidebar-collapse.css";
import "./mobile-navigation.css";
import "./header-cleanup.css";
import "./distribution-redesign.css";
import "./index.css";
import * as React from "react";
import * as JSXRuntime from "react/jsx-runtime";
import { ClipboardList, Ban, House } from "lucide-react";
import { SchoolDistributionAdjustment } from "./SchoolDistributionAdjustment";
import { ErrorBoundary } from "./ErrorBoundary";
import { formatDateDMY } from "../lib/date-format";
import { printDesktopLayout } from "../lib/desktop-print";
import { getDhakaClock } from "../lib/distribution-reporting-window";
const t = () => React;
const n = () => JSXRuntime;
const e = (obj, _) => obj;

var r = (...e) =>
    e
      .filter((e, t, n) => !!e && e.trim() !== `` && n.indexOf(e) === t)
      .join(` `)
      .trim(),
  i = (e) => e.replace(/([a-z0-9])([A-Z])/g, `$1-$2`).toLowerCase(),
  a = (e) =>
    e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) =>
      n ? n.toUpperCase() : t.toLowerCase(),
    ),
  o = (e) => {
    let t = a(e);
    return t.charAt(0).toUpperCase() + t.slice(1);
  },
  s = {
    xmlns: `http://www.w3.org/2000/svg`,
    width: 24,
    height: 24,
    viewBox: `0 0 24 24`,
    fill: `none`,
    stroke: `currentColor`,
    strokeWidth: 2,
    strokeLinecap: `round`,
    strokeLinejoin: `round`,
  },
  c = (e) => {
    for (let t in e)
      if (t.startsWith(`aria-`) || t === `role` || t === `title`) return !0;
    return !1;
  },
  l = e(t(), 1),
  u = (0, l.createContext)({}),
  d = () => (0, l.useContext)(u),
  f = (0, l.forwardRef)(
    (
      {
        color: e,
        size: t,
        strokeWidth: n,
        absoluteStrokeWidth: i,
        className: a = ``,
        children: o,
        iconNode: u,
        ...f
      },
      p,
    ) => {
      let {
          size: m = 24,
          strokeWidth: h = 2,
          absoluteStrokeWidth: g = !1,
          color: _ = `currentColor`,
          className: v = ``,
        } = d() ?? {},
        y = (i ?? g) ? (Number(n ?? h) * 24) / Number(t ?? m) : (n ?? h);
      return (0, l.createElement)(
        `svg`,
        {
          ref: p,
          ...s,
          width: t ?? m ?? s.width,
          height: t ?? m ?? s.height,
          stroke: e ?? _,
          strokeWidth: y,
          className: r(`lucide`, v, a),
          ...(!o && !c(f) && { "aria-hidden": `true` }),
          ...f,
        },
        [
          ...u.map(([e, t]) => (0, l.createElement)(e, t)),
          ...(Array.isArray(o) ? o : [o]),
        ],
      );
    },
  ),
  p = (e, t) => {
    let n = (0, l.forwardRef)(({ className: n, ...a }, s) =>
      (0, l.createElement)(f, {
        ref: s,
        iconNode: t,
        className: r(`lucide-${i(o(e))}`, `lucide-${e}`, n),
        ...a,
      }),
    );
    return ((n.displayName = o(e)), n);
  },
  m = p(`boxes`, [
    [
      `path`,
      {
        d: `M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z`,
        key: `lc1i9w`,
      },
    ],
    [`path`, { d: `m7 16.5-4.74-2.85`, key: `1o9zyk` }],
    [`path`, { d: `m7 16.5 5-3`, key: `va8pkn` }],
    [`path`, { d: `M7 16.5v5.17`, key: `jnp8gn` }],
    [
      `path`,
      {
        d: `M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z`,
        key: `8zsnat`,
      },
    ],
    [`path`, { d: `m17 16.5-5-3`, key: `8arw3v` }],
    [`path`, { d: `m17 16.5 4.74-2.85`, key: `8rfmw` }],
    [`path`, { d: `M17 16.5v5.17`, key: `k6z78m` }],
    [
      `path`,
      {
        d: `M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z`,
        key: `1xygjf`,
      },
    ],
    [`path`, { d: `M12 8 7.26 5.15`, key: `1vbdud` }],
    [`path`, { d: `m12 8 4.74-2.85`, key: `3rx089` }],
    [`path`, { d: `M12 13.5V8`, key: `1io7kd` }],
  ]),
  h = p(`calendar-range`, [
    [
      `rect`,
      { width: `18`, height: `18`, x: `3`, y: `4`, rx: `2`, key: `1hopcy` },
    ],
    [`path`, { d: `M16 2v4`, key: `4m81vk` }],
    [`path`, { d: `M3 10h18`, key: `8toen8` }],
    [`path`, { d: `M8 2v4`, key: `1cmpym` }],
    [`path`, { d: `M17 14h-6`, key: `bkmgh3` }],
    [`path`, { d: `M13 18H7`, key: `bb0bb7` }],
    [`path`, { d: `M7 14h.01`, key: `1qa3f1` }],
    [`path`, { d: `M17 18h.01`, key: `1bdyru` }],
  ]),
  g = p(`calendar-x-2`, [
    [`path`, { d: `M8 2v4`, key: `1cmpym` }],
    [`path`, { d: `M16 2v4`, key: `4m81vk` }],
    [
      `path`,
      {
        d: `M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8`,
        key: `3spt84`,
      },
    ],
    [`path`, { d: `M3 10h18`, key: `8toen8` }],
    [`path`, { d: `m17 22 5-5`, key: `1k6ppv` }],
    [`path`, { d: `m17 17 5 5`, key: `p7ous7` }],
  ]),
  v = p(`clipboard-check`, [
    [
      `rect`,
      {
        width: `8`,
        height: `4`,
        x: `8`,
        y: `2`,
        rx: `1`,
        ry: `1`,
        key: `tgr4d6`,
      },
    ],
    [
      `path`,
      {
        d: `M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2`,
        key: `116196`,
      },
    ],
    [`path`, { d: `m9 14 2 2 4-4`, key: `df797q` }],
  ]),
  y = p(`file-chart-column`, [
    [
      `path`,
      {
        d: `M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`,
        key: `1oefj6`,
      },
    ],
    [`path`, { d: `M14 2v5a1 1 0 0 0 1 1h5`, key: `wfsgrz` }],
    [`path`, { d: `M8 18v-1`, key: `zg0ygc` }],
    [`path`, { d: `M12 18v-6`, key: `17g6i2` }],
    [`path`, { d: `M16 18v-3`, key: `j5jt4h` }],
  ]),
  b = p(`handshake`, [
    [`path`, { d: `m11 17 2 2a1 1 0 1 0 3-3`, key: `efffak` }],
    [
      `path`,
      {
        d: `m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4`,
        key: `9pr0kb`,
      },
    ],
    [`path`, { d: `m21 3 1 11h-2`, key: `1tisrp` }],
    [`path`, { d: `M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3`, key: `1uvwmv` }],
    [`path`, { d: `M3 4h8`, key: `1ep09j` }],
  ]),
  x = p(`layout-dashboard`, [
    [
      `rect`,
      { width: `7`, height: `9`, x: `3`, y: `3`, rx: `1`, key: `10lvy0` },
    ],
    [
      `rect`,
      { width: `7`, height: `5`, x: `14`, y: `3`, rx: `1`, key: `16une8` },
    ],
    [
      `rect`,
      { width: `7`, height: `9`, x: `14`, y: `12`, rx: `1`, key: `1hutg5` },
    ],
    [
      `rect`,
      { width: `7`, height: `5`, x: `3`, y: `16`, rx: `1`, key: `ldoo1y` },
    ],
  ]),
  S = p(`map-pinned`, [
    [
      `path`,
      {
        d: `M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0`,
        key: `11u0oz`,
      },
    ],
    [`circle`, { cx: `12`, cy: `8`, r: `2`, key: `1822b1` }],
    [
      `path`,
      {
        d: `M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712`,
        key: `q8zwxj`,
      },
    ],
  ]),
  w = [
    {
      code: `AR-CND-71`,
      name: `চন্ডিগড়`,
      schoolCount: 17,
      dailyDemand: 2135,
      managerName: `ছাদেক আহমেদ (সোহেল)`,
      managerMobile: `01762598041`,
    },
    {
      code: `AR-PSV-24`,
      name: `পৌরসভা`,
      schoolCount: 12,
      dailyDemand: 1989,
      managerName: `মোঃ মারুফ মিয়া`,
      managerMobile: `01764530725`,
    },
    {
      code: `AR-DGP-83`,
      name: `দুর্গাপুর`,
      schoolCount: 13,
      dailyDemand: 1954,
      managerName: `মোঃ জালাল উদ্দিন`,
      managerMobile: `01345726989`,
    },
    {
      code: `AR-GKD-46`,
      name: `গাঁওকান্দিয়া`,
      schoolCount: 18,
      dailyDemand: 1655,
      managerName: `মোঃ আঃ সেলিম`,
      managerMobile: `01624405829`,
    },
    {
      code: `AR-JNJ-59`,
      name: `ঝাঞ্জাইল`,
      schoolCount: 20,
      dailyDemand: 3742,
      managerName: `মোঃ নজরুল ইসলাম`,
      managerMobile: `01710510546`,
    },
    {
      code: `AR-SBG-32`,
      name: `শিবগঞ্জ`,
      schoolCount: 18,
      dailyDemand: 2199,
      managerName: `মোঃ আলী হোসেন`,
      managerMobile: `01717692232`,
    },
    {
      code: `AR-BRS-68`,
      name: `বিরিশিরি`,
      schoolCount: 10,
      dailyDemand: 1242,
      managerName: `আবুল বাসার বাদসা`,
      managerMobile: `01834554703`,
    },
    {
      code: `AR-BKJ-17`,
      name: `বাকলজোড়া`,
      schoolCount: 18,
      dailyDemand: 2474,
      managerName: `শহিদুল ইসালাম (সোহাগ)`,
      managerMobile: `01301101531`,
    },
  ],
  T = [
    {
      serial: 1,
      name: `ভাদুয়া সপ্রাবি`,
      emisCode: `91304040102`,
      headTeacher: `মোঃ তোফায়েল হোসেন`,
      legacyMobile: `1710586342`,
      dailyDemand: 138,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 2,
      name: `মুন্সিপাড়া সপ্রাবি`,
      emisCode: `91304040101`,
      headTeacher: `মোঃ শফিকুল ইসলাম`,
      legacyMobile: `1711026017`,
      dailyDemand: 82,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 3,
      name: `শংকরপুর সপ্রাবি`,
      emisCode: `91304040109`,
      headTeacher: `মোঃ মোতাহার হোসেন(চঃদাঃ)`,
      legacyMobile: `1716944909`,
      dailyDemand: 232,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 4,
      name: `দুবরাজপুর সপ্রাবি`,
      emisCode: `91304040104`,
      headTeacher: `সোহানা খোশনিহার(ভার)`,
      legacyMobile: `1731909314`,
      dailyDemand: 113,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 5,
      name: `জাগিরপাড়া সপ্রাবি`,
      emisCode: `91304040103`,
      headTeacher: `মোঃ সেলিম (ভার)`,
      legacyMobile: `1712386441`,
      dailyDemand: 94,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 6,
      name: `দক্ষিণ জাগিরপাড়া সপ্রাবি`,
      emisCode: `91304040113`,
      headTeacher: `মো: এনামোল হক(ভার)`,
      legacyMobile: `1303804451`,
      dailyDemand: 72,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 7,
      name: `গাঁওকান্দিয়া সপ্রাবি`,
      emisCode: `91304040116`,
      headTeacher: `মুহাম্মদ হযরত আলী(চঃদাঃ)`,
      legacyMobile: `1719913066`,
      dailyDemand: 149,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 8,
      name: `মুন্সিপাড়া ভাদুয়া সপ্রাবি`,
      emisCode: `91304040115`,
      headTeacher: `মো: আফজাল হোসেন(ভার)`,
      legacyMobile: `1911691515`,
      dailyDemand: 73,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 9,
      name: `বন্দকাটুয়ারী সপ্রাবি`,
      emisCode: `91304040609`,
      headTeacher: `দুলাল মিয়া`,
      legacyMobile: `1913871991`,
      dailyDemand: 100,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 10,
      name: `কাকড়াকান্দা সপ্রাবি`,
      emisCode: `91304040610`,
      headTeacher: `আজহারুল হক (ভারঃ)`,
      legacyMobile: `1924818919`,
      dailyDemand: 88,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 11,
      name: `শশারপাড় সপ্রাবি,`,
      emisCode: `91304040611`,
      headTeacher: `সঞ্জয় চন্দ্র সরকার(ভারঃ)`,
      legacyMobile: `1911563470`,
      dailyDemand: 76,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 12,
      name: `১২ নং কুল্লাগড়া সপ্রাবি`,
      emisCode: `91304040603`,
      headTeacher: `রমা রাণী সরকার`,
      legacyMobile: `1729587160`,
      dailyDemand: 236,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 13,
      name: `রাণীখং সপ্রাবি,`,
      emisCode: `91304040612`,
      headTeacher: `তাহমিনা বেগম(ভার)`,
      legacyMobile: `1984798890`,
      dailyDemand: 175,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 14,
      name: `কাঁঠালখালী সপ্রাবি`,
      emisCode: `91304040601`,
      headTeacher: `মাজহারুল আনোয়ার`,
      legacyMobile: `1710672758`,
      dailyDemand: 95,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 15,
      name: `নন্দের গোপ সপ্রাবি`,
      emisCode: `91304040613`,
      headTeacher: `মোঃ মুসলেম উদ্দিন`,
      legacyMobile: `1818876543`,
      dailyDemand: 136,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 16,
      name: `ফারংপাড়া সপ্রাবি`,
      emisCode: `91304040205`,
      headTeacher: `শামছুন্নাহার বেগম`,
      legacyMobile: `1721860102`,
      dailyDemand: 180,
      areaName: `দুর্গাপুর`,
      areaCode: `AR-DGP-83`,
    },
    {
      serial: 17,
      name: `দুর্গাপুর সপ্রাবি`,
      emisCode: `91304040206`,
      headTeacher: `শামছুন্নাহার বেগম`,
      legacyMobile: `1818837497`,
      dailyDemand: 427,
      areaName: `পৌরসভা`,
      areaCode: `AR-PSV-24`,
    },
    {
      serial: 18,
      name: `সুসং সপ্রাবি`,
      emisCode: `91304040208`,
      headTeacher: `এমদাদ হোসেন চৌধুরী(চঃদাঃ)`,
      legacyMobile: `1865028959`,
      dailyDemand: 233,
      areaName: `পৌরসভা`,
      areaCode: `AR-PSV-24`,
    },
    {
      serial: 19,
      name: `মাকড়াইল সপ্রাবি`,
      emisCode: `91304040204`,
      headTeacher: `মোঃ মতিউর রহমান`,
      legacyMobile: `1957903454`,
      dailyDemand: 158,
      areaName: `দুর্গাপুর`,
      areaCode: `AR-DGP-83`,
    },
    {
      serial: 20,
      name: `২০ নং মেনকী সপ্রাবি`,
      emisCode: `91304040214`,
      headTeacher: `দুলাল চক্রবর্তী`,
      legacyMobile: `1716987675`,
      dailyDemand: 153,
      areaName: `দুর্গাপুর`,
      areaCode: `AR-DGP-83`,
    },
    {
      serial: 21,
      name: `কালিকাপুর সপ্রাবি`,
      emisCode: `91304040201`,
      headTeacher: `মোঃ নাজমুল হক(চঃদাঃ)`,
      legacyMobile: `1720018092`,
      dailyDemand: 164,
      areaName: `দুর্গাপুর`,
      areaCode: `AR-DGP-83`,
    },
    {
      serial: 22,
      name: `নলুয়াপাড়া সপ্রাবি`,
      emisCode: `91304040209`,
      headTeacher: `স্বপ্না দেবী রায়`,
      legacyMobile: `1718769456`,
      dailyDemand: 212,
      areaName: `দুর্গাপুর`,
      areaCode: `AR-DGP-83`,
    },
    {
      serial: 23,
      name: `গোপালপুর(উত্তর)সঃ প্রাঃ বিঃ`,
      emisCode: `91304040210`,
      headTeacher: `নকুল চন্দ্র কর্মকার`,
      legacyMobile: `1735050848`,
      dailyDemand: 175,
      areaName: `দুর্গাপুর`,
      areaCode: `AR-DGP-83`,
    },
    {
      serial: 24,
      name: `বারমারী সপ্রাবি`,
      emisCode: `91304040211`,
      headTeacher: `নাজমা আক্তার(ভার)`,
      legacyMobile: `1911248036`,
      dailyDemand: 185,
      areaName: `দুর্গাপুর`,
      areaCode: `AR-DGP-83`,
    },
    {
      serial: 25,
      name: `ধানশিরা সপ্রাবি`,
      emisCode: `91304040706`,
      headTeacher: `মাজেদা বেগম`,
      legacyMobile: `1912438465`,
      dailyDemand: 160,
      areaName: `পৌরসভা`,
      areaCode: `AR-PSV-24`,
    },
    {
      serial: 26,
      name: `চন্ডিগড় সপ্রাবি`,
      emisCode: `91304040707`,
      headTeacher: `কামরুন্নাহার খানম`,
      legacyMobile: `1986974580`,
      dailyDemand: 192,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 27,
      name: `মউ সপ্রাবি`,
      emisCode: `91304040703`,
      headTeacher: `আশিষ কুমার দে`,
      legacyMobile: `1761602225`,
      dailyDemand: 78,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 28,
      name: `নাগেরগাতী সপ্রাবি`,
      emisCode: `91304040708`,
      headTeacher: `সুমন চন্দ্র পন্ডিত (ভারঃ)`,
      legacyMobile: `1722788273`,
      dailyDemand: 154,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 29,
      name: `২৯ নং ফেচিয়া সপ্রাবি`,
      emisCode: `91304040704`,
      headTeacher: `মোঃ মোফাজ্জল হোসেন`,
      legacyMobile: `1924560880`,
      dailyDemand: 137,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 30,
      name: `নোয়াগাঁও সপ্রাবি`,
      emisCode: `91304040709`,
      headTeacher: `হাসিনা মমতাজ`,
      legacyMobile: `1747065667`,
      dailyDemand: 137,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 31,
      name: `সাতাশি সপ্রাবি`,
      emisCode: `91304040710`,
      headTeacher: `মোঃ আবু বকর সিদ্দিক`,
      legacyMobile: `1925032980`,
      dailyDemand: 170,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 32,
      name: `চৈতাটি সপ্রাবি`,
      emisCode: `91304040403`,
      headTeacher: `মোঃ আমিনুল ইসলাম`,
      legacyMobile: `1718223830`,
      dailyDemand: 108,
      areaName: `বিরিশিরি`,
      areaCode: `AR-BRS-68`,
    },
    {
      serial: 33,
      name: `দক্ষিণ ভবানীপুর সপ্রাবি`,
      emisCode: `91304040212`,
      headTeacher: `মোঃ রফিকুল ইসলাম`,
      legacyMobile: `1714794557`,
      dailyDemand: 188,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 34,
      name: `খালিশাপাড়া সপ্রাবি`,
      emisCode: `91304040406`,
      headTeacher: `মোস্তফা কামাল`,
      legacyMobile: `1721436700`,
      dailyDemand: 96,
      areaName: `বিরিশিরি`,
      areaCode: `AR-BRS-68`,
    },
    {
      serial: 35,
      name: `নওয়াপাড়া সপ্রাবি`,
      emisCode: `91304040407`,
      headTeacher: `দিপীকা রানী বর্মন`,
      legacyMobile: `1710152898`,
      dailyDemand: 142,
      areaName: `বিরিশিরি`,
      areaCode: `AR-BRS-68`,
    },
    {
      serial: 36,
      name: `রামপুর সপ্রাবি`,
      emisCode: `91304040408`,
      headTeacher: `মো: রফিকুল ইসলাম (ভারঃ)`,
      legacyMobile: `1719961050`,
      dailyDemand: 191,
      areaName: `বিরিশিরি`,
      areaCode: `AR-BRS-68`,
    },
    {
      serial: 37,
      name: `বিরিশিরি সঃ প্রাঃ বাঃ বিঃ`,
      emisCode: `91304040213`,
      headTeacher: `সাজেদা খাতুন`,
      legacyMobile: `1731403881`,
      dailyDemand: 77,
      areaName: `পৌরসভা`,
      areaCode: `AR-PSV-24`,
    },
    {
      serial: 38,
      name: `বিরিশিরি মডেল সঃ প্রাঃ বাঃ বিঃ`,
      emisCode: `91304040401`,
      headTeacher: `মিল্কা দেবী`,
      legacyMobile: `1814787817`,
      dailyDemand: 170,
      areaName: `পৌরসভা`,
      areaCode: `AR-PSV-24`,
    },
    {
      serial: 39,
      name: `কৃষ্ণেরচর সপ্রাবি`,
      emisCode: `91304040513`,
      headTeacher: `মির্জা মাসুদুর রহমান বেগ`,
      legacyMobile: `1717114513`,
      dailyDemand: 347,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 40,
      name: `রামবাড়ী সপ্রাবি`,
      emisCode: `91304040509`,
      headTeacher: `রেজাউল ইসলাম`,
      legacyMobile: `1718915060`,
      dailyDemand: 198,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 41,
      name: `৪১ নং ঝানজাইল সপ্রাবি`,
      emisCode: `91304040510`,
      headTeacher: `মোঃ বজলুল কাদের`,
      legacyMobile: `1913159453`,
      dailyDemand: 446,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 42,
      name: `পূর্ব কাকৈর গড়া সপ্রাবি`,
      emisCode: `91304040503`,
      headTeacher: `এ, কে, এম মঞ্জুরুল হক(চঃদাঃ)`,
      legacyMobile: `1754484329`,
      dailyDemand: 266,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 43,
      name: `দক্ষিণ গোপালপুর সপ্রাবি`,
      emisCode: `91304040511`,
      headTeacher: `সরকার জসীম উদ্দিন`,
      legacyMobile: `1917857554`,
      dailyDemand: 130,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 44,
      name: `৪৪ নং নগুয়া সপ্রাবি`,
      emisCode: `91304040508`,
      headTeacher: `মোঃ এমদাদুল হক`,
      legacyMobile: `1912533263`,
      dailyDemand: 228,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 45,
      name: `বায়রাউড়া সপ্রাবি`,
      emisCode: `91304040506`,
      headTeacher: `রৌশন আখতার খানম(চঃদাঃ)`,
      legacyMobile: `1911142350`,
      dailyDemand: 191,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 46,
      name: `বড়বাট্টা সপ্রাবি`,
      emisCode: `91304040512`,
      headTeacher: `সৈয়দা ফারজানা ইয়াসমিন(ভার)`,
      legacyMobile: `1739915990`,
      dailyDemand: 184,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 47,
      name: `শ্রীরামখিলা সপ্রাবি`,
      emisCode: `91304040303`,
      headTeacher: `মোঃ আমিনুল ইসলাম`,
      legacyMobile: `1713564054`,
      dailyDemand: 111,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 48,
      name: `গুজিরকোণা সপ্রাবি`,
      emisCode: `91304040302`,
      headTeacher: `মমতাজ বেগম`,
      legacyMobile: `1913926918`,
      dailyDemand: 311,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 49,
      name: `কুমুদগঞ্জ সপ্রাবি`,
      emisCode: `91304040306`,
      headTeacher: `মুহাম্মদ তরিকুল ইসলাম (চঃদাঃ)`,
      legacyMobile: `1920610857`,
      dailyDemand: 331,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 50,
      name: `নগরসিংহা সপ্রাবি`,
      emisCode: `91304040304`,
      headTeacher: `মোছাঃ মাহমুদা খাতুন(চঃদাঃ)`,
      legacyMobile: `1721271275`,
      dailyDemand: 208,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 51,
      name: `বাকলজোড়া সপ্রাবি`,
      emisCode: `91304040305`,
      headTeacher: `শাহান আরা বেগম(চঃদাঃ)`,
      legacyMobile: `1925002492`,
      dailyDemand: 95,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 52,
      name: `নয়াপাড়া সপ্রাবি`,
      emisCode: `91304040313`,
      headTeacher: `নূরুন্নাহার(ভার)`,
      legacyMobile: `1736825509`,
      dailyDemand: 147,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 53,
      name: `পাইকপাড়া সপ্রাবি`,
      emisCode: `91304040301`,
      headTeacher: `মো: সোহরাব হোসেন খান`,
      legacyMobile: `1625489909`,
      dailyDemand: 105,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 54,
      name: `নলজোড়া সপ্রাবি`,
      emisCode: `91304040604`,
      headTeacher: `নজরুল ইসলাম`,
      legacyMobile: `1916331257`,
      dailyDemand: 87,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 55,
      name: `কান্দাপাড়া সপ্রাবি`,
      emisCode: `91304040114`,
      headTeacher: `হাবিবুর রহমান(চঃদাঃ)`,
      legacyMobile: `1913832351`,
      dailyDemand: 98,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 56,
      name: `ফুলপুর সপ্রাবি`,
      emisCode: `91304040711`,
      headTeacher: `মো: আব্দুল হান্নান (ভার)`,
      legacyMobile: `1923902837`,
      dailyDemand: 83,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 57,
      name: `আড়াপাড়া সপ্রাবি`,
      emisCode: `91304040614`,
      headTeacher: `মো: নজরুল ইসলাম (ভার)`,
      legacyMobile: `1916311597`,
      dailyDemand: 152,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 58,
      name: `শ্যামনগর সপ্রাবি`,
      emisCode: `91304040307`,
      headTeacher: `দীপিকা দালবৎ(চঃদাঃ)`,
      legacyMobile: `1813621043`,
      dailyDemand: 163,
      areaName: `দুর্গাপুর`,
      areaCode: `AR-DGP-83`,
    },
    {
      serial: 59,
      name: `উত্তর কেট্টা সপ্রাবি।`,
      emisCode: `99304040407`,
      headTeacher: `বিউটি দাস(চঃদাঃ)`,
      legacyMobile: `1838854410`,
      dailyDemand: 88,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 60,
      name: `গোদারিয়া সপ্রাবি`,
      emisCode: `99304040302`,
      headTeacher: `মুহাম্মদ আসাদুল্লাহ খান(চঃদাঃ)`,
      legacyMobile: `1812147444`,
      dailyDemand: 118,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 61,
      name: `মাইজপাড়া সপ্রাবি`,
      emisCode: `99304040703`,
      headTeacher: `হীরেন কুমার দাস(চঃদাঃ)`,
      legacyMobile: `1918249529`,
      dailyDemand: 135,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 62,
      name: `নন্দেরছটি সপ্রাবি`,
      emisCode: `99304040702`,
      headTeacher: `মো: রফিক উদ্দিন`,
      legacyMobile: `1746944419`,
      dailyDemand: 88,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 63,
      name: `ডেউটুকোন সপ্রাবি`,
      emisCode: `99304040405`,
      headTeacher: `তারা মিয়া তালুকদার(ভারঃ)`,
      legacyMobile: `1724834267`,
      dailyDemand: 120,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 64,
      name: `কেরনখলা সপ্রাবি`,
      emisCode: `99304040603`,
      headTeacher: `মোঃ শামছুল হক`,
      legacyMobile: `1715732191`,
      dailyDemand: 150,
      areaName: `পৌরসভা`,
      areaCode: `AR-PSV-24`,
    },
    {
      serial: 65,
      name: `চাড়িয়া সপ্রাবি`,
      emisCode: `99304040404`,
      headTeacher: `মোঃ জহিরুল হক`,
      legacyMobile: `1713539144`,
      dailyDemand: 204,
      areaName: `দুর্গাপুর`,
      areaCode: `AR-DGP-83`,
    },
    {
      serial: 66,
      name: `আমড়াতলা সপ্রাবি`,
      emisCode: `99304040307`,
      headTeacher: `মর্জিনা বেগম`,
      legacyMobile: `1820558071`,
      dailyDemand: 113,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 67,
      name: `গৌরাখালীকান্দা সপ্রাবি`,
      emisCode: `99304040604`,
      headTeacher: `হালেমা বেগম`,
      legacyMobile: `1736635121`,
      dailyDemand: 73,
      areaName: `বিরিশিরি`,
      areaCode: `AR-BRS-68`,
    },
    {
      serial: 68,
      name: `চারিখাল সপ্রাবি`,
      emisCode: `99304040205`,
      headTeacher: `মোঃ শহিদুল ইসলাম (ভার:)`,
      legacyMobile: `1911078860`,
      dailyDemand: 103,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 69,
      name: `বুরুঙ্গাসঃ প্রাঃ বিঃ`,
      emisCode: `99304040607`,
      headTeacher: `রেহেনা খাতুন (ভার:)`,
      legacyMobile: `1721549027`,
      dailyDemand: 110,
      areaName: `পৌরসভা`,
      areaCode: `AR-PSV-24`,
    },
    {
      serial: 70,
      name: `পূর্ব রামনগর সপ্রাবি`,
      emisCode: `99304040304`,
      headTeacher: `মোঃ নজরুল ইসলাম (ভার)`,
      legacyMobile: `1834204900`,
      dailyDemand: 111,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 71,
      name: `৭১ নং কেট্রা সপ্রাবি`,
      emisCode: `99304040301`,
      headTeacher: `মো: হাবিবুর রহমান (ভার:)`,
      legacyMobile: `1918572674`,
      dailyDemand: 82,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 72,
      name: `আলমপুর সপ্রাবি`,
      emisCode: `99304040501`,
      headTeacher: `ছাবিকুন্নাহার বেগম`,
      legacyMobile: `1932235582`,
      dailyDemand: 140,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 73,
      name: `শান্তিপুর সপ্রাবি।`,
      emisCode: `99304040502`,
      headTeacher: `আব্দুল জব্বার (দায়িত্বে আছে)`,
      legacyMobile: `1924818926`,
      dailyDemand: 95,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 74,
      name: `তেলীপাড়া সপ্রাবি`,
      emisCode: `99304040408`,
      headTeacher: `মুহাম্মদ আবুল কাশেম(চঃদাঃ)`,
      legacyMobile: `1914201730`,
      dailyDemand: 135,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 75,
      name: `খুজিউড়া সপ্রাবি`,
      emisCode: `99304040602`,
      headTeacher: `সুলতানা নাসরিন`,
      legacyMobile: `1712750935`,
      dailyDemand: 180,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 76,
      name: `পূর্ব গোদারিয়া সপ্রাবি`,
      emisCode: `99304040706`,
      headTeacher: `মানিক চন্দ্র দে(চঃদাঃ)`,
      legacyMobile: `1733253480`,
      dailyDemand: 205,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 77,
      name: `গাড়াউন্দ সপ্রাবি`,
      emisCode: `99304040505`,
      headTeacher: `শাহানাজ পারভীন(চঃদাঃ)`,
      legacyMobile: `1725605272`,
      dailyDemand: 86,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 78,
      name: `বিলাশপুর সপ্রাবি`,
      emisCode: `99304040402`,
      headTeacher: `শেখ নাজিম উদ্দিন`,
      legacyMobile: `1626073550`,
      dailyDemand: 171,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 79,
      name: `চন্দ্রকোণা মায়ানগর সঃপ্রাঃবিঃ`,
      emisCode: `99304040705`,
      headTeacher: `ছবি রানী সিংহ রায়(চঃদাঃ)`,
      legacyMobile: `1716747483`,
      dailyDemand: 82,
      areaName: `দুর্গাপুর`,
      areaCode: `AR-DGP-83`,
    },
    {
      serial: 80,
      name: `দশাল সপ্রাবি`,
      emisCode: `99304040106`,
      headTeacher: `ইসমত আরা বেগম`,
      legacyMobile: `1920381732`,
      dailyDemand: 97,
      areaName: `দুর্গাপুর`,
      areaCode: `AR-DGP-83`,
    },
    {
      serial: 81,
      name: `হারিয়াউন্দ সপ্রাবি`,
      emisCode: `99304040203`,
      headTeacher: `মো: আবু সাঈদ (ভারঃ)`,
      legacyMobile: `1745416283`,
      dailyDemand: 152,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 82,
      name: `সাগরদীঘিরপাড় সপ্রাবি`,
      emisCode: `99304040606`,
      headTeacher: `মো: আব্দুল মোতালেব`,
      legacyMobile: `1715625234`,
      dailyDemand: 127,
      areaName: `বিরিশিরি`,
      areaCode: `AR-BRS-68`,
    },
    {
      serial: 83,
      name: `৮৩ নং নাথপাড়া সপ্রাবি`,
      emisCode: `99304040101`,
      headTeacher: `প্রনব কুমার পন্ডিত(চঃদাঃ)`,
      legacyMobile: `1721083322`,
      dailyDemand: 142,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 84,
      name: `৮৪ নং কৈলাটি সপ্রাবি`,
      emisCode: `99304040504`,
      headTeacher: `মোঃ আজিজুল ইসলাম খান`,
      legacyMobile: `1718659211`,
      dailyDemand: 159,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 85,
      name: `বালিচান্দা আলাউদ্দিন সপ্রাবি`,
      emisCode: `99304049001`,
      headTeacher: `মোঃ আঃ বারী`,
      legacyMobile: `1734226492`,
      dailyDemand: 111,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 86,
      name: `পলাশকান্দি সপ্রাবি`,
      emisCode: `99304040108`,
      headTeacher: `মোঃ মোশারফ হোসেন`,
      legacyMobile: `1813920180`,
      dailyDemand: 104,
      areaName: `বিরিশিরি`,
      areaCode: `AR-BRS-68`,
    },
    {
      serial: 87,
      name: `বড়ইউন্দ সপ্রাবি`,
      emisCode: `99304040503`,
      headTeacher: `নূরে জান্নাত খানম(চঃদাঃ)`,
      legacyMobile: `1739655166`,
      dailyDemand: 149,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 88,
      name: `ছোট কাটুরী সপ্রাবি`,
      emisCode: `99304040105`,
      headTeacher: `শাহিদুর রহমান বেগ`,
      legacyMobile: `1924031450`,
      dailyDemand: 85,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 89,
      name: `জাঙ্গালিয়াকান্দা সপ্রাবি`,
      emisCode: `99304040701`,
      headTeacher: `মোঃ ইদিছ আলী`,
      legacyMobile: `1731208960`,
      dailyDemand: 83,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 90,
      name: `ছনগড়া টংক শহীদ স্মৃতি সপ্রাবি`,
      emisCode: `99304040403`,
      headTeacher: `আজহারুল হক(চঃদাঃ)`,
      legacyMobile: `1710012506`,
      dailyDemand: 60,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 91,
      name: `পূর্ব বিলাসপুর সপ্রাবি`,
      emisCode: `99304040712`,
      headTeacher: `মোঃ আমিনুর রহমান তালুকদার`,
      legacyMobile: `1915421344`,
      dailyDemand: 126,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 92,
      name: `কালিকাবর সপ্রাবি`,
      emisCode: `99304040305`,
      headTeacher: `মোঃ আঃ সাহিদ`,
      legacyMobile: `1739536266`,
      dailyDemand: 109,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 93,
      name: `শিরবির সপ্রাবি`,
      emisCode: `99304050904`,
      headTeacher: `খলিলুর রহমান`,
      legacyMobile: `1712383576`,
      dailyDemand: 182,
      areaName: `বিরিশিরি`,
      areaCode: `AR-BRS-68`,
    },
    {
      serial: 94,
      name: `কুলুঞ্জা সপ্রাবি`,
      emisCode: `99304051101`,
      headTeacher: `ববিতা রানী সরকার`,
      legacyMobile: `1706471354`,
      dailyDemand: 122,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 95,
      name: `পূর্ব নন্দেরছটি সপ্রাবি`,
      emisCode: `99304051302`,
      headTeacher: `শাহজাহান মিয়া(ভারঃ)`,
      legacyMobile: `1791953625`,
      dailyDemand: 99,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 96,
      name: `গাভিনা শেখ তোফা হো স প্রা বি`,
      emisCode: `99304050402`,
      headTeacher: `চম্পা রানী দে`,
      legacyMobile: `1914070237`,
      dailyDemand: 142,
      areaName: `বিরিশিরি`,
      areaCode: `AR-BRS-68`,
    },
    {
      serial: 97,
      name: `কৃষ্ণপুর সপ্রাবি`,
      emisCode: `99304050603`,
      headTeacher: `মোঃ মাসুদুজ্জামান`,
      legacyMobile: `1865009558`,
      dailyDemand: 110,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 98,
      name: `পশ্চিম কোনাপাড়া সপ্রাবি`,
      emisCode: `99304050101`,
      headTeacher: `মনোয়ারা বেগম`,
      legacyMobile: `1761919422`,
      dailyDemand: 118,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 99,
      name: `বানিয়াপাড়া সপ্রাবি`,
      emisCode: `99304051005`,
      headTeacher: `মাকসুদা বেগম`,
      legacyMobile: `1916255737`,
      dailyDemand: 98,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 100,
      name: `১০০ নং মাদুরপাড় সপ্রাবি`,
      emisCode: `99304051403`,
      headTeacher: `মোঃ মজিবুর রহমান আকনজি`,
      legacyMobile: `1727718880`,
      dailyDemand: 98,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 101,
      name: `সুসঙ্গ আদর্শ বিদ্যা স প্রা বি`,
      emisCode: `99304051201`,
      headTeacher: `আলেয়া শারমীন(চঃদাঃ)`,
      legacyMobile: `1981246554`,
      dailyDemand: 144,
      areaName: `পৌরসভা`,
      areaCode: `AR-PSV-24`,
    },
    {
      serial: 102,
      name: `পশ্চিম কাকড়াকান্দা সপ্রাবি`,
      emisCode: `99304051505`,
      headTeacher: `মোঃ আনোয়ার হোসেন`,
      legacyMobile: `1947107383`,
      dailyDemand: 69,
      areaName: `শিবগঞ্জ`,
      areaCode: `AR-SBG-32`,
    },
    {
      serial: 103,
      name: `১০৩ নং বকেরচর সপ্রাবি`,
      emisCode: `99304041509`,
      headTeacher: `মোঃ আমিনুল ইসলাম(চঃদাঃ)`,
      legacyMobile: `1667365700`,
      dailyDemand: 134,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 104,
      name: `১০৪ নং সাংসা সপ্রাবি।`,
      emisCode: `99304041506`,
      headTeacher: `আঃ রব চৌধুরী(চঃদাঃ)`,
      legacyMobile: `1726868778`,
      dailyDemand: 126,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 105,
      name: `উত্তর নোয়াগাঁও সপ্রাবি`,
      emisCode: `99304041508`,
      headTeacher: `আবুল হোসেন আনুয়ারী`,
      legacyMobile: `1729634061`,
      dailyDemand: 112,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 106,
      name: `দক্ষিণ চারিগাঁওপাড়া সপ্রাবি`,
      emisCode: `99304041507`,
      headTeacher: `নাজমা বেগম`,
      legacyMobile: `1719960233`,
      dailyDemand: 84,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 107,
      name: `পূর্ব বাকলজোড়া সপ্রাবি`,
      emisCode: `99304041510`,
      headTeacher: `মোঃ ফারুক মোল্লাহ(চঃদাঃ)`,
      legacyMobile: `1713158966`,
      dailyDemand: 135,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 108,
      name: `বিরিশিরি পৌর সপ্রাবি`,
      emisCode: `99304049201`,
      headTeacher: `খাদিজা আক্তার পাপড়ী(চঃদাঃ)`,
      legacyMobile: `1919288664`,
      dailyDemand: 75,
      areaName: `পৌরসভা`,
      areaCode: `AR-PSV-24`,
    },
    {
      serial: 109,
      name: `মাঝিয়াইল সপ্রাবি`,
      emisCode: `99304049202`,
      headTeacher: `মোস্তাক আহাম্মদ(দায়িত্বে)`,
      legacyMobile: `1721144290`,
      dailyDemand: 182,
      areaName: `পৌরসভা`,
      areaCode: `AR-PSV-24`,
    },
    {
      serial: 110,
      name: `সাহাপুর সপ্রাবি`,
      emisCode: `99304049203`,
      headTeacher: `মো: রোকন উদ্দিন(ভারঃ)`,
      legacyMobile: `1736837202`,
      dailyDemand: 82,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 111,
      name: `চুকাইখালী সপ্রাবি`,
      emisCode: `99304049204`,
      headTeacher: `সুমন চন্দ্র পন্ডিত (ভারঃ)`,
      legacyMobile: `1718734701`,
      dailyDemand: 97,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 112,
      name: `বনগ্রাম সপ্রাবি`,
      emisCode: `99304049205`,
      headTeacher: `রফিক আহাম্মদ(ভারঃ)`,
      legacyMobile: `1834037671`,
      dailyDemand: 95,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 113,
      name: `পূর্ব জাঙ্গালিয়াকান্দা সঃপ্রাঃবিঃ`,
      emisCode: `99304049206`,
      headTeacher: `উম্মে আছমা(ভার:)`,
      legacyMobile: `1779986726`,
      dailyDemand: 72,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 114,
      name: `কানাইল সপ্রাবি`,
      emisCode: `99304049207`,
      headTeacher: `আবুল কাশেম(চঃদাঃ)`,
      legacyMobile: `1916621582`,
      dailyDemand: 77,
      areaName: `বিরিশিরি`,
      areaCode: `AR-BRS-68`,
    },
    {
      serial: 115,
      name: `আগার সপ্রাবি`,
      emisCode: `99304049208`,
      headTeacher: `মোস্তফা কামালুর রশিদ(চঃদাঃ)`,
      legacyMobile: `1710012321`,
      dailyDemand: 83,
      areaName: `দুর্গাপুর`,
      areaCode: `AR-DGP-83`,
    },
    {
      serial: 116,
      name: `শুকনাকুড়ি সপ্রাবি`,
      emisCode: `99304049209`,
      headTeacher: `প্রীতিলতা দেবনাথ(চঃদাঃ)`,
      legacyMobile: `1715247139`,
      dailyDemand: 199,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 117,
      name: `নাওদ্বারা সপ্রাবি`,
      emisCode: `99304049210`,
      headTeacher: `মমতাজ বেগম(ভারঃ)`,
      legacyMobile: `1737484128`,
      dailyDemand: 40,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 118,
      name: `মজিব নগর সপ্রাবি`,
      emisCode: `99304049211`,
      headTeacher: `মো: শাহজাহান মিয়া(দায়িত্বে)`,
      legacyMobile: `1725427495`,
      dailyDemand: 137,
      areaName: `পৌরসভা`,
      areaCode: `AR-PSV-24`,
    },
    {
      serial: 119,
      name: `চরমোক্তার পাড়া সপ্রাবি`,
      emisCode: `99304049212`,
      headTeacher: `নাসরিন রহমান(চঃদাঃ)`,
      legacyMobile: `1742779857`,
      dailyDemand: 124,
      areaName: `পৌরসভা`,
      areaCode: `AR-PSV-24`,
    },
    {
      serial: 120,
      name: `তিতারজান সপ্রাবি`,
      emisCode: `99304049213`,
      headTeacher: `অনিমা দাস(চ:দা)`,
      legacyMobile: `1718711260`,
      dailyDemand: 102,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 121,
      name: `উত্তর ফারংপাড়া সপ্রাবি`,
      emisCode: `99304049214`,
      headTeacher: `শিঊলী সোম(চঃদাঃ)`,
      legacyMobile: `1710582311`,
      dailyDemand: 98,
      areaName: `দুর্গাপুর`,
      areaCode: `AR-DGP-83`,
    },
    {
      serial: 122,
      name: `হরচাপটাবিল সপ্রাবি`,
      emisCode: `99304049215`,
      headTeacher: `মোঃ অলি উল্লাহ্(ভারঃ)`,
      legacyMobile: `1794609033`,
      dailyDemand: 60,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
    {
      serial: 123,
      name: `দক্ষিণ ছোট কাঠুরী স প্রা বি`,
      emisCode: `99304049302`,
      headTeacher: `সালমা আক্তার(চঃদাঃ)`,
      legacyMobile: `1981466428`,
      dailyDemand: 113,
      areaName: `বাকলজোড়া`,
      areaCode: `AR-BKJ-17`,
    },
    {
      serial: 124,
      name: `লোহারগাঁও সপ্রাবি`,
      emisCode: `99304049301`,
      headTeacher: `সামিনা ইয়াসমিন(চঃদাঃ)`,
      legacyMobile: `1745480941`,
      dailyDemand: 99,
      areaName: `চন্ডিগড়`,
      areaCode: `AR-CND-71`,
    },
    {
      serial: 125,
      name: `গন্ডাবেড় সপ্রাবি`,
      emisCode: `99304049303`,
      headTeacher: `শাহানারা সেলিনা(চঃদাঃ)`,
      legacyMobile: `1721858943`,
      dailyDemand: 95,
      areaName: `ঝাঞ্জাইল`,
      areaCode: `AR-JNJ-59`,
    },
    {
      serial: 126,
      name: `আটলা সপ্রাবি`,
      emisCode: `99304049304`,
      headTeacher: `ফাহিমা খাতুন্(ভারঃ)`,
      legacyMobile: `1775484621`,
      dailyDemand: 67,
      areaName: `গাঁওকান্দিয়া`,
      areaCode: `AR-GKD-46`,
    },
  ],
  E = n(),
  D = new Intl.NumberFormat(`bn-BD`),
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
  };
function R(e, t, n) {
  let r = [],
    i = new Date(e);
  for (let e = 0; e < 21 && r.length < n; e += 1) {
    let n = new Date(i);
    (n.setDate(i.getDate() + e),
      (A[n.getDay()] ?? []).includes(t) && r.push(n));
  }
  return r;
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
function B({ userName: e, userEmail: t, userRole: accountRole, userAreaCode: userAreaCode }) {
  let [n, r] = (0, l.useState)(`dashboard`), [cssReady, setCssReady] = (0, l.useState)(!1),
    [sidebarCollapsed, setSidebarCollapsed] = (0, l.useState)(!1),
    [isMounted, setIsMounted] = (0, l.useState)(!1),
    _mountEffect = (0, l.useEffect)(() => {
      let savedTab = sessionStorage.getItem('activeTab');
      if (savedTab && savedTab !== 'dashboard') r(savedTab);
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
          if (!cancelled && rows.length) {
            g(rows.map((school, index) => ({
              serial: Number(school.serial_number ?? index + 1),
              name: school.name_bn,
              emisCode: school.emis_code,
              headTeacher: school.head_teacher ?? ``,
              legacyMobile: school.legacy_mobile ?? ``,
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
    [monthlyPlanName, setMonthlyPlanName] = (0, l.useState)(``),
    _monthlyPlanEffect = (0, l.useEffect)(() => {
      let cancelled = !1;
      async function loadMonthlyPlan() {
        try {
          let month = c.slice(0, 7),
            response = await fetch(`/api/meal-plan?month=${month}`, { cache: `no-store` });
          if (!response.ok) throw Error(`monthly plan unavailable`);
          let payload = await response.json();
          if (cancelled) return;
          if (payload.source !== `configured`) {
            setMonthlyPlanCounts(null);
            setMonthlyRemainingCounts(null);
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
          setMonthlyPlanName(payload.periodName ?? ``);
        } catch {
          if (!cancelled) {
            setMonthlyPlanCounts(null);
            setMonthlyRemainingCounts(null);
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
    [_, v] = (0, l.useState)(null),
    [y, b] = (0, l.useState)(``),
    [x, S] = (0, l.useState)(``),
    O = (0, l.useMemo)(() => {
      let e = d.trim().toLocaleLowerCase(`bn`);
      return h.filter((t) => {
        let n = i === `সব অঞ্চল` || t.areaName === i,
          r =
            !e ||
            t.name.toLocaleLowerCase(`bn`).includes(e) ||
            t.emisCode.includes(e) ||
            t.headTeacher.toLocaleLowerCase(`bn`).includes(e);
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
    F = A[P.getDay()] ?? [],
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
          `প্রধান শিক্ষক`,
          `একদিনের এক আইটেমের চাহিদা`,
        ],
        ...e.map((e) => [
          e.serial,
          e.areaName,
          e.name,
          e.emisCode,
          e.headTeacher,
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
  async function X() {
    if (!_) return;
    let e = Number(y);
    if (!Number.isInteger(e) || e <= 0) {
      S(`চাহিদা অবশ্যই শূন্যের চেয়ে বড় পূর্ণ সংখ্যা হতে হবে।`);
      return;
    }
    try {
      if (
        !(
          await fetch(`/api/schools/${_.emisCode}/demand`, {
            method: `PATCH`,
            headers: { "content-type": `application/json` },
            body: JSON.stringify({
              dailyDemand: e,
              reason: `ম্যানুয়াল সংশোধন`,
            }),
          })
        ).ok
      )
        throw Error(`save failed`);
      (g((t) =>
        t.map((t) =>
          t.emisCode === _.emisCode ? { ...t, dailyDemand: e } : t,
        ),
      ),
        v(null),
        S(`একদিনের এক আইটেমের চাহিদা সফলভাবে হালনাগাদ হয়েছে।`));
    } catch {
      S(
        `Local preview-তে পরিবর্তনটি সংরক্ষণ করা যায়নি। প্রকাশিত সংস্করণে database সক্রিয় থাকবে।`,
      );
    }
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
            children: (accountRole === `area_manager`
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
            children: [
              (0, E.jsx)(`span`, { className: `live-dot` }),
              (0, E.jsxs)(`p`, {
                children: [
                  (0, E.jsx)(`strong`, { children: `সিস্টেম সচল` }),
                  (0, E.jsx)(`small`, {
                    children: `সর্বশেষ ডেটা: ১২৬ বিদ্যালয়`,
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
                    onEdit: (e) => {
                      (v(e), b(String(e.dailyDemand)));
                    },
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
            }),
          n === `stock` &&
            (0, E.jsx)(G, { dailyDemand: N, startDate: P, areaFilter: i }),
          n === `reports` &&
            (0, E.jsx)(K, {
              dailyDemand: N,
              areaFilter: i,
              onExport: () => Y(O),
            }),
          n === `suppliers` && (0, E.jsx)(q, {}),
        ],
      }),
      _ &&
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
                children: `চাহিদা সংশোধন`,
              }),
              (0, E.jsx)(`h2`, { children: _.name }),
              (0, E.jsxs)(`p`, {
                children: [`EMIS: `, _.emisCode, ` · `, _.areaName],
              }),
              (0, E.jsxs)(`label`, {
                children: [
                  `একদিনের এক আইটেমের চাহিদা`,
                  (0, E.jsx)(`input`, {
                    type: `number`,
                    min: `1`,
                    value: y,
                    onChange: (e) => b(e.target.value),
                    autoFocus: !0,
                  }),
                ],
              }),
              (0, E.jsxs)(`div`, {
                className: `modal-actions`,
                children: [
                  (0, E.jsx)(`button`, {
                    className: `button-secondary`,
                    type: `button`,
                    onClick: () => v(null),
                    children: `বাতিল`,
                  }),
                  (0, E.jsx)(`button`, {
                    className: `button-primary`,
                    type: `button`,
                    onClick: X,
                    children: `সংরক্ষণ করুন`,
                  }),
                ],
              }),
            ],
          }),
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
}) {
  let i = t.length > 0 ? t.join(` ও `) : `আজ বিতরণ নেই`,
    a = Math.max(...w.map((e) => e.dailyDemand)),
    unitPrices = { bun: 13.5, egg: 10, banana: 6 },
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
                ? 126
                : (w.find((e) => e.name === r)?.schoolCount ?? 0),
            ),
            note: `Excel থেকে যাচাইকৃত`,
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
function U({
  query: e,
  setQuery: t,
  schools: n,
  total: r,
  page: i,
  pageCount: a,
  setPage: o,
  onEdit: s,
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
                placeholder: `বিদ্যালয়, EMIS বা প্রধান শিক্ষকের নাম`,
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
                  (0, E.jsx)(`th`, { children: `প্রধান শিক্ষক` }),
                  (0, E.jsx)(`th`, {
                    className: `number-cell`,
                    children: `একদিনের চাহিদা`,
                  }),
                  (0, E.jsx)(`th`, { className: `no-print`, children: `কাজ` }),
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
                      (0, E.jsx)(`td`, { children: e.headTeacher }),
                      (0, E.jsxs)(`td`, {
                        className: `number-cell`,
                        children: [
                          (0, E.jsx)(`strong`, {
                            children: D.format(e.dailyDemand),
                          }),
                          ` পিস`,
                        ],
                      }),
                      (0, E.jsx)(`td`, {
                        className: `no-print`,
                        children: (0, E.jsx)(`button`, {
                          className: `table-action`,
                          type: `button`,
                          onClick: () => s(e),
                          children: `সংশোধন`,
                        }),
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
}) {
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
              (0, E.jsx)(`span`, {
                className: `distribution-section-icon`,
                "aria-hidden": `true`,
                children: (0, E.jsx)(h, {}),
              }),
              (0, E.jsxs)(`div`, {
                children: [
                  
                  (0, E.jsx)(`h2`, { children: `সাপ্তাহিক খাবারের রুটিন` }),
                ],
              }),
            ],
          }),
          (0, E.jsx)(`div`, {
            className: `routine-list`,
            children: [
              [`রবিবার`, `বনরুটি + সিদ্ধ ডিম`, (0, E.jsxs)(`div`, { className: `routine-food-photo-pair`, children: [(0, E.jsx)(`img`, { src: `/food-thumbnails/bread-roll.png`, alt: `বনরুটি`, className: `routine-food-photo` }), (0, E.jsx)(`img`, { src: `/food-thumbnails/boiled-egg.png`, alt: `সিদ্ধ ডিম`, className: `routine-food-photo` })] })],
              [`সোমবার`, `বনরুটি`, (0, E.jsx)(`img`, { src: `/food-thumbnails/bread-roll.png`, alt: `বনরুটি`, className: `routine-food-photo` })],
              [`মঙ্গলবার`, `কলা`, (0, E.jsx)(`img`, { src: `/food-thumbnails/banana.png`, alt: `কলা`, className: `routine-food-photo` })],
              [`বুধবার`, `বনরুটি + সিদ্ধ ডিম`, (0, E.jsxs)(`div`, { className: `routine-food-photo-pair`, children: [(0, E.jsx)(`img`, { src: `/food-thumbnails/bread-roll.png`, alt: `বনরুটি`, className: `routine-food-photo` }), (0, E.jsx)(`img`, { src: `/food-thumbnails/boiled-egg.png`, alt: `সিদ্ধ ডিম`, className: `routine-food-photo` })] })],
              [`বৃহস্পতিবার`, `বনরুটি + সিদ্ধ ডিম`, (0, E.jsxs)(`div`, { className: `routine-food-photo-pair`, children: [(0, E.jsx)(`img`, { src: `/food-thumbnails/bread-roll.png`, alt: `বনরুটি`, className: `routine-food-photo` }), (0, E.jsx)(`img`, { src: `/food-thumbnails/boiled-egg.png`, alt: `সিদ্ধ ডিম`, className: `routine-food-photo` })] })],
              [`শুক্রবার`, `বিতরণ নেই`, (0, E.jsx)(Ban, { size: 16, color: '#dc2626', fill: '#fecaca' })],
              [`শনিবার`, `বিতরণ নেই`, (0, E.jsx)(Ban, { size: 16, color: '#dc2626', fill: '#fecaca' })],
            ].map(([e, t, n]) =>
              (0, E.jsxs)(
                `article`,
                {
                  className: `routine-day-card`,
                  children: [
                    (0, E.jsx)(`strong`, {
                      className: `routine-day`,
                      children: e,
                    }),
                    (0, E.jsxs)(`div`, {
                      className: `routine-food`,
                      children: [
                        (0, E.jsx)(`div`, {
                          className: `routine-food-icon`,
                          children: n,
                        }),
                        (0, E.jsx)(`p`, { children: t }),
                      ],
                    }),
                  ],
                },
                e,
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
              (0, E.jsx)(`span`, {
                className: `distribution-section-icon distribution-section-icon-amber`,
                "aria-hidden": `true`,
                children: (0, E.jsx)(v, {}),
              }),
              (0, E.jsxs)(`div`, {
                children: [
                  (0, E.jsx)(`p`, {
                    className: `eyebrow`,
                    children: `দৈনিক পরিকল্পনা`,
                  }),
                  (0, E.jsx)(`h2`, { children: k.format(e) }),
                ],
              }),
              (0, E.jsx)(`span`, {
                className: `status-badge status-good`,
                children: r,
              }),
            ],
          }),
          n.length
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
                    children: n.map((e) =>
                      (0, E.jsxs)(
                        `article`,
                        {
                          children: [
                            (0, E.jsx)(`span`, { children: e.slice(0, 1) }),
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
                        children: D.format(t * n.length),
                      }),
                    ],
                  }),
                ],
              })
            : (0, E.jsxs)(`div`, {
                className: `empty-state`,
                children: [
                  (0, E.jsx)(`span`, {
                    className: `distribution-empty-icon`,
                    "aria-hidden": `true`,
                    children: (0, E.jsx)(g, {}),
                  }),
                  (0, E.jsx)(`strong`, {
                    children: `এই দিনে কোনো বিতরণ নির্ধারিত নেই`,
                  }),
                  (0, E.jsx)(`p`, {
                    children: `শুক্রবার, শনিবার অথবা নির্বাচিত item রুটিনে নেই।`,
                  }),
                ],
              }),
        ],
      }),
    ],
  }),
  (0, E.jsx)(ErrorBoundary, {
        children: (0, E.jsx)(SchoolDistributionAdjustment, { accountRole: accountRole, userAreaCode: userAreaCode })
      }),
    ],
  });
}
function G({ dailyDemand: e, startDate: t, areaFilter: n }) {
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
    [stockOutArea, setStockOutArea] = (0, l.useState)(``),
    [stockLedgerItem, setStockLedgerItem] = (0, l.useState)(`all`),
    [stockLedgerFrom, setStockLedgerFrom] = (0, l.useState)(``),
    [stockLedgerTo, setStockLedgerTo] = (0, l.useState)(``),
    [stockLedgerPage, setStockLedgerPage] = (0, l.useState)(1);
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
  let K =
      g === `stock_in`
        ? Math.round((Number(v) || 0) * (Number(O) || 0) * 100)
        : 0,
    q = Math.round((Number(j) || 0) * 100),
    J = K - q,
    Y = s.find((e) => e.id === Number(suppId)),
    X = { bun: u, egg: f, banana: 1 },
    Z = Object.keys(I).map((n) => {
      let i = I[n],
        a = X[n],
        o = R(t, i.routineName, a),
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
            areaCode: g === `stock_out` ? stockOutArea : null,
            unitPricePoisha:
              g === `stock_in` ? Math.round((Number(O) || 0) * 100) : 0,
            paidAmountPoisha: g === `stock_in` ? q : 0,
          }),
        }),
        n = await e.json();
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
      A(e.unitPricePoisha ? String(e.unitPricePoisha / 100) : ``),
      N(e.paidAmountPoisha ? String(e.paidAmountPoisha / 100) : ``),
      H(`সম্পাদনার জন্য লেনদেনের তথ্য ফর্মে লোড হয়েছে`));
  }
  async function te() {
    if (z && confirm(`আপনি কি নিশ্চিত যে এই লেনদেনটি মুছে ফেলতে চান?`)) {
      (W(!0), H(``));
      try {
        let e = await fetch(`/api/stock?id=${z}`, { method: `DELETE` }),
          t = await e.json();
        if (!e.ok) throw Error(t.error);
        (H(`লেনদেনটি মুছে ফেলা হয়েছে।`), $(), await G());
      } catch (e) {
        H(P(e, `মুছে ফেলা যায়নি।`));
      } finally {
        W(!1);
      }
    }
  }
  function $() {
    (B(null), y(``), C(``), setSuppId(``), A(``), N(``), H(``));
  }
  function printStockLedger() {
    printDesktopLayout(`printing-stock-ledger`);
  }
  return (0, E.jsxs)(`div`, {
    className: `stock-workspace`,
    children: [
      (0, E.jsxs)(`section`, {
        className: `panel stock-planner`,
        children: [
          (0, E.jsxs)(`div`, {
            className: `panel-head`,
            children: [
              (0, E.jsxs)(`div`, {
                children: [
                  (0, E.jsx)(`h2`, { children: `কত দিনের পণ্য একসাথে কিনবেন` }),
                  (0, E.jsxs)(`p`, {
                    className: `panel-subtitle`,
                    children: [n, ` · শুরু `, k.format(t)],
                  }),
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
                            children: formatDateDMY(e),
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
          (0, E.jsxs)(`div`, {
            className: `stock-formula`,
            children: [
              (0, E.jsx)(`strong`, {
                children: `ক্রয় পরিমাণ = নির্বাচিত দিনের মোট চাহিদা − বর্তমান ব্যবহারযোগ্য স্টক`,
              }),
              (0, E.jsx)(`span`, {
                children: `নষ্ট বা ইস্যুকৃত পণ্য স্টক লেনদেন দেওয়ার সঙ্গে সঙ্গে মজুত থেকে বাদ যাবে।`,
              }),
            ],
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
                          (_(t), t !== `stock_in` && (setSuppId(``), A(``), N(``)));
                        },
                        children: Object.keys(L).map((e) =>
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
                        (0, E.jsxs)(`select`, {
                          required: !0,
                          value: stockOutArea,
                          onChange: (e) => setStockOutArea(e.target.value),
                          children: [
                            (0, E.jsx)(`option`, {
                              value: ``,
                              children: `অঞ্চল নির্বাচন করুন`,
                            }),
                            w.map((area) =>
                              (0, E.jsx)(
                                `option`,
                                { value: area.code, children: area.name },
                                area.code,
                              ),
                            ),
                          ],
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
                                      e.transactionType === 'stock_out' && e.areaCode ? ` · ${w.find(a => a.code === e.areaCode)?.name || 'অজানা অঞ্চল'}` : ''
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
                              (0, E.jsx)(`button`, {
                                className: `ledger-edit button-secondary`,
                                type: `button`,
                                onClick: () => ee(e),
                                children: `এডিট`,
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
                                    (e.areaCode ? w.find((a) => a.code === e.areaCode)?.name : ``) ||
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
    [ledg, setLedg] = (0, l.useState)(null);
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
    (m(null), a(``), s(``), u(``), f(``), setOpeningBalance(``));
  }
  return (0, E.jsx)(`div`, {
    className: `stock-workspace`,
    children: (0, E.jsxs)(`section`, {
      className: `panel supplier-panel`,
      children: [
        (0, E.jsx)(`div`, {
          className: `panel-head`,
          children: (0, E.jsxs)(`div`, {
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
        }),
        (0, E.jsxs)(`form`, {
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
                                      setOpeningBalance(e.openingBalancePoisha ? String(e.openingBalancePoisha / 100) : ``));
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







