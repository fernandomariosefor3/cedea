const projects = [
  {
    category: "Dashboard",
    title: "Painel de Controle Financeiro",
    desc: "Visão geral em tempo real de receitas, despesas, dívidas e saldo com gráficos interativos.",
    tags: ["React", "TailwindCSS", "Chart.js"],
    accent: "from-indigo-500 to-violet-600",
    stat: "10k usuários",
  },
  {
    category: "Mobile App",
    title: "App emdia para iOS & Android",
    desc: "Experiência mobile nativa com sincronização em nuvem, notificações e suporte offline.",
    tags: ["PWA", "IndexedDB", "Push Notifications"],
    accent: "from-emerald-500 to-teal-600",
    stat: "4.8 estrelas",
  },
  {
    category: "IA & Analytics",
    title: "Assistente Lia — IA Financeira",
    desc: "Chatbot inteligente treinado com dados financeiros para dar conselhos personalizados.",
    tags: ["NLP", "Machine Learning", "API"],
    accent: "from-purple-500 to-fuchsia-600",
    stat: "95% precisão",
  },
  {
    category: "Relatórios",
    title: "Relatórios Exportáveis",
    desc: "Sistema completo de geração de relatórios em CSV com filtros avançados por período e categoria.",
    tags: ["CSV Export", "Filtros", "Analytics"],
    accent: "from-amber-500 to-orange-600",
    stat: "500k exports",
  },
  {
    category: "Segurança",
    title: "Proteção de Dados",
    desc: "Arquitetura de segurança multicamadas com criptografia local e autenticação segura.",
    tags: ["Criptografia", "Auth", "LGPD"],
    accent: "from-rose-500 to-pink-600",
    stat: "100% seguro",
  },
  {
    category: "UX Design",
    title: "Design System emdia",
    desc: "Sistema de design consistente e acessível que sustenta toda a identidade visual da plataforma.",
    tags: ["Figma", "A11y", "Design Tokens"],
    accent: "from-cyan-500 to-sky-600",
    stat: "50+ componentes",
  },
];

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <span className="inline-block text-indigo-600 font-semibold text-sm tracking-widest uppercase mb-4">
            Portfólio
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-5">
            O que já construímos
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Projetos reais que impactam a vida financeira de milhares de brasileiros todos os dias.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.title}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-indigo-200 transition-all duration-300 flex flex-col cursor-default"
            >
              <div className={`h-44 bg-gradient-to-br ${p.accent} flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
                <span className="relative z-10 text-white/20 text-9xl font-black select-none group-hover:text-white/30 transition-colors">
                  {p.category.charAt(0)}
                </span>
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {p.category}
                </div>
                <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                  {p.stat}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 text-lg mb-2">{p.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">{p.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
