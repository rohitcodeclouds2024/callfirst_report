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
export async function generateMetadata(): Promise<Metadata> {
  const path = "/";
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
