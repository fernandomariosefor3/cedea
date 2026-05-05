const links = [
  { label: "Home", href: "#home" },
  { label: "Como funciona", href: "#how-it-works" },
  { label: "Planos", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contato", href: "#contact" },
];

const socials = [
  { icon: "ri-instagram-line", href: "#" },
  { icon: "ri-twitter-x-line", href: "#" },
  { icon: "ri-linkedin-box-line", href: "#" },
  { icon: "ri-github-line", href: "#" },
];

export default function Footer() {
  const handleNav = (href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 flex items-center justify-center bg-white/10 rounded-xl">
                <img
                  src="https://storage.readdy-site.link/project_files/39e7c9d0-c363-4d2c-9178-5149cb0274e0/c8d6296c-cf8b-434b-af6a-a4cf98876b89_1775334459022.jpg?v=482e543bd3ecee30f7eb14ce04149a24"
                  alt="emdia"
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <span className="text-5xl font-extrabold tracking-tight">emdia</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Controle financeiro pessoal inteligente para quem quer ter clareza sobre o próprio dinheiro.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socials.map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer"
                >
                  <i className={`${s.icon} text-base`} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 mb-5">
              Navegação
            </h3>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNav(link.href)}
                    className="text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300 mb-5">
              Contato
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <i className="ri-mail-line text-emerald-400" />
                <a href="mailto:emdiacontrolefinanceiro@gmail.com" className="hover:text-white transition-colors cursor-pointer">
                  emdiacontrolefinanceiro@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <i className="ri-whatsapp-line text-emerald-400" />
                <a href="https://wa.me/5585987436263" className="hover:text-white transition-colors cursor-pointer">
                  (85) 98743-6263
                </a>
              </li>
              <li className="flex items-center gap-2 text-slate-400 text-sm">
                <i className="ri-map-pin-line text-emerald-400" />
                Fortaleza, CE — Brasil
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} emdia. Todos os direitos reservados.
          </p>
          <p className="text-slate-500 text-sm">
            Feito com <span className="text-rose-400">♥</span> no Brasil
          </p>
        </div>
      </div>
    </footer>
  );
}
