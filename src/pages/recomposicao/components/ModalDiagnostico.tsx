import { useState, useEffect } from 'react';
import { TurmaComDiagnostico, DiagnosticoInput } from '@/hooks/useRecomposicao';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: DiagnosticoInput) => Promise<boolean>;
  turma: TurmaComDiagnostico | null;
  mes: number;
  ano: number;
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const ESTRATEGIAS = [
  'Grupos de reforço 3x/semana',
  'Atividades diferenciadas por nível',
  'Tutoria entre pares',
  'Reforço intensivo + monitoria',
  'Leitura compartilhada diária',
  'Resolução de problemas contextualizados',
  'Produção textual semanal',
  'Jogos matemáticos',
  'Projetos interdisciplinares',
  'Aulas de reforço no contraturno',
  'Olimpíada interna',
  'Outra estratégia',
];

export default function ModalDiagnostico({ open, onClose, onSave, turma, mes, ano }: Props) {
  const [form, setForm] = useState({
    periodo: 'Diagnóstico Inicial',
    alunos_abaixo: 0,
    alunos_basico: 0,
    alunos_adequado: 0,
    alunos_avancado: 0,
    estrategia: '',
    status: 'pendente' as 'pendente' | 'parcial' | 'concluido',
    observacoes: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (turma?.diagnostico) {
      const d = turma.diagnostico;
      setForm({
        periodo: d.periodo,
        alunos_abaixo: d.alunos_abaixo,
        alunos_basico: d.alunos_basico,
        alunos_adequado: d.alunos_adequado,
        alunos_avancado: d.alunos_avancado,
        estrategia: d.estrategia ?? '',
        status: d.status,
        observacoes: d.observacoes ?? '',
      });
    } else {
      setForm({ periodo: 'Diagnóstico Inicial', alunos_abaixo: 0, alunos_basico: 0, alunos_adequado: 0, alunos_avancado: 0, estrategia: '', status: 'pendente', observacoes: '' });
    }
  }, [turma, open]);

  const total = form.alunos_abaixo + form.alunos_basico + form.alunos_adequado + form.alunos_avancado;
  const pctAdequado = total > 0 ? Math.round(((form.alunos_adequado + form.alunos_avancado) / total) * 100) : 0;
  const pctAbaixo = total > 0 ? Math.round((form.alunos_abaixo / total) * 100) : 0;

  const handleNum = (field: string, val: string) => setForm((p) => ({ ...p, [field]: Number(val) || 0 }));

  const handleSubmit = async () => {
    if (!turma) return;
    setSaving(true);
    const ok = await onSave({
      turma_id: turma.id,
      escola_id: turma.escola_id,
      periodo: form.periodo,
      mes,
      ano,
      alunos_abaixo: form.alunos_abaixo,
      alunos_basico: form.alunos_basico,
      alunos_adequado: form.alunos_adequado,
      alunos_avancado: form.alunos_avancado,
      estrategia: form.estrategia,
      status: form.status,
      observacoes: form.observacoes,
    });
    setSaving(false);
    if (ok) {
      setToast('Diagnóstico salvo!');
      setTimeout(() => { setToast(''); onClose(); }, 1500);
    } else {
      setToast('Erro ao salvar.');
      setTimeout(() => setToast(''), 3000);
    }
  };

  if (!open || !turma) return null;

  const nivelColor = pctAdequado >= 70 ? 'text-emerald-600' : pctAdequado >= 50 ? 'text-amber-600' : 'text-red-500';
  const nivelLabel = pctAdequado >= 70 ? 'Ótimo' : pctAdequado >= 50 ? 'Bom' : pctAdequado >= 30 ? 'Atenção' : 'Crítico';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 shadow-xl overflow-hidden">
        <div className="bg-[#0F2744] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-base">Lançar Diagnóstico</h2>
            <p className="text-white/60 text-xs mt-0.5">
              {turma.escola_nome} — Turma {turma.turma} | {turma.serie} | {turma.componente} — {MESES[mes - 1]}/{ano}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* Resumo visual */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-red-500">{pctAbaixo}%</p>
              <p className="text-xs text-red-600 mt-0.5">Abaixo do básico</p>
            </div>
            <div className={`rounded-lg p-3 text-center ${pctAdequado >= 70 ? 'bg-emerald-50' : pctAdequado >= 50 ? 'bg-amber-50' : 'bg-orange-50'}`}>
              <p className={`text-xl font-bold ${nivelColor}`}>{pctAdequado}%</p>
              <p className={`text-xs mt-0.5 ${nivelColor}`}>Adequado/Avançado</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className={`text-xl font-bold ${nivelColor}`}>{nivelLabel}</p>
              <p className="text-xs text-gray-500 mt-0.5">Nível da turma</p>
            </div>
          </div>

          {/* Período */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Período do Diagnóstico</label>
            <select value={form.periodo} onChange={(e) => setForm((p) => ({ ...p, periodo: e.target.value }))}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 cursor-pointer">
              <option>Diagnóstico Inicial</option>
              <option>Diagnóstico Intermediário</option>
              <option>Diagnóstico Final</option>
            </select>
          </div>

          {/* Distribuição de alunos */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Distribuição de Alunos por Nível
              {turma.total_alunos > 0 && <span className="ml-2 text-gray-400 normal-case font-normal">({turma.total_alunos} alunos na turma)</span>}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { field: 'alunos_abaixo', label: 'Abaixo do Básico', color: 'border-red-200 focus:ring-red-200' },
                { field: 'alunos_basico', label: 'Básico', color: 'border-amber-200 focus:ring-amber-200' },
                { field: 'alunos_adequado', label: 'Adequado', color: 'border-emerald-200 focus:ring-emerald-200' },
                { field: 'alunos_avancado', label: 'Avançado', color: 'border-[#0F2744]/20 focus:ring-[#0F2744]/20' },
              ].map(({ field, label, color }) => (
                <div key={field}>
                  <label className="text-xs text-gray-600 font-medium block mb-1">{label}</label>
                  <input type="number" min={0} value={(form as any)[field]}
                    onChange={(e) => handleNum(field, e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${color}`} />
                </div>
              ))}
            </div>
            {total > 0 && (
              <div className="mt-3 flex h-3 rounded-full overflow-hidden gap-0.5">
                {form.alunos_abaixo > 0 && <div className="bg-red-400 transition-all" style={{ width: `${(form.alunos_abaixo / total) * 100}%` }} />}
                {form.alunos_basico > 0 && <div className="bg-amber-400 transition-all" style={{ width: `${(form.alunos_basico / total) * 100}%` }} />}
                {form.alunos_adequado > 0 && <div className="bg-emerald-400 transition-all" style={{ width: `${(form.alunos_adequado / total) * 100}%` }} />}
                {form.alunos_avancado > 0 && <div className="bg-[#0F2744] transition-all" style={{ width: `${(form.alunos_avancado / total) * 100}%` }} />}
              </div>
            )}
          </div>

          {/* Estratégia */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Estratégia de Recomposição</label>
            <select value={form.estrategia} onChange={(e) => setForm((p) => ({ ...p, estrategia: e.target.value }))}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 cursor-pointer">
              <option value="">Selecione uma estratégia...</option>
              {ESTRATEGIAS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as any }))}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 cursor-pointer">
              <option value="pendente">Pendente</option>
              <option value="parcial">Em andamento</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Observações</label>
            <textarea value={form.observacoes} onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))}
              rows={3} maxLength={500}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]/30 resize-none"
              placeholder="Observações sobre a turma ou estratégia..." />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          {toast ? (
            <span className={`text-xs font-medium ${toast.includes('Erro') ? 'text-red-500' : 'text-emerald-600'}`}>{toast}</span>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer whitespace-nowrap">Cancelar</button>
            <button onClick={handleSubmit} disabled={saving}
              className="px-5 py-2 bg-[#00A86B] text-white text-sm font-semibold rounded-md hover:bg-[#009060] disabled:opacity-50 cursor-pointer whitespace-nowrap">
              {saving ? 'Salvando...' : 'Salvar Diagnóstico'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
