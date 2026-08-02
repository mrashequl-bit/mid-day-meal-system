export const USER_ROLE_LABELS = {
  super_admin: "সুপার অ্যাডমিন",
  area_manager: "এরিয়া ম্যানেজার",
  project_manager: "প্রকল্প ম্যানেজার",
  store_manager: "স্টোর ম্যানেজার",
  tiffin_manager: "টিফিন ম্যানেজার",
} as const;

export type UserRole = keyof typeof USER_ROLE_LABELS;

export const ASSIGNABLE_USER_ROLES = [
  "area_manager",
  "project_manager",
  "store_manager",
  "tiffin_manager",
] as const satisfies readonly UserRole[];

export function isAssignableUserRole(value: unknown): value is (typeof ASSIGNABLE_USER_ROLES)[number] {
  return typeof value === "string" && ASSIGNABLE_USER_ROLES.includes(value as (typeof ASSIGNABLE_USER_ROLES)[number]);
}
