import { useState, useMemo, useEffect } from 'react';
import MainLayout from '@/components/feature/MainLayout';
import { useRecomposicao, TurmaComDiagnostico } from '@/hooks/useRecomposicao';
import { useEscolas } from '@/hooks/useEscolas';
import ModalDiagnostico from './components/ModalDiagnostico';

interface AcaoRecomp {
  id: string;
  escola_id: number;
  escola_nome: string;
  acao: string;
  responsavel: string;
  prazo: string;
  impacto: 'alto' | 'médio' | 'baixo';
  status: 'pendente' | 'em_andamento' | 'concluida';
  componente: 'Língua Portuguesa' | 'Matemática' | 'Geral';
}

const ACOES_KEY = 'sefor3_acoes_recomp';

function loadAcoes(): AcaoRecomp[] {
  try { return JSON.parse(localStorage.getItem(ACOES_KEY) || '[]'); } catch { return []; }
}
function saveAcoes(a: AcaoRecomp[]) { localStorage.setItem(ACOES_KEY, JSON.stringify(a)); }

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

  // Ações por escola
  const [acoes, setAcoes] = useState<AcaoRecomp[]>(loadAcoes);
  const [mostrarAcoes, setMostrarAcoes] = useState(false);
  const [adicionandoAcao, setAdicionandoAcao] = useState(false);
  const [novaAcao, setNovaAcao] = useState<Partial<AcaoRecomp>>({
    acao: '', responsavel: '', prazo: '', impacto: 'alto', status: 'pendente', componente: 'Geral',
  });
  const [filtroAcaoEscola, setFiltroAcaoEscola] = useState<number | null>(null);
  const [filtroAcaoStatus, setFiltroAcaoStatus] = useState<'todos' | AcaoRecomp['status']>('todos');

  useEffect(() => { saveAcoes(acoes); }, [acoes]);

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

        {/* Ações por escola com prazo e impacto */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div
            className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setMostrarAcoes(!mostrarAcoes)}
          >
            <div>
              <h3 className="text-sm font-bold text-[#0F2744] flex items-center gap-2">
                <i className="ri-task-line text-[#00A86B]"></i>
                Ações de Recomposição por Escola
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">{acoes.length} ação{acoes.length !== 1 ? 'ões' : ''} cadastrada{acoes.length !== 1 ? 's' : ''} — com prazo e impacto</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 flex items-center justify-center rounded-lg ${mostrarAcoes ? 'bg-[#0F2744]/5' : ''}`}>
                <i className={`ri-arrow-${mostrarAcoes ? 'up' : 'down'}-s-line text-gray-400`}></i>
              </span>
            </div>
          </div>

          {mostrarAcoes && (
            <div className="border-t border-gray-100 p-5 space-y-4">
              {/* Filtros e botão de adicionar */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={filtroAcaoEscola ?? ''}
                  onChange={e => setFiltroAcaoEscola(e.target.value ? Number(e.target.value) : null)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer bg-white"
                >
                  <option value="">Todas as escolas</option>
                  {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
                <div className="flex gap-1.5">
                  {(['todos', 'pendente', 'em_andamento', 'concluida'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setFiltroAcaoStatus(s)}
                      className={`px-3 py-1.5 text-[10px] font-semibold rounded-full cursor-pointer transition-all whitespace-nowrap ${filtroAcaoStatus === s ? 'bg-[#0F2744] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {s === 'todos' ? 'Todos' : s === 'pendente' ? 'Pendente' : s === 'em_andamento' ? 'Em andamento' : 'Concluída'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setAdicionandoAcao(true)}
                  className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-[#00A86B] text-white text-xs font-bold rounded-lg hover:bg-[#009960] cursor-pointer transition-colors whitespace-nowrap"
                >
                  <i className="ri-add-line text-sm"></i>Nova Ação
                </button>
              </div>

              {/* Formulário de nova ação */}
              {adicionandoAcao && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                  <p className="text-xs font-bold text-gray-700">Nova Ação de Recomposição</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-1">Escola <span className="text-red-400">*</span></label>
                      <select
                        value={novaAcao.escola_id ?? ''}
                        onChange={e => {
                          const id = Number(e.target.value);
                          const nome = escolas.find(es => es.id === id)?.nome || '';
                          setNovaAcao(p => ({ ...p, escola_id: id, escola_nome: nome }));
                        }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer"
                      >
                        <option value="">Selecione...</option>
                        {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-1">Componente</label>
                      <select
                        value={novaAcao.componente}
                        onChange={e => setNovaAcao(p => ({ ...p, componente: e.target.value as AcaoRecomp['componente'] }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer"
                      >
                        <option value="Geral">Geral</option>
                        <option value="Língua Portuguesa">Língua Portuguesa</option>
                        <option value="Matemática">Matemática</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 block mb-1">Descrição da Ação <span className="text-red-400">*</span></label>
                    <textarea
                      value={novaAcao.acao}
                      onChange={e => setNovaAcao(p => ({ ...p, acao: e.target.value }))}
                      placeholder="Descreva a ação de recomposição a ser realizada..."
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-1">Responsável</label>
                      <input
                        type="text"
                        value={novaAcao.responsavel}
                        onChange={e => setNovaAcao(p => ({ ...p, responsavel: e.target.value }))}
                        placeholder="Nome do responsável"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-1">Prazo</label>
                      <input
                        type="date"
                        value={novaAcao.prazo}
                        onChange={e => setNovaAcao(p => ({ ...p, prazo: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-1">Impacto Esperado</label>
                      <select
                        value={novaAcao.impacto}
                        onChange={e => setNovaAcao(p => ({ ...p, impacto: e.target.value as AcaoRecomp['impacto'] }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer"
                      >
                        <option value="alto">Alto impacto</option>
                        <option value="médio">Médio impacto</option>
                        <option value="baixo">Baixo impacto</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setAdicionandoAcao(false)} className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap">Cancelar</button>
                    <button
                      onClick={() => {
                        if (!novaAcao.acao?.trim() || !novaAcao.escola_id) return;
                        const acao: AcaoRecomp = {
                          id: Date.now().toString(),
                          escola_id: novaAcao.escola_id!,
                          escola_nome: novaAcao.escola_nome || '',
                          acao: novaAcao.acao || '',
                          responsavel: novaAcao.responsavel || '',
                          prazo: novaAcao.prazo || '',
                          impacto: novaAcao.impacto || 'alto',
                          status: 'pendente',
                          componente: novaAcao.componente || 'Geral',
                        };
                        setAcoes(prev => [...prev, acao]);
                        setNovaAcao({ acao: '', responsavel: '', prazo: '', impacto: 'alto', status: 'pendente', componente: 'Geral' });
                        setAdicionandoAcao(false);
                      }}
                      disabled={!novaAcao.acao?.trim() || !novaAcao.escola_id}
                      className="px-4 py-1.5 text-xs font-bold bg-[#00A86B] text-white rounded-lg hover:bg-[#009960] cursor-pointer disabled:opacity-40 whitespace-nowrap"
                    >
                      Adicionar Ação
                    </button>
                  </div>
                </div>
              )}

              {/* Tabela de ações */}
              {acoes.filter(a => (!filtroAcaoEscola || a.escola_id === filtroAcaoEscola) && (filtroAcaoStatus === 'todos' || a.status === filtroAcaoStatus)).length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-task-line text-gray-300 text-3xl"></i>
                  <p className="text-sm text-gray-400 mt-2">Nenhuma ação cadastrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Escola</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Componente</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Ação</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Responsável</th>
                        <th className="text-center px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Prazo</th>
                        <th className="text-center px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Impacto</th>
                        <th className="text-center px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Status</th>
                        <th className="px-4 py-2.5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {acoes
                        .filter(a => (!filtroAcaoEscola || a.escola_id === filtroAcaoEscola) && (filtroAcaoStatus === 'todos' || a.status === filtroAcaoStatus))
                        .map(a => {
                          const prazoVencido = a.prazo && new Date(a.prazo) < new Date() && a.status !== 'concluida';
                          return (
                            <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                              <td className="px-4 py-3">
                                <p className="text-xs font-semibold text-gray-700 max-w-[140px] truncate">{a.escola_nome?.replace('EEFM ', '')}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${a.componente === 'Matemática' ? 'bg-violet-50 text-violet-700' : a.componente === 'Língua Portuguesa' ? 'bg-sky-50 text-sky-700' : 'bg-gray-100 text-gray-600'}`}>
                                  {a.componente === 'Matemática' ? 'Mat.' : a.componente === 'Língua Portuguesa' ? 'Port.' : 'Geral'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-xs text-gray-600 max-w-[200px] truncate">{a.acao}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-xs text-gray-500">{a.responsavel || '—'}</p>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {a.prazo ? (
                                  <span className={`text-xs font-semibold ${prazoVencido ? 'text-red-500' : 'text-gray-600'}`}>
                                    {new Date(a.prazo + 'T00:00:00').toLocaleDateString('pt-BR')}
                                    {prazoVencido && <i className="ri-alarm-warning-line ml-1 text-red-500"></i>}
                                  </span>
                                ) : <span className="text-xs text-gray-300">—</span>}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${a.impacto === 'alto' ? 'bg-red-50 text-red-600' : a.impacto === 'médio' ? 'bg-yellow-50 text-yellow-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                  {a.impacto === 'alto' ? 'Alto' : a.impacto === 'médio' ? 'Médio' : 'Baixo'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <select
                                  value={a.status}
                                  onChange={e => setAcoes(prev => prev.map(ac => ac.id === a.id ? { ...ac, status: e.target.value as AcaoRecomp['status'] } : ac))}
                                  className={`text-[10px] font-bold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${a.status === 'concluida' ? 'bg-emerald-50 text-emerald-600' : a.status === 'em_andamento' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}
                                >
                                  <option value="pendente">Pendente</option>
                                  <option value="em_andamento">Em andamento</option>
                                  <option value="concluida">Concluída</option>
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => setAcoes(prev => prev.filter(ac => ac.id !== a.id))}
                                  className="w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50 cursor-pointer transition-colors"
                                >
                                  <i className="ri-delete-bin-line text-sm"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
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
