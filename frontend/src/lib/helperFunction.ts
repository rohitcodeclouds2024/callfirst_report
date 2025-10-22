export function formatDateMDY(date) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear(); // full 4-digit year

  return `${month}/${day}/${year}`;
}

export const formatYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export type DateFilter = "last7" | "previousWeek" | "custom";

export interface CustomRange {
  start: string | Date;
  end: string | Date;
}

export interface DateRangeResult {
  startDate: Date;
  endDate: Date;
  dateArray: string[]; // YYYY-MM-DD
}

export function getDateRange(
  dateFilter: DateFilter,
  customRange?: CustomRange
): DateRangeResult {
  const today = new Date();
  let startDate: Date, endDate: Date;

  switch (dateFilter) {
    case "last7":
      endDate = today;
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);
      break;

    case "previousWeek":
      const day = today.getDay();
      const lastSunday = new Date(today);
      lastSunday.setDate(today.getDate() - day - 1); // last week's Sunday
      endDate = lastSunday;
      startDate = new Date(lastSunday);
      startDate.setDate(lastSunday.getDate() - 6); // last week Monday
      break;

    case "custom":
      if (!customRange?.start || !customRange?.end) {
        throw new Error("Custom range start and end dates are required");
      }
      startDate = new Date(customRange.start);
      endDate = new Date(customRange.end);
      break;

    default:
      throw new Error("Invalid dateFilter value");
  }

  // Generate array of dates in YYYY-MM-DD
  const dateArray: string[] = [];
  const d = new Date(startDate);
  while (d <= endDate) {
    dateArray.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }

  return { startDate, endDate, dateArray };
}

export function formatDateRangeLabel(
  startDate: string | Date,
  endDate: string | Date,
  sameYear = false
): string {
  const startObj = new Date(startDate);
  const endObj = new Date(endDate);

  const startLabel = startObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "2-digit" }),
  });

  const endLabel = endObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "2-digit" }),
  });

  return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
}
