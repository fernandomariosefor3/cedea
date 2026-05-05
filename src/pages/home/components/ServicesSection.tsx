const services = [
  {
    icon: "ri-wallet-3-line",
    title: "Controle de Receitas",
    desc: "Registre e acompanhe todas as suas entradas financeiras com categorias personalizáveis e histórico detalhado.",
    badge: "Popular",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: "ri-file-list-3-line",
    title: "Gestão de Despesas",
    desc: "Monitore seus gastos em tempo real, identifique padrões e mantenha o orçamento sempre equilibrado.",
    badge: null,
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: "ri-bank-line",
    title: "Controle de Dívidas",
    desc: "Organize e acompanhe suas dívidas, defina prioridades de pagamento e livre-se delas mais rápido.",
    badge: null,
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: "ri-pie-chart-2-line",
    title: "Relatórios Visuais",
    desc: "Gráficos e dashboards interativos que transformam seus números em insights fáceis de entender.",
    badge: "Novo",
    color: "from-emerald-600 to-teal-600",
  },
  {
    icon: "ri-robot-line",
    title: "IA Financeira — Lia",
    desc: "Assistente inteligente que analisa seu perfil financeiro e oferece recomendações personalizadas.",
    badge: "IA",
    color: "from-purple-500 to-fuchsia-500",
  },
  {
    icon: "ri-download-cloud-line",
    title: "Exportação de Dados",
    desc: "Exporte seu histórico completo em CSV para análises externas, declaração de IR e muito mais.",
    badge: null,
    color: "from-cyan-500 to-sky-500",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <span className="inline-block text-emerald-600 font-semibold text-sm tracking-widest uppercase mb-4">
            Serviços
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-5">
            Tudo que você precisa
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Uma suíte completa de ferramentas para você assumir o controle total da sua vida financeira.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="group relative bg-white rounded-2xl border border-slate-100 p-7 hover:border-emerald-200 transition-all duration-300 cursor-default overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"
                   style={{backgroundImage: `linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))`}}
              />
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${s.color} mb-5`}>
                <i className={`${s.icon} text-white text-xl`} />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-bold text-slate-900 text-lg">{s.title}</h3>
                {s.badge && (
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full">
                    {s.badge}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
