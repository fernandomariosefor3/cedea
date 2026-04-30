import { useState } from 'react';
import { AlunoRisco, NovaAcao } from '@/hooks/useBuscaAtiva';

interface Props {
  aluno: AlunoRisco;
  onSave: (acao: NovaAcao) => Promise<boolean>;
  onClose: () => void;
}

const tiposAcao: { value: NovaAcao['tipo']; label: string; icon: string; desc: string }[] = [
  { value: 'ligação', label: 'Ligação Telefônica', icon: 'ri-phone-line', desc: 'Contato por telefone com aluno ou responsável' },
  { value: 'visita_domiciliar', label: 'Visita Domiciliar', icon: 'ri-home-4-line', desc: 'Visita à residência do aluno' },
  { value: 'contato_responsavel', label: 'Contato com Responsável', icon: 'ri-user-heart-line', desc: 'Reunião ou contato presencial com responsável' },
  { value: 'encaminhamento_cras', label: 'Encaminhamento CRAS', icon: 'ri-government-line', desc: 'Encaminhamento ao Centro de Referência de Assistência Social' },
  { value: 'outro', label: 'Outro', icon: 'ri-more-line', desc: 'Outro tipo de ação de busca ativa' },
];

export default function ModalRegistrarAcao({ aluno, onSave, onClose }: Props) {
  const [form, setForm] = useState<{
    tipo: NovaAcao['tipo'];
    descricao: string;
    resultado: string;
    responsavel: string;
    data_acao: string;
    status: NovaAcao['status'];
  }>({
    tipo: 'ligação',
    descricao: '',
    resultado: '',
    responsavel: '',
    data_acao: new Date().toISOString().split('T')[0],
    status: 'realizada',
  });
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const handleSave = async () => {
    if (!form.descricao.trim() || !form.responsavel.trim()) return;
    setSalvando(true);
    const ok = await onSave({
      aluno_id: aluno.id,
      escola_id: aluno.escola_id,
      tipo: form.tipo,
      descricao: form.descricao,
      resultado: form.resultado || undefined,
      responsavel: form.responsavel,
      data_acao: form.data_acao,
      status: form.status,
    });
    setSalvando(false);
    if (ok) {
      setSalvo(true);
      setTimeout(() => { setSalvo(false); onClose(); }, 900);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Registrar Ação de Busca Ativa</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{aluno.nome}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Tipo de ação */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Tipo de Ação</label>
            <div className="grid grid-cols-1 gap-2">
              {tiposAcao.map(t => (
                <button
                  key={t.value}
                  onClick={() => setForm(prev => ({ ...prev, tipo: t.value }))}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${form.tipo === t.value ? 'border-[#00A86B] bg-[#00A86B]/5' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${form.tipo === t.value ? 'bg-[#00A86B] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <i className={`${t.icon} text-sm`}></i>
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${form.tipo === t.value ? 'text-[#00A86B]' : 'text-gray-700'}`}>{t.label}</p>
                    <p className="text-[10px] text-gray-400">{t.desc}</p>
                  </div>
                  {form.tipo === t.value && (
                    <div className="ml-auto w-4 h-4 flex items-center justify-center">
                      <i className="ri-checkbox-circle-fill text-[#00A86B]"></i>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Descrição da Ação <span className="text-red-400">*</span></label>
            <textarea
              value={form.descricao}
              onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva o que foi feito nesta ação..."
              rows={3}
              maxLength={500}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] resize-none"
            />
            <p className="text-[10px] text-gray-400 text-right mt-0.5">{form.descricao.length}/500</p>
          </div>

          {/* Justificativa da Ausência */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">
              <i className="ri-questionnaire-line mr-1 text-amber-500"></i>
              Justificativa da Ausência
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {['Trabalho informal', 'Problemas familiares', 'Doença / Saúde', 'Dificuldade de transporte', 'Gravidez / Maternidade', 'Conflito / Violência', 'Sem interesse', 'Sem justificativa'].map(j => (
                <button
                  key={j}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, resultado: j === prev.resultado ? '' : j }))}
                  className={`text-left px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all ${form.resultado === j ? 'border-amber-400 bg-amber-50 text-amber-700 font-semibold' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  {j}
                </button>
              ))}
            </div>
            <textarea
              value={form.resultado}
              onChange={e => setForm(prev => ({ ...prev, resultado: e.target.value }))}
              placeholder="Descreva ou complemente a justificativa da ausência do aluno..."
              rows={2}
              maxLength={500}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] resize-none"
            />
          </div>

          {/* Responsável e data */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Responsável <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={form.responsavel}
                onChange={e => setForm(prev => ({ ...prev, responsavel: e.target.value }))}
                placeholder="Nome do responsável"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Data da Ação</label>
              <input
                type="date"
                value={form.data_acao}
                onChange={e => setForm(prev => ({ ...prev, data_acao: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Status da Ação</label>
            <div className="flex gap-2">
              {(['realizada', 'pendente', 'sem_sucesso'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setForm(prev => ({ ...prev, status: s }))}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-all whitespace-nowrap ${form.status === s ? (s === 'realizada' ? 'bg-emerald-500 text-white border-emerald-500' : s === 'pendente' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-red-500 text-white border-red-500') : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                >
                  {s === 'realizada' ? 'Realizada' : s === 'pendente' ? 'Pendente' : 'Sem Sucesso'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!form.descricao.trim() || !form.responsavel.trim() || salvando}
            className={`px-5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap flex items-center gap-2 disabled:opacity-40 ${salvo ? 'bg-emerald-500 text-white' : 'bg-[#00A86B] text-white hover:bg-[#009960]'}`}
          >
            {salvo ? <><i className="ri-check-line"></i> Salvo!</> : salvando ? 'Salvando...' : <><i className="ri-save-line"></i> Registrar Ação</>}
          </button>
        </div>
      </div>
    </div>
  );
}
