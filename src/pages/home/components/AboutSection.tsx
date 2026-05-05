const values = [
  {
    icon: "ri-shield-check-line",
    title: "Segurança",
    desc: "Seus dados financeiros protegidos com criptografia de ponta a ponta e total privacidade.",
  },
  {
    icon: "ri-line-chart-line",
    title: "Inteligência",
    desc: "Relatórios visuais e insights automáticos para que você entenda para onde vai seu dinheiro.",
  },
  {
    icon: "ri-smartphone-line",
    title: "Simplicidade",
    desc: "Interface limpa e intuitiva pensada para todos — sem complicações, sem curva de aprendizado.",
  },
  {
    icon: "ri-team-line",
    title: "Suporte",
    desc: "Equipe dedicada para ajudar você a tirar o máximo proveito da plataforma a qualquer momento.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <span className="inline-block text-emerald-600 font-semibold text-sm tracking-widest uppercase mb-4">
              Sobre nós
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
              Nascemos para
              <br />
              <span className="text-emerald-600">simplificar</span> finanças
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-6">
              O emdia nasceu da necessidade real de ter um lugar onde o controle financeiro fosse acessível, visual e eficiente. Somos uma equipe apaixonada por tecnologia e educação financeira.
            </p>
            <p className="text-slate-500 text-lg leading-relaxed mb-10">
              Nossa missão é democratizar a gestão financeira pessoal — independente do nível de conhecimento ou renda — com uma plataforma elegante e poderosa.
            </p>

            <div className="flex items-center gap-6">
              <div className="w-14 h-14 flex items-center justify-center">
                <img
                  src="https://public.readdy.ai/ai/img_res/85c17e08-92b9-4549-947f-7c505e91c2c0.png"
                  alt="emdia"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="font-bold text-slate-900">Fernando Mário</p>
                <p className="text-slate-500 text-sm">Fundador & CEO, emdia</p>
              </div>
            </div>
          </div>

          {/* Right - values grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 transition-all duration-300 group"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-emerald-50 rounded-xl mb-4 group-hover:bg-emerald-100 transition-colors">
                  <i className={`${v.icon} text-emerald-600 text-2xl`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
