import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/escolas': 'Escolas da Regional',
  '/fluxo-escolar': 'Fluxo Escolar',
  '/notas': 'Preenchimento de Notas',
  '/cdg': 'CdG Cearense',
  '/plano-de-acao': 'Plano de Ação',
  '/visitas': 'Visitas Técnicas',
  '/relatorios': 'Relatórios',
};

const pageBreadcrumbs: Record<string, string[]> = {
  '/': ['Início'],
  '/escolas': ['Início', 'Gestão Escolar', 'Escolas da Regional'],
  '/fluxo-escolar': ['Início', 'Gestão Escolar', 'Fluxo Escolar'],
  '/notas': ['Início', 'Gestão Escolar', 'Preenchimento de Notas'],
  '/cdg': ['Início', 'Ciclo de Gestão', 'CdG Cearense'],
  '/plano-de-acao': ['Início', 'Ciclo de Gestão', 'Plano de Ação'],
  '/visitas': ['Início', 'Acompanhamento', 'Visitas Técnicas'],
  '/relatorios': ['Início', 'Acompanhamento', 'Relatórios'],
};

export default function TopHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const title = pageTitles[location.pathname] || 'Página';
  const breadcrumbs = pageBreadcrumbs[location.pathname] || ['Início'];

  const notifications = [
    { id: 1, text: '6 escolas com SIGE abaixo de 50%', time: 'há 2h', tipo: 'critico' },
    { id: 2, text: 'Prazo SIGE vence em 5 dias', time: 'há 3h', tipo: 'atencao' },
    { id: 3, text: 'Visita agendada: EEFM Dom Lustosa', time: 'há 5h', tipo: 'info' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-30">
      <div>
        <div className="flex items-center gap-1.5 mb-0.5">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">{crumb}</span>
              {i < breadcrumbs.length - 1 && (
                <span className="text-gray-300 text-xs">/</span>
              )}
            </span>
          ))}
        </div>
        <h1 className="text-lg font-bold text-gray-800 leading-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-calendar-line text-gray-500 text-sm"></i>
          </div>
          <span className="text-xs text-gray-600 font-medium whitespace-nowrap">Abril 2026</span>
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-arrow-down-s-line text-gray-400 text-sm"></i>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowUserMenu(false); }}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-notification-3-line text-gray-600 text-base"></i>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">3</span>
          </button>

          {showNotif && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-gray-200 rounded-xl z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">Notificações</p>
              </div>
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.tipo === 'critico' ? 'bg-red-500' : n.tipo === 'atencao' ? 'bg-orange-400' : 'bg-blue-400'}`}></div>
                    <div>
                      <p className="text-xs text-gray-700">{n.text}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="flex items-center gap-2 bg-[#00A86B] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#009960] transition-colors cursor-pointer whitespace-nowrap">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-download-2-line text-sm"></i>
          </div>
          Exportar
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotif(false); }}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-[#0F2744] rounded-lg">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-gray-800 leading-tight whitespace-nowrap">{user?.name ?? 'Usuário'}</p>
              <p className="text-[10px] text-gray-400 leading-tight whitespace-nowrap">{user?.role ?? ''}</p>
            </div>
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-arrow-down-s-line text-gray-400 text-sm"></i>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-11 w-52 bg-white border border-gray-200 rounded-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-800">{user?.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-logout-box-r-line text-sm"></i>
                </div>
                Sair do sistema
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
