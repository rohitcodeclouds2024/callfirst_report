export interface GraphProps {
  selectedClientId: number | "";
  dateFilter: "last7" | "previousWeek" | "custom";
  customRange: {
    start: string;
    end: string;
  };
}
