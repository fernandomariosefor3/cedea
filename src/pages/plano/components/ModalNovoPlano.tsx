import { useState, useEffect } from 'react';
import { PlanoAcao, NovoPlanoInput } from '@/hooks/usePlanos';
import { useData } from '@/context/DataContext';

interface Props {
  plano?: PlanoAcao | null;
  onSave: (plano: NovoPlanoInput) => void;
  onClose: () => void;
}

export default function ModalNovoPlano({ plano, onSave, onClose }: Props) {
  const { escolas } = useData();
  const [form, setForm] = useState<NovoPlanoInput>({
    titulo: '',
    escola: '',
    problema: '',
    objetivo: '',
    prazo: '',
    status: 'Ativo',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plano) {
      setForm({
        titulo: plano.titulo,
        escola: plano.escola,
        problema: plano.problema,
        objetivo: plano.objetivo,
        prazo: plano.prazo,
        status: plano.status,
      });
    }
  }, [plano]);

  const set = (field: keyof NovoPlanoInput, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const canSave = form.titulo.trim() && form.escola && form.prazo;

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800">
            {plano ? 'Editar Plano de Ação' : 'Novo Plano de Ação'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Título do Plano <span className="text-red-400">*</span>
            </label>
            <input
              value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
              placeholder="Ex: Redução da Evasão Escolar 2026"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Escola <span className="text-red-400">*</span>
            </label>
            <select
              value={form.escola}
              onChange={e => set('escola', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B] bg-white cursor-pointer"
            >
              <option value="">Selecione a escola...</option>
              {escolas.map(e => (
                <option key={e.id} value={e.nome}>
                  {e.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Prazo Final <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.prazo}
                onChange={e => set('prazo', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B] bg-white cursor-pointer"
              >
                <option value="Ativo">Ativo</option>
                <option value="Revisão">Em Revisão</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">
              Problema Identificado
            </label>
            <textarea
              value={form.problema}
              onChange={e => set('problema', e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Descreva o problema que motivou este plano de ação..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B] resize-none"
            />
            <p className="text-[10px] text-gray-400 text-right mt-0.5">{form.problema.length}/500</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Objetivo</label>
            <textarea
              value={form.objetivo}
              onChange={e => set('objetivo', e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Qual o resultado esperado ao final deste plano?"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B] resize-none"
            />
            <p className="text-[10px] text-gray-400 text-right mt-0.5">{form.objetivo.length}/500</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="px-5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-[#00A86B] text-white hover:bg-[#009960]"
          >
            {saving ? (
              <><i className="ri-loader-4-line animate-spin"></i> Salvando...</>
            ) : (
              <><i className="ri-save-line"></i> {plano ? 'Salvar Alterações' : 'Criar Plano'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
