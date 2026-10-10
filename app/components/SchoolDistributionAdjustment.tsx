"use client";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import "./DashboardApp.css";
import serialMapping from "./serial_mapping.json";
import { getAreaManagerReportingWindow, getDhakaClock } from "../lib/distribution-reporting-window";
import { formatDateDMY } from "../lib/date-format";
import { printDesktopLayout } from "../lib/desktop-print";

export function SchoolDistributionAdjustment({ accountRole, userAreaCode, userSchoolEmis, onDateChange }: { accountRole: string, userAreaCode?: string, userSchoolEmis?: string, onDateChange?: (date: string) => void }) {
  const problemTypeMapping = {
    less_item: 'কম আইটেম পাওয়া গেছে',
    more_item: 'বেশি আইটেম পাওয়া গেছে',
    no_item: 'কোনো আইটেম পাওয়া যায়নি',
    wrong_item: 'ভুল আইটেম পাওয়া গেছে',
    school_closed: 'স্কুল বন্ধ ছিল',
    other: 'অন্যান্য'
  };
  const adjustmentReasons = [
    'পরবর্তী বিতরণে সমন্বয়',
    'পুনরায় সরবরাহ',
    'ঘাটতি পূরণ',
    'নষ্ট পণ্য পরিবর্তন',
    'রিপোর্ট গ্রহণ করে সমাপ্ত',
    'রিপোর্ট ভুল / বাতিল',
    'অন্যান্য',
  ];
  const quantityResolutionDirections: Record<string, 'shortage'> = {
    'পুনরায় সরবরাহ': 'shortage',
    'ঘাটতি পূরণ': 'shortage',
    'নষ্ট পণ্য পরিবর্তন': 'shortage',
  };

  const [schools, setSchools] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [receivedBread, setReceivedBread] = useState<number>(0);
  const [receivedEgg, setReceivedEgg] = useState<number>(0);
  const [receivedBanana, setReceivedBanana] = useState<number>(0);
  const [problemType, setProblemType] = useState('less_item');
  const [reason, setReason] = useState('');
  const [resolutionReason, setResolutionReason] = useState('');
  const [comments, setComments] = useState('');
  const [resolutionItems, setResolutionItems] = useState({ bun: 0, egg: 0, banana: 0 });
  const [selectedResolutionItem, setSelectedResolutionItem] = useState<'bun' | 'egg' | 'banana' | ''>('');
  const [isSavingResolution, setIsSavingResolution] = useState(false);

  const [filterDate, setFilterDate] = useState(() => getDhakaClock().date);
  const [filterArea, setFilterArea] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [printingAllRows, setPrintingAllRows] = useState(false);
  const [focusedSchoolEmis, setFocusedSchoolEmis] = useState('');
  const [configuredMealItems, setConfiguredMealItems] = useState<string[] | null>(null);

  useEffect(() => {
    onDateChange?.(filterDate);
  }, [filterDate, onDateChange]);

  const printDistributionReport = useCallback(() => {
    setPrintingAllRows(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        printDesktopLayout('printing-distribution-report', () => setPrintingAllRows(false));
      });
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (accountRole !== 'tiffin_manager' && params.get('date')) setFilterDate(params.get('date') as string);
      if (params.get('area')) setFilterArea(params.get('area') as string);
      if (params.get('status')) setFilterStatus(params.get('status') as string);
      if (params.get('school')) setFocusedSchoolEmis(params.get('school') as string);
    }
  }, [accountRole]);

  useEffect(() => {
    const openReport = (event: Event) => {
      const detail = (event as CustomEvent<{ areaCode?: string; date?: string; status?: string; schoolEmis?: string }>).detail || {};
      if (accountRole !== 'tiffin_manager' && detail.date) setFilterDate(detail.date);
      if (accountRole === 'super_admin' && detail.areaCode) setFilterArea(detail.areaCode);
      if (detail.status) setFilterStatus(detail.status);
      setFocusedSchoolEmis(detail.schoolEmis || '');
    };
    window.addEventListener('open-distribution-report', openReport);
    return () => window.removeEventListener('open-distribution-report', openReport);
  }, [accountRole]);

  useEffect(() => {
    let cancelled = false;
    const loadMealPlan = async () => {
      try {
        const response = await fetch(`/api/meal-plan?date=${encodeURIComponent(filterDate)}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Meal plan unavailable');
        const result = await response.json() as { source?: string; items?: Array<{ code: string }> };
        if (!cancelled) setConfiguredMealItems(result.source === 'configured' ? (result.items || []).map((item) => item.code) : null);
      } catch {
        if (!cancelled) setConfiguredMealItems(null);
      }
    };
    void loadMealPlan();
    const refresh = () => void loadMealPlan();
    window.addEventListener('meal-plan-updated', refresh);
    return () => { cancelled = true; window.removeEventListener('meal-plan-updated', refresh); };
  }, [filterDate]);

  useEffect(() => {
    if (!focusedSchoolEmis || loading) return;
    const row = document.querySelector<HTMLElement>(`[data-distribution-school="${focusedSchoolEmis}"]`);
    row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusedSchoolEmis, loading, reports]);
  
  const d = new Date(filterDate);
  const filterDay = !isNaN(d.getTime()) ? d.getDay() : -1;
  
  let showBread = configuredMealItems?.includes('bun') || false;
  let showEgg = configuredMealItems?.includes('egg') || false;
  let showBanana = configuredMealItems?.includes('banana') || false;
  
  if (configuredMealItems === null && (filterDay === 0 || filterDay === 3 || filterDay === 4)) { // Sun, Wed, Thu
    showBread = true;
    showEgg = true;
  } else if (configuredMealItems === null && filterDay === 1) { // Mon
    showBread = true;
  } else if (configuredMealItems === null && filterDay === 2) { // Tue
    showBanana = true;
  }
  const hasScheduledItems = showBread || showEgg || showBanana;

  const reportingWindow = getAreaManagerReportingWindow(filterDate, currentTime);
  const isLockedForManager = accountRole !== 'super_admin' && (!reportingWindow.canReport || !hasScheduledItems);
  
  const [areas, setAreas] = useState<any[]>([]);

  useEffect(() => {
    if (accountRole === 'super_admin') {
      fetch('/api/areas').then(res => res.json()).then((data: any) => {
        setAreas(data.areas || []);
      }).catch(e => console.error(e));
    }
  }, [accountRole]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const ts = Date.now();
      const schoolRes = await fetch(`/api/schools?_t=${ts}`, { cache: 'no-store' });
      const schoolData = await schoolRes.json() as any;
      
      let filteredSchools = schoolData.schools || [];
      if (accountRole === 'tiffin_manager') {
        filteredSchools = filteredSchools.filter((s: any) => s.emis_code === userSchoolEmis);
      } else if (accountRole === 'area_manager' && userAreaCode) {
        filteredSchools = filteredSchools.filter((s: any) => s.area_code === userAreaCode);
      } else if (filterArea) {
        filteredSchools = filteredSchools.filter((s: any) => s.area_code === filterArea);
      }
      setSchools(filteredSchools);

      let url = `/api/distribution-reports?date=${filterDate}&_t=${ts}`;
      if (filterArea) url += `&areaCode=${filterArea}`;
      const reportsRes = await fetch(url, { cache: 'no-store' });
      const reportsData = await reportsRes.json() as any;
      setReports(reportsData.reports || []);

    } catch (e) {
      console.error("Failed to fetch distribution data", e);
    }
    setLoading(false);
  }, [accountRole, filterArea, filterDate, userAreaCode, userSchoolEmis]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterArea, filterDate, filterStatus, pageSize]);

  function handleReportClick(school: any) {
    setSelectedSchool(school);
    
    const existing = reports.find(r => r.school_emis_code === school.emis_code);
    if (existing) {
      setReceivedBread(existing.received_bread || 0);
      setReceivedEgg(existing.received_egg || 0);
      setReceivedBanana(existing.received_banana || 0);
      setProblemType(existing.problem_type === 'none' ? 'less_item' : (existing.problem_type || 'less_item'));
      setReason(existing.reason || '');
      setResolutionReason(existing.resolution_action || existing.resolution_reason || '');
      setComments(existing.resolution_note || (existing.comments === 'অটো-রিসিভড (২ টার পর)' ? '' : (existing.comments || '')));
      setResolutionItems({ bun: 0, egg: 0, banana: 0 });
      setSelectedResolutionItem('');
    } else {
      setReceivedBread(school.current_daily_demand || 0);
      setReceivedEgg(school.current_daily_demand || 0);
      setReceivedBanana(school.current_daily_demand || 0);
      setProblemType('less_item');
      setReason('');
      setResolutionReason('');
      setComments('');
      setResolutionItems({ bun: 0, egg: 0, banana: 0 });
      setSelectedResolutionItem('');
    }
    
    setIsModalOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSchool) return;

    const planned = selectedSchool.current_daily_demand || 0;
    const sBread = Math.max(0, planned - receivedBread);
    const eBread = Math.max(0, receivedBread - planned);
    const sEgg = Math.max(0, planned - receivedEgg);
    const eEgg = Math.max(0, receivedEgg - planned);
    const sBanana = Math.max(0, planned - receivedBanana);
    const eBanana = Math.max(0, receivedBanana - planned);
    const existing = reports.find(r => r.school_emis_code === selectedSchool.emis_code);

    if (accountRole === 'super_admin' && !adjustmentReasons.includes(resolutionReason)) {
      alert('সমন্বয়ের কারণ নির্বাচন করুন।');
      return;
    }
    if (accountRole === 'super_admin' && ['অন্যান্য', 'রিপোর্ট ভুল / বাতিল'].includes(resolutionReason) && !comments.trim()) {
      alert('এই ব্যবস্থার জন্য মন্তব্য লিখুন।');
      return;
    }
    const quantityDirection = quantityResolutionDirections[resolutionReason];
    if (accountRole === 'super_admin' && quantityDirection && !selectedResolutionItem) {
      alert('পার্থক্য ও বর্তমান বকেয়া থেকে একটি আইটেম নির্বাচন করুন।');
      return;
    }
    if (accountRole === 'super_admin' && quantityDirection && selectedResolutionItem && resolutionItems[selectedResolutionItem] <= 0) {
      alert('সমন্বয় করা আইটেমের সংখ্যা লিখুন।');
      return;
    }

    const payload = {
      date: filterDate,
      schoolEmisCode: selectedSchool.emis_code,
      areaCode: selectedSchool.area_code,
      plannedBread: planned,
      plannedEgg: planned,
      plannedBanana: planned,
      receivedBread,
      receivedEgg,
      receivedBanana,
      shortageBread: sBread,
      shortageEgg: sEgg,
      shortageBanana: sBanana,
      excessBread: eBread,
      excessEgg: eEgg,
      excessBanana: eBanana,
      problemType: existing?.problem_type || (accountRole === 'super_admin' ? 'none' : problemType),
      reason: existing?.reason || (accountRole === 'super_admin' ? 'অ্যাডমিন কর্তৃক সরাসরি সমন্বয়' : reason),
      resolutionReason: accountRole === 'super_admin' ? resolutionReason : undefined,
      resolutionAction: accountRole === 'super_admin' ? resolutionReason : undefined,
      resolutionNote: accountRole === 'super_admin' ? comments : undefined,
      resolutionItems: accountRole === 'super_admin' ? resolutionItems : undefined,
      resolutionItemCode: accountRole === 'super_admin' ? selectedResolutionItem : undefined,
      comments,
      status: accountRole === 'super_admin'
        ? resolutionReason === 'পরবর্তী বিতরণে সমন্বয়' ? 'under_review' : 'resolved'
        : undefined
    };

    try {
      setIsSavingResolution(true);
      const url = existing ? `/api/distribution-reports/${existing.id}` : `/api/distribution-reports`;
      const method = existing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to save report: ${res.status} - ${errText}`);
      }

      setIsModalOpen(false);
      fetchData();
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error saving report.");
    } finally {
      setIsSavingResolution(false);
    }
  }

  let totalBread = 0;
  let totalEgg = 0;
  let totalBanana = 0;
  let totalShortageBread = 0;
  let totalShortageEgg = 0;
  let totalShortageBanana = 0;
  let totalExcessBread = 0;
  let totalExcessEgg = 0;
  let totalExcessBanana = 0;

  schools.forEach((school) => {
    const report = reports.find(r => r.school_emis_code === school.emis_code);
    const planned = school.current_daily_demand || 0;
    const isAutoReceived = !report && reportingWindow.shouldAutoReceive;

    if (showBread) {
      if (isAutoReceived) {
        totalBread += planned;
      } else if (report) {
        totalBread += Number(report.received_bread) || 0;
        const diff = Number(report.outstanding_shortage_bun ?? report.shortage_bread ?? 0) - Number(report.outstanding_excess_bun ?? report.excess_bread ?? 0);
        if (diff > 0) totalShortageBread += diff;
        else if (diff < 0) totalExcessBread += Math.abs(diff);
      }
    }
    if (showEgg) {
      if (isAutoReceived) {
        totalEgg += planned;
      } else if (report) {
        totalEgg += Number(report.received_egg) || 0;
        const diff = Number(report.outstanding_shortage_egg ?? report.shortage_egg ?? 0) - Number(report.outstanding_excess_egg ?? report.excess_egg ?? 0);
        if (diff > 0) totalShortageEgg += diff;
        else if (diff < 0) totalExcessEgg += Math.abs(diff);
      }
    }
    if (showBanana) {
      if (isAutoReceived) {
        totalBanana += planned;
      } else if (report) {
        totalBanana += Number(report.received_banana) || 0;
        const diff = Number(report.outstanding_shortage_banana ?? report.shortage_banana ?? 0) - Number(report.outstanding_excess_banana ?? report.excess_banana ?? 0);
        if (diff > 0) totalShortageBanana += diff;
        else if (diff < 0) totalExcessBanana += Math.abs(diff);
      }
    }
  });

  const engToBnNumber = (num: number | string) => String(num).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[Number(d)]);

  const totalsText = [
    showBread && `${engToBnNumber(totalBread)} টি রুটি`,
    showEgg && `${engToBnNumber(totalEgg)} টি ডিম`,
    showBanana && `${engToBnNumber(totalBanana)} টি কলা`
  ].filter(Boolean).join(' এবং ');

  const shortageText = [
    showBread && totalShortageBread > 0 && `${engToBnNumber(totalShortageBread)} টি রুটি`,
    showEgg && totalShortageEgg > 0 && `${engToBnNumber(totalShortageEgg)} টি ডিম`,
    showBanana && totalShortageBanana > 0 && `${engToBnNumber(totalShortageBanana)} টি কলা`
  ].filter(Boolean).join(', ');

  const excessText = [
    showBread && totalExcessBread > 0 && `${engToBnNumber(totalExcessBread)} টি রুটি`,
    showEgg && totalExcessEgg > 0 && `${engToBnNumber(totalExcessEgg)} টি ডিম`,
    showBanana && totalExcessBanana > 0 && `${engToBnNumber(totalExcessBanana)} টি কলা`
  ].filter(Boolean).join(', ');

  const headerDate = mounted ? formatDateDMY(currentTime) : 'তারিখ লোড হচ্ছে...';
  const headerTime = mounted
    ? currentTime.toLocaleTimeString('bn-BD', {
        timeZone: 'Asia/Dhaka',
        timeStyle: 'medium'
      })
    : 'সময় লোড হচ্ছে...';

  const reportBySchool = new Map(reports.map((report) => [report.school_emis_code, report]));
  const isIssueReport = (report: any) => ['new', 'under_review', 'partially_resolved'].includes(report?.status);
  const isAutomaticReport = (report: any) => report?.confirmation_source === 'system' || report?.comments === 'অটো-রিসিভড (২ টার পর)';
  const sortedFilteredSchools = [...schools]
    .filter((school) => {
      const report = reportBySchool.get(school.emis_code);
      if (!filterStatus) return true;
      if (filterStatus === 'new' || filterStatus === 'issue') return isIssueReport(report);
      if (filterStatus === 'resolved') return report?.status === 'resolved' && !isAutomaticReport(report);
      if (filterStatus === 'auto') return isAutomaticReport(report);
      if (filterStatus === 'pending') return !report;
      return true;
    })
    .sort((a, b) => ((serialMapping as any)[a.emis_code] || 9999) - ((serialMapping as any)[b.emis_code] || 9999));
  const totalPages = Math.max(1, Math.ceil(sortedFilteredSchools.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSchools = printingAllRows
    ? sortedFilteredSchools
    : sortedFilteredSchools.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);
  const issueCount = schools.filter((school) => isIssueReport(reportBySchool.get(school.emis_code))).length;
  const automaticCount = schools.filter((school) => isAutomaticReport(reportBySchool.get(school.emis_code))).length;
  const pendingCount = schools.filter((school) => !reportBySchool.get(school.emis_code)).length;
  const selectedReport = selectedSchool ? reportBySchool.get(selectedSchool.emis_code) : null;
  const drawerItems = [
    { code: 'bun', label: 'বনরুটি', plannedField: 'planned_bread', receivedField: 'received_bread', shortageField: 'shortage_bread', excessField: 'excess_bread', visible: showBread },
    { code: 'egg', label: 'সিদ্ধ ডিম', plannedField: 'planned_egg', receivedField: 'received_egg', shortageField: 'shortage_egg', excessField: 'excess_egg', visible: showEgg },
    { code: 'banana', label: 'কলা', plannedField: 'planned_banana', receivedField: 'received_banana', shortageField: 'shortage_banana', excessField: 'excess_banana', visible: showBanana },
  ].filter((item) => item.visible);
  const selectedQuantityDirection = quantityResolutionDirections[resolutionReason];
  const canResolveSelectedReport = accountRole === 'super_admin' && isIssueReport(selectedReport);

  return (
    <section id="distribution-exceptions" className="panel distribution-exceptions" style={{ gridColumn: "1 / -1", marginBottom: '24px' }}>
      <div className="panel-head distribution-panel-head distribution-exceptions-head no-print">
        <div className="distribution-exceptions-title">
          <h2>{accountRole === 'tiffin_manager' ? 'আমার বিদ্যালয়ের বিতরণ রিপোর্ট' : 'স্কুলভিত্তিক বিতরণ সমন্বয়'}</h2>
          <div className="distribution-header-meta">
            <span>{headerDate}</span>
            <span>সময় {headerTime}</span>
          </div>
        </div>
        <button 
          className="button-primary distribution-print-button no-print"
          onClick={printDistributionReport}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          প্রিন্ট করুন
        </button>
      </div>

      <div className="distribution-exceptions-body">
        <div className="print-only" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '8px', fontWeight: 'bold' }}>স্কুলভিত্তিক বিতরণ</h2>
          <p style={{ fontSize: '16px', margin: 0, marginBottom: '6px' }}>
            অঞ্চল: {accountRole === 'area_manager' ? (areas.find(a => a.code === userAreaCode)?.name_bn || areas.find(a => a.code === userAreaCode)?.name || 'অজানা') : (filterArea ? areas.find(a => a.code === filterArea)?.name_bn || areas.find(a => a.code === filterArea)?.name || 'অজানা' : 'সকল অঞ্চল')} | তারিখ: {formatDateDMY(filterDate)}
          </p>
          <p style={{ fontSize: '15px', margin: 0, fontWeight: 600, color: '#333' }}>
            আইটেম বিতরনঃ {totalsText}
            {(shortageText || excessText) && (
              <span style={{ fontWeight: 'normal', color: '#555', marginLeft: '6px' }}>
                | {shortageText && `ঘাটতি: ${shortageText}`}{shortageText && excessText && ' এবং '}{excessText && `অতিরিক্ত: ${excessText}`}
              </span>
            )}
          </p>
        </div>
        {accountRole === 'super_admin' && (
          <div className="distribution-summary-grid no-print" aria-label="বিতরণ রিপোর্টের সারসংক্ষেপ">
            <article className="distribution-summary-card is-total">
              <span className="distribution-summary-icon">▦</span>
              <div><small>মোট স্কুল</small><strong>{engToBnNumber(schools.length)}</strong><span>টি স্কুল</span></div>
            </article>
            <article className="distribution-summary-card is-issue">
              <span className="distribution-summary-icon">!</span>
              <div><small>সমস্যা আছে</small><strong>{engToBnNumber(issueCount)}</strong><span>টি স্কুল</span></div>
            </article>
            <article className="distribution-summary-card is-pending">
              <span className="distribution-summary-icon">◷</span>
              <div>
                <small>{reportingWindow.shouldAutoReceive ? 'স্বয়ংক্রিয়ভাবে নিশ্চিত' : 'অটো কনফার্ম বাকি'}</small>
                <strong>{engToBnNumber(reportingWindow.shouldAutoReceive ? automaticCount : pendingCount)}</strong>
                <span>টি স্কুল{!reportingWindow.shouldAutoReceive && ' · দুপুর ২টার পর'}</span>
              </div>
            </article>
          </div>
        )}
        {isLockedForManager && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#fff3cd', border: '1px solid #ffe69c', borderRadius: '8px', color: '#664d03', fontSize: '13px' }}>
            <strong>সতর্কতা:</strong> {!hasScheduledItems
              ? 'এই তারিখে কোনো আইটেম বিতরণ নির্ধারিত নেই।'
              : <>{accountRole === 'tiffin_manager' ? 'টিফিন ম্যানেজার শুধু নিজের বিদ্যালয়ের বিতরণের দিন দুপুর ২টার আগে রিপোর্ট করতে পারবেন।' : 'এরিয়া ম্যানেজার শুধু বিতরণের দিন দুপুর ২টার আগে রিপোর্ট করতে পারবেন।'} সময় শেষ হওয়ায় বরাদ্দকৃত আইটেম স্কুলে সঠিকভাবে বিতরণ হয়েছে বলে ধরা হয়েছে।</>}
          </div>
        )}

        <div className="distribution-exception-filters no-print" style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
            তারিখ:
            <input 
              type="date" 
              lang="en-GB"
              value={filterDate} 
              onChange={e => setFilterDate(e.target.value)} 
              disabled={accountRole === 'tiffin_manager'}
              title={accountRole === 'tiffin_manager' ? 'টিফিন ম্যানেজার শুধু আজকের বিতরণ রিপোর্ট করতে পারবেন' : undefined}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }}
            />
          </label>
          
          {accountRole === 'super_admin' && (
            <>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                অঞ্চল:
                <select value={filterArea} onChange={e => setFilterArea(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                  <option value="">সকল অঞ্চল</option>
                  {areas.map(a => <option key={a.code} value={a.code}>{a.name_bn || a.name}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                স্ট্যাটাস:
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                  <option value="">সব স্ট্যাটাস</option>
                  <option value="issue">সমাধান প্রয়োজন</option>
                  <option value="pending">রিপোর্টের অপেক্ষায়</option>
                  <option value="auto">স্বয়ংক্রিয়ভাবে নিশ্চিত</option>
                  <option value="resolved">সমন্বয় সম্পন্ন</option>
                </select>
              </label>
            </>
          )}

          <div className="distribution-filter-refresh">
            <button type="button" className="button-secondary" onClick={() => void fetchData()} disabled={loading}>
              ↻ {loading ? 'লোড হচ্ছে…' : 'রিফ্রেশ করুন'}
            </button>
          </div>
        </div>

        <div className="table-responsive">
          {(() => {
            const allocatedItems = [];
            if (showBread) allocatedItems.push('রুটি');
            if (showEgg) allocatedItems.push('ডিম');
            if (showBanana) allocatedItems.push('কলা');
            const allocatedHeader = allocatedItems.length > 0 ? `বরাদ্দ (${allocatedItems.join('/')})` : 'বরাদ্দ (ছুটি)';

            return (
              <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
                <table className="data-table responsive-adjustment-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface)' }}>
                      <th style={{ textAlign: 'center', padding: '12px', width: '60px' }}>ক্রমিক</th>
                      <th style={{ textAlign: 'left', padding: '12px' }}>স্কুলের নাম</th>
                      <th style={{ textAlign: 'right', padding: '12px' }}>{allocatedHeader}</th>
                      <th style={{ textAlign: 'right', padding: '12px' }}>প্রাপ্ত</th>
                      <th style={{ textAlign: 'right', padding: '12px' }}>ঘাটতি/অতিরিক্ত</th>
                      <th style={{ textAlign: 'center', padding: '12px' }}>স্ট্যাটাস</th>
                      <th className="no-print" style={{ textAlign: 'center', padding: '12px' }}>অ্যাকশন</th>
                    </tr>
                  </thead>
            <tbody>
              {(() => {
                const formatItems = (items: { amount: number; unit: string }[]) => {
                  if (items.length === 0) return '-';
                  return items.map((item, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && ' এবং '}
                      <span style={{ fontWeight: 'bold' }}>{item.amount}</span> {item.unit}
                    </React.Fragment>
                  ));
                };

                return paginatedSchools.map((school) => {
                  const report = reports.find(r => r.school_emis_code === school.emis_code);
                  const planned = school.current_daily_demand || 0;
                  const serialNum = (serialMapping as any)[school.emis_code] || '-';

                  const plannedItems = [];
                  if (showBread) plannedItems.push({ amount: planned, unit: 'রুটি' });
                  if (showEgg) plannedItems.push({ amount: planned, unit: 'ডিম' });
                  if (showBanana) plannedItems.push({ amount: planned, unit: 'কলা' });
                  const plannedNode = formatItems(plannedItems);

                  let receivedNode: React.ReactNode = '-';
                  let shortageNode: React.ReactNode = '-';
                  let isShortage = false;
                  let hasExcess = false;

                  const isAutoReceived = hasScheduledItems && (isAutomaticReport(report) || (!report && reportingWindow.shouldAutoReceive));
                  
                  if (!isAutoReceived && report) {
                    const receivedItems = [];
                    if (showBread) receivedItems.push({ amount: report.received_bread, unit: 'রুটি' });
                    if (showEgg) receivedItems.push({ amount: report.received_egg, unit: 'ডিম' });
                    if (showBanana) receivedItems.push({ amount: report.received_banana, unit: 'কলা' });
                    
                    if (receivedItems.length > 0) receivedNode = formatItems(receivedItems);

                    const shortageItems = [];
                    let hasShortage = false;
                    if (showBread) { 
                      const diff = Number(report.outstanding_shortage_bun ?? report.shortage_bread) - Number(report.outstanding_excess_bun ?? report.excess_bread);
                      if (diff > 0) { shortageItems.push({ amount: diff, unit: 'রুটি (ঘাটতি)' }); hasShortage = true; }
                      else if (diff < 0) { shortageItems.push({ amount: Math.abs(diff), unit: 'রুটি (অতিরিক্ত)' }); hasExcess = true; }
                    }
                    if (showEgg) { 
                      const diff = Number(report.outstanding_shortage_egg ?? report.shortage_egg) - Number(report.outstanding_excess_egg ?? report.excess_egg);
                      if (diff > 0) { shortageItems.push({ amount: diff, unit: 'ডিম (ঘাটতি)' }); hasShortage = true; }
                      else if (diff < 0) { shortageItems.push({ amount: Math.abs(diff), unit: 'ডিম (অতিরিক্ত)' }); hasExcess = true; }
                    }
                    if (showBanana) { 
                      const diff = Number(report.outstanding_shortage_banana ?? report.shortage_banana) - Number(report.outstanding_excess_banana ?? report.excess_banana);
                      if (diff > 0) { shortageItems.push({ amount: diff, unit: 'কলা (ঘাটতি)' }); hasShortage = true; }
                      else if (diff < 0) { shortageItems.push({ amount: Math.abs(diff), unit: 'কলা (অতিরিক্ত)' }); hasExcess = true; }
                    }
                    if (shortageItems.length > 0) shortageNode = formatItems(shortageItems);
                    if (hasShortage) isShortage = true;
                  } else if (isAutoReceived) {
                    const receivedItems = [];
                    if (showBread) receivedItems.push({ amount: planned, unit: 'রুটি' });
                    if (showEgg) receivedItems.push({ amount: planned, unit: 'ডিম' });
                    if (showBanana) receivedItems.push({ amount: planned, unit: 'কলা' });
                    if (receivedItems.length > 0) receivedNode = formatItems(receivedItems);
                  }

                  return (
                    <tr
                      key={school.emis_code}
                      data-distribution-school={school.emis_code}
                      className={school.emis_code === focusedSchoolEmis ? 'distribution-notification-target' : undefined}
                      style={{ borderBottom: '1px solid var(--line)' }}
                    >
                      <td style={{ textAlign: 'center', padding: '12px', color: 'var(--ink-light)' }}>
                        {serialNum}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <strong>{school.name_bn}</strong>
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px', whiteSpace: 'nowrap' }}>{plannedNode}</td>
                      
                      {report || isAutoReceived ? (
                        <>
                          <td style={{ textAlign: 'right', padding: '12px', whiteSpace: 'nowrap' }}>
                            {receivedNode}
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px', color: isShortage ? 'var(--red)' : (hasExcess ? 'var(--green)' : 'inherit'), whiteSpace: 'nowrap' }}>
                            {shortageNode}
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px' }}>
                            {isAutoReceived ? (
                              <span style={{ 
                                padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                                background: '#d1e7dd', color: '#0f5132'
                              }}>
                                স্বয়ংক্রিয়ভাবে নিশ্চিত
                              </span>
                            ) : (
                              <>
                                <span style={{ 
                                  padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                                  background: isIssueReport(report) ? '#fff3cd' :
                                              report.status === 'resolved' ? '#d1e7dd' : '#e2e3e5'
                                }}>
                                  {report.status === 'new' ? 'সমাধান প্রয়োজন'
                                    : report.status === 'under_review' ? 'সমন্বয়ের অপেক্ষায়'
                                    : report.status === 'partially_resolved' ? 'আংশিক সমন্বিত'
                                    : report.status === 'resolved' ? (report.problem_type === 'none' ? 'সম্পূর্ণ প্রাপ্ত' : 'সমন্বয় সম্পন্ন')
                                    : report.status}
                                </span>
                                <div className="distribution-status-reason">
                                  {isIssueReport(report)
                                    ? `কারণ: ${report.reason || (problemTypeMapping as any)[report.problem_type] || 'উল্লেখ নেই'}`
                                    : report.status === 'resolved' && report.resolution_reason
                                      ? `সমন্বয়ের কারণ: ${report.resolution_reason}`
                                      : ''}
                                </div>
                              </>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ textAlign: 'right', padding: '12px', color: 'var(--ink-light)' }}>-</td>
                          <td style={{ textAlign: 'right', padding: '12px', color: 'var(--ink-light)' }}>-</td>
                          <td style={{ textAlign: 'center', padding: '12px', color: 'var(--ink-light)' }}>রিপোর্ট নেই</td>
                        </>
                      )}
                      
                      <td className="no-print" style={{ textAlign: 'center', padding: '12px' }}>
                        {accountRole === 'super_admin' && (!report || isAutoReceived) ? <span className="distribution-empty-action">—</span> : (
                          <button
                            className="button-secondary"
                            onClick={() => handleReportClick(school)}
                            disabled={isLockedForManager}
                            style={{ opacity: isLockedForManager ? 0.5 : 1, cursor: isLockedForManager ? 'not-allowed' : 'pointer' }}
                          >
                            {accountRole === 'super_admin' ? 'দেখুন' : 'রিপোর্ট করুন'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                });
              })()}
              {schools.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: 'var(--ink-light)' }}>
                    কোনো স্কুল পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
          );
        })()}
        <div className="distribution-pagination no-print">
          <span>মোট {engToBnNumber(sortedFilteredSchools.length)}টি স্কুল</span>
          <div className="distribution-pagination-controls">
            <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={safeCurrentPage === 1}>‹</button>
            <strong>{engToBnNumber(safeCurrentPage)}</strong>
            <span>/ {engToBnNumber(totalPages)}</span>
            <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={safeCurrentPage === totalPages}>›</button>
          </div>
          <label>প্রতি পেইজে
            <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
              <option value={10}>১০</option>
              <option value={20}>২০</option>
              <option value={50}>৫০</option>
              <option value={100}>১০০</option>
              <option value={200}>২০০</option>
            </select>
          </label>
        </div>
      </div>
      </div>

      {isModalOpen && selectedSchool && (
        <div className="distribution-drawer-layer" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsModalOpen(false);
        }}>
          <aside className="distribution-resolution-drawer" role="dialog" aria-modal="true" aria-label="বিদ্যালয়ের বিতরণ সমন্বয়">
            <header className="distribution-drawer-header">
              <div>
                <span>{accountRole === 'super_admin' ? 'বিদ্যালয়ের বিতরণ বিস্তারিত' : 'বিতরণ সমস্যা অভিযোগ'}</span>
                <h3>{selectedSchool.name_bn}</h3>
                <small>{formatDateDMY(filterDate)} · EMIS {selectedSchool.emis_code}</small>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} aria-label="বন্ধ করুন">×</button>
            </header>

            <form onSubmit={handleFormSubmit} className="distribution-drawer-form">
              <section className="distribution-drawer-section">
                <h4>বরাদ্দ</h4>
                <div className="distribution-drawer-items">
                  {drawerItems.map((item) => (
                    <article key={`planned-${item.code}`}>
                      <span>{item.label}</span>
                      <strong>{engToBnNumber(Number(selectedReport?.[item.plannedField] ?? selectedSchool.current_daily_demand ?? 0))}টি</strong>
                    </article>
                  ))}
                </div>
              </section>

              <section className="distribution-drawer-section">
                <h4>প্রাপ্ত পরিমাণ</h4>
                {accountRole === 'super_admin' ? (
                  <div className="distribution-drawer-items">
                    {drawerItems.map((item) => (
                      <article key={`received-${item.code}`}>
                        <span>{item.label}</span>
                        <strong>{engToBnNumber(Number(selectedReport?.[item.receivedField] ?? 0))}টি</strong>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="distribution-drawer-inputs">
                    {showBread && <label>বনরুটি<input type="number" min="0" required value={receivedBread} onChange={e => setReceivedBread(Number(e.target.value))} /></label>}
                    {showEgg && <label>সিদ্ধ ডিম<input type="number" min="0" required value={receivedEgg} onChange={e => setReceivedEgg(Number(e.target.value))} /></label>}
                    {showBanana && <label>কলা<input type="number" min="0" required value={receivedBanana} onChange={e => setReceivedBanana(Number(e.target.value))} /></label>}
                  </div>
                )}
              </section>

              {selectedReport && (
                <section className="distribution-drawer-section">
                  <h4>পার্থক্য ও বর্তমান বকেয়া</h4>
                  <div className="distribution-difference-grid">
                    {drawerItems.map((item) => {
                      const shortage = Number(selectedReport[`outstanding_shortage_${item.code}`] ?? selectedReport[item.shortageField] ?? 0);
                      const excess = Number(selectedReport[`outstanding_excess_${item.code}`] ?? selectedReport[item.excessField] ?? 0);
                      const difference = excess - shortage;
                      const isSelected = selectedResolutionItem === item.code;
                      return <button
                        type="button"
                        key={`difference-${item.code}`}
                        className={`${difference < 0 ? 'is-shortage' : difference > 0 ? 'is-excess' : 'is-exact'}${isSelected ? ' is-selected' : ''}`}
                        aria-pressed={isSelected}
                        disabled={difference >= 0 || !canResolveSelectedReport}
                        title={difference > 0 ? 'অতিরিক্ত অংশ আগের ঘাটতিতে সমন্বয়ের পর প্রিন্ট হিসাব থেকে বাদ যাবে' : undefined}
                        onClick={() => {
                          setSelectedResolutionItem(item.code as 'bun' | 'egg' | 'banana');
                          setResolutionItems({ bun: 0, egg: 0, banana: 0 });
                        }}
                      >
                        <span>{item.label}</span>
                        <strong>{difference > 0 ? `+${engToBnNumber(difference)}টি · প্রিন্টে বাদ` : `${engToBnNumber(difference)}টি`}</strong>
                      </button>;
                    })}
                  </div>
                  {canResolveSelectedReport && <p className="distribution-item-select-hint">আলাদাভাবে সমন্বয় করতে বকেয়া আইটেমে ক্লিক করুন।</p>}
                  <p className="distribution-manager-reason"><strong>রিপোর্টের কারণ:</strong> {selectedReport.reason || 'উল্লেখ নেই'}</p>
                </section>
              )}

              {Array.isArray(selectedReport?.adjustments) && selectedReport.adjustments.length > 0 && (
                <section className="distribution-drawer-section distribution-adjustment-history">
                  <h4>মাসিক সমন্বয় ইতিহাস</h4>
                  {selectedReport.adjustments.map((adjustment: any) => (
                    <p key={adjustment.id}>
                      <strong>{engToBnNumber(adjustment.quantity)}টি</strong> {adjustment.item_code === 'bun' ? 'বনরুটি' : adjustment.item_code === 'egg' ? 'সিদ্ধ ডিম' : 'কলা'} · {formatDateDMY(adjustment.shortage_date)} → {formatDateDMY(adjustment.excess_date)}
                    </p>
                  ))}
                </section>
              )}

              {Array.isArray(selectedReport?.resolution_items) && selectedReport.resolution_items.length > 0 && (
                <section className="distribution-drawer-section distribution-adjustment-history">
                  <h4>প্রশাসনিক সমন্বয় ইতিহাস</h4>
                  {selectedReport.resolution_items.map((item: any) => (
                    <p key={`resolution-${item.id}`}>
                      <strong>{engToBnNumber(item.quantity)}টি</strong> {item.item_code === 'bun' ? 'বনরুটি' : item.item_code === 'egg' ? 'সিদ্ধ ডিম' : 'কলা'} · {item.action}
                    </p>
                  ))}
                </section>
              )}

              {accountRole === 'super_admin' ? (
                <section className="distribution-drawer-section">
                  <h4>কী ব্যবস্থা নেওয়া হবে?</h4>
                  <div className="distribution-resolution-options">
                    {adjustmentReasons.map((item) => (
                      <label key={item}>
                        <input type="radio" name="resolution-action" value={item} checked={resolutionReason === item} onChange={(event) => { setResolutionReason(event.target.value); setResolutionItems({ bun: 0, egg: 0, banana: 0 }); }} disabled={!canResolveSelectedReport} />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                  {selectedQuantityDirection && (
                    <div className="distribution-resolution-quantity">
                      <h5>সরবরাহ/পূরণ করা পরিমাণ</h5>
                      <div className="distribution-resolution-quantity-grid">
                        {drawerItems.map((item) => {
                          if (item.code !== selectedResolutionItem) return null;
                          const outstanding = Number(selectedReport?.[`outstanding_${selectedQuantityDirection}_${item.code}`] || 0);
                          if (outstanding <= 0) return <p className="distribution-resolution-unavailable" key={`resolution-input-${item.code}`}>নির্বাচিত ব্যবস্থাটি {item.label}-এর বর্তমান বকেয়ার সঙ্গে প্রযোজ্য নয়।</p>;
                          return (
                            <label key={`resolution-input-${item.code}`}>
                              <span>{item.label}<small>বকেয়া {engToBnNumber(outstanding)}টি</small></span>
                              <input
                                type="number"
                                min="0"
                                max={outstanding}
                                value={resolutionItems[item.code as keyof typeof resolutionItems]}
                                onChange={(event) => setResolutionItems((current) => ({ ...current, [item.code]: Math.max(0, Math.floor(Number(event.target.value) || 0)) }))}
                                disabled={!canResolveSelectedReport}
                              />
                            </label>
                          );
                        })}
                        {!selectedResolutionItem && <p className="distribution-resolution-unavailable">পরিমাণ লিখতে উপরের বকেয়া থেকে একটি আইটেম নির্বাচন করুন।</p>}
                      </div>
                    </div>
                  )}
                  {['অন্যান্য', 'রিপোর্ট ভুল / বাতিল'].includes(resolutionReason) && <label className="distribution-resolution-note">
                    মন্তব্য (আবশ্যিক)
                    <textarea rows={3} value={comments} onChange={(event) => setComments(event.target.value)} placeholder="সমন্বয়ের বিস্তারিত লিখুন…" disabled={!canResolveSelectedReport} />
                  </label>}
                </section>
              ) : (
                <section className="distribution-drawer-section">
                  <label className="distribution-resolution-note">সমস্যার ধরন
                    <select value={problemType} onChange={e => setProblemType(e.target.value)}>
                      <option value="less_item">কম আইটেম পাওয়া গেছে</option>
                      <option value="more_item">বেশি আইটেম পাওয়া গেছে</option>
                      <option value="no_item">কোনো আইটেম পাওয়া যায়নি</option>
                      <option value="wrong_item">ভুল আইটেম পাওয়া গেছে</option>
                      <option value="school_closed">স্কুল বন্ধ ছিল</option>
                      <option value="other">অন্যান্য</option>
                    </select>
                  </label>
                </section>
              )}

              <div className="distribution-drawer-actions">
                <button type="button" className="button-secondary" onClick={() => setIsModalOpen(false)}>বন্ধ করুন</button>
                {(accountRole !== 'super_admin' || canResolveSelectedReport) && (
                  <button type="submit" className="button-primary" disabled={isSavingResolution}>{isSavingResolution ? 'সংরক্ষণ হচ্ছে…' : accountRole === 'super_admin' ? 'সমাধান করুন' : 'রিপোর্ট সংরক্ষণ করুন'}</button>
                )}
              </div>
            </form>
          </aside>
        </div>
      )}
    </section>
  );
}

