"use client";

import { Fragment } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { FaCog } from "react-icons/fa";

interface ChartSettingsMenuProps {
  options: { label: string; url: string }[];
}

export default function ChartSettingsMenu({ options }: ChartSettingsMenuProps) {
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
              <MenuItem key={option.label}>
                {({ active }) => (
                  <a
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${
                      active ? "bg-gray-100 dark:bg-gray-700" : ""
                    } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                  >
                    {option.label}
                  </a>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
