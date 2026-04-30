import { useState } from 'react';
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

export default function CdGPage() {
  const { escolas, updateEscola } = useData();
  const { cdgData, loading, saveCdG } = useCdG();
  const [editando, setEditando] = useState<{ escola: typeof escolas[0]; cdg: CdGEscola } | null>(null);
  const [filtro, setFiltro] = useState<'Todas' | 'Em dia' | 'Atrasado' | 'Crítico'>('Todas');
  const [search, setSearch] = useState('');
  const [savedToast, setSavedToast] = useState('');

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
          CdG atualizado com sucesso!
        </div>
      )}

      <div className="space-y-6">
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

              return (
                <div key={escola.id} className={`border-l-4 ${statusBorda[cdg.status_cdg]} hover:bg-gray-50/50 transition-colors`}>
                  <div className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-bold text-gray-800 truncate">{escola.nome}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusCor[cdg.status_cdg]}`}>{cdg.status_cdg}</span>
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

                    <button
                      onClick={() => setEditando({ escola, cdg })}
                      className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 bg-[#0F2744]/5 text-[#0F2744] rounded-lg hover:bg-[#0F2744]/10 cursor-pointer transition-colors whitespace-nowrap flex-shrink-0"
                    >
                      <i className="ri-edit-line text-xs"></i>
                      Lançar CdG
                    </button>
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