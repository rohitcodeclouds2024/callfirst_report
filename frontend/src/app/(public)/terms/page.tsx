"use client";

import { useEffect } from "react";
import { useLayout } from "../../context/LayoutContext";

export default function TermsPage() {
  const { setHideHeaderFooter } = useLayout();

  useEffect(() => {
    setHideHeaderFooter(false);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center px-4 py-12 bg-background text-neutral transition-colors duration-300">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 pointer-events-none -z-10"></div>

      <div className="w-full max-w-4xl relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-primary transition-colors duration-300">
          Terms & Conditions
        </h1>

        <p className="text-muted text-lg mb-4 transition-colors duration-300">
          Welcome to DatastarPro. Please read these terms and conditions
          carefully before using our services.
        </p>

        <p className="text-muted text-lg mb-4 transition-colors duration-300">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
          lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod
          malesuada.
        </p>

        <p className="text-muted text-lg mb-4 transition-colors duration-300">
          Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis
          natoque penatibus et magnis dis parturient montes, nascetur ridiculus
          mus.
        </p>

        <p className="text-muted text-lg mb-4 transition-colors duration-300">
          Donec ullamcorper nulla non metus auctor fringilla. Maecenas sed diam
          eget risus varius blandit sit amet non magna.
        </p>
      </div>
    </div>
  );
}
