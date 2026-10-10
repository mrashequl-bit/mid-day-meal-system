"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { areas } from "../data/schools";
import { ASSIGNABLE_USER_ROLES, USER_ROLE_LABELS } from "../lib/user-roles";
import "./user-management.css";

type ManagedUser = {
  id: number; username: string; name: string; role: string;
  area_code?: string | null; area_name?: string | null; is_active: number;
  email?: string | null; phone?: string | null; bio?: string | null;
  address?: string | null; designation?: string | null; photo_base64?: string | null;
};

const emptyForm = {
  username: "", password: "", name: "", role: "area_manager",
  area_code: "", is_active: 1, email: "", phone: "", bio: "",
  address: "", designation: "",
};

function userInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("") || "ইউ";
}

function displayRole(role: string) {
  return USER_ROLE_LABELS[role as keyof typeof USER_ROLE_LABELS] || role;
}

export function UserManagementWidget() {
  const [allowed, setAllowed] = useState(false);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    const response = await fetch("/api/users", { cache: "no-store" });
    if (response.status === 403) return false;
    if (!response.ok) throw new Error("ইউজার তালিকা লোড করা যায়নি।");
    setUsers(await response.json() as ManagedUser[]);
    setAllowed(true);
    return true;
  }, []);

  useEffect(() => {
    loadUsers().catch(() => undefined);
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("bn");
    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (!needle) return true;
      return [user.name, user.username, user.phone, user.email, user.area_name]
        .filter(Boolean).some((value) => String(value).toLocaleLowerCase("bn").includes(needle));
    });
  }, [query, roleFilter, users]);

  function closeEditor() { setEditing(null); setEditorMode(null); setForm(emptyForm); }

  function startEdit(user: ManagedUser) {
    setEditing(user); setEditorMode("edit"); setMessage("");
    setForm({
      username: user.username || "", password: "", name: user.name || "",
      role: user.role || "area_manager",
      area_code: user.area_code || "", is_active: Number(user.is_active),
      email: user.email || "", phone: user.phone || "", bio: user.bio || "",
      address: user.address || "", designation: user.designation || "",
    });
  }

  function startCreate() { setEditing(null); setEditorMode("create"); setForm(emptyForm); setMessage(""); }

  async function saveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isCreating = editorMode === "create";
    if (!isCreating && !editing) return;
    setSaving(true); setMessage("");
    try {
      const response = await fetch(isCreating ? "/api/users" : `/api/users/${editing?.id}`, {
        method: isCreating ? "POST" : "PUT",
        headers: { "content-type": "application/json" }, body: JSON.stringify(form),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || (isCreating ? "ইউজার যোগ করা যায়নি।" : "ইউজার আপডেট করা যায়নি।"));
      await loadUsers(); closeEditor();
      setMessage(isCreating ? "নতুন ইউজার সফলভাবে যোগ হয়েছে।" : "ইউজার প্রোফাইল সফলভাবে আপডেট হয়েছে।");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ইউজার সংরক্ষণ করা যায়নি।");
    } finally { setSaving(false); }
  }

  async function deleteUser(user: ManagedUser) {
    if (user.role === "super_admin" || !window.confirm(`${user.name} ইউজারটি স্থায়ীভাবে ডিলেট করবেন?`)) return;
    setSaving(true); setMessage("");
    try {
      const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "ইউজার ডিলেট করা যায়নি।");
      await loadUsers(); closeEditor(); setMessage("ইউজার সফলভাবে ডিলেট হয়েছে।");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ইউজার ডিলেট করা যায়নি।");
    } finally { setSaving(false); }
  }

  const field = (key: keyof typeof form, value: string | number) => setForm((current) => ({ ...current, [key]: value }));

  if (!allowed) return null;
  return <>
    <button className="user-management-widget" type="button" onClick={() => setOpen(true)}>
      <span className="user-widget-icon">ইউ</span><span><strong>ইউজার ম্যানেজমেন্ট</strong><small>{users.length}টি প্রোফাইল · সম্পাদনা ও অনুমতি নিয়ন্ত্রণ</small></span>
      <span className="user-widget-avatars">{users.slice(0, 3).map((user) => <i key={user.id}>{userInitials(user.name)}</i>)}</span><b>খুলুন</b>
    </button>
    {open && createPortal(
      <div className="user-manager-layer" role="presentation" onClick={() => setOpen(false)}>
        <section className="user-manager-dialog" role="dialog" aria-modal="true" aria-label="ইউজার ম্যানেজমেন্ট" onClick={(event) => event.stopPropagation()}>
          <header><div><small>সুপার অ্যাডমিন কন্ট্রোল</small><h2>ইউজার ম্যানেজমেন্ট</h2><p>সিস্টেমের সকল প্রোফাইল ও অ্যাকাউন্ট স্ট্যাটাস পরিচালনা করুন</p></div><button type="button" aria-label="বন্ধ করুন" onClick={() => setOpen(false)}>×</button></header>
          <div className="user-manager-toolbar"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="নাম, মোবাইল, ইউজারনেম বা অঞ্চল দিয়ে খুঁজুন" /><select className="user-role-filter" aria-label="ইউজার রোল অনুযায়ী ফিল্টার" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="all">সব রোল</option>{Object.entries(USER_ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><span>{filteredUsers.length}টি অ্যাকাউন্ট</span><button className="button-primary user-add-button" type="button" onClick={startCreate}>নতুন ইউজার যোগ করুন</button></div>
          {message && <p className="user-manager-message" role="status">{message}</p>}
          <div className="managed-user-grid">{filteredUsers.map((user) => (
            <article key={user.id} className={user.is_active ? "" : "managed-user-disabled"}>
              <div className="managed-user-avatar">{userInitials(user.name)}</div>
              <div className="managed-user-main"><div><h3>{user.name}</h3><span className={user.is_active ? "user-active" : "user-inactive"}>{user.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</span></div><p>{displayRole(user.role)}</p><dl><div><dt>ইউজারনেম</dt><dd>{user.username}</dd></div><div><dt>অঞ্চল</dt><dd>{user.area_name || "সব অঞ্চল"}</dd></div><div><dt>মোবাইল</dt><dd>{user.phone || user.username}</dd></div></dl></div>
              <div className="managed-user-actions"><button type="button" onClick={() => startEdit(user)}>প্রোফাইল সম্পাদনা</button>{user.role !== "super_admin" && <button className="user-delete-button" type="button" onClick={() => deleteUser(user)}>ডিলেট</button>}</div>
            </article>
          ))}</div>
          {editorMode && <div className="user-edit-layer" role="presentation" onClick={closeEditor}>
            <form className="user-edit-card" onSubmit={saveUser} onClick={(event) => event.stopPropagation()}>
              <div className="user-edit-head"><div><small>{editorMode === "create" ? "নতুন অ্যাকাউন্ট" : "প্রোফাইল সম্পাদনা"}</small><h3>{editorMode === "create" ? "নতুন ইউজার যোগ করুন" : editing?.name}</h3></div><button type="button" onClick={closeEditor}>×</button></div>
              <div className="user-edit-grid">
                <label>পূর্ণ নাম<input required value={form.name} onChange={(event) => field("name", event.target.value)} /></label>
                <label>ইউজারনেম<input required value={form.username} onChange={(event) => field("username", event.target.value)} /></label>
                <label>রোল<select disabled={editing?.role === "super_admin"} value={editing?.role === "super_admin" ? "super_admin" : form.role} onChange={(event) => field("role", event.target.value)}>{editing?.role === "super_admin" && <option value="super_admin">{USER_ROLE_LABELS.super_admin}</option>}{ASSIGNABLE_USER_ROLES.map((value) => <option key={value} value={value}>{USER_ROLE_LABELS[value]}</option>)}</select></label>
                <label>অঞ্চল<select disabled={form.role !== "area_manager"} required={form.role === "area_manager"} value={form.area_code} onChange={(event) => field("area_code", event.target.value)}><option value="">অঞ্চল নির্বাচন</option>{areas.map((area) => <option key={area.code} value={area.code}>{area.name}</option>)}</select></label>
                <label>মোবাইল<input value={form.phone} onChange={(event) => field("phone", event.target.value)} inputMode="numeric" /></label>
                <label>ইমেইল<input type="email" value={form.email} onChange={(event) => field("email", event.target.value)} /></label>
                <label>ডিজিগনেশন<input value={form.designation} onChange={(event) => field("designation", event.target.value)} /></label>
                <label>{editorMode === "create" ? "পাসওয়ার্ড" : "নতুন পাসওয়ার্ড"}<input required={editorMode === "create"} type="password" value={form.password} onChange={(event) => field("password", event.target.value)} placeholder={editorMode === "create" ? "পাসওয়ার্ড দিন" : "পরিবর্তন না করলে খালি রাখুন"} /></label>
                <label>অ্যাকাউন্ট স্ট্যাটাস<select value={form.is_active} onChange={(event) => field("is_active", Number(event.target.value))}><option value={1}>সক্রিয়</option><option value={0}>নিষ্ক্রিয়</option></select></label>
                <label>ঠিকানা<input value={form.address} onChange={(event) => field("address", event.target.value)} /></label>
                <label className="user-edit-wide">নিজের সম্পর্কে<textarea rows={3} value={form.bio} onChange={(event) => field("bio", event.target.value)} /></label>
              </div>
              <div className="user-edit-actions"><button className="button-primary" type="submit" disabled={saving}>{saving ? "সংরক্ষণ হচ্ছে…" : editorMode === "create" ? "ইউজার যোগ করুন" : "পরিবর্তন সংরক্ষণ"}</button><button className="button-secondary" type="button" onClick={closeEditor}>বাতিল</button></div>
            </form>
          </div>}
        </section>
      </div>, document.body,
    )}
  </>;
}
