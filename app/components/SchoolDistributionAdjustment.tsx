"use client";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import "./DashboardApp.css";
import serialMapping from "./serial_mapping.json";
import { getAreaManagerReportingWindow, getDhakaClock } from "../lib/distribution-reporting-window";
import { formatDateDMY } from "../lib/date-format";
import { printDesktopLayout } from "../lib/desktop-print";

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle">
    <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>
);

export function SchoolDistributionAdjustment({ accountRole, userAreaCode }: { accountRole: string, userAreaCode?: string }) {
  const problemTypeMapping = {
    less_item: 'কম আইটেম পাওয়া গেছে',
    more_item: 'বেশি আইটেম পাওয়া গেছে',
    no_item: 'কোনো আইটেম পাওয়া যায়নি',
    wrong_item: 'ভুল আইটেম পাওয়া গেছে',
    school_closed: 'স্কুল বন্ধ ছিল',
    other: 'অন্যান্য'
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
  const [comments, setComments] = useState('');

  const [filterDate, setFilterDate] = useState(() => getDhakaClock().date);
  const [filterArea, setFilterArea] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [focusedSchoolEmis, setFocusedSchoolEmis] = useState('');

  const printDistributionReport = useCallback(() => {
    printDesktopLayout('printing-distribution-report');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('date')) setFilterDate(params.get('date') as string);
      if (params.get('area')) setFilterArea(params.get('area') as string);
      if (params.get('status')) setFilterStatus(params.get('status') as string);
      if (params.get('school')) setFocusedSchoolEmis(params.get('school') as string);
    }
  }, []);

  useEffect(() => {
    const openReport = (event: Event) => {
      const detail = (event as CustomEvent<{ areaCode?: string; date?: string; status?: string; schoolEmis?: string }>).detail || {};
      if (detail.date) setFilterDate(detail.date);
      if (accountRole === 'super_admin' && detail.areaCode) setFilterArea(detail.areaCode);
      if (detail.status) setFilterStatus(detail.status);
      setFocusedSchoolEmis(detail.schoolEmis || '');
    };
    window.addEventListener('open-distribution-report', openReport);
    return () => window.removeEventListener('open-distribution-report', openReport);
  }, [accountRole]);

  useEffect(() => {
    if (!focusedSchoolEmis || loading) return;
    const row = document.querySelector<HTMLElement>(`[data-distribution-school="${focusedSchoolEmis}"]`);
    row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusedSchoolEmis, loading, reports]);
  
  const d = new Date(filterDate);
  const filterDay = !isNaN(d.getTime()) ? d.getDay() : -1;
  
  let showBread = false;
  let showEgg = false;
  let showBanana = false;
  
  if (filterDay === 0 || filterDay === 3 || filterDay === 4) { // Sun, Wed, Thu
    showBread = true;
    showEgg = true;
  } else if (filterDay === 1) { // Mon
    showBread = true;
  } else if (filterDay === 2) { // Tue
    showBanana = true;
  }
  const hasScheduledItems = showBread || showEgg || showBanana;

  const reportingWindow = getAreaManagerReportingWindow(filterDate, currentTime);
  const isLockedForManager = accountRole !== 'super_admin' && !reportingWindow.canReport;
  
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
      if (accountRole === 'area_manager' && userAreaCode) {
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
  }, [accountRole, filterArea, filterDate, userAreaCode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleReportClick(school: any) {
    setSelectedSchool(school);
    
    const existing = reports.find(r => r.school_emis_code === school.emis_code);
    if (existing) {
      setReceivedBread(existing.received_bread || 0);
      setReceivedEgg(existing.received_egg || 0);
      setReceivedBanana(existing.received_banana || 0);
      setProblemType(existing.problem_type === 'none' ? 'less_item' : (existing.problem_type || 'less_item'));
      setReason(existing.reason || '');
      setComments(existing.comments === 'অটো-রিসিভড (২ টার পর)' ? '' : (existing.comments || ''));
    } else {
      setReceivedBread(school.current_daily_demand || 0);
      setReceivedEgg(school.current_daily_demand || 0);
      setReceivedBanana(school.current_daily_demand || 0);
      setProblemType('less_item');
      setReason('');
      setComments('');
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
      problemType,
      reason,
      comments,
      status: accountRole === 'super_admin' ? 'resolved' : undefined
    };

    try {
      const existing = reports.find(r => r.school_emis_code === selectedSchool.emis_code);
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
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error saving report.");
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
        const diff = (Number(report.shortage_bread) || 0) - (Number(report.excess_bread) || 0);
        if (diff > 0) totalShortageBread += diff;
        else if (diff < 0) totalExcessBread += Math.abs(diff);
      }
    }
    if (showEgg) {
      if (isAutoReceived) {
        totalEgg += planned;
      } else if (report) {
        totalEgg += Number(report.received_egg) || 0;
        const diff = (Number(report.shortage_egg) || 0) - (Number(report.excess_egg) || 0);
        if (diff > 0) totalShortageEgg += diff;
        else if (diff < 0) totalExcessEgg += Math.abs(diff);
      }
    }
    if (showBanana) {
      if (isAutoReceived) {
        totalBanana += planned;
      } else if (report) {
        totalBanana += Number(report.received_banana) || 0;
        const diff = (Number(report.shortage_banana) || 0) - (Number(report.excess_banana) || 0);
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

  return (
    <section id="distribution-exceptions" className="panel distribution-exceptions" style={{ gridColumn: "1 / -1", marginBottom: '24px' }}>
      <div className="panel-head distribution-panel-head distribution-exceptions-head no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="distribution-section-icon distribution-section-icon-alert" aria-hidden="true">
            <AlertIcon />
          </span>
          <div>
            <h2 style={{ marginBottom: '4px' }}>স্কুলভিত্তিক বিতরণ সমন্বয়</h2>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-dark)', marginTop: '4px', marginBottom: 0 }}>
                {mounted ? currentTime.toLocaleString('bn-BD', {
                  timeZone: 'Asia/Dhaka',
                  dateStyle: 'full',
                  timeStyle: 'medium'
                }) : 'সময় লোড হচ্ছে...'}
              </p>
          </div>
        </div>
        <button 
          className="button-primary no-print" 
          onClick={printDistributionReport}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
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
        {isLockedForManager && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#fff3cd', border: '1px solid #ffe69c', borderRadius: '8px', color: '#664d03', fontSize: '13px' }}>
            <strong>সতর্কতা:</strong> এরিয়া ম্যানেজার শুধু বিতরণের দিন দুপুর ২টার আগে রিপোর্ট করতে পারবেন। সময় শেষ হওয়ায় বরাদ্দকৃত আইটেম স্কুলে সঠিকভাবে বিতরণ হয়েছে বলে ধরা হয়েছে।
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
                  <option value="">সকল</option>
                  <option value="new">রিপোর্ট করা সমস্যা</option>
                  <option value="resolved">সমন্বয় সম্পন্ন</option>
                </select>
              </label>
            </>
          )}

          <div style={{ alignSelf: 'flex-end', paddingBottom: '8px' }}>
            {loading && <span style={{ color: 'var(--ink-light)', fontSize: '13px' }}>Loading...</span>}
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
                const filteredSchools = [...schools].filter(school => {
                  if (!filterStatus) return true;
                  const storedReport = reports.find(r => r.school_emis_code === school.emis_code);
                  const report = !hasScheduledItems && storedReport?.comments === 'অটো-রিসিভড (২ টার পর)' ? undefined : storedReport;
                  if (filterStatus === 'new') return report && report.status === 'new';
                  if (filterStatus === 'resolved') return report && report.status === 'resolved';
                  return true;
                });

                const sortedSchools = filteredSchools.sort((a, b) => {
                   const serialA = (serialMapping as any)[a.emis_code] || 999;
                   const serialB = (serialMapping as any)[b.emis_code] || 999;
                   return serialA - serialB;
                });

                const formatItems = (items: { amount: number; unit: string }[]) => {
                  if (items.length === 0) return '-';
                  return items.map((item, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && ' এবং '}
                      <span style={{ fontWeight: 'bold' }}>{item.amount}</span> {item.unit}
                    </React.Fragment>
                  ));
                };

                return sortedSchools.map((school) => {
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

                  const isAutoReceived = hasScheduledItems && (report?.comments === 'অটো-রিসিভড (২ টার পর)' || (!report && reportingWindow.shouldAutoReceive));
                  
                  if (!isAutoReceived && report) {
                    const receivedItems = [];
                    if (showBread) receivedItems.push({ amount: report.received_bread, unit: 'রুটি' });
                    if (showEgg) receivedItems.push({ amount: report.received_egg, unit: 'ডিম' });
                    if (showBanana) receivedItems.push({ amount: report.received_banana, unit: 'কলা' });
                    
                    if (receivedItems.length > 0) receivedNode = formatItems(receivedItems);

                    const shortageItems = [];
                    let hasShortage = false;
                    if (showBread) { 
                      const diff = report.shortage_bread - report.excess_bread;
                      if (diff > 0) { shortageItems.push({ amount: diff, unit: 'রুটি (ঘাটতি)' }); hasShortage = true; }
                      else if (diff < 0) { shortageItems.push({ amount: Math.abs(diff), unit: 'রুটি (অতিরিক্ত)' }); hasExcess = true; }
                    }
                    if (showEgg) { 
                      const diff = report.shortage_egg - report.excess_egg;
                      if (diff > 0) { shortageItems.push({ amount: diff, unit: 'ডিম (ঘাটতি)' }); hasShortage = true; }
                      else if (diff < 0) { shortageItems.push({ amount: Math.abs(diff), unit: 'ডিম (অতিরিক্ত)' }); hasExcess = true; }
                    }
                    if (showBanana) { 
                      const diff = report.shortage_banana - report.excess_banana;
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
                                সঠিক আইটেম পাওয়া গেছে
                              </span>
                            ) : (
                              <>
                                <span style={{ 
                                  padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                                  background: report.status === 'new' ? '#fff3cd' : 
                                              report.status === 'resolved' ? '#d1e7dd' : '#e2e3e5'
                                }}>
                                  {report.status === 'new'
                                    ? ((problemTypeMapping as any)[report.problem_type] || report.problem_type)
                                    : report.status === 'resolved' ? 'সম্পন্ন' : report.status}
                                </span>
                                {accountRole === 'super_admin' && report.status !== 'new' && report.problem_type && report.problem_type !== 'none' && (
                                  <div className="no-print" style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                                    নোট: {(problemTypeMapping as any)[report.problem_type] || report.problem_type}
                                  </div>
                                )}
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
                        <button 
                          className="button-secondary" 
                          onClick={() => handleReportClick(school)}
                          disabled={isLockedForManager}
                          style={{ opacity: isLockedForManager ? 0.5 : 1, cursor: isLockedForManager ? 'not-allowed' : 'pointer' }}
                        >
                          {accountRole === 'super_admin' ? 'সমন্বয় করুন' : 'রিপোর্ট করুন'}
                        </button>
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
      </div>
      </div>

      {isModalOpen && selectedSchool && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', fontWeight: 600 }}>
              {accountRole === 'super_admin' ? 'বিতরণ সমন্বয়' : 'বিতরণ সমস্যা অভিযোগ'} - {selectedSchool.name_bn}
            </h3>
            
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', background: '#f8fbf9', padding: '12px', borderRadius: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--ink-light)', marginBottom: '4px' }}>তারিখ</label>
                  <strong>{formatDateDMY(filterDate)}</strong>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--ink-light)', marginBottom: '4px' }}>বরাদ্দ</label>
                  <strong>{selectedSchool.current_daily_demand || 0} পিস (প্রতিটি আইটেম)</strong>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--ink-light)' }}>প্রাপ্ত সংখ্যা প্রদান করুন:</h4>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {showBread && (
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <span style={{ fontSize: '14px' }}>রুটি</span>
                      <input type="number" min="0" required value={receivedBread} onChange={e => setReceivedBread(Number(e.target.value))} style={{ padding: '8px', border: '1px solid var(--line)', borderRadius: '6px' }} />
                    </label>
                  )}
                  {showEgg && (
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <span style={{ fontSize: '14px' }}>ডিম</span>
                      <input type="number" min="0" required value={receivedEgg} onChange={e => setReceivedEgg(Number(e.target.value))} style={{ padding: '8px', border: '1px solid var(--line)', borderRadius: '6px' }} />
                    </label>
                  )}
                  {showBanana && (
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <span style={{ fontSize: '14px' }}>কলা</span>
                      <input type="number" min="0" required value={receivedBanana} onChange={e => setReceivedBanana(Number(e.target.value))} style={{ padding: '8px', border: '1px solid var(--line)', borderRadius: '6px' }} />
                    </label>
                  )}
                </div>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '14px' }}>সমস্যার ধরন</span>
                <select value={problemType} onChange={e => setProblemType(e.target.value)} style={{ padding: '8px', border: '1px solid var(--line)', borderRadius: '6px' }}>
                  <option value="less_item">কম আইটেম পাওয়া গেছে</option>
                  <option value="more_item">বেশি আইটেম পাওয়া গেছে</option>
                  <option value="no_item">কোনো আইটেম পাওয়া যায়নি</option>
                  <option value="wrong_item">ভুল আইটেম পাওয়া গেছে</option>
                  <option value="school_closed">স্কুল বন্ধ ছিল</option>
                  <option value="other">অন্যান্য</option>
                </select>
              </label>


              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="button-secondary" onClick={() => setIsModalOpen(false)}>বাতিল</button>
                <button type="submit" className="button-primary">সংরক্ষণ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

