import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Login — CREDE Sistema de Gestão Regional';

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Login — CREDE Sistema de Gestão Regional',
      description:
        'Acesse o sistema de gestão regional CREDE para acompanhar indicadores educacionais, visitas técnicas, fluxo escolar e planos de ação.',
      url: `${import.meta.env.VITE_SITE_URL ?? ''}/login`,
      inLanguage: 'pt-BR',
      publisher: {
        '@type': 'GovernmentOrganization',
        name: 'CREDE — Coordenadoria Regional de Desenvolvimento da Educação',
      },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-login';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('schema-login');
      if (existing) existing.remove();
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Preencha e-mail e senha para continuar.');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const success = login(email, password);
    setLoading(false);

    if (success) {
      navigate('/');
    } else {
      setError('E-mail ou senha incorretos. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F2744] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-[#00A86B]/30 blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 flex items-center justify-center bg-[#00A86B] rounded-xl">
              <i className="ri-government-line text-white text-xl"></i>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">CREDE</p>
              <p className="text-white/60 text-xs">Sistema de Gestão Regional</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-white text-4xl font-bold leading-tight mb-4">
              Gestão escolar<br />
              <span className="text-[#00A86B]">inteligente</span> e<br />
              eficiente.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Acompanhe indicadores, visitas, fluxo escolar e planos de ação de todas as escolas da sua regional em um só lugar.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: 'ri-school-line', label: 'Escolas', value: '47' },
              { icon: 'ri-user-line', label: 'Matrículas', value: '28k' },
              { icon: 'ri-bar-chart-line', label: 'IDEB médio', value: '5.8' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 text-center">
                <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
                  <i className={`${stat.icon} text-[#00A86B] text-xl`}></i>
                </div>
                <p className="text-white font-bold text-xl">{stat.value}</p>
                <p className="text-white/50 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/30 text-xs">
            © 2026 CREDE — Coordenadoria Regional de Desenvolvimento da Educação
          </p>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 flex items-center justify-center bg-[#0F2744] rounded-xl">
              <i className="ri-government-line text-white text-xl"></i>
            </div>
            <div>
              <p className="text-[#0F2744] font-bold text-lg leading-tight">CREDE</p>
              <p className="text-gray-400 text-xs">Sistema de Gestão Regional</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Bem-vindo de volta</h1>
            <p className="text-gray-500 text-sm">Faça login para acessar o painel de gestão</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                E-mail institucional
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-mail-line text-gray-400 text-base"></i>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@crede.ce.gov.br"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2744]/20 focus:border-[#0F2744] transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-lock-line text-gray-400 text-base"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2744]/20 focus:border-[#0F2744] transition-all placeholder:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer"
                >
                  <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400 text-base`}></i>
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-error-warning-line text-red-500 text-sm"></i>
                </div>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F2744] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#1a3a5c] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-base"></i>
                  Entrando...
                </>
              ) : (
                <>
                  <i className="ri-login-box-line text-base"></i>
                  Entrar no sistema
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-white border border-gray-100 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Credenciais de acesso</p>
            <div className="space-y-2">
              {[
                { role: 'Administrador', email: 'admin@crede.ce.gov.br', pass: 'crede2026' },
                { role: 'Gestor', email: 'gestor@crede.ce.gov.br', pass: 'gestor123' },
                { role: 'Técnico', email: 'tecnico@crede.ce.gov.br', pass: 'tecnico123' },
              ].map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword(u.pass); setError(''); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <div>
                    <p className="text-xs font-medium text-gray-700">{u.role}</p>
                    <p className="text-[11px] text-gray-400">{u.email}</p>
                  </div>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-arrow-right-s-line text-gray-300 text-base"></i>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Problemas de acesso? Entre em contato com o suporte da CREDE.
          </p>
        </div>
      </div>
    </div>
  );
}
