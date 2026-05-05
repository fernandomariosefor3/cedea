import { useState } from "react";

const faqs = [
  {
    q: "O plano gratuito tem limite de uso?",
    a: "Sim. No plano gratuito você pode registrar até 15 transações por mês e visualizar os últimos 30 dias de histórico. É o suficiente pra experimentar e sentir como o app funciona.",
  },
  {
    q: "Como funciona o gráfico de pizza?",
    a: "Assim que você registrar suas receitas, despesas e dívidas, o app gera automaticamente um gráfico de pizza mostrando sua situação financeira do mês — quanto entra, quanto sai e o que está em aberto. Tudo em tempo real.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim, sem burocracia. Se você assinar o plano mensal, pode cancelar quando quiser e continua com acesso até o fim do período pago. No plano anual, oferecemos 7 dias de garantia total.",
  },
  {
    q: "Preciso instalar alguma coisa?",
    a: "Não! O emdia roda direto no navegador do seu celular ou computador. Não ocupa espaço no seu dispositivo e está sempre atualizado.",
  },
  {
    q: "Meus dados financeiros ficam seguros?",
    a: "Com certeza. Os dados são criptografados, ficam salvos na nuvem de forma segura e nunca são compartilhados com terceiros. Você é o único dono das suas informações.",
  },
  {
    q: "Posso usar no celular e no computador ao mesmo tempo?",
    a: "Sim! Com o plano Pro seus dados ficam sincronizados na nuvem. Você acessa de qualquer dispositivo com o mesmo login do Google.",
  },
  {
    q: "Como é feito o pagamento?",
    a: "Aceitamos cartão de crédito, débito e Pix. O pagamento é processado de forma segura pelo Stripe, uma das maiores plataformas de pagamento do mundo.",
  },
  {
    q: "E se eu precisar de ajuda?",
    a: "Usuários do plano Pro têm suporte prioritário por e-mail com resposta em até 24h. Usuários gratuitos contam com a nossa central de ajuda online.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full uppercase tracking-widest mb-4">
            Dúvidas Frequentes
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Ficou alguma dúvida?
          </h2>
          <p className="text-slate-500 text-base">
            Respondemos as perguntas mais comuns. Se precisar de mais ajuda, fala com a gente!
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                open === i ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-white"
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
              >
                <span className={`text-sm font-semibold ${open === i ? "text-emerald-700" : "text-slate-800"}`}>
                  {faq.q}
                </span>
                <span className={`w-6 h-6 flex items-center justify-center shrink-0 ml-4 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}>
                  <i className={`ri-arrow-down-s-line text-lg ${open === i ? "text-emerald-500" : "text-slate-400"}`} />
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  open === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-6 pb-5 text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm mb-4">Ainda tem dúvida?</p>
          <button
            onClick={() => {
              const el = document.getElementById("contact");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-700 transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-chat-1-line" />
            Falar com a equipe
          </button>
        </div>
      </div>
    </section>
  );
}
