import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="https://readdy.ai/api/search-image?query=modern%20minimalist%20financial%20dashboard%20workspace%20with%20clean%20desk%2C%20laptop%20showing%20charts%20and%20graphs%2C%20soft%20natural%20light%2C%20premium%20lifestyle%2C%20money%20management%2C%20personal%20finance%20app%2C%20elegant%20and%20professional%20atmosphere%2C%20warm%20neutral%20tones%20with%20subtle%20green%20accents%2C%20high-end%20photography%20style%2C%20bokeh%20background%2C%20sophisticated%20and%20trustworthy&width=1920&height=1080&seq=hero-emdia-v2&orientation=landscape"
          alt="emdia hero background"
          className="w-full h-full object-cover object-top"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/60" />
        {/* Color tint overlay to match brand */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/40 via-transparent to-teal-900/30" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          Controle Financeiro Inteligente
        </div>

        {/* Logo mark */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-2">
            <img
              src="https://public.readdy.ai/ai/img_res/366d3964-2745-4d2f-8943-be2ae7a6f325.png"
              alt="emdia logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
          Seu dinheiro,
          <br />
          <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
            sob controle
          </span>
        </h1>

        <p className="text-white/75 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          O emdia é a plataforma definitiva para gerenciar suas finanças pessoais com simplicidade, inteligência e clareza — tudo em um só lugar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/auth"
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base rounded-full transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2"
          >
            <i className="ri-rocket-line" /> Começar grátis
          </Link>
          <button
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 border-2 border-white/40 text-white font-bold text-base rounded-full hover:bg-white/10 transition-all duration-200 whitespace-nowrap cursor-pointer backdrop-blur-sm"
          >
            Como funciona
          </button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[
            { value: "10k+", label: "Usuários ativos" },
            { value: "R$ 5M+", label: "Gerenciados" },
            { value: "99%", label: "Satisfação" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-white">{stat.value}</div>
              <div className="text-white/60 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,60 C360,0 1080,80 1440,20 L1440,80 L0,80 Z" fill="#f8fafc" />
        </svg>
      </div>
    </section>
  );
}
