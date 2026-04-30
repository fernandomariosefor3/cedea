import { useState, useMemo } from 'react';
import MainLayout from '@/components/feature/MainLayout';
import { useRecomposicao, TurmaComDiagnostico } from '@/hooks/useRecomposicao';
import { useEscolas } from '@/hooks/useEscolas';
import ModalDiagnostico from './components/ModalDiagnostico';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

type NivelFilter = 'todos' | 'critico' | 'atencao' | 'bom' | 'otimo';
type ComponenteFilter = 'todos' | 'Língua Portuguesa' | 'Matemática';

const NIVEL_CONFIG = {
  critico: { label: 'Crítico', bg: 'bg-red-100', text: 'text-red-600', bar: 'bg-red-400' },
  atencao: { label: 'Atenção', bg: 'bg-amber-100', text: 'text-amber-600', bar: 'bg-amber-400' },
  bom: { label: 'Bom', bg: 'bg-emerald-100', text: 'text-emerald-600', bar: 'bg-emerald-400' },
  otimo: { label: 'Ótimo', bg: 'bg-[#0F2744]/10', text: 'text-[#0F2744]', bar: 'bg-[#0F2744]' },
};

function NivelBadge({ nivel }: { nivel: TurmaComDiagnostico['nivel'] }) {
  const c = NIVEL_CONFIG[nivel];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
}

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function RecomposicaoPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [mes, setMes] = useState(currentMonth);
  const [ano] = useState(currentYear);
  const [escolaFiltro, setEscolaFiltro] = useState<number | null>(null);
  const [nivelFilter, setNivelFilter] = useState<NivelFilter>('todos');
  const [componenteFilter, setComponenteFilter] = useState<ComponenteFilter>('todos');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<TurmaComDiagnostico | null>(null);

  const { turmas, stats, loading, error, upsertDiagnostico } = useRecomposicao(mes, ano, escolaFiltro);
  const { escolas } = useEscolas();

  const filtered = useMemo(() => {
    return turmas.filter((t) => {
      const matchSearch = !search || t.escola_nome?.toLowerCase().includes(search.toLowerCase()) || t.turma.toLowerCase().includes(search.toLowerCase()) || t.professor?.toLowerCase().includes(search.toLowerCase());
      const matchNivel = nivelFilter === 'todos' || t.nivel === nivelFilter;
      const matchComp = componenteFilter === 'todos' || t.componente === componenteFilter;
      return matchSearch && matchNivel && matchComp;
    });
  }, [turmas, search, nivelFilter, componenteFilter]);

  const openModal = (turma: TurmaComDiagnostico) => {
    setSelectedTurma(turma);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#00A86B] rounded-full animate-spin"></div>
            <span className="text-sm">Carregando Recomposição das Aprendizagens...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full mx-auto mb-3">
              <i className="ri-error-warning-line text-red-500 text-xl"></i>
            </div>
            <p className="text-gray-600 font-medium">{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0F2744]">Recomposição das Aprendizagens</h1>
            <p className="text-sm text-gray-500 mt-0.5">Diagnóstico por turma e acompanhamento de estratégias</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMes((m) => (m === 1 ? 12 : m - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <i className="ri-arrow-left-s-line text-gray-600"></i>
            </button>
            <div className="px-4 py-1.5 bg-[#0F2744] text-white text-sm font-semibold rounded-lg min-w-[110px] text-center">
              {MESES[mes - 1]} {ano}
            </div>
            <button onClick={() => setMes((m) => (m === 12 ? 1 : m + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <i className="ri-arrow-right-s-line text-gray-600"></i>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 flex items-center justify-center bg-[#0F2744]/10 rounded-lg">
                <i className="ri-book-open-line text-[#0F2744] text-base"></i>
              </div>
              <span className="text-xs text-gray-500 font-medium">Turmas</span>
            </div>
            <p className="text-2xl font-bold text-[#0F2744]">{stats.totalTurmas}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stats.turmasComDiagnostico} com diagnóstico</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 flex items-center justify-center bg-emerald-50 rounded-lg">
                <i className="ri-bar-chart-line text-emerald-600 text-base"></i>
              </div>
              <span className="text-xs text-gray-500 font-medium">Adequado+</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.mediaAdequado}%</p>
            <p className="text-xs text-gray-400 mt-0.5">média regional</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 flex items-center justify-center bg-red-50 rounded-lg">
                <i className="ri-alarm-warning-line text-red-500 text-base"></i>
              </div>
              <span className="text-xs text-gray-500 font-medium">Críticas</span>
            </div>
            <p className="text-2xl font-bold text-red-500">{stats.turmasCriticas}</p>
            <p className="text-xs text-gray-400 mt-0.5">turmas em nível crítico</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 flex items-center justify-center bg-amber-50 rounded-lg">
                <i className="ri-user-unfollow-line text-amber-600 text-base"></i>
              </div>
              <span className="text-xs text-gray-500 font-medium">Abaixo Básico</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.totalAlunosAbaixo}</p>
            <p className="text-xs text-gray-400 mt-0.5">alunos identificados</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 flex items-center justify-center bg-violet-50 rounded-lg">
                <i className="ri-award-line text-violet-600 text-base"></i>
              </div>
              <span className="text-xs text-gray-500 font-medium">Ótimas</span>
            </div>
            <p className="text-2xl font-bold text-violet-600">{stats.turmasOtimas}</p>
            <p className="text-xs text-gray-400 mt-0.5">turmas em nível ótimo</p>
          </div>
        </div>

        {/* Alerta */}
        {stats.turmasCriticas > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-lg flex-shrink-0">
              <i className="ri-alarm-warning-line text-red-500 text-base"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700">
                {stats.turmasCriticas} {stats.turmasCriticas === 1 ? 'turma está' : 'turmas estão'} em nível crítico em {MESES[mes - 1]}
              </p>
              <p className="text-xs text-red-500 mt-0.5">Priorize o acompanhamento dessas turmas e verifique as estratégias de recomposição.</p>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-[#0F2744]">Turmas — {MESES[mes - 1]}/{ano}</h3>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                  <i className="ri-search-line text-gray-400 text-sm"></i>
                </div>
                <input type="text" placeholder="Buscar escola ou professor..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 w-52" />
              </div>
              <select value={escolaFiltro ?? ''} onChange={(e) => setEscolaFiltro(e.target.value ? Number(e.target.value) : null)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 cursor-pointer">
                <option value="">Todas as escolas</option>
                {escolas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
              <select value={componenteFilter} onChange={(e) => setComponenteFilter(e.target.value as ComponenteFilter)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 cursor-pointer">
                <option value="todos">Todos os componentes</option>
                <option value="Língua Portuguesa">Língua Portuguesa</option>
                <option value="Matemática">Matemática</option>
              </select>
              <select value={nivelFilter} onChange={(e) => setNivelFilter(e.target.value as NivelFilter)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 cursor-pointer">
                <option value="todos">Todos os níveis</option>
                <option value="critico">Crítico</option>
                <option value="atencao">Atenção</option>
                <option value="bom">Bom</option>
                <option value="otimo">Ótimo</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Escola / Turma</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Componente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Professor</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Alunos</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Abaixo Básico</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-32">Adequado+</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nível</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estratégia</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                      Nenhuma turma encontrada para os filtros selecionados
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-[#0F2744] leading-tight">{t.escola_nome}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Turma {t.turma} — {t.serie}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          t.componente === 'Matemática' ? 'bg-violet-50 text-violet-700' : 'bg-sky-50 text-sky-700'
                        }`}>
                          <i className={`${t.componente === 'Matemática' ? 'ri-calculator-line' : 'ri-book-2-line'} text-xs`}></i>
                          {t.componente === 'Matemática' ? 'Mat.' : 'Port.'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-gray-600">{t.professor ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-sm font-semibold text-gray-700">{t.total_alunos}</span>
                      </td>
                      <td className="px-4 py-3.5 min-w-[120px]">
                        {t.diagnostico ? (
                          <MiniBar pct={t.pct_abaixo} color="bg-red-400" />
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 min-w-[120px]">
                        {t.diagnostico ? (
                          <MiniBar pct={t.pct_adequado} color={NIVEL_CONFIG[t.nivel].bar} />
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {t.diagnostico ? (
                          <NivelBadge nivel={t.nivel} />
                        ) : (
                          <span className="text-xs text-gray-300 italic">Sem dados</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 max-w-[180px]">
                        {t.diagnostico?.estrategia ? (
                          <p className="text-xs text-gray-500 truncate">{t.diagnostico.estrategia}</p>
                        ) : (
                          <span className="text-xs text-gray-300 italic">Não definida</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button onClick={() => openModal(t)}
                          className="px-3 py-1.5 bg-[#0F2744]/5 hover:bg-[#0F2744]/10 text-[#0F2744] text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap transition-colors">
                          <i className={`${t.diagnostico ? 'ri-edit-line' : 'ri-add-line'} mr-1`}></i>
                          {t.diagnostico ? 'Editar' : 'Lançar'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legenda de níveis */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-[#0F2744] mb-4">Legenda de Níveis de Aprendizagem</h3>
          <div className="grid grid-cols-4 gap-4">
            {(Object.entries(NIVEL_CONFIG) as [TurmaComDiagnostico['nivel'], typeof NIVEL_CONFIG['critico']][]).map(([key, cfg]) => (
              <div key={key} className={`rounded-lg p-4 ${cfg.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${cfg.bar}`}></div>
                  <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {key === 'critico' && 'Menos de 30% dos alunos em nível adequado ou avançado'}
                  {key === 'atencao' && 'Entre 30% e 50% dos alunos em nível adequado ou avançado'}
                  {key === 'bom' && 'Entre 50% e 70% dos alunos em nível adequado ou avançado'}
                  {key === 'otimo' && 'Mais de 70% dos alunos em nível adequado ou avançado'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Navegação mensal */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-[#0F2744] mb-4">Navegar por Mês</h3>
          <div className="flex items-center gap-2">
            {MESES_CURTOS.map((m, idx) => {
              const mesNum = idx + 1;
              const isCurrent = mesNum === mes;
              const isFuture = mesNum > currentMonth;
              return (
                <button key={m} onClick={() => setMes(mesNum)} disabled={isFuture}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent ? 'bg-[#0F2744] text-white' : isFuture ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}>
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ModalDiagnostico
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={upsertDiagnostico}
        turma={selectedTurma}
        mes={mes}
        ano={ano}
      />
    </MainLayout>
  );
}
