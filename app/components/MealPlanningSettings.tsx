"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeDollarSign, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Plus, Save, Trash2 } from "lucide-react";
import { formatDateDMY } from "../lib/date-format";
import "./meal-planning-settings.css";

type Food = { code:string; name:string; unit:string };
type Period = { id:number; name:string; start_date:string; end_date:string; status:"draft"|"active"; lifecycle:"draft"|"active"|"history" };
type PlanDay = { id:number; period_id:number; plan_date:string; items_json:string };
type Prices = { bun:number; egg:number; banana:number };
type Payload = { periods:Period[]; foods:Food[]; days:PlanDay[]; prices:Prices };
const defaultPrices:Prices={bun:13.5,egg:10,banana:6};
const weekDays = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"];
const monthNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

function iso(date:Date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`}
function endAfter(start:string,months:number){const date=new Date(`${start}T00:00:00`);date.setMonth(date.getMonth()+months);date.setDate(date.getDate()-1);return iso(date)}
function parseItems(value:string){try{const result=JSON.parse(value);return Array.isArray(result)?result.map(String):[]}catch{return []}}

export function MealPlanningSettings(){
  const today=iso(new Date());
  const [data,setData]=useState<Payload>({periods:[],foods:[],days:[],prices:defaultPrices});
  const [priceDraft,setPriceDraft]=useState({bun:"13.5",egg:"10",banana:"6"});
  const [periodId,setPeriodId]=useState(0),[month,setMonth]=useState(today.slice(0,7)),[selectedDate,setSelectedDate]=useState(today);
  const [selectedItems,setSelectedItems]=useState<string[]>([]),[savedItems,setSavedItems]=useState<string[]>([]);
  const [preset,setPreset]=useState("1"),[form,setForm]=useState({name:"",startDate:today,endDate:endAfter(today,1)});
  const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
  const dirty=selectedItems.join("|")!==savedItems.join("|");
  const period=data.periods.find(item=>item.id===periodId);
  const currentPeriods=data.periods.filter(item=>item.lifecycle!=="history");
  const historyPeriods=data.periods.filter(item=>item.lifecycle==="history");

  async function load(wanted=0,resetSelection=true){setBusy(true);try{
    let response=await fetch(`/api/settings/meal-plans${wanted?`?periodId=${wanted}`:""}`,{cache:"no-store"});
    let result=await response.json() as Payload&{error?:string};if(!response.ok)throw new Error(result.error||"পরিকল্পনা লোড করা যায়নি।");
    const next=wanted||result.periods[0]?.id||0;
    if(next&&!wanted){response=await fetch(`/api/settings/meal-plans?periodId=${next}`,{cache:"no-store"});result=await response.json() as Payload&{error?:string}}
    setData(result);setPriceDraft({bun:String(result.prices?.bun??defaultPrices.bun),egg:String(result.prices?.egg??defaultPrices.egg),banana:String(result.prices?.banana??defaultPrices.banana)});setPeriodId(next);const chosen=result.periods.find(item=>item.id===next);if(chosen&&resetSelection){setMonth(chosen.start_date.slice(0,7));setSelectedDate(chosen.start_date)}
  }catch(error){setMessage(error instanceof Error?error.message:"সমস্যা হয়েছে।")}finally{setBusy(false)}}
  useEffect(()=>{void load()},[]);
  useEffect(()=>{const row=data.days.find(day=>day.plan_date===selectedDate);const items=row?parseItems(row.items_json):[];setSelectedItems(items);setSavedItems(items)},[data.days,selectedDate]);

  const daysByDate=useMemo(()=>new Map(data.days.map(day=>[day.plan_date,parseItems(day.items_json)])),[data.days]);
  const foodNames=useMemo(()=>new Map(data.foods.map(food=>[food.code,food.name])),[data.foods]);
  const foodDayCounts=useMemo(()=>{const counts:Record<string,number>={};for(const day of data.days){for(const code of new Set(parseItems(day.items_json)))counts[code]=(counts[code]||0)+1}return counts},[data.days]);
  const calendarDays=useMemo(()=>{const [year,number]=month.split("-").map(Number),first=new Date(year,number-1,1),last=new Date(year,number,0),cells:Array<string|null>=Array(first.getDay()).fill(null);for(let day=1;day<=last.getDate();day++)cells.push(iso(new Date(year,number-1,day)));while(cells.length%7)cells.push(null);return cells},[month]);
  function safeChange(action:()=>void){if(!dirty||confirm("এই দিনের অসংরক্ষিত পরিবর্তন বাদ দেবেন?"))action()}
  function moveMonth(delta:number){safeChange(()=>{const [year,number]=month.split("-").map(Number);setMonth(iso(new Date(year,number-1+delta,1)).slice(0,7))})}
  function updatePreset(value:string){setPreset(value);if(value!=="custom")setForm(current=>({...current,endDate:endAfter(current.startDate,Number(value))}))}
  function updateStart(startDate:string){setForm(current=>({...current,startDate,endDate:preset==="custom"?current.endDate:endAfter(startDate,Number(preset))}))}
  async function call(method:string,body?:unknown,query=""){setBusy(true);setMessage("");try{const response=await fetch(`/api/settings/meal-plans${query}`,{method,headers:body?{"content-type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined});const result=await response.json() as{id?:number;prices?:Prices;error?:string};if(!response.ok)throw new Error(result.error||"কাজটি করা যায়নি।");return result}catch(error){setMessage(error instanceof Error?error.message:"কাজটি করা যায়নি।");return null}finally{setBusy(false)}}
  async function savePrices(){const result=await call("PUT",{action:"save-prices",prices:priceDraft});if(result?.prices){setPriceDraft({bun:String(result.prices.bun),egg:String(result.prices.egg),banana:String(result.prices.banana)});setMessage("পণ্যের ক্রয়মূল্য সংরক্ষিত হয়েছে। Dashboard-এর হিসাব নতুন রেটে আপডেট হয়েছে।");window.dispatchEvent(new Event("meal-plan-updated"))}}
  async function createPeriod(){const result=await call("POST",form);if(result?.id){setMessage("নতুন Draft পরিকল্পনা তৈরি হয়েছে।");await load(result.id)}}
  async function saveDay(){if(!period)return;const result=await call("PUT",{action:"save-day",periodId:period.id,date:selectedDate,itemCodes:selectedItems});if(result){setMessage(selectedItems.length?"দিনের খাবার সংরক্ষিত হয়েছে।":"দিনের পরিকল্পনা মুছে দেওয়া হয়েছে।");await load(period.id,false);window.dispatchEvent(new Event("meal-plan-updated"))}}
  async function changeStatus(action:"activate"|"draft"){if(!period||(action==="activate"&&!confirm("পরিকল্পনাটি Active করবেন? একই সময়সীমায় অন্য Active পরিকল্পনা থাকলে এটি চালু করা যাবে না।")))return;const result=await call("PUT",{action,periodId:period.id});if(result){setMessage(action==="activate"?"পরিকল্পনাটি Active হয়েছে। অন্য মাসের Active পরিকল্পনাগুলো অপরিবর্তিত আছে।":"পরিকল্পনাটি Draft হয়েছে।");await load(period.id,false);window.dispatchEvent(new Event("meal-plan-updated"))}}
  async function removePeriod(){if(!period||!confirm("এই Draft পরিকল্পনা ও এর সব দিনের তথ্য মুছে দেবেন?"))return;const result=await call("DELETE",undefined,`?periodId=${period.id}`);if(result){setMessage("পরিকল্পনা মুছে দেওয়া হয়েছে।");await load()}}
  const [calendarYear,calendarMonth]=month.split("-").map(Number);

  return <div className="meal-planning-settings">
    <details className="meal-config-disclosure meal-price-settings"><summary className="meal-disclosure-summary"><div className="meal-price-heading"><div className="meal-heading-icon"><BadgeDollarSign/></div><div><h3>পণ্যের ক্রয়মূল্য</h3><p>Dashboard-এর মাসিক ক্রয়মূল্য এই প্রতি ইউনিট রেট থেকে হিসাব হবে।</p></div></div><span className="meal-disclosure-action"><span className="when-closed">খুলুন</span><span className="when-open">বন্ধ করুন</span><ChevronDown/></span></summary><div className="meal-disclosure-content"><div className="meal-price-grid">
      <label><span>বনরুটি <small>প্রতি পিস</small></span><div className="meal-price-input"><b>৳</b><input aria-label="বনরুটির প্রতি পিস ক্রয়মূল্য" type="number" min="0.01" max="1000" step="0.01" value={priceDraft.bun} onChange={e=>setPriceDraft({...priceDraft,bun:e.target.value})}/></div></label>
      <label><span>সিদ্ধ ডিম <small>প্রতি পিস</small></span><div className="meal-price-input"><b>৳</b><input aria-label="সিদ্ধ ডিমের প্রতি পিস ক্রয়মূল্য" type="number" min="0.01" max="1000" step="0.01" value={priceDraft.egg} onChange={e=>setPriceDraft({...priceDraft,egg:e.target.value})}/></div></label>
      <label><span>কলা <small>প্রতি টি</small></span><div className="meal-price-input"><b>৳</b><input aria-label="কলার প্রতি টি ক্রয়মূল্য" type="number" min="0.01" max="1000" step="0.01" value={priceDraft.banana} onChange={e=>setPriceDraft({...priceDraft,banana:e.target.value})}/></div></label>
      <button className="primary meal-price-save" disabled={busy||Object.values(priceDraft).some(value=>!value||Number(value)<=0)} onClick={savePrices}><Save size={16}/> রেট সংরক্ষণ করুন</button>
    </div></div></details>
    <details className="meal-config-disclosure meal-period-builder"><summary className="meal-disclosure-summary"><div className="meal-section-heading"><div className="meal-heading-icon"><CalendarDays/></div><div><h3>মাসিক খাবার পরিকল্পনা</h3><p>এক বা একাধিক মাসের প্রতিদিনের খাবার নির্ধারণ করুন।</p></div></div><span className="meal-disclosure-action"><span className="when-closed">খুলুন</span><span className="when-open">বন্ধ করুন</span><ChevronDown/></span></summary><div className="meal-disclosure-content">
      <div className="meal-period-form"><label>পরিকল্পনার নাম<input value={form.name} placeholder="যেমন: আগস্ট–অক্টোবর ২০২৬" onChange={e=>setForm({...form,name:e.target.value})}/></label><label>সময়সীমা<select value={preset} onChange={e=>updatePreset(e.target.value)}><option value="1">১ মাস</option><option value="2">২ মাস</option><option value="3">৩ মাস</option><option value="6">৬ মাস</option><option value="12">১ বছর</option><option value="custom">নিজস্ব তারিখ</option></select></label><label>শুরু<input type="date" lang="en-GB" value={form.startDate} onChange={e=>updateStart(e.target.value)}/></label><label>শেষ<input type="date" lang="en-GB" value={form.endDate} min={form.startDate} disabled={preset!=="custom"} onChange={e=>setForm({...form,endDate:e.target.value})}/></label><button className="primary" disabled={busy||!form.startDate||!form.endDate} onClick={createPeriod}><Plus size={16}/> তৈরি করুন</button></div>
    </div></details>{message&&<div className="meal-message">{message}</div>}
    <section className="meal-plan-workspace">
      <div className="meal-plan-toolbar">
        <div className="meal-plan-picker">
          <span className="meal-toolbar-eyebrow">পরিকল্পনা নির্বাচন</span>
          <select aria-label="পরিকল্পনা নির্বাচন" value={periodId} onChange={e=>safeChange(()=>void load(Number(e.target.value)))}>
            {currentPeriods.length>0&&<optgroup label="চলমান ও Draft পরিকল্পনা">{currentPeriods.map(item=><option key={item.id} value={item.id}>{item.name} · {item.lifecycle==="active"?"Active":"Draft"}</option>)}</optgroup>}
            {historyPeriods.length>0&&<optgroup label="পরিকল্পনার ইতিহাস">{historyPeriods.map(item=><option key={item.id} value={item.id}>{item.name} · ইতিহাস</option>)}</optgroup>}
          </select>
        </div>
        {period&&<>
          <div className="meal-plan-info">
            <div className="meal-plan-state-row">
              <span className={`meal-status ${period.lifecycle}`}>{period.lifecycle==="history"?"ইতিহাস":period.lifecycle==="active"?"Active":"Draft"}</span>
              <span className="meal-period-dates">{formatDateDMY(period.start_date)} – {formatDateDMY(period.end_date)}</span>
            </div>
            <div className="meal-period-summary" aria-label="খাবারের দিনের সারাংশ">{data.foods.map(food=><span key={food.code}><strong>{food.name}</strong> {foodDayCounts[food.code]||0} দিন</span>)}</div>
          </div>
          <div className="meal-plan-actions">
            {period.lifecycle!=="history"&&<button className="meal-outline" disabled={busy} onClick={()=>changeStatus(period.status==="active"?"draft":"activate")}>{period.status==="active"?"Draft করুন":"Active করুন"}</button>}
            {period.status==="draft"&&<button className="meal-danger" aria-label="পরিকল্পনা মুছুন" onClick={removePeriod}><Trash2 size={16}/></button>}
          </div>
        </>}
      </div>
      {!period?<div className="meal-empty">পরিকল্পনা তৈরি বা নির্বাচন করলে ক্যালেন্ডার দেখা যাবে।</div>:<div className="meal-calendar-layout"><div className="meal-calendar-card"><header><button disabled={month<=period.start_date.slice(0,7)} onClick={()=>moveMonth(-1)} aria-label="আগের মাস"><ChevronLeft/></button><h3>{monthNames[calendarMonth-1]} {calendarYear}</h3><button disabled={month>=period.end_date.slice(0,7)} onClick={()=>moveMonth(1)} aria-label="পরের মাস"><ChevronRight/></button></header><div className="meal-calendar-grid weekdays">{weekDays.map(day=><span key={day}>{day}</span>)}</div><div className="meal-calendar-grid">{calendarDays.map((date,index)=>{if(!date)return <span className="meal-calendar-blank" key={`blank-${index}`}/>;const outside=date<period.start_date||date>period.end_date,items=daysByDate.get(date)||[],itemNames=items.map(code=>foodNames.get(code)).filter(Boolean).join(" + ");return <button key={date} disabled={outside} className={`${date===selectedDate?"selected":""} ${items.length?"planned":"closed"}`} onClick={()=>safeChange(()=>setSelectedDate(date))}><strong>{Number(date.slice(-2))}</strong>{!outside&&<span className={items.length?"meal-label":"meal-closed"}>{itemNames||"বিদ্যালয় বন্ধ"}</span>}</button>})}</div></div>
        <aside className="meal-day-editor"><div><small>নির্বাচিত দিন</small><h3>{formatDateDMY(selectedDate)}</h3><p>{period.lifecycle==="history"?"এটি সংরক্ষিত ইতিহাস; শুধু দেখা যাবে।":period.status==="active"?"পরিবর্তনের জন্য আগে পরিকল্পনাটি Draft করুন।":"এই দিনে একাধিক খাবার নির্বাচন করা যাবে।"}</p></div><div className="meal-food-list">{data.foods.map(food=><label key={food.code} className={selectedItems.includes(food.code)?"checked":""}><input type="checkbox" disabled={period.status==="active"} checked={selectedItems.includes(food.code)} onChange={e=>setSelectedItems(items=>e.target.checked?[...items,food.code]:items.filter(code=>code!==food.code))}/><span><strong>{food.name}</strong><small>একক: {food.unit}</small></span></label>)}</div><div className="meal-editor-actions"><button disabled={period.status==="active"||busy||!dirty} className="primary" onClick={saveDay}>সংরক্ষণ করুন</button><button disabled={period.status==="active"||busy||savedItems.length===0} className="meal-outline" onClick={()=>setSelectedItems([])}>দিনটি খালি করুন</button></div></aside>
      </div>}
    </section>
  </div>
}
