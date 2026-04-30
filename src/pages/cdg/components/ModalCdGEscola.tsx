import { useState } from 'react';
import { CdGEscola, CdGEvidencia, CdGChecklist, etapasCdG } from '@/hooks/useCdG';
import { EscolaEditavel } from '@/context/DataContext';

interface Props {
  escola: EscolaEditavel;
  cdg: CdGEscola;
  onSave: (data: CdGEscola) => void;
  onClose: () => void;
}

const tiposEvidencia = ['Documento', 'Foto', 'Ata', 'Relatório', 'Outro'] as const;
type TipoEvidencia = typeof tiposEvidencia[number];

const statusCor: Record<string, string> = {
  'Em dia': 'bg-emerald-100 text-emerald-700',
  'Atrasado': 'bg-yellow-100 text-yellow-700',
  'Crítico': 'bg-red-100 text-red-700',
};

export default function ModalCdGEscola({ escola, cdg, onSave, onClose }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState<CdGEscola>({
    ...cdg,
    checklist: cdg.checklist.map(c => ({ ...c })),
    evidencias: cdg.evidencias.map(e => ({ ...e })),
  });
  const [novaEvidencia, setNovaEvidencia] = useState({ descricao: '', data: '', tipo: 'Documento' as TipoEvidencia });
  const [saved, setSaved] = useState(false);

  const etapaConcluida = (idx: number) => form.etapas_concluidas > idx;
  const etapaAtual = form.etapas_concluidas;

  const toggleEtapa = (idx: number) => {
    const novas = idx < form.etapas_concluidas ? idx : idx + 1;
    const novoStatus: CdGEscola['status_cdg'] = novas >= 4 ? 'Em dia' : novas >= 2 ? 'Atrasado' : 'Crítico';
    setForm(prev => ({ ...prev, etapas_concluidas: novas, status_cdg: novoStatus }));
  };

  const toggleChecklist = (id: number) => {
    setForm(prev => ({
      ...prev,
      checklist: prev.checklist.map(c => c.id === id ? { ...c, concluido: !c.concluido } : c),
    }));
  };

  const addEvidencia = () => {
    if (!novaEvidencia.descricao.trim()) return;
    const nova: CdGEvidencia = {
      id: Date.now(),
      cdg_id: form.id,
      tipo: novaEvidencia.tipo,
      descricao: novaEvidencia.descricao,
      arquivo: '',
      dataUpload: novaEvidencia.data,
    };
    setForm(prev => ({ ...prev, evidencias: [...prev.evidencias, nova] }));
    setNovaEvidencia({ descricao: '', data: '', tipo: 'Documento' });
  };

  const removeEvidencia = (id: number) =>
    setForm(prev => ({ ...prev, evidencias: prev.evidencias.filter(e => e.id !== id) }));

  const handleSave = () => {
    onSave({ ...form, updated_at: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const checklistEtapa = form.checklist.filter((c: CdGChecklist) => {
    // Distribui checklist por etapa baseado no índice
    const itemsPerEtapa = Math.ceil(form.checklist.length / 5);
    const etapaIdx = Math.floor(form.checklist.indexOf(c) / itemsPerEtapa);
    return etapaIdx === activeTab;
  });
  const evidenciasEtapa = form.evidencias;
  const checklistConcluidos = checklistEtapa.filter(c => c.concluido).length;

  const tipoIcon: Record<string, string> = {
    'Documento': 'ri-file-text-line',
    'Foto': 'ri-image-line',
    'Ata': 'ri-file-list-2-line',
    'Relatório': 'ri-bar-chart-line',
    'Outro': 'ri-attachment-line',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-sm font-bold text-gray-800">CdG Cearense</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCor[form.status_cdg]}`}>{form.status_cdg}</span>
            </div>
            <p className="text-xs text-gray-400 truncate max-w-sm">{escola.nome}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>

        {/* Timeline de etapas */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-6 right-6 h-0.5 bg-gray-200 z-0"></div>
            {etapasCdG.map((etapa, i) => {
              const concluida = etapaConcluida(i);
              const atual = i === etapaAtual;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center z-10 flex-1 cursor-pointer group"
                  onClick={() => setActiveTab(i)}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-bold text-sm transition-all ${
                      concluida
                        ? 'bg-[#00A86B] border-[#00A86B] text-white'
                        : atual
                        ? 'bg-white border-[#0F2744] text-[#0F2744]'
                        : activeTab === i
                        ? 'bg-white border-[#0F2744] text-[#0F2744]'
                        : 'bg-white border-gray-300 text-gray-400'
                    } ${activeTab === i ? 'ring-2 ring-offset-2 ring-[#00A86B]/40' : ''}`}
                  >
                    {concluida ? <i className="ri-check-line text-base"></i> : <i className={`${etapa.icone} text-base`}></i>}
                  </div>
                  <p className={`text-[10px] font-semibold mt-1.5 text-center max-w-[72px] leading-tight ${concluida ? 'text-[#00A86B]' : atual ? 'text-[#0F2744]' : 'text-gray-400'}`}>
                    {etapa.nome}
                  </p>
                  {atual && !concluida && (
                    <span className="text-[9px] bg-[#0F2744] text-white px-1.5 py-0.5 rounded-full mt-0.5 whitespace-nowrap">Atual</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-[10px] text-gray-400">
              Clique na etapa para navegar • {form.etapas_concluidas}/5 etapas concluídas
            </p>
            <button
              onClick={() => toggleEtapa(activeTab)}
              className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                etapaConcluida(activeTab)
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-[#00A86B] text-white hover:bg-[#009960]'
              }`}
            >
              {etapaConcluida(activeTab)
                ? <><i className="ri-close-line"></i> Desmarcar Etapa</>
                : <><i className="ri-check-line"></i> Marcar como Concluída</>
              }
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 ${etapaConcluida(activeTab) ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                <i className={`${etapasCdG[activeTab].icone} text-base ${etapaConcluida(activeTab) ? 'text-emerald-600' : 'text-gray-500'}`}></i>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Etapa {activeTab + 1}: {etapasCdG[activeTab].nome}</h3>
                <p className="text-[10px] text-gray-400">{checklistConcluidos}/{checklistEtapa.length} itens do checklist concluídos</p>
              </div>
            </div>

            {/* Checklist */}
            {checklistEtapa.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-3">Checklist da Etapa</p>
                <div className="space-y-2">
                  {checklistEtapa.map((item: CdGChecklist) => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${item.concluido ? 'bg-emerald-50' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                      <div className={`w-5 h-5 flex items-center justify-center rounded-md border-2 flex-shrink-0 transition-all ${item.concluido ? 'bg-[#00A86B] border-[#00A86B]' : 'border-gray-300 bg-white'}`}>
                        {item.concluido && <i className="ri-check-line text-white text-[10px]"></i>}
                      </div>
                      <p className={`text-xs flex-1 ${item.concluido ? 'text-emerald-700 line-through' : 'text-gray-700'}`}>
                        {item.item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidências */}
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-3">
                Evidências ({evidenciasEtapa.length})
              </p>

              {evidenciasEtapa.length > 0 && (
                <div className="space-y-2 mb-3">
                  {evidenciasEtapa.map(ev => (
                    <div key={ev.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-gray-200 flex-shrink-0">
                        <i className={`${tipoIcon[ev.tipo] ?? 'ri-attachment-line'} text-gray-500 text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{ev.descricao}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400">{ev.tipo}</span>
                          {ev.dataUpload && <span className="text-[10px] text-gray-400">{new Date(ev.dataUpload + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => removeEvidencia(ev.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer transition-colors flex-shrink-0"
                      >
                        <i className="ri-delete-bin-line text-red-400 text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border border-dashed border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Adicionar Evidência</p>
                <input
                  value={novaEvidencia.descricao}
                  onChange={e => setNovaEvidencia(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição da evidência..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={novaEvidencia.tipo}
                    onChange={e => setNovaEvidencia(prev => ({ ...prev, tipo: e.target.value as TipoEvidencia }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B] bg-white cursor-pointer"
                  >
                    {tiposEvidencia.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    type="date"
                    value={novaEvidencia.data}
                    onChange={e => setNovaEvidencia(prev => ({ ...prev, data: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
                <button
                  onClick={addEvidencia}
                  disabled={!novaEvidencia.descricao.trim()}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-[#0F2744]/5 text-[#0F2744] rounded-lg hover:bg-[#0F2744]/10 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <i className="ri-add-line"></i> Adicionar Evidência
                </button>
              </div>
            </div>

            {/* Observações */}
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Observações Gerais</p>
              <textarea
                value={form.observacoes}
                onChange={e => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                rows={3}
                maxLength={500}
                placeholder="Anotações sobre o CdG desta escola..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B] resize-none"
              />
              <p className="text-[10px] text-gray-400 text-right mt-0.5">{form.observacoes.length}/500</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[10px] text-gray-400">
            {form.updated_at ? `Última edição: ${new Date(form.updated_at).toLocaleDateString('pt-BR')}` : ''}
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className={`px-5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap flex items-center gap-2 ${saved ? 'bg-emerald-500 text-white' : 'bg-[#00A86B] text-white hover:bg-[#009960]'}`}
            >
              {saved ? <><i className="ri-check-line"></i> Salvo!</> : <><i className="ri-save-line"></i> Salvar CdG</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}