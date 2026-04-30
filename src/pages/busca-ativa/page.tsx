import { useState, useMemo } from 'react';
import MainLayout from '@/components/feature/MainLayout';
import { useBuscaAtiva, AlunoRisco, NovaAcao, NovoAlunoRisco } from '@/hooks/useBuscaAtiva';
import ModalFichaAluno from './components/ModalFichaAluno';
import ModalRegistrarAcao from './components/ModalRegistrarAcao';
import ModalNovoAluno from './components/ModalNovoAluno';

type StatusFiltro = 'todos' | 'em_risco' | 'em_acompanhamento' | 'retornou' | 'evadido';

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  em_risco: { label: 'Em Risco', color: 'text-red-600', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500' },
  em_acompanhamento: { label: 'Em Acompanhamento', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', dot: 'bg-yellow-400' },
  retornou: { label: 'Retornou', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  evadido: { label: 'Evadido', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', dot: 'bg-gray-400' },
};

export default function BuscaAtivaPage() {
  const { alunos, loading, error, stats, addAluno, updateAluno, addAcao } = useBuscaAtiva();
  const [filtroStatus, setFiltroStatus] = useState<StatusFiltro>('todos');
  const [search, setSearch] = useState('');
  const [filtroEscola, setFiltroEscola] = useState('');
  const [filtroSerie, setFiltroSerie] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');
  const [alunoSelecionado, setAlunoSelecionado] = useState<AlunoRisco | null>(null);
  const [alunoParaAcao, setAlunoParaAcao] = useState<AlunoRisco | null>(null);
  const [modalNovoAluno, setModalNovoAluno] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const escolasUnicas = useMemo(() => {
    const nomes = [...new Set(alunos.map(a => a.escola_nome || '').filter(Boolean))].sort();
    return nomes;
  }, [alunos]);

  const seriesUnicas = useMemo(() => {
    const series = [...new Set(alunos.map(a => a.serie || '').filter(Boolean))].sort();
    return series;
  }, [alunos]);

  const turmasUnicas = useMemo(() => {
    const turmas = [...new Set(alunos.map(a => a.turma || '').filter(Boolean))].sort();
    return turmas;
  }, [alunos]);

  const filtered = useMemo(() => alunos.filter(a => {
    const matchSearch = a.nome.toLowerCase().includes(search.toLowerCase()) ||
      (a.escola_nome || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || a.status === filtroStatus;
    const matchEscola = !filtroEscola || a.escola_nome === filtroEscola;
    const matchSerie = !filtroSerie || a.serie === filtroSerie;
    const matchTurma = !filtroTurma || a.turma === filtroTurma;
    return matchSearch && matchStatus && matchEscola && matchSerie && matchTurma;
  }), [alunos, search, filtroStatus, filtroEscola, filtroSerie, filtroTurma]);

  const handleUpdateStatus = async (id: string, status: AlunoRisco['status']) => {
    const ok = await updateAluno(id, { status });
    if (ok) {
      showToast('Status atualizado com sucesso!');
      setAlunoSelecionado(null);
    }
  };

  const handleAddAcao = async (acao: NovaAcao): Promise<boolean> => {
    const ok = await addAcao(acao);
    if (ok) {
      showToast('Ação registrada com sucesso!');
      setAlunoParaAcao(null);
    }
    return ok;
  };

  const handleAddAluno = async (data: NovoAlunoRisco) => {
    const novo = await addAluno(data);
    if (novo) {
      showToast('Aluno adicionado com sucesso!');
      setModalNovoAluno(false);
    }
    return novo;
  };

  const handleRegistrarAcao = (aluno: AlunoRisco) => {
    setAlunoSelecionado(null);
    setAlunoParaAcao(aluno);
  };

  const limparFiltros = () => {
    setSearch('');
    setFiltroStatus('todos');
    setFiltroEscola('');
    setFiltroSerie('');
    setFiltroTurma('');
  };

  const temFiltroAtivo = search || filtroStatus !== 'todos' || filtroEscola || filtroSerie || filtroTurma;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#00A86B] rounded-full animate-spin"></div>
            <span className="text-sm">Carregando dados...</span>
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
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-white text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
          <i className="ri-checkbox-circle-fill text-base"></i>
          {toast}
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#0F2744]">Busca Ativa / Evasão Escolar</h1>
            <p className="text-xs text-gray-400 mt-0.5">Monitoramento e acompanhamento de alunos em risco de evasão</p>
          </div>
          <button
            onClick={() => setModalNovoAluno(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00A86B] text-white text-xs font-bold rounded-xl hover:bg-[#009960] cursor-pointer transition-colors whitespace-nowrap"
          >
            <i className="ri-user-add-line"></i>
            Adicionar Aluno
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total Monitorados', value: stats.total, icon: 'ri-group-line', color: 'text-[#0F2744]', bg: 'bg-[#0F2744]/5' },
            { label: 'Em Risco', value: stats.emRisco, icon: 'ri-alarm-warning-line', color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Em Acompanhamento', value: stats.emAcompanhamento, icon: 'ri-eye-line', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Retornaram', value: stats.retornaram, icon: 'ri-checkbox-circle-line', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Evadidos', value: stats.evadidos, icon: 'ri-close-circle-line', color: 'text-gray-500', bg: 'bg-gray-50' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide leading-tight">{kpi.label}</p>
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${kpi.bg}`}>
                  <i className={`${kpi.icon} ${kpi.color} text-sm`}></i>
                </div>
              </div>
              <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Alerta de urgência */}
        {stats.emRisco > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-lg flex-shrink-0">
              <i className="ri-alarm-warning-fill text-red-500 text-base"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-red-700">
                {stats.emRisco} aluno{stats.emRisco !== 1 ? 's' : ''} em situação de risco imediato
              </p>
              <p className="text-[10px] text-red-500 mt-0.5">
                Estes alunos precisam de ação urgente. Registre contatos e visitas domiciliares.
              </p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setFiltroStatus('em_risco')}
                className="px-3 py-1.5 text-[10px] font-bold text-red-600 border border-red-300 rounded-lg hover:bg-red-100 cursor-pointer transition-colors whitespace-nowrap"
              >
                Ver apenas em risco
              </button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
              <i className="ri-filter-3-line text-[#0F2744]"></i>
              Filtros de Busca
            </p>
            {temFiltroAtivo && (
              <button
                onClick={limparFiltros}
                className="text-[10px] text-gray-400 hover:text-gray-600 cursor-pointer flex items-center gap-1"
              >
                <i className="ri-close-line"></i>
                Limpar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {/* Busca por nome */}
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar aluno..."
                className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#00A86B]"
              />
            </div>

            {/* Filtro por Escola */}
            <select
              value={filtroEscola}
              onChange={e => setFiltroEscola(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer bg-white"
            >
              <option value="">Todas as escolas</option>
              {escolasUnicas.map(e => (
                <option key={e} value={e}>{e.replace('EEFM ', '')}</option>
              ))}
            </select>

            {/* Filtro por Série */}
            <select
              value={filtroSerie}
              onChange={e => setFiltroSerie(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer bg-white"
            >
              <option value="">Todas as séries</option>
              {seriesUnicas.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Filtro por Turma */}
            <select
              value={filtroTurma}
              onChange={e => setFiltroTurma(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer bg-white"
            >
              <option value="">Todas as turmas</option>
              {turmasUnicas.map(t => (
                <option key={t} value={t}>Turma {t}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-gray-400 font-medium">Status:</span>
            {(['todos', 'em_risco', 'em_acompanhamento', 'retornou', 'evadido'] as StatusFiltro[]).map(f => (
              <button
                key={f}
                onClick={() => setFiltroStatus(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-all whitespace-nowrap ${filtroStatus === f ? 'bg-[#0F2744] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {f === 'todos' ? 'Todos' : statusConfig[f]?.label}
              </button>
            ))}
            <p className="text-xs text-gray-400 ml-auto whitespace-nowrap">{filtered.length} aluno{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Lista de alunos */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
              <i className="ri-user-search-line text-gray-400 text-2xl"></i>
            </div>
            <p className="text-sm font-semibold text-gray-500">Nenhum aluno encontrado</p>
            <p className="text-xs text-gray-400 mt-1">Tente ajustar os filtros ou adicione um novo aluno</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Aluno</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Escola</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Série / Turma</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Dias Ausente</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Faltas Consec.</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Motivo / Justificativa</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Ações</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((aluno, idx) => {
                  const cfg = statusConfig[aluno.status];
                  return (
                    <tr
                      key={aluno.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0F2744]/10 flex-shrink-0">
                            <span className="text-[10px] font-bold text-[#0F2744]">
                              {aluno.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-gray-800">{aluno.nome}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-gray-600 max-w-[140px] truncate">{aluno.escola_nome?.replace('EEFM ', '')}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs font-semibold text-gray-700">{aluno.serie}</p>
                        <p className="text-[10px] text-gray-400">Turma {aluno.turma} — <span className="capitalize">{aluno.turno}</span></p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-sm font-bold ${aluno.dias_ausente >= 25 ? 'text-red-600' : aluno.dias_ausente >= 15 ? 'text-yellow-600' : 'text-gray-700'}`}>
                          {aluno.dias_ausente}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-sm font-bold ${aluno.faltas_consecutivas >= 15 ? 'text-red-600' : aluno.faltas_consecutivas >= 7 ? 'text-yellow-600' : 'text-gray-700'}`}>
                          {aluno.faltas_consecutivas}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-gray-500 max-w-[150px] truncate">{aluno.motivo_ausencia || '—'}</p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="text-xs font-semibold text-gray-500">{aluno.acoes?.length || 0}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => setAlunoParaAcao(aluno)}
                            title="Registrar ação / justificativa"
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#00A86B]/10 text-[#00A86B] hover:bg-[#00A86B]/20 cursor-pointer transition-colors"
                          >
                            <i className="ri-add-line text-sm"></i>
                          </button>
                          <button
                            onClick={() => setAlunoSelecionado(aluno)}
                            title="Ver ficha"
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#0F2744]/10 text-[#0F2744] hover:bg-[#0F2744]/20 cursor-pointer transition-colors"
                          >
                            <i className="ri-eye-line text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Resumo por escola */}
        <div className="bg-white rounded-xl p-5">
          <h3 className="text-xs font-bold text-gray-700 mb-4">Distribuição por Escola</h3>
          <div className="space-y-3">
            {Object.entries(
              alunos.reduce((acc, a) => {
                const nome = a.escola_nome || 'Desconhecida';
                if (!acc[nome]) acc[nome] = { total: 0, risco: 0, evadidos: 0 };
                acc[nome].total++;
                if (a.status === 'em_risco') acc[nome].risco++;
                if (a.status === 'evadido') acc[nome].evadidos++;
                return acc;
              }, {} as Record<string, { total: number; risco: number; evadidos: number }>)
            )
              .sort((a, b) => b[1].total - a[1].total)
              .map(([escola, dados]) => (
                <div key={escola} className="flex items-center gap-4">
                  <p className="text-xs text-gray-600 w-48 truncate flex-shrink-0">{escola.replace('EEFM ', '')}</p>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-[#0F2744]"
                      style={{ width: `${(dados.total / Math.max(...Object.values(alunos.reduce((acc, a) => { const n = a.escola_nome || ''; if (!acc[n]) acc[n] = 0; acc[n]++; return acc; }, {} as Record<string, number>)).map(v => v))) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-bold text-gray-700 w-6 text-right">{dados.total}</span>
                    {dados.risco > 0 && (
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{dados.risco} risco</span>
                    )}
                    {dados.evadidos > 0 && (
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{dados.evadidos} evadido{dados.evadidos !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Modais */}
      {alunoSelecionado && (
        <ModalFichaAluno
          aluno={alunoSelecionado}
          onClose={() => setAlunoSelecionado(null)}
          onUpdateStatus={handleUpdateStatus}
          onRegistrarAcao={handleRegistrarAcao}
        />
      )}

      {alunoParaAcao && (
        <ModalRegistrarAcao
          aluno={alunoParaAcao}
          onSave={handleAddAcao}
          onClose={() => setAlunoParaAcao(null)}
        />
      )}

      {modalNovoAluno && (
        <ModalNovoAluno
          onSave={handleAddAluno}
          onClose={() => setModalNovoAluno(false)}
        />
      )}
    </MainLayout>
  );
}
