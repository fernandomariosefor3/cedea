import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Como funciona", href: "#how-it-works" },
  { label: "Planos", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contato", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const sections = ["home", "how-it-works", "about", "services", "portfolio", "pricing", "faq", "contact"];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) {
          setActive(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNav = (href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-20">
        <a href="#home" onClick={() => handleNav("#home")} className="flex items-center gap-3 cursor-pointer">
          <div className="w-14 h-14 flex items-center justify-center">
            <img
              src="https://storage.readdy-site.link/project_files/39e7c9d0-c363-4d2c-9178-5149cb0274e0/c8d6296c-cf8b-434b-af6a-a4cf98876b89_1775334459022.jpg?v=482e543bd3ecee30f7eb14ce04149a24"
              alt="emdia logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className={`text-5xl font-bold tracking-tight transition-colors duration-300 ${scrolled ? "text-slate-900" : "text-white"}`}>
            emdia
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const id = link.href.replace("#", "");
            return (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className={`text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap relative group ${
                  scrolled
                    ? active === id
                      ? "text-emerald-600"
                      : "text-slate-600 hover:text-emerald-600"
                    : active === id
                    ? "text-white"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-500 rounded-full transition-transform duration-200 ${
                    active === id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>
            );
          })}
          <Link
            to="/auth"
            className="ml-2 px-5 py-2.5 bg-white text-emerald-600 hover:bg-emerald-50 text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer"
          >
            Acessar App
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
            scrolled ? "text-slate-800" : "text-white"
          }`}
        >
          <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden bg-white border-t border-slate-100 overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className="text-left text-slate-700 font-medium py-1 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <Link
            to="/auth"
            className="text-left text-emerald-600 font-semibold py-1 hover:text-emerald-700 transition-colors cursor-pointer"
            onClick={() => setMenuOpen(false)}
          >
            Acessar App
          </Link>
        </div>
      </div>
    </header>
  );
}
