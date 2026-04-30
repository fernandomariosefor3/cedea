import { useState, useEffect } from 'react';
import { FaceRecord, FaceInput } from '@/hooks/usePPDT';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: FaceInput) => Promise<boolean>;
  escola: { id: number; nome: string } | null;
  mes: number;
  ano: number;
  existing: FaceRecord | null;
}

export default function ModalLancarFACE({ open, onClose, onSave, escola, mes, ano, existing }: Props) {
  const [form, setForm] = useState<Omit<FaceInput, 'escola_id' | 'mes' | 'ano'>>({
    total_alunos: 0,
    alunos_atendidos: 0,
    reunioes_realizadas: 0,
    reunioes_previstas: 4,
    ppdts_ativos: 0,
    ppdts_total: 0,
    status: 'pendente',
    observacoes: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (existing) {
      setForm({
        total_alunos: existing.total_alunos,
        alunos_atendidos: existing.alunos_atendidos,
        reunioes_realizadas: existing.reunioes_realizadas,
        reunioes_previstas: existing.reunioes_previstas,
        ppdts_ativos: existing.ppdts_ativos,
        ppdts_total: existing.ppdts_total,
        status: existing.status,
        observacoes: existing.observacoes ?? '',
      });
    } else {
      setForm({ total_alunos: 0, alunos_atendidos: 0, reunioes_realizadas: 0, reunioes_previstas: 4, ppdts_ativos: 0, ppdts_total: 0, status: 'pendente', observacoes: '' });
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
      setToast('FACE salvo com sucesso!');
      setTimeout(() => { setToast(''); onClose(); }, 1500);
    } else {
      setToast('Erro ao salvar. Tente novamente.');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const cobertura = form.ppdts_total > 0 ? Math.round((form.ppdts_ativos / form.ppdts_total) * 100) : 0;
  const atendimento = form.total_alunos > 0 ? Math.round((form.alunos_atendidos / form.total_alunos) * 100) : 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0F2744] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-base">Lançar FACE</h2>
            <p className="text-white/60 text-xs mt-0.5">{escola?.nome} — {meses[mes - 1]}/{ano}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Indicadores calculados */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{atendimento}%</p>
              <p className="text-xs text-emerald-700 mt-0.5">Atendimento de Alunos</p>
            </div>
            <div className="bg-[#0F2744]/5 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-[#0F2744]">{cobertura}%</p>
              <p className="text-xs text-[#0F2744]/70 mt-0.5">Cobertura de PPDTs</p>
            </div>
          </div>

          {/* Alunos */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Alunos</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">Total de Alunos</label>
                <input type="number" min={0} value={form.total_alunos} onChange={(e) => handleNum('total_alunos', e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">Alunos Atendidos</label>
                <input type="number" min={0} max={form.total_alunos} value={form.alunos_atendidos} onChange={(e) => handleNum('alunos_atendidos', e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30" />
              </div>
            </div>
          </div>

          {/* Reuniões */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Reuniões FACE</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">Reuniões Previstas</label>
                <input type="number" min={0} value={form.reunioes_previstas} onChange={(e) => handleNum('reunioes_previstas', e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">Reuniões Realizadas</label>
                <input type="number" min={0} max={form.reunioes_previstas} value={form.reunioes_realizadas} onChange={(e) => handleNum('reunioes_realizadas', e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30" />
              </div>
            </div>
          </div>

          {/* PPDTs */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">PPDTs</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">Total de PPDTs</label>
                <input type="number" min={0} value={form.ppdts_total} onChange={(e) => handleNum('ppdts_total', e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30" />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-medium block mb-1">PPDTs Ativos</label>
                <input type="number" min={0} max={form.ppdts_total} value={form.ppdts_ativos} onChange={(e) => handleNum('ppdts_ativos', e.target.value)}
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
              placeholder="Observações sobre o FACE desta escola..." />
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
              {saving ? 'Salvando...' : 'Salvar FACE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
