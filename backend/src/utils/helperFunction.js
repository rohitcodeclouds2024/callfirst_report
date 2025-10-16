export function formatDateRangeLabel(startDate, endDate, sameYear) {
   sameYear = false;
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

export function groupData({ dateArray, dataMap, startDate, endDate, sameYear, field,sendas}) {
   sameYear = false;
   const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
   const groupedData = [];

   if (diffDays > 10) {
      const maxPoints = 10;
      const groupSize = Math.ceil(diffDays / maxPoints);

      for (let i = 0; i < dateArray.length; i += groupSize) {
         const groupDates = dateArray.slice(i, i + groupSize);
         const total = groupDates.reduce((sum, date) => sum + (dataMap.get(date)?.[field] || 0), 0);

         groupedData.push({
            name: formatDateRangeLabel(groupDates[0], groupDates[groupDates.length - 1], sameYear),
            [sendas]: total,
         });
      }
   } else {
      dateArray.forEach(date => {
         groupedData.push({
            name: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            [sendas]: dataMap.get(date)?.[field] || 0,
         });
      });
   }
   return groupedData;
}

export function formatDateMDY(date) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}


