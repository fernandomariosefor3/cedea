import { useState, useEffect } from 'react';
import MainLayout from '@/components/feature/MainLayout';
import { useData } from '@/context/DataContext';
import { useCdG, CdGEscola, etapasCdG } from '@/hooks/useCdG';
import ModalCdGEscola from './components/ModalCdGEscola';
import AnaliseIA from '@/components/feature/AnaliseIA';

const statusCor: Record<string, string> = {
  'Em dia': 'bg-emerald-100 text-emerald-700',
  'Atrasado': 'bg-yellow-100 text-yellow-700',
  'Crítico': 'bg-red-100 text-red-700',
};

const statusBorda: Record<string, string> = {
  'Em dia': 'border-emerald-200',
  'Atrasado': 'border-yellow-200',
  'Crítico': 'border-red-200',
};

interface AcaoPlano {
  id: string;
  acao: string;
  responsavel: string;
  prazo: string;
  impacto: 'alto' | 'médio' | 'baixo';
  status: 'pendente' | 'em_andamento' | 'concluida';
  observacao: string;
}

interface PlanoEscola {
  escola_id: number;
  objetivo: string;
  analise: string;
  acoes: AcaoPlano[];
  updated_at: string;
}

const PLANOS_KEY = 'sefor3_planos_cdg';

