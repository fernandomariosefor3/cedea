import { NavLink } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  group: string;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: 'ri-dashboard-3-line', group: 'Visão Geral' },
  { path: '/escolas', label: 'Escolas da Regional', icon: 'ri-school-line', group: 'Gestão Escolar' },
  { path: '/fluxo-escolar', label: 'Fluxo Escolar', icon: 'ri-flow-chart', group: 'Gestão Escolar' },
  { path: '/notas', label: 'Registro de Notas por Bimestre', icon: 'ri-file-list-3-line', group: 'Gestão Escolar' },
  { path: '/cdg', label: 'CdG Cearense', icon: 'ri-loop-right-line', group: 'Ciclo de Gestão' },
  { path: '/visitas', label: 'Visitas Técnicas', icon: 'ri-map-pin-line', group: 'Ciclo de Gestão' },
  { path: '/busca-ativa', label: 'Busca Ativa / Evasão', icon: 'ri-user-search-line', group: 'Ciclo de Gestão' },
  { path: '/ppdt', label: 'PPDT & Coordenação', icon: 'ri-team-line', group: 'Ciclo de Gestão' },
  { path: '/recomposicao', label: 'Recomposição', icon: 'ri-refresh-line', group: 'Ciclo de Gestão' },
  { path: '/relatorios', label: 'Relatórios', icon: 'ri-file-chart-line', group: 'Relatórios' },
];

const groups = ['Visão Geral', 'Gestão Escolar', 'Ciclo de Gestão', 'Relatórios'];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0F2744] flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg overflow-hidden flex-shrink-0">
          <img
            src="https://static.readdy.ai/image/65343c6eeff79b21e2af7ceb37b37afc/37b21220329337295d06473b7f478f15.jpeg"
            alt="Logo SEFOR 3"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">SEFOR 3</p>
          <p className="text-white/50 text-xs">Gestão Regional</p>
        </div>
      </div>

      {/* User */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#00A86B] flex-shrink-0">
          <span className="text-white font-bold text-sm">S3</span>
        </div>
        <div className="min-w-0">
          <p className="text-white text-xs font-semibold truncate">Gestor SEFOR 3</p>
          <p className="text-white/40 text-xs truncate">SEFOR 3 — Fortaleza</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {groups.map((group) => {
          const items = navItems.filter((i) => i.group === group);
          return (
            <div key={group} className="mb-4">
              <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
                {group}
              </p>
              {items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#00A86B]/20 border-l-4 border-[#00A86B] text-[#00A86B] font-semibold'
                        : 'text-white/60 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                    }`
                  }
                >
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <i className={`${item.icon} text-base`}></i>
                  </div>
                  <span className="text-xs whitespace-nowrap">{item.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-white/25 text-[10px] text-center">SEFOR 3 — Sistema de Gestão v1.0 — 2026</p>
      </div>
    </aside>
  );
}
