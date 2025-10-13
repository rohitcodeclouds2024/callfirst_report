"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLayout } from "../../context/LayoutContext";
import { FaTooth } from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";
import { notify } from "../../../components/Toaster";
import Link from "next/link";
import TextInput from "../../../components/form/TextInput";
import FormButton from "../../../components/form/FormButton";
import "../../../i18n";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setHideHeaderFooter } = useLayout();

  useEffect(() => setHideHeaderFooter(true), []);

  const validate = () => {
    if (!email) {
      const msg = "Email is required.";
      setError(msg);
      notify(msg, "error");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      const msg = "Email is invalid.";
      setError(msg);
      notify(msg, "error");
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Simulate backend request
      await new Promise((resolve) => setTimeout(resolve, 1500));
      notify(globalThis.message("auth.forgotPasswordSuccess"), "success");
      router.push("/login");
    } catch {
      notify(globalThis.message("common.error"), "error");
    } finally {
      setLoading(false);
    }
  };

  // Generate particles
  const particles = Array.from({ length: 30 }).map((_, i) => (
    <div key={i} className={`particle particle-${i + 1}`}></div>
  ));

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#0f172a] to-[#2563eb] animate-gradient-xy opacity-40 -z-20"></div> */}
      {/* <div className="absolute inset-0 -z-10">{particles}</div> */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-surface rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl">
        {/* Left Section */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-center bg-primary p-8 text-white">
          <div className="flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <span className="block">DatastarPro</span>
          </div>
          <h2 className="text-3xl font-semibold mb-2">Forgot Password</h2>
          <p className="text-gray-200 text-sm">Enter your email address and we’ll send you a password reset link.</p>
        </div>
        <div className="w-full flex flex-col justify-center gap-6 md:w-1/2 p-8 md:min-h-80">
          {/* <h2 className="text-2xl font-semibold mb-6 md:hidden text-center text-neutral">Forgot Password</h2> */}
          <form className="grid grid-cols-12 gap-6" onSubmit={ handleSubmit }>
            <div className="col-span-12">
              <TextInput id="email" label="Email" type="email" placeholder="Enter your email" value={ email } onChange={ ( e ) => setEmail( e.target.value ) } error={ error } autoComplete="on" />
            </div>
            <div className="col-span-12">
              <FormButton type="submit" label="Send Reset Link" className="w-full" loading={ loading } icon={ <HiArrowRight className="block" size={ 16 } /> } iconPosition="right" id="forgotPassword" />
            </div>
          </form>
          <p className="text-sm text-gray-500 text-center">Remembered your password?{" "} <Link href="/login" id="loginLink" className="font-medium text-primary underline">Back to Login</Link>
          </p>
        </div>
      </div>

      {/* Gradient animation & particles CSS */}
      {/* <style jsx global>{`
        @keyframes gradientXY {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradientXY 15s ease infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.5;
          }
        }

        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        ${Array.from({ length: 30 })
          .map(
            (_, i) => `
          .particle-${i + 1} {
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            width: ${2 + Math.random() * 6}px;
            height: ${2 + Math.random() * 6}px;
            animation-duration: ${4 + Math.random() * 6}s;
            animation-delay: ${Math.random() * 5}s;
          }
        `
          )
          .join("")}
      `}</style> */}
    </div>
  );
}
