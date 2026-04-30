import { useState, useEffect } from 'react';
import { PcaRecord, PcaInput } from '@/hooks/usePPDT';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: PcaInput) => Promise<boolean>;
  escola: { id: number; nome: string } | null;
  mes: number;
  ano: number;
  existing: PcaRecord | null;
}

export default function ModalLancarPCA({ open, onClose, onSave, escola, mes, ano, existing }: Props) {
  const [form, setForm] = useState<Omit<PcaInput, 'escola_id' | 'mes' | 'ano'>>({
    coordenadores_ativos: 0,
    coordenadores_total: 0,
    horas_formacao: 0,
    meta_horas: 20,
    encontros_realizados: 0,
    encontros_previstos: 4,
    status: 'pendente',
    observacoes: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (existing) {
      setForm({
        coordenadores_ativos: existing.coordenadores_ativos,
        coordenadores_total: existing.coordenadores_total,
        horas_formacao: existing.horas_formacao,
        meta_horas: existing.meta_horas,
        encontros_realizados: existing.encontros_realizados,
        encontros_previstos: existing.encontros_previstos,
        status: existing.status,
        observacoes: existing.observacoes ?? '',
      });
    } else {
      setForm({ coordenadores_ativos: 0, coordenadores_total: 0, horas_formacao: 0, meta_horas: 20, encontros_realizados: 0, encontros_previstos: 4, status: 'pendente', observacoes: '' });
    }
  }, [existing, open]);

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const handleNum = (field: string, val: string) => {
    setForm((prev) => ({ ...prev, [field]: Number(val) || 0 }));
  };

  const handleSubmit = async () => {
    if (!escola) return;
    setSaving(true);
    const ok = await onSave({ ...form, escola_id: escola.id, mes, ano });
    setSaving(false);
    if (ok) {
      setToast('PCA salvo com sucesso!');
      setTimeout(() => { setToast(''); onClose(); }, 1500);
    } else {
      setToast('Erro ao salvar. Tente novamente.');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const pctHoras = form.meta_horas > 0 ? Math.round((form.horas_formacao / form.meta_horas) * 100) : 0;
  const pctCoordenadores = form.coordenadores_total > 0 ? Math.round((form.coordenadores_ativos / form.coordenadores_total) * 100) : 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0F2744] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-base">Lançar PCA</h2>
            <p className="text-white/60 text-xs mt-0.5">{escola?.nome} — {meses[mes - 1]}/{ano}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Indicadores calculados */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{pctHoras}%</p>
              <p className="text-xs text-amber-700 mt-0.5">Meta de Horas</p>
            </div>
            <div className="bg-[#0F2744]/5 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-[#0F2744]">{pctCoordenadores}%</p>
              <p className="text-xs text-[#0F2744]/70 mt-0.5">Coordenadores Ativos</p>
            </div>
          </div>

          {/* Coordenadores */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Coordenadores</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">Total de Coordenadores</label>
                <input type="number" min={0} value={form.coordenadores_total} onChange={(e) => handleNum('coordenadores_total', e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">Coordenadores Ativos</label>
                <input type="number" min={0} max={form.coordenadores_total} value={form.coordenadores_ativos} onChange={(e) => handleNum('coordenadores_ativos', e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30" />
              </div>
            </div>
          </div>

          {/* Horas de Formação */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Formação</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">Meta de Horas</label>
                <input type="number" min={0} step={0.5} value={form.meta_horas} onChange={(e) => handleNum('meta_horas', e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">Horas Realizadas</label>
                <input type="number" min={0} step={0.5} value={form.horas_formacao} onChange={(e) => handleNum('horas_formacao', e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30" />
              </div>
            </div>
          </div>

          {/* Encontros */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Encontros PCA</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">Encontros Previstos</label>
                <input type="number" min={0} value={form.encontros_previstos} onChange={(e) => handleNum('encontros_previstos', e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">Encontros Realizados</label>
                <input type="number" min={0} max={form.encontros_previstos} value={form.encontros_realizados} onChange={(e) => handleNum('encontros_realizados', e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30" />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as any }))}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 cursor-pointer">
              <option value="pendente">Pendente</option>
              <option value="parcial">Parcial</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Observações</label>
            <textarea value={form.observacoes ?? ''} onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))}
              rows={3} maxLength={500}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 resize-none"
              placeholder="Observações sobre o PCA desta escola..." />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          {toast ? (
            <span className={`text-xs font-medium ${toast.includes('Erro') ? 'text-red-500' : 'text-emerald-600'}`}>{toast}</span>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer whitespace-nowrap">Cancelar</button>
            <button onClick={handleSubmit} disabled={saving}
              className="px-5 py-2 bg-[#00A86B] text-white text-sm font-semibold rounded-md hover:bg-[#009060] disabled:opacity-50 cursor-pointer whitespace-nowrap">
              {saving ? 'Salvando...' : 'Salvar PCA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
