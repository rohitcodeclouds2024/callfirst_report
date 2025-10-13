"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useLayout } from "../../context/LayoutContext";
import { FaTooth } from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";
import { notify } from "../../../components/Toaster";
import Link from "next/link";
import TextInput from "../../../components/form/TextInput";
import PasswordInput from "../../../components/form/PasswordInput";
import FormButton from "../../../components/form/FormButton";
import CheckboxInput from "../../../components/form/CheckboxInput";
import "../../../i18n";
// import useApi from "./../../../lib/useApi";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  //   const api = useApi();
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();
  const { setHideHeaderFooter } = useLayout();

  useEffect(() => setHideHeaderFooter(true), []);

  useEffect(() => {
    if (session) router.push("/admin/dashboard");
  }, [session, router]);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid.";

    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";

    setErrors(newErrors);

    Object.values(newErrors).forEach((err) => err && notify(err, "error"));

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    rememberMe
      ? localStorage.setItem("rememberedEmail", email)
      : localStorage.removeItem("rememberedEmail");

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      //   console.log(res);

      if (res?.error) {
        notify(globalThis.message("common.error"), "error");
      } else {
        notify(globalThis.message("auth.loggedIn"), "success");
        router.push("/admin/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate particle divs
  const particles = Array.from({ length: 30 }).map((_, i) => (
    <div key={i} className={`particle particle-${i + 1}`}></div>
  ));

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Animated Gradient Background */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#0f172a] to-[#2563eb] animate-gradient-xy opacity-40 -z-20"></div> */}

      {/* Particles */}
      {/* <div className="absolute inset-0 -z-10">{particles}</div> */}

      {/* Login Card */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-surface rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl">
        <div className="hidden md:flex md:w-1/2 flex-col justify-center bg-primary p-8 text-white">
          <div className="flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold">DatastarPro</span>
          </div>
          <h2 className="text-3xl font-semibold mb-2">Welcome Back</h2>
          <p className="text-gray-200 text-sm">Enter your credentials to access your <strong>dashboard</strong> and manage your account.</p>
        </div>
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-semibold mb-6 md:hidden text-center text-neutral">Login</h2>
          <form className="grid grid-cols-12 gap-6 mb-6" onSubmit={ handleSubmit }>
            <div className="col-span-12">
              <TextInput id="email" label="Email" type="email" placeholder="Enter your email" value={ email } onChange={ ( e ) => setEmail( e.target.value ) } error={ errors.email } autoComplete="on" />
            </div>
            <div className="col-span-12">
              <PasswordInput id="password" label="Password" placeholder="Enter your password" value={ password } onChange={ ( e ) => setPassword( e.target.value ) } error={ errors.password } autoComplete="off" />
            </div>
            <div className="col-span-12">
              <CheckboxInput label="Remember Me" checked={ rememberMe } onChange={ ( e ) => setRememberMe( e.target.checked ) } id="rememberMe" />
            </div>
            <div className="col-span-12">
              <FormButton label="Sign In" type="submit" id="login" variant="primary" className="w-full" disabled={ loading } loading={ loading } icon={ <HiArrowRight size={ 16 } className="block"  /> } iconPosition="right" />
            </div>
          </form>
          {/* <p className="text-sm text-muted my-6 text-center">Email : demo@demo.com <br /> password : demo123</p> */}
          <p className="text-sm text-gray-500 text-center">Forgot your password?{" "}
            <Link href="/forgot-password" id="resetLink" className="font-medium text-primary underline">Reset it here</Link>
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
