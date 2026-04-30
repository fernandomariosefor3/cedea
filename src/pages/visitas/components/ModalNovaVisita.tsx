import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { NovaVisitaInput, TipoVisita } from '@/hooks/useVisitas';

interface Props {
  onSave: (visita: NovaVisitaInput) => void;
  onClose: () => void;
}

const tipos: TipoVisita[] = [
  'Acompanhamento CdG',
  'Intervenção Pedagógica',
  'SMAR',
  'Plano de Ação',
  'Busca Ativa',
  'Visita Técnica Geral',
];

export default function ModalNovaVisita({ onSave, onClose }: Props) {
  const { escolas } = useData();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    escola_id: 0,
    escola_nome: '',
    data: '',
    hora: '08:00',
    tipo: '' as TipoVisita | '',
    objetivo: '',
    status: 'Agendada' as const,
    relato: '',
    pontos_fortes: '',
    pontos_atencao: '',
    encaminhamentos: [] as { descricao: string; responsavel: string; prazo: string; status: 'Pendente' }[],
  });
  const [novoEnc, setNovoEnc] = useState({ descricao: '', responsavel: '', prazo: '' });

  const set = (field: string, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleEscolaChange = (id: number) => {
    const escola = escolas.find(e => e.id === id);
    setForm(prev => ({ ...prev, escola_id: id, escola_nome: escola?.nome ?? '' }));
  };

  const addEncaminhamento = () => {
    if (!novoEnc.descricao.trim()) return;
    setForm(prev => ({
      ...prev,
      encaminhamentos: [...prev.encaminhamentos, { ...novoEnc, status: 'Pendente' as const }],
    }));
    setNovoEnc({ descricao: '', responsavel: '', prazo: '' });
  };

  const removeEnc = (idx: number) =>
    setForm(prev => ({
      ...prev,
      encaminhamentos: prev.encaminhamentos.filter((_, i) => i !== idx),
    }));

  const canNext1 =
    form.escola_id > 0 && form.data && form.hora && form.tipo && form.objetivo;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    await onSave({
      ...form,
      tipo: form.tipo as TipoVisita,
    });
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Registrar Nova Visita Técnica</h2>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-1">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                      step >= s ? 'bg-[#00A86B] text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-8 h-0.5 ${step > s ? 'bg-[#00A86B]' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              ))}
              <span className="text-[10px] text-gray-400 ml-1">
                {step === 1 ? 'Dados da Visita' : step === 2 ? 'Relato & Observações' : 'Encaminhamentos'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Escola <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.escola_id}
                  onChange={e => handleEscolaChange(+e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B] bg-white cursor-pointer"
                >
                  <option value={0}>Selecione a escola...</option>
                  {escolas.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Data <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.data}
                    onChange={e => set('data', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Horário <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.hora}
                    onChange={e => set('hora', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Tipo de Visita <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {tipos.map(t => (
                    <button
                      key={t}
                      onClick={() => set('tipo', t)}
                      className={`text-[10px] font-semibold px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-left whitespace-normal leading-tight ${
                        form.tipo === t
                          ? 'bg-[#00A86B]/10 border-[#00A86B] text-[#00A86B]'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Objetivo da Visita <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.objetivo}
                  onChange={e => set('objetivo', e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Descreva o objetivo principal desta visita..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B] resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {(['Agendada', 'Realizada', 'Reagendada', 'Cancelada'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => set('status', s)}
                      className={`text-[10px] font-semibold px-3 py-1.5 rounded-full border cursor-pointer transition-all whitespace-nowrap ${
                        form.status === s
                          ? 'bg-[#0F2744] text-white border-[#0F2744]'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">
                <i className="ri-information-line mr-1"></i>
                Preencha o relato e observações se a visita já foi realizada. Para visitas agendadas, pode deixar em branco.
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Relato da Visita</label>
                <textarea
                  value={form.relato}
                  onChange={e => set('relato', e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Descreva como foi a visita, o que foi observado, conversas com a equipe..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B] resize-none"
                />
                <p className="text-[10px] text-gray-400 text-right mt-0.5">{form.relato.length}/500</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Pontos Fortes Observados</label>
                <textarea
                  value={form.pontos_fortes}
                  onChange={e => set('pontos_fortes', e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="O que a escola está fazendo bem? Boas práticas identificadas..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B] resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Pontos de Atenção</label>
                <textarea
                  value={form.pontos_atencao}
                  onChange={e => set('pontos_atencao', e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Fragilidades identificadas, riscos, situações que precisam de intervenção..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B] resize-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Registre os encaminhamentos definidos durante a visita. Cada encaminhamento terá seu status acompanhado.
              </p>

              {form.encaminhamentos.length > 0 && (
                <div className="space-y-2">
                  {form.encaminhamentos.map((enc, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="w-5 h-5 flex items-center justify-center bg-[#00A86B]/10 rounded-full flex-shrink-0 mt-0.5">
                        <i className="ri-arrow-right-line text-[#00A86B] text-xs"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{enc.descricao}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {enc.responsavel && <span>Resp: {enc.responsavel}</span>}
                          {enc.prazo && (
                            <span className="ml-2">
                              Prazo: {new Date(enc.prazo).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => removeEnc(idx)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer transition-colors flex-shrink-0"
                      >
                        <i className="ri-delete-bin-line text-red-400 text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border border-dashed border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                  Adicionar Encaminhamento
                </p>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Descrição</label>
                  <input
                    value={novoEnc.descricao}
                    onChange={e => setNovoEnc(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="O que precisa ser feito?"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Responsável</label>
                    <input
                      value={novoEnc.responsavel}
                      onChange={e => setNovoEnc(prev => ({ ...prev, responsavel: e.target.value }))}
                      placeholder="Nome do responsável"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Prazo</label>
                    <input
                      type="date"
                      value={novoEnc.prazo}
                      onChange={e => setNovoEnc(prev => ({ ...prev, prazo: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                </div>
                <button
                  onClick={addEncaminhamento}
                  disabled={!novoEnc.descricao.trim()}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-[#0F2744]/5 text-[#0F2744] rounded-lg hover:bg-[#0F2744]/10 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <i className="ri-add-line"></i> Adicionar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => (step > 1 ? setStep(s => s - 1) : onClose())}
            className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap"
          >
            {step > 1 ? 'Voltar' : 'Cancelar'}
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && !canNext1}
              className="px-5 py-2 text-xs font-bold bg-[#00A86B] text-white rounded-lg hover:bg-[#009960] cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
            >
              Próximo <i className="ri-arrow-right-line"></i>
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-xs font-bold bg-[#00A86B] text-white rounded-lg hover:bg-[#009960] cursor-pointer transition-colors whitespace-nowrap flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <><i className="ri-loader-4-line animate-spin"></i> Salvando...</>
              ) : (
                <><i className="ri-save-line"></i> Salvar Visita</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
