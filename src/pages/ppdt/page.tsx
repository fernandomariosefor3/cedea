import { useState, useMemo } from 'react';
import MainLayout from '@/components/feature/MainLayout';
import { usePPDT, FaceRecord, PcaRecord } from '@/hooks/usePPDT';
import ModalLancarFACE from './components/ModalLancarFACE';
import ModalLancarPCA from './components/ModalLancarPCA';

type TabType = 'face' | 'pca';
type StatusFilter = 'todos' | 'concluido' | 'parcial' | 'pendente';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function StatusBadge({ status }: { status: 'pendente' | 'parcial' | 'concluido' }) {
  const map = {
    concluido: 'bg-emerald-100 text-emerald-700',
    parcial: 'bg-amber-100 text-amber-700',
    pendente: 'bg-red-100 text-red-600',
  };
  const labels = { concluido: 'Concluído', parcial: 'Parcial', pendente: 'Pendente' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

function ProgressBar({ value, max, color = 'bg-[#00A86B]' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function PPDTPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [mes, setMes] = useState(currentMonth);
  const [ano] = useState(currentYear);
  const [tab, setTab] = useState<TabType>('face');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [search, setSearch] = useState('');

  const { faceRecords, pcaRecords, stats, loading, error, upsertFace, upsertPca } = usePPDT(mes, ano);

  const [modalFace, setModalFace] = useState(false);
  const [modalPca, setModalPca] = useState(false);
  const [selectedEscola, setSelectedEscola] = useState<{ id: number; nome: string } | null>(null);
  const [selectedFace, setSelectedFace] = useState<FaceRecord | null>(null);
  const [selectedPca, setSelectedPca] = useState<PcaRecord | null>(null);

  const openFace = (escola: { id: number; nome: string }, existing: FaceRecord | null) => {
    setSelectedEscola(escola);
    setSelectedFace(existing);
    setModalFace(true);
  };

  const openPca = (escola: { id: number; nome: string }, existing: PcaRecord | null) => {
    setSelectedEscola(escola);
    setSelectedPca(existing);
    setModalPca(true);
  };

  const filteredFace = useMemo(() => {
    return faceRecords.filter((r) => {
      const matchSearch = !search || r.escola_nome?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'todos' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [faceRecords, search, statusFilter]);

  const filteredPca = useMemo(() => {
    return pcaRecords.filter((r) => {
      const matchSearch = !search || r.escola_nome?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'todos' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [pcaRecords, search, statusFilter]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#00A86B] rounded-full animate-spin"></div>
            <span className="text-sm">Carregando PPDT & Coordenação...</span>
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
            <h1 className="text-xl font-bold text-[#0F2744]">PPDT &amp; Coordenação</h1>
            <p className="text-sm text-gray-500 mt-0.5">Monitoramento de FACE e PCA por escola</p>
          </div>
          {/* Seletor de mês */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMes((m) => (m === 1 ? 12 : m - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              <i className="ri-arrow-left-s-line text-gray-600"></i>
            </button>
            <div className="px-4 py-1.5 bg-[#0F2744] text-white text-sm font-semibold rounded-lg min-w-[110px] text-center">
              {MESES[mes - 1]} {ano}
            </div>
            <button
              onClick={() => setMes((m) => (m === 12 ? 1 : m + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              <i className="ri-arrow-right-s-line text-gray-600"></i>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 flex items-center justify-center bg-[#0F2744]/10 rounded-lg">
                <i className="ri-school-line text-[#0F2744] text-base"></i>
              </div>
              <span className="text-xs text-gray-500 font-medium">Escolas</span>
            </div>
            <p className="text-2xl font-bold text-[#0F2744]">{stats.totalEscolas}</p>
            <p className="text-xs text-gray-400 mt-0.5">monitoradas</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 flex items-center justify-center bg-emerald-50 rounded-lg">
                <i className="ri-user-heart-line text-emerald-600 text-base"></i>
              </div>
              <span className="text-xs text-gray-500 font-medium">FACE OK</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.escolasFaceConcluidas}</p>
            <p className="text-xs text-gray-400 mt-0.5">de {stats.totalEscolas} escolas</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 flex items-center justify-center bg-amber-50 rounded-lg">
                <i className="ri-team-line text-amber-600 text-base"></i>
              </div>
              <span className="text-xs text-gray-500 font-medium">PCA OK</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.escolasPcaConcluidas}</p>
            <p className="text-xs text-gray-400 mt-0.5">de {stats.totalEscolas} escolas</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 flex items-center justify-center bg-violet-50 rounded-lg">
                <i className="ri-group-line text-violet-600 text-base"></i>
              </div>
              <span className="text-xs text-gray-500 font-medium">Cobertura PPDT</span>
            </div>
            <p className="text-2xl font-bold text-violet-600">{stats.mediaCoberturaPPDT}%</p>
            <p className="text-xs text-gray-400 mt-0.5">média regional</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 flex items-center justify-center bg-red-50 rounded-lg">
                <i className="ri-alarm-warning-line text-red-500 text-base"></i>
              </div>
              <span className="text-xs text-gray-500 font-medium">Críticas</span>
            </div>
            <p className="text-2xl font-bold text-red-500">{stats.escolasCriticas}</p>
            <p className="text-xs text-gray-400 mt-0.5">escolas pendentes</p>
          </div>
        </div>

        {/* Alerta crítico */}
        {stats.escolasCriticas > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-lg flex-shrink-0">
              <i className="ri-alarm-warning-line text-red-500 text-base"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700">
                {stats.escolasCriticas} {stats.escolasCriticas === 1 ? 'escola está' : 'escolas estão'} com FACE pendente em {MESES[mes - 1]}
              </p>
              <p className="text-xs text-red-500 mt-0.5">Acesse a aba FACE e registre os dados para essas escolas.</p>
            </div>
          </div>
        )}

        {/* Tabs + Filtros */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {(['face', 'pca'] as TabType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setStatusFilter('todos'); setSearch(''); }}
                  className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    tab === t ? 'bg-white text-[#0F2744] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t === 'face' ? 'FACE' : 'PCA'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                  <i className="ri-search-line text-gray-400 text-sm"></i>
                </div>
                <input
                  type="text"
                  placeholder="Buscar escola..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 w-52"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 cursor-pointer"
              >
                <option value="todos">Todos os status</option>
                <option value="concluido">Concluído</option>
                <option value="parcial">Parcial</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
          </div>

          {/* Tabela FACE */}
          {tab === 'face' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Escola</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">PPDTs</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cobertura</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reuniões</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Atendimento</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFace.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                        Nenhum registro encontrado para {MESES[mes - 1]}/{ano}
                      </td>
                    </tr>
                  ) : (
                    filteredFace.map((r) => (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-[#0F2744] leading-tight">{r.escola_nome}</p>
                          {r.observacoes && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{r.observacoes}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-sm font-semibold text-gray-700">{r.ppdts_ativos}/{r.ppdts_total}</span>
                        </td>
                        <td className="px-4 py-3.5 min-w-[120px]">
                          <ProgressBar value={r.ppdts_ativos} max={r.ppdts_total} color="bg-violet-500" />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-sm font-semibold text-gray-700">{r.reunioes_realizadas}/{r.reunioes_previstas}</span>
                        </td>
                        <td className="px-4 py-3.5 min-w-[120px]">
                          <ProgressBar value={r.alunos_atendidos} max={r.total_alunos} color="bg-[#00A86B]" />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => openFace({ id: r.escola_id, nome: r.escola_nome ?? '' }, r)}
                            className="px-3 py-1.5 bg-[#0F2744]/5 hover:bg-[#0F2744]/10 text-[#0F2744] text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap transition-colors"
                          >
                            <i className="ri-edit-line mr-1"></i>Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tabela PCA */}
          {tab === 'pca' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Escola</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Coordenadores</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Horas Formação</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Meta Horas</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Encontros</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPca.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                        Nenhum registro encontrado para {MESES[mes - 1]}/{ano}
                      </td>
                    </tr>
                  ) : (
                    filteredPca.map((r) => (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-[#0F2744] leading-tight">{r.escola_nome}</p>
                          {r.observacoes && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{r.observacoes}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-sm font-semibold text-gray-700">{r.coordenadores_ativos}/{r.coordenadores_total}</span>
                        </td>
                        <td className="px-4 py-3.5 min-w-[130px]">
                          <ProgressBar value={r.horas_formacao} max={r.meta_horas} color="bg-amber-500" />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-sm font-semibold text-gray-700">{r.meta_horas}h</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-sm font-semibold text-gray-700">{r.encontros_realizados}/{r.encontros_previstos}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => openPca({ id: r.escola_id, nome: r.escola_nome ?? '' }, r)}
                            className="px-3 py-1.5 bg-[#0F2744]/5 hover:bg-[#0F2744]/10 text-[#0F2744] text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap transition-colors"
                          >
                            <i className="ri-edit-line mr-1"></i>Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Histórico mensal resumido */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-[#0F2744] mb-4">Evolução Mensal — {new Date().getFullYear()}</h3>
          <div className="flex items-end gap-2">
            {MESES_CURTOS.map((m, idx) => {
              const mesNum = idx + 1;
              const isCurrent = mesNum === mes;
              const isFuture = mesNum > currentMonth;
              return (
                <button
                  key={m}
                  onClick={() => setMes(mesNum)}
                  disabled={isFuture}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#0F2744] text-white'
                      : isFuture
                      ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xs font-semibold">{m}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modais */}
      <ModalLancarFACE
        open={modalFace}
        onClose={() => setModalFace(false)}
        onSave={upsertFace}
        escola={selectedEscola}
        mes={mes}
        ano={ano}
        existing={selectedFace}
      />
      <ModalLancarPCA
        open={modalPca}
        onClose={() => setModalPca(false)}
        onSave={upsertPca}
        escola={selectedEscola}
        mes={mes}
        ano={ano}
        existing={selectedPca}
      />
    </MainLayout>
  );
}
