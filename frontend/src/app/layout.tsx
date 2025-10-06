// app/layout.tsx
import type { Metadata } from "next";
import "./../styles/global.css";
import SessionWrapper from "./../components/SessionWrapper";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeToggle from "./../components/ThemeComponent";
import { LoaderProvider } from "./context/LoaderContext";

const siteName = "DatastarPro";

// Static page title mapping
const staticTitles: Record<string, string> = {
  "/": "Home",
  "/admin": "Admin",
  "/login": "Login",
  "/about": "About",
  "/contact": "Contact",
};

function formatTitle(name: string) {
  return `${siteName} || ${name}`;
}

export async function generateMetadata({
  params,
  pathname,
}: {
  params: any;
  pathname?: string;
}): Promise<Metadata> {
  // Dynamic route handling
  const slug = params?.slug
    ? Array.isArray(params.slug)
      ? params.slug
      : [params.slug]
    : [];

  if (slug.length > 0) {
    const pageName = slug
      .map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
      .join(" / ");
    return { title: formatTitle(pageName) };
  }

  // Static route handling
  const path = pathname ?? "/";
  const staticPageName = staticTitles[path] ?? "Home";
  return { title: formatTitle(staticPageName) };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                document.documentElement.classList.add(theme);
              })()
            `,
          }}
        />
        <ThemeProvider>
          <SessionWrapper>
            <LoaderProvider> {children}</LoaderProvider>
          </SessionWrapper>
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
