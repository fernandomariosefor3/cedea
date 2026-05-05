import { useState } from "react";

const testimonials = [
  {
    name: "Ana Paula Ferreira",
    role: "Professora",
    city: "Belo Horizonte, MG",
    avatar: "https://readdy.ai/api/search-image?query=portrait%20of%20a%20smiling%20Brazilian%20woman%20in%20her%2030s%20with%20warm%20brown%20eyes%2C%20natural%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%2C%20soft%20smile%2C%20casual%20elegant%20style&width=80&height=80&seq=t1&orientation=squarish",
    text: "Finalmente entendi pra onde ia meu dinheiro todo mês! O gráfico de pizza deixa tudo muito claro. Em 2 semanas já consegui guardar R$ 400 que antes sumiam sem eu perceber.",
    stars: 5,
    plan: "Pro",
  },
  {
    name: "Carlos Eduardo Santos",
    role: "Designer Freelancer",
    city: "São Paulo, SP",
    avatar: "https://readdy.ai/api/search-image?query=portrait%20of%20a%20smiling%20Brazilian%20man%20in%20his%20late%2020s%2C%20casual%20friendly%20expression%2C%20natural%20lighting%2C%20clean%20white%20background%2C%20professional%20headshot%2C%20modern%20style&width=80&height=80&seq=t2&orientation=squarish",
    text: "Como freelancer minha renda varia muito. O emdia me ajudou a controlar os meses ruins sem desespero. O plano anual valeu cada centavo — economizo mais do que pago pelo app.",
    stars: 5,
    plan: "Pro Anual",
  },
  {
    name: "Mariana Costa",
    role: "Enfermeira",
    city: "Curitiba, PR",
    avatar: "https://readdy.ai/api/search-image?query=portrait%20of%20a%20cheerful%20Brazilian%20woman%20in%20her%20early%2030s%2C%20warm%20smile%2C%20natural%20lighting%2C%20clean%20background%2C%20professional%20headshot%2C%20scrubs%20or%20casual%20attire&width=80&height=80&seq=t3&orientation=squarish",
    text: "Já tentei 4 apps de finanças antes. Esse é o único que não abandonei depois de uma semana. É simples, bonito e funciona de verdade no celular.",
    stars: 5,
    plan: "Pro",
  },
  {
    name: "Rafael Mendonça",
    role: "Estudante universitário",
    city: "Fortaleza, CE",
    avatar: "https://readdy.ai/api/search-image?query=portrait%20of%20a%20young%20Brazilian%20man%20student%20in%20his%20early%2020s%2C%20confident%20smile%2C%20natural%20lighting%2C%20clean%20white%20background%2C%20casual%20student%20style%20headshot&width=80&height=80&seq=t4&orientation=squarish",
    text: "Uso o plano gratuito e já me ajudou muito. Quando me formar vou assinar o Pro sem pensar duas vezes. O gráfico de categorias é incrível pra estudante.",
    stars: 5,
    plan: "Grátis",
  },
  {
    name: "Juliana Rocha",
    role: "Empreendedora",
    city: "Recife, PE",
    avatar: "https://readdy.ai/api/search-image?query=portrait%20of%20a%20confident%20Brazilian%20businesswoman%20in%20her%2030s%2C%20professional%20smile%2C%20natural%20lighting%2C%20clean%20background%2C%20business%20casual%20attire%20headshot&width=80&height=80&seq=t5&orientation=squarish",
    text: "Separo as finanças pessoais das do negócio e agora consigo ver exatamente minha saúde financeira individual. A exportação CSV facilita muito na hora do imposto.",
    stars: 5,
    plan: "Pro Anual",
  },
  {
    name: "Tiago Alves",
    role: "Motorista de app",
    city: "Rio de Janeiro, RJ",
    avatar: "https://readdy.ai/api/search-image?query=portrait%20of%20a%20friendly%20Brazilian%20man%20in%20his%2040s%2C%20warm%20genuine%20smile%2C%20natural%20outdoor%20lighting%2C%20casual%20attire%2C%20relaxed%20headshot%20photograph&width=80&height=80&seq=t6&orientation=squarish",
    text: "Minha renda é diária e variada. Agora registro tudo pelo celular na hora e no fim do mês já sei exatamente quanto ganhei e gastei. Simples demais!",
    stars: 5,
    plan: "Pro",
  },
];

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const visible = [
    testimonials[active % testimonials.length],
    testimonials[(active + 1) % testimonials.length],
    testimonials[(active + 2) % testimonials.length],
  ];

  return (
    <section id="testimonials" className="py-24 bg-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-white/10 text-emerald-300 text-xs font-semibold rounded-full uppercase tracking-widest mb-4">
            Depoimentos
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Quem usa, não para.
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Mais de <strong className="text-white">1.200 pessoas</strong> já transformaram
            sua relação com o dinheiro usando o emdia.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { value: "1.200+", label: "Usuários ativos" },
            { value: "4.9★", label: "Avaliação média" },
            { value: "R$ 2,4M", label: "Registrados no app" },
            { value: "94%", label: "Renovam o plano" },
          ].map((stat) => (
            <div key={stat.label} className="text-center bg-white/5 rounded-2xl py-6 px-4 border border-white/10">
              <p className="text-3xl font-extrabold text-white mb-1">{stat.value}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {visible.map((t, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: t.stars }).map((_, s) => (
                  <i key={s} className="ri-star-fill text-amber-400 text-sm" />
                ))}
              </div>

              {/* Text */}
              <p className="text-slate-300 text-sm leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* User */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-full h-full object-top object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{t.name}</p>
                  <p className="text-slate-400 text-xs truncate">{t.role} · {t.city}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full font-medium whitespace-nowrap shrink-0">
                  {t.plan}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation dots */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-s-line text-lg" />
          </button>

          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === active ? "w-6 h-2.5 bg-emerald-400" : "w-2.5 h-2.5 bg-white/20"
              }`}
            />
          ))}

          <button
            onClick={() => setActive((prev) => (prev + 1) % testimonials.length)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-right-s-line text-lg" />
          </button>
        </div>
      </div>
    </section>
  );
}
