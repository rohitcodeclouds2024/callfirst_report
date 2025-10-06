"use client";

import { LayoutProvider, useLayout } from "../context/LayoutContext";
import PublicLayout from "./../../layouts/PublicLayout";
import Toaster from "./../../components/Toaster";

function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { hideHeaderFooter } = useLayout();
  return (
    <PublicLayout hideHeaderFooter={hideHeaderFooter}>{children}</PublicLayout>
  );
}

export default function PublicRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutProvider>
      <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
      <Toaster />
    </LayoutProvider>
  );
}
