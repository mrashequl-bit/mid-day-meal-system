const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDate(value: string | Date) {
  if (value instanceof Date) return value;
  const match = value.match(dateOnlyPattern);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  }
  return new Date(value);
}

export function formatDateDMY(value?: string | Date | null) {
  if (!value) return "";
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: value instanceof Date ? "Asia/Dhaka" : undefined,
  }).format(date);
}

export function formatDateTimeDMY(value?: string | Date | null) {
  if (!value) return "";
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  }).format(date);
}
