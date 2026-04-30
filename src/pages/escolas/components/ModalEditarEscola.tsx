import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { EscolaEditavel } from '@/context/DataContext';

interface Props {
  escola: EscolaEditavel;
  onSave: (data: Partial<EscolaEditavel>) => void;
  onClose: () => void;
}

const tabs = ['Identificação', 'Indicadores', 'Metas', 'Observações'];

export default function ModalEditarEscola({ escola, onSave, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('Identificação');
  const [form, setForm] = useState<Partial<EscolaEditavel>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({ ...escola });
    setActiveTab('Identificação');
  }, [escola]);

  const set = (field: keyof EscolaEditavel, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  const modal = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ zIndex: 100000 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Editar Escola</h2>
            <p className="text-xs text-gray-400 mt-0.5">{escola.nome}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 mr-6 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'border-[#00A86B] text-[#00A86B]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── IDENTIFICAÇÃO ── */}
          {activeTab === 'Identificação' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Nome da Escola</label>
                  <input
                    value={form.nome || ''}
                    onChange={e => set('nome', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Diretor(a)</label>
                  <input
                    value={form.diretor || ''}
                    onChange={e => set('diretor', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Telefone</label>
                  <input
                    value={form.telefone || ''}
                    onChange={e => set('telefone', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">E-mail</label>
                  <input
                    value={form.email || ''}
                    onChange={e => set('email', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Endereço</label>
                  <input
                    value={form.endereco || ''}
                    onChange={e => set('endereco', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Matrículas</label>
                  <input
                    type="number"
                    value={form.matriculas || ''}
                    onChange={e => set('matriculas', +e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Turmas</label>
                  <input
                    type="number"
                    value={form.turmas || ''}
                    onChange={e => set('turmas', +e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Professores</label>
                  <input
                    type="number"
                    value={form.professores || ''}
                    onChange={e => set('professores', +e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Funcionários</label>
                  <input
                    type="number"
                    value={form.funcionarios || ''}
                    onChange={e => set('funcionarios', +e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── INDICADORES ── */}
          {activeTab === 'Indicadores' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                <i className="ri-information-line mr-1"></i>
                Ao salvar, o semáforo da escola será recalculado automaticamente com base nos indicadores.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { field: 'aprovacao' as keyof EscolaEditavel, label: 'Taxa de Aprovação (%)', min: 0, max: 100, step: 0.1 },
                  { field: 'evasao' as keyof EscolaEditavel, label: 'Taxa de Evasão (%)', min: 0, max: 100, step: 0.1 },
                  { field: 'frequencia' as keyof EscolaEditavel, label: 'Frequência Média (%)', min: 0, max: 100, step: 0.1 },
                  { field: 'ideb' as keyof EscolaEditavel, label: 'IDEB', min: 0, max: 10, step: 0.1 },
                  { field: 'preenchimentoSige' as keyof EscolaEditavel, label: 'Preenchimento SIGE (%)', min: 0, max: 100, step: 1 },
                  { field: 'visitasRealizadas' as keyof EscolaEditavel, label: 'Visitas Realizadas', min: 0, max: 20, step: 1 },
                  { field: 'notaPortugues' as keyof EscolaEditavel, label: 'Nota Português', min: 0, max: 10, step: 0.1 },
                  { field: 'notaMatematica' as keyof EscolaEditavel, label: 'Nota Matemática', min: 0, max: 10, step: 0.1 },
                ].map(({ field, label, min, max, step }) => (
                  <div key={field}>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">{label}</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range" min={min} max={max} step={step}
                        value={Number(form[field]) || 0}
                        onChange={e => set(field, +e.target.value)}
                        className="flex-1 accent-[#00A86B]"
                      />
                      <input
                        type="number" min={min} max={max} step={step}
                        value={Number(form[field]) || 0}
                        onChange={e => set(field, +e.target.value)}
                        className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-[#00A86B]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── METAS ── */}
          {activeTab === 'Metas' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg p-3">
                <i className="ri-focus-3-line mr-1 text-amber-500"></i>
                As metas são usadas para calcular o desempenho relativo nos gráficos e relatórios.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { field: 'metaAprovacao' as keyof EscolaEditavel, label: 'Meta de Aprovação (%)', min: 0, max: 100 },
                  { field: 'metaFrequencia' as keyof EscolaEditavel, label: 'Meta de Frequência (%)', min: 0, max: 100 },
                  { field: 'metaEvasao' as keyof EscolaEditavel, label: 'Meta de Evasão (%)', min: 0, max: 20 },
                ].map(({ field, label, min, max }) => (
                  <div key={field}>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">{label}</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range" min={min} max={max} step={0.5}
                        value={Number(form[field]) || 0}
                        onChange={e => set(field, +e.target.value)}
                        className="flex-1 accent-[#00A86B]"
                      />
                      <input
                        type="number" min={min} max={max} step={0.5}
                        value={Number(form[field]) || 0}
                        onChange={e => set(field, +e.target.value)}
                        className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-[#00A86B]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── OBSERVAÇÕES ── */}
          {activeTab === 'Observações' && (
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Observações e Anotações</label>
              <textarea
                value={form.observacoes || ''}
                onChange={e => set('observacoes', e.target.value)}
                rows={10}
                placeholder="Registre observações sobre a escola, pontos de atenção, encaminhamentos..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B] resize-none"
                maxLength={500}
              />
              <p className="text-[10px] text-gray-400 mt-1 text-right">{(form.observacoes || '').length}/500</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[10px] text-gray-400">
            {escola.updatedAt ? `Última edição: ${new Date(escola.updatedAt).toLocaleDateString('pt-BR')}` : ''}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className={`px-5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap flex items-center gap-2 ${
                saved ? 'bg-emerald-500 text-white' : 'bg-[#00A86B] text-white hover:bg-[#009960]'
              }`}
            >
              {saved
                ? <><i className="ri-check-line"></i> Salvo!</>
                : <><i className="ri-save-line"></i> Salvar Alterações</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