function loadPlanos(): PlanoEscola[] {
  try {
    const raw = localStorage.getItem(PLANOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePlanos(planos: PlanoEscola[]) {
  localStorage.setItem(PLANOS_KEY, JSON.stringify(planos));
}

const impactoConfig = {
  alto: { label: 'Alto', color: 'text-red-600', bg: 'bg-red-50' },
  médio: { label: 'Médio', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  baixo: { label: 'Baixo', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

const statusAcaoConfig = {
  pendente: { label: 'Pendente', color: 'text-gray-500', bg: 'bg-gray-100' },
  em_andamento: { label: 'Em andamento', color: 'text-blue-600', bg: 'bg-blue-50' },
  concluida: { label: 'Concluída', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

export default function CdGPage() {
  const { escolas, updateEscola } = useData();
  const { cdgData, loading, saveCdG } = useCdG();
  const [editando, setEditando] = useState<{ escola: typeof escolas[0]; cdg: CdGEscola } | null>(null);
  const [filtro, setFiltro] = useState<'Todas' | 'Em dia' | 'Atrasado' | 'Crítico'>('Todas');
  const [search, setSearch] = useState('');
  const [savedToast, setSavedToast] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'ciclo' | 'plano'>('ciclo');

  // Plano de Ação state
  const [planos, setPlanos] = useState<PlanoEscola[]>(loadPlanos);
  const [escolaPlanoId, setEscolaPlanoId] = useState<number | null>(null);
  const [novaAcaoForm, setNovaAcaoForm] = useState<Partial<AcaoPlano>>({
    acao: '', responsavel: '', prazo: '', impacto: 'alto', status: 'pendente', observacao: '',
  });
  const [adicionandoAcao, setAdicionandoAcao] = useState(false);
  const [editandoPlano, setEditandoPlano] = useState(false);
  const [planoForm, setPlanoForm] = useState({ objetivo: '', analise: '' });
  const [expandidoAcao, setExpandidoAcao] = useState<string | null>(null);

  useEffect(() => {
    savePlanos(planos);
  }, [planos]);

  const getCdG = (escolaId: number): CdGEscola =>
    cdgData.find(c => c.escola_id === escolaId) ?? {
      id: 0,
      escola_id: escolaId,
      etapas_concluidas: 0,
      status_cdg: 'Crítico',
      evidencias: [],
      checklist: [],
      observacoes: '',
      updated_at: new Date().toISOString(),
    };

  const getPlano = (escolaId: number): PlanoEscola =>
    planos.find(p => p.escola_id === escolaId) ?? {
      escola_id: escolaId,
      objetivo: '',
      analise: '',
      acoes: [],
      updated_at: new Date().toISOString(),
    };

  const handleSave = async (data: CdGEscola) => {
    const success = await saveCdG({
      escola_id: data.escola_id,
      etapas_concluidas: data.etapas_concluidas,
      status_cdg: data.status_cdg,
      observacoes: data.observacoes,
      checklist: data.checklist.map(c => ({ item: c.item, concluido: c.concluido })),
    });

    if (success) {
      await updateEscola(data.escola_id, {
        statusCdg: data.status_cdg,
        etapasCdg: data.etapas_concluidas,
      });

      setSavedToast(editando?.escola.nome ?? '');
      setEditando(null);
      setTimeout(() => setSavedToast(''), 3000);
    }
  };

  const handleSavePlano = () => {
    if (!escolaPlanoId) return;
    setPlanos(prev => {
      const updated = prev.filter(p => p.escola_id !== escolaPlanoId);
      const existing = prev.find(p => p.escola_id === escolaPlanoId) ?? { escola_id: escolaPlanoId, acoes: [], updated_at: '' };
      return [...updated, { ...existing, objetivo: planoForm.objetivo, analise: planoForm.analise, updated_at: new Date().toISOString() }];
    });
    setEditandoPlano(false);
    setSavedToast('Plano de Ação salvo!');
    setTimeout(() => setSavedToast(''), 2000);
  };

  const handleAddAcao = () => {
    if (!escolaPlanoId || !novaAcaoForm.acao?.trim()) return;
    const acao: AcaoPlano = {
      id: Date.now().toString(),
      acao: novaAcaoForm.acao || '',
      responsavel: novaAcaoForm.responsavel || '',
      prazo: novaAcaoForm.prazo || '',
      impacto: novaAcaoForm.impacto || 'alto',
      status: novaAcaoForm.status || 'pendente',
      observacao: novaAcaoForm.observacao || '',
    };
    setPlanos(prev => {
      const existing = prev.find(p => p.escola_id === escolaPlanoId);
      if (existing) {
        return prev.map(p => p.escola_id === escolaPlanoId ? { ...p, acoes: [...p.acoes, acao], updated_at: new Date().toISOString() } : p);
      }
      return [...prev, { escola_id: escolaPlanoId, objetivo: '', analise: '', acoes: [acao], updated_at: new Date().toISOString() }];
    });
    setNovaAcaoForm({ acao: '', responsavel: '', prazo: '', impacto: 'alto', status: 'pendente', observacao: '' });
    setAdicionandoAcao(false);
  };

  const handleUpdateAcaoStatus = (acaoId: string, status: AcaoPlano['status']) => {
    if (!escolaPlanoId) return;
    setPlanos(prev => prev.map(p => {
      if (p.escola_id !== escolaPlanoId) return p;
      return { ...p, acoes: p.acoes.map(a => a.id === acaoId ? { ...a, status } : a) };
    }));
  };

  const handleRemoveAcao = (acaoId: string) => {
    if (!escolaPlanoId) return;
    setPlanos(prev => prev.map(p => {
      if (p.escola_id !== escolaPlanoId) return p;
      return { ...p, acoes: p.acoes.filter(a => a.id !== acaoId) };
    }));
  };

  const filtered = escolas.filter(e => {
    const cdg = getCdG(e.id);
    const matchFiltro = filtro === 'Todas' || cdg.status_cdg === filtro;
    const matchSearch = e.nome.toLowerCase().includes(search.toLowerCase());
    return matchFiltro && matchSearch;
  });

  const emDia = escolas.filter(e => getCdG(e.id).status_cdg === 'Em dia').length;
  const atrasado = escolas.filter(e => getCdG(e.id).status_cdg === 'Atrasado').length;
  const critico = escolas.filter(e => getCdG(e.id).status_cdg === 'Crítico').length;
  const mediaEtapas = escolas.length > 0
    ? (escolas.reduce((s, e) => s + getCdG(e.id).etapas_concluidas, 0) / escolas.length).toFixed(1)
    : '0';

  const distribuicaoEtapas = etapasCdG.map((_, i) =>
    escolas.filter(e => getCdG(e.id).etapas_concluidas === i + 1 || (i === 4 && getCdG(e.id).etapas_concluidas >= 5)).length
  );

  const escolaAtualPlano = escolaPlanoId ? escolas.find(e => e.id === escolaPlanoId) : null;
  const planoAtual = escolaPlanoId ? getPlano(escolaPlanoId) : null;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#00A86B] rounded-full animate-spin"></div>
            <span className="text-sm">Carregando dados do CdG...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {savedToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-white text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
          <i className="ri-checkbox-circle-fill text-base"></i>
          {savedToast}
        </div>
      )}

      <div className="space-y-6">
        {/* Abas principais */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setAbaAtiva('ciclo')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${abaAtiva === 'ciclo' ? 'bg-white text-[#0F2744] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <i className="ri-loop-right-line mr-2"></i>Ciclo de Gestão
          </button>
          <button
            onClick={() => setAbaAtiva('plano')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${abaAtiva === 'plano' ? 'bg-white text-[#0F2744] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <i className="ri-task-line mr-2"></i>Plano de Ação por Escola
          </button>
        </div>

        {abaAtiva === 'ciclo' && (
          <>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Média de Etapas</p>
                <p className="text-2xl font-bold text-[#0F2744] mt-1">{mediaEtapas}<span className="text-sm text-gray-400">/5</span></p>
                <p className="text-[10px] text-gray-400 mt-1">por escola na regional</p>
              </div>
              <div className="bg-white rounded-xl p-5 border-l-4 border-emerald-400">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Em Dia</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{emDia}</p>
                <p className="text-[10px] text-gray-400 mt-1">escolas no ciclo completo</p>
              </div>
              <div className="bg-white rounded-xl p-5 border-l-4 border-yellow-400">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Atrasadas</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{atrasado}</p>
                <p className="text-[10px] text-gray-400 mt-1">precisam de atenção</p>
              </div>
              <div className="bg-white rounded-xl p-5 border-l-4 border-red-500">
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Críticas</p>
                <p className="text-2xl font-bold text-red-500 mt-1">{critico}</p>
                <p className="text-[10px] text-gray-400 mt-1">necessitam intervenção</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div className="col-span-2 bg-white rounded-xl p-6">
                <h3 className="text-xs font-bold text-gray-700 mb-5">Ciclo de Gestão Cearense 2026 — Etapas</h3>
                <div className="flex items-start justify-between relative">
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 z-0"></div>
                  {etapasCdG.map((etapa, i) => {
                    const count = escolas.filter(e => getCdG(e.id).etapas_concluidas > i).length;
                    const pct = escolas.length > 0 ? Math.round((count / escolas.length) * 100) : 0;
                    return (
                      <div key={i} className="flex flex-col items-center z-10 flex-1">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-bold text-sm transition-all ${pct >= 80 ? 'bg-[#00A86B] border-[#00A86B] text-white' : pct >= 40 ? 'bg-white border-[#0F2744] text-[#0F2744]' : 'bg-white border-gray-300 text-gray-400'}`}>
                          <i className={`${etapa.icone} text-base`}></i>
                        </div>
                        <p className={`text-[10px] font-semibold mt-2 text-center max-w-[72px] leading-tight ${pct >= 80 ? 'text-[#00A86B]' : pct >= 40 ? 'text-[#0F2744]' : 'text-gray-400'}`}>
                          {etapa.nome}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{count}/{escolas.length} escolas</p>
                        <div className="w-12 bg-gray-100 rounded-full h-1 mt-1">
                          <div className={`h-1 rounded-full ${pct >= 80 ? 'bg-emerald-400' : pct >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6">
                <h3 className="text-xs font-bold text-gray-700 mb-4">Distribuição por Etapa</h3>
                <div className="space-y-3">
                  {etapasCdG.map((etapa, i) => {
                    const count = distribuicaoEtapas[i];
                    const pct = escolas.length > 0 ? (count / escolas.length) * 100 : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{etapa.nome}</span>
                          <span className="text-[10px] font-bold text-gray-700">{count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full bg-[#00A86B] transition-all" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-xs">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar escola..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#00A86B]"
                />
              </div>
              <div className="flex gap-2">
                {(['Todas', 'Em dia', 'Atrasado', 'Crítico'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFiltro(f)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full cursor-pointer transition-all whitespace-nowrap ${filtro === f ? 'bg-[#0F2744] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 ml-auto">{filtered.length} escola{filtered.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="bg-white rounded-xl overflow-hidden">
              <div className="divide-y divide-gray-50">
                {filtered.map(escola => {
                  const cdg = getCdG(escola.id);
                  const checklistTotal = cdg.checklist.length;
                  const checklistConc = cdg.checklist.filter(c => c.concluido).length;
                  const evidenciasTotal = cdg.evidencias.length;
                  const plano = getPlano(escola.id);
                  const temPlano = plano.objetivo || plano.acoes.length > 0;

                  return (
                    <div key={escola.id} className={`border-l-4 ${statusBorda[cdg.status_cdg]} hover:bg-gray-50/50 transition-colors`}>
                      <div className="flex items-center gap-4 px-6 py-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-xs font-bold text-gray-800 truncate">{escola.nome}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusCor[cdg.status_cdg]}`}>{cdg.status_cdg}</span>
                            {temPlano && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 flex-shrink-0 flex items-center gap-1">
                                <i className="ri-task-line text-[10px]"></i>Plano
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400">{escola.diretor}</p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {etapasCdG.map((_, i) => (
                            <div
                              key={i}
                              className={`w-6 h-6 flex items-center justify-center rounded-full text-[9px] font-bold transition-all ${i < cdg.etapas_concluidas ? 'bg-[#00A86B] text-white' : 'bg-gray-100 text-gray-400'}`}
                            >
                              {i < cdg.etapas_concluidas ? <i className="ri-check-line text-[10px]"></i> : i + 1}
                            </div>
                          ))}
                          <span className="text-xs font-bold text-gray-600 ml-1">{cdg.etapas_concluidas}/5</span>
                        </div>

                        <div className="w-28 flex-shrink-0">
                          <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-gray-400">Progresso</span>
                            <span className="text-[10px] font-bold text-gray-600">{Math.round((cdg.etapas_concluidas / 5) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${cdg.etapas_concluidas >= 4 ? 'bg-emerald-400' : cdg.etapas_concluidas >= 2 ? 'bg-yellow-400' : 'bg-red-400'}`}
                              style={{ width: `${(cdg.etapas_concluidas / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0 text-[10px] text-gray-400">
                          {checklistTotal > 0 && (
                            <span className="flex items-center gap-1">
                              <i className="ri-checkbox-line text-xs"></i>
                              {checklistConc}/{checklistTotal}
                            </span>
                          )}
                          {evidenciasTotal > 0 && (
                            <span className="flex items-center gap-1">
                              <i className="ri-attachment-line text-xs"></i>
                              {evidenciasTotal}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => setEditando({ escola, cdg })}
                            className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 bg-[#0F2744]/5 text-[#0F2744] rounded-lg hover:bg-[#0F2744]/10 cursor-pointer transition-colors whitespace-nowrap"
                          >
                            <i className="ri-edit-line text-xs"></i>
                            Lançar CdG
                          </button>
                          <button
                            onClick={() => {
                              setEscolaPlanoId(escola.id);
                              setAbaAtiva('plano');
                              const p = getPlano(escola.id);
                              setPlanoForm({ objetivo: p.objetivo, analise: p.analise });
                            }}
                            className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors whitespace-nowrap"
                          >
                            <i className="ri-task-line text-xs"></i>
                            Plano de Ação
                          </button>
                        </div>
                      </div>

                      {cdg.observacoes && (
                        <div className="px-6 pb-3">
                          <p className="text-[10px] text-gray-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                            <i className="ri-sticky-note-line mr-1 text-amber-500"></i>
                            {cdg.observacoes}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <AnaliseIA
              titulo="Análise IA — CdG Cearense Regional"
              contexto="Ciclo de Gestão Cearense da Regional"
              dados={{
                escolasEmDia: emDia,
                escolasAtrasadas: atrasado,
                escolasCriticas: critico,
                mediaEtapas: Number(mediaEtapas),
                aprovacao: escolas.length > 0 ? escolas.reduce((s, e) => s + e.aprovacao, 0) / escolas.length : 0,
              }}
            />
          </>
        )}

        {abaAtiva === 'plano' && (
          <div className="space-y-5">
            {/* Seleção de Escola */}
            <div className="bg-white rounded-xl p-5">
              <h3 className="text-sm font-bold text-[#0F2744] mb-3">Plano de Ação por Escola</h3>
              <p className="text-xs text-gray-400 mb-4">Selecione uma escola para inserir ou visualizar o plano de ação, análise e monitoramento das ações.</p>
              <div className="flex items-center gap-3">
                <select
                  value={escolaPlanoId ?? ''}
                  onChange={e => {
                    const id = Number(e.target.value);
                    setEscolaPlanoId(id || null);
                    if (id) {
                      const p = getPlano(id);
                      setPlanoForm({ objetivo: p.objetivo, analise: p.analise });
                    }
                    setEditandoPlano(false);
                    setAdicionandoAcao(false);
                  }}
                  className="flex-1 max-w-sm border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B] cursor-pointer bg-white"
                >
                  <option value="">Selecione uma escola...</option>
                  {escolas.map(e => {
                    const temPlano = planos.some(p => p.escola_id === e.id && (p.objetivo || p.acoes.length > 0));
                    return (
                      <option key={e.id} value={e.id}>
                        {e.nome}{temPlano ? ' ✓' : ''}
                      </option>
                    );
                  })}
                </select>
                {escolaPlanoId && (
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${statusCor[getCdG(escolaPlanoId).status_cdg]}`}>
                    CdG: {getCdG(escolaPlanoId).status_cdg}
                  </span>
                )}
              </div>
            </div>

            {escolaPlanoId && escolaAtualPlano && planoAtual && (
              <>
                {/* Objetivo e Análise */}
                <div className="bg-white rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#0F2744]">
                      <i className="ri-school-line mr-2 text-[#00A86B]"></i>
                      {escolaAtualPlano.nome}
                    </h3>
                    {!editandoPlano ? (
                      <button
                        onClick={() => { setEditandoPlano(true); setPlanoForm({ objetivo: planoAtual.objetivo, analise: planoAtual.analise }); }}
                        className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-[#0F2744] text-white rounded-lg hover:bg-[#1a3a5c] cursor-pointer transition-colors whitespace-nowrap"
                      >
                        <i className="ri-edit-line text-xs"></i>
                        {planoAtual.objetivo ? 'Editar Plano' : 'Inserir Plano'}
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => setEditandoPlano(false)} className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap">Cancelar</button>
                        <button onClick={handleSavePlano} className="px-4 py-1.5 text-xs font-bold bg-[#00A86B] text-white rounded-lg hover:bg-[#009960] cursor-pointer whitespace-nowrap">Salvar Plano</button>
                      </div>
                    )}
                  </div>

                  {editandoPlano ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1.5">Objetivo Geral do Plano <span className="text-red-400">*</span></label>
                        <textarea
                          value={planoForm.objetivo}
                          onChange={e => setPlanoForm(p => ({ ...p, objetivo: e.target.value }))}
                          placeholder="Descreva o objetivo principal do plano de ação para esta escola..."
                          rows={3}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1.5">Análise da Situação</label>
                        <textarea
                          value={planoForm.analise}
                          onChange={e => setPlanoForm(p => ({ ...p, analise: e.target.value }))}
                          placeholder="Descreva a análise diagnóstica da escola: pontos fortes, fragilidades, principais desafios, contexto..."
                          rows={5}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Objetivo Geral</p>
                        {planoAtual.objetivo ? (
                          <p className="text-xs text-gray-700 bg-blue-50 rounded-lg p-3 border border-blue-100">{planoAtual.objetivo}</p>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Nenhum objetivo definido ainda.</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Análise da Situação</p>
                        {planoAtual.analise ? (
                          <p className="text-xs text-gray-700 bg-amber-50 rounded-lg p-3 border border-amber-100 whitespace-pre-line">{planoAtual.analise}</p>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Nenhuma análise registrada ainda.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Ações do Plano */}
                <div className="bg-white rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#0F2744]">Ações do Plano</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{planoAtual.acoes.length} ação{planoAtual.acoes.length !== 1 ? 'ões' : ''} cadastrada{planoAtual.acoes.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button
                      onClick={() => setAdicionandoAcao(true)}
                      className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-[#00A86B] text-white rounded-lg hover:bg-[#009960] cursor-pointer transition-colors whitespace-nowrap"
                    >
                      <i className="ri-add-line text-sm"></i>
                      Nova Ação
                    </button>
                  </div>

                  {/* Formulário de nova ação */}
                  {adicionandoAcao && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200 space-y-3">
                      <p className="text-xs font-bold text-gray-700">Nova Ação</p>
                      <div>
                        <label className="text-[10px] font-bold text-gray-600 block mb-1">Descrição da Ação <span className="text-red-400">*</span></label>
                        <textarea
                          value={novaAcaoForm.acao}
                          onChange={e => setNovaAcaoForm(p => ({ ...p, acao: e.target.value }))}
                          placeholder="Descreva a ação a ser realizada..."
                          rows={2}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-600 block mb-1">Responsável</label>
                          <input
                            type="text"
                            value={novaAcaoForm.responsavel}
                            onChange={e => setNovaAcaoForm(p => ({ ...p, responsavel: e.target.value }))}
                            placeholder="Nome do responsável"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-600 block mb-1">Prazo</label>
                          <input
                            type="date"
                            value={novaAcaoForm.prazo}
                            onChange={e => setNovaAcaoForm(p => ({ ...p, prazo: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-600 block mb-1">Impacto</label>
                          <select
                            value={novaAcaoForm.impacto}
                            onChange={e => setNovaAcaoForm(p => ({ ...p, impacto: e.target.value as AcaoPlano['impacto'] }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer"
                          >
                            <option value="alto">Alto impacto</option>
                            <option value="médio">Médio impacto</option>
                            <option value="baixo">Baixo impacto</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-600 block mb-1">Observação</label>
                        <input
                          type="text"
                          value={novaAcaoForm.observacao}
                          onChange={e => setNovaAcaoForm(p => ({ ...p, observacao: e.target.value }))}
                          placeholder="Observações adicionais (opcional)"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B]"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setAdicionandoAcao(false)} className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap">Cancelar</button>
                        <button
                          onClick={handleAddAcao}
                          disabled={!novaAcaoForm.acao?.trim()}
                          className="px-4 py-1.5 text-xs font-bold bg-[#00A86B] text-white rounded-lg hover:bg-[#009960] cursor-pointer disabled:opacity-40 whitespace-nowrap"
                        >
                          Adicionar Ação
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lista de ações */}
                  {planoAtual.acoes.length === 0 && !adicionandoAcao ? (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-3">
                        <i className="ri-task-line text-gray-400 text-xl"></i>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Nenhuma ação cadastrada</p>
                      <p className="text-xs text-gray-400 mt-1">Clique em "Nova Ação" para adicionar ações ao plano</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Resumo de impacto */}
                      {planoAtual.acoes.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {(['alto', 'médio', 'baixo'] as const).map(imp => {
                            const count = planoAtual.acoes.filter(a => a.impacto === imp).length;
                            const cfg = impactoConfig[imp];
                            return (
                              <div key={imp} className={`${cfg.bg} rounded-lg p-3 text-center`}>
                                <p className={`text-lg font-bold ${cfg.color}`}>{count}</p>
                                <p className="text-[10px] text-gray-500">Impacto {cfg.label}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {planoAtual.acoes.map((acao) => {
                        const impCfg = impactoConfig[acao.impacto];
                        const stCfg = statusAcaoConfig[acao.status];
                        const isExpanded = expandidoAcao === acao.id;
                        const prazoVencido = acao.prazo && new Date(acao.prazo) < new Date() && acao.status !== 'concluida';
                        return (
                          <div key={acao.id} className={`border rounded-xl overflow-hidden ${prazoVencido ? 'border-red-200' : 'border-gray-100'}`}>
                            <div className="flex items-center gap-3 px-4 py-3">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${acao.impacto === 'alto' ? 'bg-red-400' : acao.impacto === 'médio' ? 'bg-yellow-400' : 'bg-emerald-400'}`}></div>
                              <p className="text-xs font-semibold text-gray-800 flex-1 truncate">{acao.acao}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${impCfg.bg} ${impCfg.color}`}>{impCfg.label}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${stCfg.bg} ${stCfg.color}`}>{stCfg.label}</span>
                              {acao.prazo && (
                                <span className={`text-[10px] flex items-center gap-1 flex-shrink-0 ${prazoVencido ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                  <i className={`ri-calendar-line text-xs ${prazoVencido ? 'text-red-500' : ''}`}></i>
                                  {new Date(acao.prazo + 'T00:00:00').toLocaleDateString('pt-BR')}
                                  {prazoVencido && <i className="ri-alarm-warning-line text-xs text-red-500"></i>}
                                </span>
                              )}
                              <button
                                onClick={() => setExpandidoAcao(isExpanded ? null : acao.id)}
                                className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0"
                              >
                                <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-base`}></i>
                              </button>
                            </div>
                            {isExpanded && (
                              <div className="px-4 pb-3 pt-0 bg-gray-50/50 border-t border-gray-100 space-y-3">
                                {acao.responsavel && <p className="text-xs text-gray-500"><i className="ri-user-line mr-1"></i><strong>Responsável:</strong> {acao.responsavel}</p>}
                                {acao.observacao && <p className="text-xs text-gray-500"><i className="ri-sticky-note-line mr-1"></i>{acao.observacao}</p>}
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-gray-500">Atualizar status:</span>
                                  {(['pendente', 'em_andamento', 'concluida'] as const).map(s => (
                                    <button
                                      key={s}
                                      onClick={() => handleUpdateAcaoStatus(acao.id, s)}
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer transition-all ${acao.status === s ? `${statusAcaoConfig[s].bg} ${statusAcaoConfig[s].color} ring-1 ring-current` : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                    >
                                      {statusAcaoConfig[s].label}
                                    </button>
                                  ))}
                                  <button
                                    onClick={() => handleRemoveAcao(acao.id)}
                                    className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-semibold text-red-400 hover:bg-red-50 cursor-pointer transition-colors"
                                  >
                                    <i className="ri-delete-bin-line mr-1"></i>Remover
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {editando && (
        <ModalCdGEscola
          escola={editando.escola}
          cdg={editando.cdg}
          onSave={handleSave}
          onClose={() => setEditando(null)}
        />
      )}
    </MainLayout>
  );
}
