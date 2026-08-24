"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Settings as SettingsIcon, UserRound } from "lucide-react";
import { USER_ROLE_LABELS } from "../lib/user-roles";
import "./account-profile.css";

type Profile = {
  id: number;
  username: string;
  name: string;
  role: string;
  area_code?: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  address?: string | null;
  designation?: string | null;
  photo_base64?: string | null;
};

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.slice(0, 1)).join("") || "ইউ";
}

export function AccountProfileCard({ fallbackName, fallbackEmail, showSettings = false }: { fallbackName: string; fallbackEmail: string; showSettings?: boolean }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [launcherTarget, setLauncherTarget] = useState<Element | null>(null);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: fallbackName, email: fallbackEmail, phone: "", designation: "", address: "", bio: "", photo_base64: "", new_password: "" });

  useEffect(() => {
    let active = true;
    fetch("/api/profile")
      .then((response) => { if (!response.ok) throw new Error("profile unavailable"); return response.json() as Promise<Profile>; })
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setForm({ name: data.name || fallbackName, email: data.email || fallbackEmail, phone: data.phone || "", designation: data.designation || "", address: data.address || "", bio: data.bio || "", photo_base64: data.photo_base64 || "", new_password: "" });
      }).catch(() => undefined);
    return () => { active = false; };
  }, [fallbackEmail, fallbackName]);

  useEffect(() => {
    const locateSidebar = () => {
      setLauncherTarget(document.querySelector(".sidebar"));
    };
    locateSidebar();
    const observer = new MutationObserver(locateSidebar);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const display = profile ?? { id: 0, username: fallbackName, name: fallbackName, role: "super_admin", email: fallbackEmail };
  const roleLabel = USER_ROLE_LABELS[display.role as keyof typeof USER_ROLE_LABELS] || display.role;
  const areaLabel = display.area_code ? "নির্ধারিত অঞ্চল" : "উপজেলা পর্যায়ের পূর্ণ অনুমতি";
  const avatarCandidate = editing ? form.photo_base64 : display.photo_base64 || "";
  const avatar = avatarCandidate.startsWith("data:image/") ? avatarCandidate : "";
  const field = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  function selectPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("শুধু JPG, PNG অথবা WebP ছবি ব্যবহার করুন।");
      event.target.value = "";
      return;
    }
    if (file.size > 1024 * 1024) {
      setMessage("প্রোফাইল ছবির সর্বোচ্চ সাইজ ১ MB।");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      field("photo_base64", typeof reader.result === "string" ? reader.result : "");
      setMessage("");
    };
    reader.onerror = () => setMessage("ছবিটি পড়া যায়নি। অন্য একটি ছবি চেষ্টা করুন।");
    reader.readAsDataURL(file);
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/profile", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, id: display.id }) });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "প্রোফাইল সংরক্ষণ করা যায়নি।");
      setProfile((current) => (current ? { ...current, ...form } : { ...display, ...form }));
      setForm((current) => ({ ...current, new_password: "" })); setEditing(false); setMessage("প্রোফাইল সফলভাবে আপডেট হয়েছে।");
    } catch (error) { setMessage(error instanceof Error ? error.message : "প্রোফাইল সংরক্ষণ করা যায়নি।"); }
    finally { setSaving(false); }
  }

  async function logout() {
    setLoggingOut(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("লগআউট করা যায়নি। আবার চেষ্টা করুন।");
      window.location.href = "/login";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "লগআউট করা যায়নি।");
      setLoggingOut(false);
    }
  }

  const initialsText = useMemo(() => initials(display.name), [display.name]);
  const toggleEditing = () => {
    setEditing((current) => !current);
    setMessage("");
  };
  const launcher = (
    <div className="account-user-card">
      <button
        type="button"
        className="account-profile-launcher"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => { setOpen((current) => !current); setEditing(false); setMessage(""); }}
      >
        {avatar ? <img className="account-launcher-avatar" src={avatar} alt="প্রোফাইল ছবি" /> : <span className="account-launcher-avatar"><UserRound aria-hidden="true" /></span>}
        <span className="account-launcher-details"><strong>{display.name}</strong><small>প্রোফাইল</small></span>
        <span className="mobile-profile-label">প্রোফাইল</span>
      </button>
      {showSettings && <button className="account-settings-button" type="button" aria-label="সেটিংস" title="সেটিংস" onClick={() => window.dispatchEvent(new Event("open-system-settings"))}><SettingsIcon aria-hidden="true" /></button>}
    </div>
  );
  return (
    <>
      {launcherTarget && createPortal(launcher, launcherTarget)}
      {open && (
        <div className="account-profile-layer" role="presentation" onClick={() => setOpen(false)}>
          <section className="account-profile-card" role="dialog" aria-modal="true" aria-label="ইউজার প্রোফাইল" onClick={(event) => event.stopPropagation()}>
            <button className="account-close-button" type="button" aria-label="প্রোফাইল বন্ধ করুন" onClick={() => setOpen(false)}>×</button>
      <div className="account-cover" />
      <div className="account-card-body">
        <div className="account-identity-row">
          <div
            className="account-profile-trigger"
            role="button"
            tabIndex={0}
            aria-expanded={editing}
            aria-label="প্রোফাইল সম্পাদনা করুন"
            onClick={toggleEditing}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleEditing();
              }
            }}
          >
            {avatar ? <img className="account-avatar" src={avatar} alt="প্রোফাইল ছবি" /> : <span className="account-avatar account-avatar-fallback">{initialsText}</span>}
            <div className="account-identity"><h2>{display.name}</h2><p>{roleLabel}</p><span className="account-status"><i /> সক্রিয় অ্যাকাউন্ট</span></div>
          </div>
          {showSettings && (
            <button className="account-modal-settings-btn" type="button" aria-label="সিস্টেম সেটিংস" title="সিস্টেম সেটিংস" onClick={() => { setOpen(false); window.dispatchEvent(new Event("open-system-settings")); }}>
              <SettingsIcon aria-hidden="true" />
            </button>
          )}
          <button type="button" className="account-edit-button" onClick={toggleEditing}>{editing ? "বন্ধ করুন" : "প্রোফাইল সম্পাদনা"}</button>
        </div>
        <div className="account-meta-grid">
          <div><small>ইউজারনেম</small><strong>{display.username}</strong></div><div><small>রোল</small><strong>{roleLabel}</strong></div><div><small>অঞ্চল / দায়িত্ব</small><strong>{areaLabel}</strong></div>
          <div><small>মোবাইল</small><strong>{display.phone || "তথ্য যোগ করা হয়নি"}</strong></div><div><small>ইমেইল</small><strong>{display.email || "তথ্য যোগ করা হয়নি"}</strong></div><div><small>ঠিকানা</small><strong>{display.address || "তথ্য যোগ করা হয়নি"}</strong></div>
        </div>
        {display.bio && <p className="account-bio">{display.bio}</p>}
        {message && <p className="account-message" role="status">{message}</p>}
        {editing && <form className="account-edit-form" onSubmit={saveProfile}><div className="account-form-grid">
          <label className="account-photo-field">প্রোফাইল ছবি<input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} /><small>JPG, PNG বা WebP · সর্বোচ্চ ১ MB</small></label><label>নাম<input value={form.name} onChange={(event) => field("name", event.target.value)} required /></label><label>ডিজিগনেশন<input value={form.designation} onChange={(event) => field("designation", event.target.value)} /></label><label>মোবাইল<input value={form.phone} onChange={(event) => field("phone", event.target.value)} inputMode="numeric" /></label><label>ইমেইল<input value={form.email} onChange={(event) => field("email", event.target.value)} type="email" /></label><label>ঠিকানা<input value={form.address} onChange={(event) => field("address", event.target.value)} /></label><label>নতুন পাসওয়ার্ড<input value={form.new_password} onChange={(event) => field("new_password", event.target.value)} type="password" placeholder="পরিবর্তন করতে চাইলে লিখুন" /></label><label className="account-form-wide">নিজের সম্পর্কে<textarea value={form.bio} onChange={(event) => field("bio", event.target.value)} rows={3} /></label>
        </div><div className="account-form-actions"><button type="submit" className="button-primary" disabled={saving}>{saving ? "সংরক্ষণ হচ্ছে…" : "পরিবর্তন সংরক্ষণ"}</button><button type="button" className="button-secondary" onClick={() => setEditing(false)}>বাতিল</button></div></form>}
        <div className="account-card-footer">
          <span>এই ডিভাইসে আপনার সেশন সক্রিয় আছে</span>
          <button type="button" className="account-logout-button" onClick={logout} disabled={loggingOut}>
            {loggingOut ? "লগআউট হচ্ছে…" : "লগআউট"}
          </button>
        </div>
      </div>
          </section>
        </div>
      )}
    </>
  );
}
