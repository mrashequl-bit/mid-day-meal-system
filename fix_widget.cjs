const fs = require('fs');
let widget = fs.readFileSync('app/components/UserManagementWidget.tsx', 'utf8');

// Add school_emis_code to ManagedUser type
widget = widget.replace('area_code?: string | null; area_name?: string | null;', 'area_code?: string | null; area_name?: string | null; school_emis_code?: string | null; school_name?: string | null;');

// Add school_emis_code to emptyForm
widget = widget.replace('area_code: "", is_active', 'area_code: "", school_emis_code: "", is_active');

// In filteredUsers, add school_name
widget = widget.replace('user.email, user.area_name]', 'user.email, user.area_name, user.school_name]');

// In the form rendering, add school dropdown
const formAreaCode = '<label>অঞ্চল<select value={form.area_code} onChange={(event) => field("area_code", event.target.value)} disabled={form.role !== "area_manager"}><option value="">বাছাই করুন</option>{areas.map((area) => <option key={area.code} value={area.code}>{area.name_bn}</option>)}</select></label>';
const formSchoolCode = '<label>বিদ্যালয় (প্রধান শিক্ষক/টিফিন ম্যানেজার)<select value={form.school_emis_code} onChange={(event) => field("school_emis_code", event.target.value)} disabled={form.role !== "school_headmaster" && form.role !== "tiffin_manager"}><option value="">বাছাই করুন</option>{areas.map((area) => <optgroup key={area.code} label={area.name_bn}>{area.schools?.map((school) => <option key={school.emis_code} value={school.emis_code}>{school.name_bn}</option>)}</optgroup>)}</select></label>';
widget = widget.replace(formAreaCode, formAreaCode + '\n                ' + formSchoolCode);

// In the user listing, display school name
widget = widget.replace('<div><dt>অঞ্চল</dt><dd>{user.area_name || "সব অঞ্চল"}</dd></div>', '<div><dt>অঞ্চল</dt><dd>{user.area_name || "সব অঞ্চল"}</dd></div><div><dt>বিদ্যালয়</dt><dd>{user.school_name || "প্রযোজ্য নয়"}</dd></div>');

fs.writeFileSync('app/components/UserManagementWidget.tsx', widget, 'utf8');
console.log('Widget updated.');
