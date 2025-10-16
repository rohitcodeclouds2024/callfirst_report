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
