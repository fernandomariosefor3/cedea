import { useState, FormEvent } from "react";

const contactInfo = [
  {
    icon: "ri-mail-line",
    label: "E-mail",
    value: "emdiacontrolefinanceiro@gmail.com",
    href: "mailto:emdiacontrolefinanceiro@gmail.com",
  },
  {
    icon: "ri-whatsapp-line",
    label: "WhatsApp",
    value: "(85) 98743-6263",
    href: "https://wa.me/5585987436263",
  },
  {
    icon: "ri-map-pin-line",
    label: "Localização",
    value: "Fortaleza, CE — Brasil",
    href: null,
  },
];

export default function ContactSection() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const message = (form.querySelector('[name="message"]') as HTMLTextAreaElement)?.value || "";
    if (message.length > 500) return;

    setStatus("sending");
    try {
      const data = new URLSearchParams();
      new FormData(form).forEach((val, key) => data.append(key, val as string));
      const res = await fetch("https://readdy.ai/api/form/d760tokbmgf2o8mm6vcg", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data.toString(),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
        setCharCount(0);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <span className="inline-block text-emerald-600 font-semibold text-sm tracking-widest uppercase mb-4">
            Contato
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-5">
            Vamos conversar
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Tem alguma dúvida, sugestão ou quer saber mais sobre o emdia? Estamos aqui para ajudar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact info */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {contactInfo.map((info) => (
              <div key={info.label} className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-emerald-50 rounded-xl flex-shrink-0">
                  <i className={`${info.icon} text-emerald-600 text-xl`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    {info.label}
                  </p>
                  {info.href ? (
                    <a
                      href={info.href}
                      className="text-slate-700 font-medium hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-slate-700 font-medium">{info.value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="mt-6 p-6 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl text-white">
              <h3 className="font-bold text-lg mb-2">Resposta rápida</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Nosso time responde em até <strong>24 horas úteis</strong>. Para urgências, use nosso WhatsApp.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-white/90 font-medium">Online agora</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form
              id="contact-form"
              data-readdy-form
              onSubmit={handleSubmit}
              className="bg-slate-50 rounded-2xl p-8 border border-slate-100"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Seu nome"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="seu@email.com"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Assunto
                </label>
                <select
                  name="subject"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400 transition-colors cursor-pointer"
                >
                  <option value="">Selecione um assunto</option>
                  <option value="suporte">Suporte técnico</option>
                  <option value="parceria">Parceria comercial</option>
                  <option value="feedback">Feedback / Sugestão</option>
                  <option value="imprensa">Imprensa</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Mensagem
                  <span className={`ml-auto float-right font-normal ${charCount > 480 ? "text-rose-500" : "text-slate-400"}`}>
                    {charCount}/500
                  </span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  maxLength={500}
                  placeholder="Escreva sua mensagem..."
                  onChange={(e) => setCharCount(e.target.value.length)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-400 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer"
              >
                {status === "sending" ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-loader-4-line animate-spin" /> Enviando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-send-plane-line" /> Enviar Mensagem
                  </span>
                )}
              </button>

              {status === "success" && (
                <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm font-medium">
                  <i className="ri-checkbox-circle-line text-lg" />
                  Mensagem enviada com sucesso! Responderemos em breve.
                </div>
              )}
              {status === "error" && (
                <div className="mt-4 flex items-center gap-2 text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm font-medium">
                  <i className="ri-error-warning-line text-lg" />
                  Erro ao enviar. Tente novamente ou use nosso e-mail.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
