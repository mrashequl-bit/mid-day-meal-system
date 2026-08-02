export const DISTRIBUTION_REPORT_CUTOFF_HOUR = 14;

type DhakaClock = {
  date: string;
  hour: number;
  minute: number;
  second: number;
};

export function getDhakaClock(now = new Date()): DhakaClock {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || "";

  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    hour: Number(value("hour")),
    minute: Number(value("minute")),
    second: Number(value("second")),
  };
}

export function getAreaManagerReportingWindow(reportDate: string, now = new Date()) {
  const dhaka = getDhakaClock(now);
  const isReportDay = reportDate === dhaka.date;
  const isAfterCutoff = isReportDay && dhaka.hour >= DISTRIBUTION_REPORT_CUTOFF_HOUR;
  const isPastDate = reportDate < dhaka.date;

  return {
    canReport: isReportDay && !isAfterCutoff,
    shouldAutoReceive: isPastDate || isAfterCutoff,
    isAfterCutoff,
    isPastDate,
    isFutureDate: reportDate > dhaka.date,
  };
}
