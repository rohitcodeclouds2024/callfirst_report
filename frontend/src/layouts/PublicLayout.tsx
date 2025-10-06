import { FaTwitter, FaGithub, FaLinkedin, FaFacebook } from "react-icons/fa";
import RouteLoader from "../components/RouteLoader";

export default function PublicLayout({
  children,
  hideHeaderFooter = true,
}: {
  children: React.ReactNode;
  hideHeaderFooter?: boolean;
}) {
  return (
    <div
      className={`flex flex-col min-h-screen transition-colors duration-300 ${
        hideHeaderFooter ? "" : "bg-background text-neutral"
      }`}
    >
      {!hideHeaderFooter && <PublicHeader />}
      <main className="flex-1">
        <RouteLoader />
        {children}
      </main>
      {!hideHeaderFooter && <PublicFooter />}
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="bg-primary text-white shadow-md transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="DatastarPro Logo" className="h-8 w-auto" />
        </a>

        {/* Navigation */}
        <nav className="space-x-6 hidden md:flex">
          {["Features", "Pricing", "About", "Contact"].map((item) => (
            <a
              key={item}
              href={`/${item.toLowerCase()}`}
              className="hover:text-accent transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <button className="text-white focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="bg-surface border-t border-border text-sm text-muted transition-colors duration-300">
      <div className="container mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Logo + Description */}
        <div className="flex flex-col space-y-2">
          <a href="/" className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="DatastarPro Logo"
              className="h-6 w-auto"
            />
          </a>
          <p className="text-muted">
            Building amazing web experiences with modern tech.
          </p>
        </div>

        <div>
          <h5 className="font-medium mb-2 text-neutral">Company</h5>
          <ul className="space-y-1">
            {["About", "Careers", "Press"].map((item) => (
              <li key={item}>
                <a
                  href={`/${item.toLowerCase()}`}
                  className="hover:text-primary transition-colors"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="font-medium mb-2 text-neutral">Support</h5>
          <ul className="space-y-1">
            {["Help Center", "Terms", "Privacy"].map((item) => (
              <li key={item}>
                <a
                  href={`/${item.toLowerCase().replace(" ", "-")}`}
                  className="hover:text-primary transition-colors"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h5 className="font-medium mb-2 text-neutral">Follow Us</h5>
          <div className="flex space-x-3">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="hover:text-primary transition-colors"
            >
              <FaTwitter className="h-5 w-5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hover:text-primary transition-colors"
            >
              <FaGithub className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-primary transition-colors"
            >
              <FaLinkedin className="h-5 w-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-primary transition-colors"
            >
              <FaFacebook className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="text-center text-xs mt-6 mb-2 text-muted transition-colors duration-300">
        © {new Date().getFullYear()} DatastarPro. All rights reserved.
      </div>
    </footer>
  );
}
