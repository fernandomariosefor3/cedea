import { useState, useRef } from "react";
import type { Transaction } from "@/hooks/useTransactions";
import type { UserProfile } from "@/hooks/useUserProfile";
import { AVATAR_COLORS } from "@/hooks/useUserProfile";

interface Props {
  transactions: Transaction[];
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  initials: string;
  onResetApp: () => void;
  onExportCSV: () => void;
  userId?: string | null;
  isPro?: boolean;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const monthLabel = (iso: string) => {
  const [year, month] = iso.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
};

export default function ProfileView({
  transactions,
  profile,
  updateProfile,
  initials,
  onResetApp,
  onExportCSV,
  userId,
  isPro,
}: Props) {

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [showReset, setShowReset] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const APP_URL = "https://emdia.readdy.co";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Em Dia — Controle Financeiro",
          text: "Controlo minhas finanças com o Em Dia. Experimente grátis!",
          url: APP_URL,
        });
      } catch {
        // usuario cancelou
      }
    } else {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEditName = () => {
    setNameInput(profile.name);
    setEditingName(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      updateProfile({ name: trimmed });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }
    setEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveName();
    if (e.key === "Escape") setEditingName(false);
  };

  // Stats
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthTxs = transactions.filter((t) => t.date.startsWith(currentMonth));
  const income = thisMonthTxs.filter((t) => t.type === "receita").reduce((s, t) => s + t.amount, 0);
  const expenses = thisMonthTxs.filter((t) => t.type !== "receita").reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;

  const months = [
    ...new Set(transactions.map((t) => t.date.slice(0, 7))),
  ].length;

  return (
    <div className="pb-24 min-h-screen bg-slate-50">

      {/* ─── Cover + Avatar ─── */}
      <div className="relative">
        {/* Banner */}
        <div
          className="h-36 w-full"
          style={{
            background: `linear-gradient(135deg, ${profile.avatarColor}cc 0%, ${profile.avatarColor} 100%)`,
          }}
        >
          {/* decorative rings */}
          <div className="absolute top-4 right-6 w-20 h-20 rounded-full border-2 border-white/20" />
          <div className="absolute top-8 right-12 w-10 h-10 rounded-full border border-white/15" />
          <div className="absolute -top-2 left-10 w-14 h-14 rounded-full border border-white/10" />
        </div>

        {/* Avatar */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center text-white text-3xl font-extrabold shadow-md"
              style={{ backgroundColor: profile.avatarColor }}
            >
              {initials}
            </div>
            {/* Color picker trigger */}
            <button
              onClick={() => setShowColorPicker((p) => !p)}
              className="absolute -bottom-1 -right-1 w-8 h-8 flex items-center justify-center bg-white border-2 border-white rounded-full shadow cursor-pointer"
              style={{ backgroundColor: profile.avatarColor }}
            >
              <i className="ri-palette-line text-white text-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Name + info ─── */}
      <div className="pt-16 px-5 text-center">
        {/* Color picker inline */}
        {showColorPicker && (
          <div className="mb-3 flex items-center justify-center gap-2 flex-wrap">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  updateProfile({ avatarColor: c.value });
                  setShowColorPicker(false);
                }}
                className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer"
                style={{
                  backgroundColor: c.value,
                  borderColor: profile.avatarColor === c.value ? "#1e293b" : "transparent",
                }}
              />
            ))}
          </div>
        )}

        {/* Name */}
        {editingName ? (
          <div className="flex items-center justify-center gap-2 mb-1">
            <input
              ref={inputRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={40}
              className="text-xl font-extrabold text-slate-800 text-center bg-white border-2 rounded-xl px-3 py-1 outline-none focus:border-emerald-400 w-48 text-sm"
            />
            <button
              onClick={handleSaveName}
              className="w-8 h-8 flex items-center justify-center bg-emerald-600 rounded-full cursor-pointer"
            >
              <i className="ri-check-line text-white text-sm" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-800">{profile.name}</h2>
            <button
              onClick={handleEditName}
              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer rounded-lg hover:bg-emerald-50"
            >
              <i className="ri-pencil-line text-base" />
            </button>
          </div>
        )}

        {/* Saved toast */}
        {saved && (
          <p className="text-xs text-emerald-600 font-semibold mb-1 animate-pulse">
            Nome salvo!
          </p>
        )}

        {/* Plan + join date */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {isPro ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-extrabold rounded-full">
              <i className="ri-vip-crown-2-fill text-xs" /> PRO
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">
              <i className="ri-star-line text-xs" /> Plano Grátis
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
            <i className="ri-calendar-line text-xs" />
            Desde {monthLabel(profile.joinedAt)}
          </span>
        </div>
      </div>

      {/* ─── Pro Status Card ─── */}
      <div className="px-4 mt-6">
        {isPro ? (
          <div className="relative overflow-hidden rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)" }}
          >
            {/* decorative circles */}
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />

            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 flex items-center justify-center bg-amber-400 rounded-lg">
                    <i className="ri-vip-crown-2-fill text-amber-900 text-sm" />
                  </div>
                  <span className="text-amber-300 text-xs font-extrabold uppercase tracking-widest">Plano Pro Ativo</span>
                </div>
                <p className="text-white font-extrabold text-base mt-2">Acesso ilimitado</p>
                <p className="text-indigo-300 text-xs mt-0.5">Transações, histórico e exportação sem limites</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <i className="ri-shield-check-fill text-4xl text-indigo-400/60" />
              </div>
            </div>

            <div className="relative mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
              {[
                { icon: "ri-infinity-line", label: "Transações" },
                { icon: "ri-history-line", label: "Histórico" },
                { icon: "ri-file-download-line", label: "Exportação" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-xl">
                    <i className={`${item.icon} text-indigo-200 text-base`} />
                  </div>
                  <span className="text-indigo-300 text-[10px] font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold text-slate-800 mb-0.5">Faça upgrade para o Pro</p>
              <p className="text-xs text-slate-400">Transações ilimitadas a partir de R$ 9,99/mês</p>
            </div>
            <button
              onClick={() => {
                const target = window.top || window;
                target.location.href = `${window.location.origin}/#pricing`;
              }}
              className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Ver planos
            </button>
          </div>
        )}
      </div>

      {/* ─── Stats ─── */}
      <div className="px-4 mt-6">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 px-1">
          Este mês
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Transações", value: String(thisMonthTxs.length), icon: "ri-swap-line", color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Receitas",   value: fmt(income),                 icon: "ri-arrow-up-circle-line", color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Gastos",     value: fmt(expenses),               icon: "ri-arrow-down-circle-line", color: "text-rose-500", bg: "bg-rose-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center`}>
              <div className={`w-8 h-8 flex items-center justify-center mx-auto rounded-xl mb-1.5 bg-white/60`}>
                <i className={`${s.icon} ${s.color} text-base`} />
              </div>
              <p className={`text-sm font-extrabold ${s.color} truncate`}>{s.value}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Total stats ─── */}
      <div className="px-4 mt-3">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 rounded-xl">
              <i className="ri-bar-chart-grouped-line text-emerald-600 text-xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Histórico geral</p>
              <p className="text-xs text-slate-400">
                {transactions.length} transações · {months} {months === 1 ? "mês" : "meses"} registrados
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-extrabold ${balance >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
              {fmt(balance)}
            </p>
            <p className="text-[10px] text-slate-400">saldo do mês</p>
          </div>
        </div>
      </div>

      {/* ─── Ações ─── */}
      <div className="px-4 mt-5">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 px-1">
          Dados
        </h3>
        <div className="space-y-2">
          {/* Compartilhar */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center bg-emerald-50 rounded-xl">
                <i className="ri-share-line text-emerald-600 text-lg" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-700">Compartilhar app</p>
                <p className="text-xs text-slate-400">
                  {copied ? "Link copiado!" : "Indique o Em Dia para um amigo"}
                </p>
              </div>
            </div>
            {copied ? (
              <i className="ri-check-line text-emerald-500 text-lg" />
            ) : (
              <i className="ri-arrow-right-s-line text-slate-400 text-lg" />
            )}
          </button>

          {/* Exportar CSV */}
          <button
            onClick={onExportCSV}
            disabled={transactions.length === 0}
            className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center bg-emerald-50 rounded-xl">
                <i className="ri-file-download-line text-emerald-600 text-lg" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-700">Exportar CSV</p>
                <p className="text-xs text-slate-400">Baixar {transactions.length} transações</p>
              </div>
            </div>
            <i className="ri-arrow-right-s-line text-slate-400 text-lg" />
          </button>
        </div>
      </div>

      {/* ─── Sair / Redefinir ─── */}
      <div className="px-4 mt-5">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 px-1">
          Conta
        </h3>
        <button
          onClick={() => setShowReset(true)}
          className="w-full flex items-center justify-between p-4 bg-rose-50 border border-rose-100 rounded-2xl hover:bg-rose-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-rose-100 rounded-xl">
              <i className="ri-logout-box-r-line text-rose-500 text-lg" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-rose-600">Sair da conta</p>
              <p className="text-xs text-rose-400">Apaga todos os dados locais</p>
            </div>
          </div>
          <i className="ri-arrow-right-s-line text-rose-300 text-lg" />
        </button>
      </div>

      {/* App version */}
      <p className="text-center text-xs text-slate-300 font-medium mt-8">Em Dia v1.0 · Controle financeiro pessoal</p>

      {/* ─── Reset modal ─── */}
      {showReset && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowReset(false)}
        >
          <div
            className="bg-white w-full rounded-t-3xl p-6 max-w-lg mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
            <div className="w-12 h-12 flex items-center justify-center bg-rose-100 rounded-2xl mx-auto mb-4">
              <i className="ri-logout-box-r-line text-rose-500 text-2xl" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg text-center mb-2">
              Sair da conta?
            </h3>
            <p className="text-slate-500 text-sm text-center leading-relaxed mb-6">
              Todos os dados salvos neste dispositivo serão apagados — transações, perfil e configurações. Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer whitespace-nowrap hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setShowReset(false); onResetApp(); }}
                className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl cursor-pointer whitespace-nowrap transition-colors"
              >
                Sim, sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
