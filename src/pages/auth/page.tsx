import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { usePageSEO } from "@/hooks/usePageSEO";
import SeoJsonLd from "@/pages/auth/components/SeoJsonLd";

type Mode = "login" | "signup" | "forgot";

export default function AuthPage() {
  usePageSEO({
    title: "Acessar emdia — Login e Cadastro Grátis",
    description:
      "Entre ou crie sua conta grátis no emdia. Controle despesas, receitas e dívidas com gráficos em tempo real. App de controle financeiro pessoal simples e inteligente.",
    keywords: "login emdia, cadastro app financeiro, acessar controle financeiro, conta emdia",
    canonicalPath: "/auth",
    robots: "noindex, follow",
  });

  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setError("");
    setSuccessMsg("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleModeChange = (m: Mode) => {
    setMode(m);
    resetForm();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6 && mode !== "forgot") {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          if (signInError.message.includes("Invalid login credentials")) {
            setError("E-mail ou senha incorretos.");
          } else {
            setError(signInError.message);
          }
          return;
        }
        navigate("/app");
      } else if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (signUpError) {
          if (signUpError.message.includes("already registered")) {
            setError("Este e-mail já está cadastrado. Faça login.");
          } else {
            setError(signUpError.message);
          }
          return;
        }
        setSuccessMsg("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
      } else if (mode === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/app`,
        });
        if (resetError) {
          setError(resetError.message);
          return;
        }
        setSuccessMsg("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/app` },
      });
      if (googleError) {
        if (
          googleError.message.toLowerCase().includes("provider") ||
          googleError.message.toLowerCase().includes("not enabled") ||
          googleError.message.toLowerCase().includes("unsupported")
        ) {
          setError("O login com Google ainda não está configurado. Por favor, use e-mail e senha.");
        } else {
          setError(googleError.message);
        }
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <SeoJsonLd />

      {/* ── Left panel — hero visual ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background image */}
        <img
          src="https://readdy.ai/api/search-image?query=modern%20minimalist%20financial%20workspace%20with%20laptop%20showing%20green%20charts%20and%20graphs%2C%20clean%20desk%20with%20coffee%20cup%2C%20soft%20warm%20natural%20light%20coming%20through%20window%2C%20premium%20lifestyle%20photography%2C%20personal%20finance%20management%2C%20elegant%20and%20sophisticated%20atmosphere%2C%20warm%20neutral%20tones%20with%20emerald%20green%20accents%2C%20bokeh%20background%2C%20high-end%20professional%20photography&width=900&height=1200&seq=auth-hero-v3&orientation=portrait"
          alt="emdia background"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-slate-900/70 to-black/60" />

        {/* Content over image */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-14 h-14 flex items-center justify-center">
              <img
                src="https://storage.readdy-site.link/project_files/39e7c9d0-c363-4d2c-9178-5149cb0274e0/c8d6296c-cf8b-434b-af6a-a4cf98876b89_1775334459022.jpg?v=482e543bd3ecee30f7eb14ce04149a24"
                alt="emdia logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-5xl font-bold text-white tracking-tight">emdia</span>
          </a>

          {/* Center quote */}
          <div>
            <div className="w-10 h-1 bg-emerald-400 rounded-full mb-6" />
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Seu dinheiro,<br />
              <span className="text-emerald-400">sob controle.</span>
            </h2>
            <p className="text-white/70 text-base leading-relaxed max-w-sm">
              Registre receitas, despesas e dívidas. Veja gráficos em tempo real. Tome decisões financeiras mais inteligentes.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-10">
              {[
                { value: "10k+", label: "Usuários" },
                { value: "R$ 5M+", label: "Gerenciados" },
                { value: "99%", label: "Satisfação" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
            <div className="flex items-center gap-0.5 mb-3">
              {[1,2,3,4,5].map((s) => (
                <i key={s} className="ri-star-fill text-amber-400 text-sm" />
              ))}
            </div>
            <p className="text-white/90 text-sm leading-relaxed italic">
              &ldquo;Finalmente entendi pra onde ia meu dinheiro. Em 2 semanas já guardei R$ 400 que antes sumiam.&rdquo;
            </p>
            <p className="text-white/50 text-xs mt-3">— Ana Paula F., Professora · Belo Horizonte</p>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white lg:overflow-y-auto">

        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3 cursor-pointer">
            <div className="w-14 h-14 flex items-center justify-center">
              <img
                src="https://storage.readdy-site.link/project_files/39e7c9d0-c363-4d2c-9178-5149cb0274e0/c8d6296c-cf8b-434b-af6a-a4cf98876b89_1775334459022.jpg?v=482e543bd3ecee30f7eb14ce04149a24"
                alt="emdia logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-5xl font-bold text-slate-900 tracking-tight">emdia</span>
          </a>
        </div>

        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            {mode === "forgot" ? (
              <>
                <button
                  onClick={() => handleModeChange("login")}
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm font-medium cursor-pointer transition-colors mb-6"
                >
                  <i className="ri-arrow-left-line" /> Voltar ao login
                </button>
                <h1 className="text-2xl font-extrabold text-slate-900">Recuperar senha</h1>
                <p className="text-slate-500 text-sm mt-1">Enviaremos um link para redefinir sua senha.</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
                  {mode === "login" ? "Bem-vindo de volta!" : "Crie sua conta grátis"}
                </h1>
                <p className="text-slate-500 text-sm">
                  {mode === "login"
                    ? "Entre para acessar seu painel financeiro."
                    : "Comece a controlar suas finanças hoje mesmo."}
                </p>
              </>
            )}
          </div>

          {/* Tabs */}
          {mode !== "forgot" && (
            <div className="flex bg-slate-100 rounded-2xl p-1 mb-7">
              <button
                onClick={() => handleModeChange("login")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => handleModeChange("signup")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Criar conta
              </button>
            </div>
          )}

          {/* Google button */}
          {mode !== "forgot" && (
            <>
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-semibold text-sm hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                )}
                {mode === "login" ? "Entrar com Google" : "Cadastrar com Google"}
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-slate-400 text-xs font-medium">ou com e-mail</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-mail</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400">
                  <i className="ri-mail-line text-base" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Senha</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400">
                    <i className="ri-lock-line text-base" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"} />
                  </button>
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmar senha</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400">
                    <i className="ri-lock-2-line text-base" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repita a senha"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => handleModeChange("forgot")}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-medium cursor-pointer transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {/* Error / Success */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <i className="ri-error-warning-line text-red-500 text-base mt-0.5 shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            {successMsg && (
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                <i className="ri-checkbox-circle-line text-emerald-500 text-base mt-0.5 shrink-0" />
                <p className="text-emerald-700 text-sm">{successMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 text-sm cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Aguarde...
                </>
              ) : mode === "login" ? (
                <><i className="ri-login-box-line" /> Entrar</>
              ) : mode === "signup" ? (
                <><i className="ri-user-add-line" /> Criar conta grátis</>
              ) : (
                <><i className="ri-send-plane-line" /> Enviar link de recuperação</>
              )}
            </button>
          </form>

          {/* Signup terms */}
          {mode === "signup" && (
            <p className="text-center text-xs text-slate-400 mt-5 leading-relaxed">
              Ao criar uma conta, você concorda com nossos{" "}
              <span className="text-emerald-600 cursor-pointer hover:underline">Termos de Uso</span>{" "}
              e{" "}
              <span className="text-emerald-600 cursor-pointer hover:underline">Política de Privacidade</span>.
            </p>
          )}

          {/* Back to home */}
          <div className="text-center mt-8">
            <a href="/" className="text-slate-400 hover:text-slate-700 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1">
              <i className="ri-arrow-left-line text-xs" /> Voltar ao site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
