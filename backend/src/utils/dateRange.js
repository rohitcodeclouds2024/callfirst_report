/**
 * Returns start and end dates based on filter type
 * @param {"last7"|"previousWeek"|"custom"} dateFilter
 * @param {{start: string, end: string}} customRange
 * @returns {{startDate: Date, endDate: Date, dateArray: string[]}}
 */
export function getDateRange(dateFilter, customRange = null) {
  const today = new Date();
  let startDate, endDate;

  if (dateFilter === "last7") {
    endDate = today;
    startDate = new Date();
    startDate.setDate(endDate.getDate() - 6); // last 7 days
  } else if (dateFilter === "previousWeek") {
    const day = today.getDay(); // Sunday = 0
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - day - 1); // previous Sunday
    endDate = lastSunday;
    startDate = new Date(lastSunday);
    startDate.setDate(lastSunday.getDate() - 6); // previous Monday
  } else if (dateFilter === "custom") {
    if (!customRange?.start || !customRange?.end) {
      throw new Error("Custom range start and end dates are required");
    }

    startDate = new Date(customRange.start);
    endDate = new Date(customRange.end);

    const diffDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    // if (diffDays < 5 || diffDays > 31) {
    //   throw new Error("Custom range must be between 5 and 31 days");
    // }
  } else {
    throw new Error("Invalid dateFilter value");
  }

  // Generate array of dates in YYYY-MM-DD
  const dateArray = [];
  const d = new Date(startDate);
  while (d <= endDate) {
    dateArray.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }

  return { startDate, endDate, dateArray };
}

/**
 * Returns start and end dates based on filter type
 * @param {"last7"|"previousWeek"|"custom"} dateFilter
 * @param {{start: string, end: string}} customRange
 * @returns {{startDate: Date, endDate: Date, dateArray: string[]}}
 */
export function getDateRangeNewLogic(dateFilter, customRange = null) {
  const today = new Date();
  let startDate, endDate;

  if (dateFilter === "last7") {
    endDate = today;
    startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
  } else if (dateFilter === "previousWeek") {
    const day = today.getDay();
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - day - 1);
    endDate = lastSunday;
    startDate = new Date(lastSunday);
    startDate.setDate(lastSunday.getDate() - 6);
  } else if (dateFilter === "custom") {
    if (!customRange?.start || !customRange?.end) {
      throw new Error("Custom range start and end dates are required");
    }

    startDate = new Date(customRange.start);
    endDate = new Date(customRange.end);
  } else {
    throw new Error("Invalid dateFilter value");
  }

  // Generate array of dates in YYYY-MM-DD
  const dateArray = [];
  const d = new Date(startDate);
  while (d <= endDate) {
    dateArray.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }

  return { startDate, endDate, dateArray };
}

