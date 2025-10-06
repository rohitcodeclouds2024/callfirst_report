import React from "react";
import CheckboxInput from "./../../components/form/CheckboxInput"; // adjust path as needed

type RowSkeletonProps = {
  count?: number;
  columns?: number;
  withCheckbox?: boolean;
};

const RowSkeleton = ({
  count = 5,
  columns = 7,
  withCheckbox = true,
}: RowSkeletonProps) => {
  const renderCells = () => {
    const cellCount = withCheckbox ? columns - 1 : columns;

    return Array.from({ length: cellCount }).map((_, j) => (
      <td key={j} className="px-6 py-4">
        <div className="h-4 rounded bg-border animate-pulse"></div>
      </td>
    ));
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={`skeleton-${i}`} className="border-b border-border">
          {withCheckbox && (
            <td className="px-6 py-4">
              <CheckboxInput label="" checked={false} onChange={() => {}} />
            </td>
          )}
          {renderCells()}
        </tr>
      ))}
    </>
  );
};

export default RowSkeleton;
