// app/layout.tsx
import type { Metadata } from "next";
import "./../styles/global.css";
import SessionWrapper from "./../components/SessionWrapper";
import { ThemeProvider } from "./context/ThemeContext";
import { LoaderProvider } from "./context/LoaderContext";
import { AppProvider } from "./context/AppProvider";

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
            <LoaderProvider>
              <AppProvider> {children}</AppProvider>
            </LoaderProvider>
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
