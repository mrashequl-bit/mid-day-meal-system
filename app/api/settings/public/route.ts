import { NextResponse } from "next/server";
import { getAuthUser } from "../../../lib/auth";
import { getSettings } from "../../../lib/admin-settings";
export async function GET(){if(!await getAuthUser())return NextResponse.json({error:"Unauthorized"},{status:401});const s=await getSettings();return NextResponse.json({institution_name:s.institution_name,project_name:s.project_name,address:s.address,logo_data_url:s.logo_data_url,language:s.language,timezone:s.timezone,date_format:s.date_format})}
