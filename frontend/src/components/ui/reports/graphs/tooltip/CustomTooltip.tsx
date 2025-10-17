import { useRouter } from "next/navigation";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  coordinate?: { x: number; y: number };
  selectedClientId?: number | string;
  viewBtnColor?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  coordinate,
  selectedClientId,
  viewBtnColor,
}) => {
  const router = useRouter();
  if (active && payload && payload.length) {
    const value = payload[0].value;

    const handleViewClick = () => {
      console.log("X-axis:", label);
      console.log("Selected Client ID:", selectedClientId);

      // Save data in sessionStorage
      sessionStorage.setItem(
        "trackerClient",
        JSON.stringify({ clientId: selectedClientId, xAxisLegend: label })
      );

      // Navigate to tracker page
      router.push("/admin/reports/tracker");
    };

    // Use fixed coordinates for the tooltip
    const style: React.CSSProperties = {
      position: "absolute",
      left: (coordinate?.x ?? 0) + 10, // shift right a bit from cursor
      top: (coordinate?.y ?? 0) - 40, // shift above cursor
      backgroundColor: "var(--color-bg)",
      color: "var(--color-text)",
      padding: "0.5rem",
      borderRadius: "0.5rem",
      boxShadow: "0px 2px 4px 0px rgb(0 0 0 / 30%)",
      border: "0px",
      pointerEvents: "auto", // allow clicking
      zIndex: 9999,
    };

    return (
      <div style={style}>
        <div>
          <strong>{`${value}%`}</strong>
        </div>
        <button
          style={{
            display: "inline-block",
            marginTop: "0.25rem",
            background: "transparent",
            cursor: "pointer",
            fontSize: "0.75rem",
            fontWeight: 500,
            color: viewBtnColor,
            textDecoration: "underline",
          }}
          onClick={handleViewClick}
        >
          View
        </button>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
