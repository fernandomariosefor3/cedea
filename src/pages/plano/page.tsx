import { useState, useEffect } from 'react';
import MainLayout from '@/components/feature/MainLayout';
import { usePlanos, PlanoAcao, AcaoPlano, NovoPlanoInput } from '@/hooks/usePlanos';
import ModalNovoPlano from './components/ModalNovoPlano';
import PainelAcoes from './components/PainelAcoes';
import AnaliseIA from '@/components/feature/AnaliseIA';

function formatPrazo(prazo: string): string {
  if (!prazo) return '—';
  if (prazo.includes('-')) {
    const d = new Date(prazo + 'T00:00:00');
    return isNaN(d.getTime()) ? prazo : d.toLocaleDateString('pt-BR');
  }
  return prazo;
}

const statusColors: Record<string, string> = {
  Ativo: 'bg-emerald-100 text-emerald-700',
  Concluído: 'bg-gray-100 text-gray-600',
  Revisão: 'bg-yellow-100 text-yellow-700',
};

const statusBorda: Record<string, string> = {
  Ativo: 'border-emerald-300',
  Concluído: 'border-gray-300',
  Revisão: 'border-yellow-300',
};

export default function PlanoAcaoPage() {
  const { planos, loading, addPlano, updatePlano, deletePlano, addAcao, updateAcao, deleteAcao } = usePlanos();
  const [selected, setSelected] = useState<PlanoAcao | null>(null);
  const [modalNovo, setModalNovo] = useState(false);
  const [editandoPlano, setEditandoPlano] = useState(false);
  const [confirmDeletePlano, setConfirmDeletePlano] = useState(false);
  const [savedToast, setSavedToast] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'Todos' | PlanoAcao['status']>('Todos');
  const [search, setSearch] = useState('');

  // Seleciona o primeiro plano quando carrega
  useEffect(() => {
    if (planos.length > 0 && !selected) {
      setSelected(planos[0]);
    }
  }, [planos, selected]);

  // Mantém selected sincronizado com dados atualizados
  useEffect(() => {
    if (selected) {
      const updated = planos.find(p => p.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [planos]);

  const showToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(''), 3000);
  };

  const handleSavePlano = async (data: NovoPlanoInput) => {
    if (editandoPlano && selected) {
      const ok = await updatePlano(selected.id, data);
      if (ok) showToast('Plano atualizado!');
    } else {
      const novo = await addPlano(data);
      if (novo) {
        setSelected(novo);
        showToast('Plano criado com sucesso!');
      }
    }
    setModalNovo(false);
    setEditandoPlano(false);
  };

  const handleDeletePlano = async () => {
    if (!selected) return;
    const ok = await deletePlano(selected.id);
    if (ok) {
      setSelected(null);
      showToast('Plano excluído.');
    }
    setConfirmDeletePlano(false);
  };

  const handleUpdateAcao = async (acaoId: number, data: Partial<AcaoPlano>) => {
    await updateAcao(acaoId, data);
  };

  const handleAddAcao = async (acao: Omit<AcaoPlano, 'id' | 'plano_id'>) => {
    if (!selected) return;
    const ok = await addAcao(selected.id, acao);
    if (ok) showToast('Ação adicionada!');
  };

  const handleRemoveAcao = async (acaoId: number) => {
    if (!selected) return;
    await deleteAcao(acaoId, selected.id);
  };

  const filtrados = planos.filter(p => {
    const matchStatus = filtroStatus === 'Todos' || p.status === filtroStatus;
    const matchSearch =
      p.titulo.toLowerCase().includes(search.toLowerCase()) ||
      p.escola.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalAtivos = planos.filter(p => p.status === 'Ativo').length;
  const totalAcoes = planos.flatMap(p => p.acoes).length;
  const acoesConcluidas = planos.flatMap(p => p.acoes).filter(a => a.status === 'Concluída').length;
  const pctGeral = totalAcoes > 0 ? Math.round((acoesConcluidas / totalAcoes) * 100) : 0;

  const pctSelected =
    selected && selected.acoes.length > 0
      ? Math.round(
          (selected.acoes.filter(a => a.status === 'Concluída').length / selected.acoes.length) * 100
        )
      : 0;

  return (
    <MainLayout>
      {savedToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-white text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
          <i className="ri-checkbox-circle-fill text-base"></i>
          {savedToast}
        </div>
      )}

      <div className="space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Planos Ativos</p>
            <p className="text-2xl font-bold text-[#0F2744] mt-1">{totalAtivos}</p>
            <p className="text-[10px] text-gray-400 mt-1">de {planos.length} planos</p>
          </div>
          <div className="bg-white rounded-xl p-5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Total de Ações</p>
            <p className="text-2xl font-bold text-[#0F2744] mt-1">{totalAcoes}</p>
            <p className="text-[10px] text-gray-400 mt-1">{acoesConcluidas} concluídas</p>
          </div>
          <div className="bg-white rounded-xl p-5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Execução Geral</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                pctGeral >= 70 ? 'text-emerald-600' : pctGeral >= 40 ? 'text-yellow-600' : 'text-red-500'
              }`}
            >
              {pctGeral}%
            </p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
              <div
                className={`h-1.5 rounded-full ${
                  pctGeral >= 70 ? 'bg-emerald-400' : pctGeral >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${pctGeral}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Em Revisão</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {planos.filter(p => p.status === 'Revisão').length}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">aguardando aprovação</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <i className="ri-loader-4-line text-3xl text-[#00A86B] animate-spin"></i>
              <p className="text-sm text-gray-400">Carregando planos...</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* Lista lateral */}
            <div className="w-72 flex-shrink-0 space-y-3">
              <button
                onClick={() => { setEditandoPlano(false); setModalNovo(true); }}
                className="w-full flex items-center justify-center gap-2 bg-[#00A86B] text-white text-xs font-bold py-2.5 rounded-lg hover:bg-[#009960] transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line"></i> Novo Plano de Ação
              </button>

              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar plano..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#00A86B]"
                />
              </div>

              <div className="flex gap-1">
                {(['Todos', 'Ativo', 'Revisão', 'Concluído'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFiltroStatus(f)}
                    className={`flex-1 text-[9px] font-bold py-1.5 rounded-full cursor-pointer transition-all whitespace-nowrap ${
                      filtroStatus === f
                        ? 'bg-[#0F2744] text-white'
                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
                {filtrados.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">Nenhum plano encontrado</div>
                ) : (
                  filtrados.map(plano => {
                    const pct =
                      plano.acoes.length > 0
                        ? Math.round(
                            (plano.acoes.filter(a => a.status === 'Concluída').length /
                              plano.acoes.length) *
                              100
                          )
                        : 0;
                    return (
                      <div
                        key={plano.id}
                        onClick={() => setSelected(plano)}
                        className={`bg-white rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-0.5 border-l-4 ${statusBorda[plano.status]} ${
                          selected?.id === plano.id ? 'ring-2 ring-[#00A86B]' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-xs font-bold text-gray-800 leading-tight">{plano.titulo}</p>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${statusColors[plano.status]}`}
                          >
                            {plano.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">{plano.escola}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Prazo: {formatPrazo(plano.prazo)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                pct === 100
                                  ? 'bg-emerald-400'
                                  : pct >= 50
                                  ? 'bg-yellow-400'
                                  : 'bg-[#0F2744]'
                              }`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold text-gray-500">{pct}%</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Painel principal */}
            {selected ? (
              <div className="flex-1 space-y-5">
                <div className="bg-white rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-base font-bold text-gray-800">{selected.titulo}</h2>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[selected.status]}`}
                        >
                          {selected.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {selected.escola} · Prazo: {formatPrazo(selected.prazo)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => { setEditandoPlano(true); setModalNovo(true); }}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors whitespace-nowrap"
                      >
                        <i className="ri-edit-line text-xs"></i> Editar
                      </button>
                      <button
                        onClick={() => setConfirmDeletePlano(true)}
                        className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer transition-colors"
                      >
                        <i className="ri-delete-bin-line text-red-400 text-sm"></i>
                      </button>
                    </div>
                  </div>

                  {(selected.problema || selected.objetivo) && (
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      {selected.problema && (
                        <div className="bg-red-50 rounded-xl p-4">
                          <p className="text-[10px] font-bold text-red-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                            <i className="ri-error-warning-line"></i> Problema Identificado
                          </p>
                          <p className="text-xs text-red-800 leading-relaxed">{selected.problema}</p>
                        </div>
                      )}
                      {selected.objetivo && (
                        <div className="bg-emerald-50 rounded-xl p-4">
                          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                            <i className="ri-focus-3-line"></i> Objetivo
                          </p>
                          <p className="text-xs text-emerald-800 leading-relaxed">{selected.objetivo}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-3">
                      Ações do Plano
                    </p>
                    <PainelAcoes
                      plano={selected}
                      onUpdateAcao={handleUpdateAcao}
                      onAddAcao={handleAddAcao}
                      onRemoveAcao={handleRemoveAcao}
                    />
                  </div>
                </div>

                <AnaliseIA
                  titulo={`Análise IA — ${selected.titulo}`}
                  contexto={`Plano de Ação "${selected.titulo}" da ${selected.escola}`}
                  dados={{
                    execucao: pctSelected,
                    acoesConcluidas: selected.acoes.filter(a => a.status === 'Concluída').length,
                    acoesPendentes: selected.acoes.filter(a => a.status === 'Pendente').length,
                    totalAcoes: selected.acoes.length,
                  }}
                />

                {selected.versoes.length > 0 && (
                  <div className="bg-white rounded-xl p-6">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-4">
                      Histórico de Versões
                    </p>
                    <div className="space-y-2">
                      {[...selected.versoes].reverse().map((v, i) => (
                        <div
                          key={v.id}
                          className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                            i === 0 ? 'bg-[#0F2744]/5 border border-[#0F2744]/10' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-[#0F2744]/10 rounded-lg flex-shrink-0">
                              <i className="ri-file-text-line text-[#0F2744] text-sm"></i>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-700">{v.autor}</p>
                              <p className="text-[10px] text-gray-400">
                                {v.data.includes('-')
                                  ? new Date(v.data + 'T00:00:00').toLocaleDateString('pt-BR')
                                  : v.data}{' '}
                                às {v.hora}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                v.status === 'Publicado'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : v.status === 'Revisado'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {v.status}
                            </span>
                            {i === 0 && (
                              <span className="text-[9px] text-[#0F2744] font-bold">Atual</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                    <i className="ri-task-line text-3xl text-gray-400"></i>
                  </div>
                  <p className="text-gray-500 font-medium text-sm">Selecione um plano</p>
                  <p className="text-gray-400 text-xs mt-1">ou crie um novo plano de ação</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {modalNovo && (
        <ModalNovoPlano
          plano={editandoPlano ? selected : null}
          onSave={handleSavePlano}
          onClose={() => { setModalNovo(false); setEditandoPlano(false); }}
        />
      )}

      {confirmDeletePlano && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center space-y-4">
            <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full mx-auto">
              <i className="ri-delete-bin-line text-red-500 text-xl"></i>
            </div>
            <p className="text-sm font-bold text-gray-800">Excluir este plano?</p>
            <p className="text-xs text-gray-500">
              Todas as ações e histórico serão removidos. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmDeletePlano(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePlano}
                className="px-4 py-2 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 cursor-pointer whitespace-nowrap"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
