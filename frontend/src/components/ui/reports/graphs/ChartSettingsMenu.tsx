"use client";

import { Fragment, ReactNode } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { FaCog, FaDownload } from "react-icons/fa";
import { MdOutlinePreview } from "react-icons/md";
import { formatDateRangeLabel, getDateRange } from "@/lib/helperFunction";
import { useRouter } from "next/navigation";

interface Option {
  id: number;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

export default function ChartSettingsMenu({
  selectedClientId,
  dateFilter,
  customRange,
}) {
  const router = useRouter();
  const { startDate, endDate } = getDateRange(dateFilter, customRange);
  const xlabel = formatDateRangeLabel(startDate, endDate, false);

  const options: Option[] = [
    {
      id: 1,
      label: "Download",
      icon: <FaDownload className="inline-block mr-2" />,
      onClick: () => {
        const queryList = new URLSearchParams({
          client_id: selectedClientId.toString(),
          start_date: startDate.toString(),
          end_date: endDate.toString(),
        }).toString();

        window.open(
          `${process.env.NEXT_PUBLIC_ADMIN_BASE_URL}/report/tracker-download?${queryList}`,
          "_blank"
        );
      },
    },
    {
      id: 2,
      label: "View Report",
      icon: <MdOutlinePreview className="inline-block mr-2" />,
      onClick: () => {
        sessionStorage.setItem(
          "trackerClient",
          JSON.stringify({ clientId: selectedClientId, xAxisLegend: xlabel })
        );
        router.push("/admin/reports/tracker");
      },
    },
  ];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
        <FaCog size={16} />
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 mt-2 w-44 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            {options.map((option) => (
              <MenuItem key={option.id}>
                {({ active }) => (
                  <button
                    onClick={option.onClick}
                    className={`${
                      active ? "bg-gray-100 dark:bg-gray-700" : ""
                    } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
