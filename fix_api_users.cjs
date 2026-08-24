const fs = require('fs');

// 1. Update app/api/users/route.ts
let api = fs.readFileSync('app/api/users/route.ts', 'utf8');
api = api.replace('u.area_code, u.is_active', 'u.area_code, u.school_emis_code, u.is_active');
api = api.replace('a.name_bn AS area_name', 'a.name_bn AS area_name, s.name_bn AS school_name');
api = api.replace('LEFT JOIN areas a ON a.code = u.area_code', 'LEFT JOIN areas a ON a.code = u.area_code\n       LEFT JOIN schools s ON s.emis_code = u.school_emis_code');
api = api.replace('const role = data.role;', 'const role = data.role as string;');
api = api.replace('if (role === "area_manager"', 'const isSchoolRole = role === "school_headmaster" || role === "tiffin_manager";\n    if (isSchoolRole && !String(data.school_emis_code ?? "").trim()) {\n      return NextResponse.json({ error: "এই রোলের জন্য একটি বিদ্যালয় নির্বাচন করা আবশ্যক।" }, { status: 400 });\n    }\n    if (role === "area_manager"');
api = api.replace('role === "area_manager" ? String(data.area_code ?? "") : null,', 'role === "area_manager" ? String(data.area_code ?? "") : null,\n      isSchoolRole ? String(data.school_emis_code ?? "") : null,');
api = api.replace('(username, password, name, role, area_code, is_active', '(username, password, name, role, area_code, school_emis_code, is_active');
api = api.replace('VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
api = api.replace('area_code: data.area_code }', 'area_code: data.area_code, school_emis_code: data.school_emis_code }');
fs.writeFileSync('app/api/users/route.ts', api, 'utf8');

// 2. Update app/api/users/[id]/route.ts
let apiId = fs.readFileSync('app/api/users/[id]/route.ts', 'utf8');
apiId = apiId.replace('if (nextRole === "area_manager"', 'const isSchoolRole = nextRole === "school_headmaster" || nextRole === "tiffin_manager";\n    if (isSchoolRole && !String(data.school_emis_code ?? "").trim()) {\n      return NextResponse.json({ error: "এই রোলের জন্য একটি বিদ্যালয় নির্বাচন করা আবশ্যক।" }, { status: 400 });\n    }\n    if (nextRole === "area_manager"');
apiId = apiId.replace('area_code = ?, is_active', 'area_code = ?, school_emis_code = ?, is_active');
apiId = apiId.replace('nextRole === "area_manager" ? String(data.area_code ?? "") : null,', 'nextRole === "area_manager" ? String(data.area_code ?? "") : null,\n      isSchoolRole ? String(data.school_emis_code ?? "") : null,');
apiId = apiId.replace('area_code: data.area_code, is_active', 'area_code: data.area_code, school_emis_code: data.school_emis_code, is_active');
fs.writeFileSync('app/api/users/[id]/route.ts', apiId, 'utf8');

console.log('API updated successfully.');
