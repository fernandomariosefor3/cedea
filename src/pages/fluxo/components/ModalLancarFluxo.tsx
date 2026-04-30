import { useState, useEffect } from 'react';
import { EscolaEditavel } from '@/context/DataContext';

interface Props {
  escola: EscolaEditavel;
  onSave: (data: Partial<EscolaEditavel>) => void;
  onClose: () => void;
}

export default function ModalLancarFluxo({ escola, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    matriculas: escola.matriculas,
    matriculasAnterior: escola.matriculasAnterior || escola.matriculas,
    frequencia: escola.frequencia,
    aprovacao: escola.aprovacao,
    evasao: escola.evasao,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      matriculas: escola.matriculas,
      matriculasAnterior: escola.matriculasAnterior || escola.matriculas,
      frequencia: escola.frequencia,
      aprovacao: escola.aprovacao,
      evasao: escola.evasao,
    });
  }, [escola]);

  const set = (field: keyof typeof form, value: number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const fields: { key: keyof typeof form; label: string; unit: string; min: number; max: number; step: number; hint: string }[] = [
    { key: 'matriculas', label: 'Matrículas Atuais', unit: 'alunos', min: 0, max: 5000, step: 1, hint: 'Total de alunos matriculados no ano corrente' },
    { key: 'matriculasAnterior', label: 'Matrículas Ano Anterior', unit: 'alunos', min: 0, max: 5000, step: 1, hint: 'Usado para calcular variação de matrículas' },
    { key: 'frequencia', label: 'Frequência Média', unit: '%', min: 0, max: 100, step: 0.1, hint: 'Percentual médio de presença dos alunos' },
    { key: 'aprovacao', label: 'Taxa de Aprovação', unit: '%', min: 0, max: 100, step: 0.1, hint: 'Percentual de alunos aprovados no período' },
    { key: 'evasao', label: 'Taxa de Evasão', unit: '%', min: 0, max: 100, step: 0.1, hint: 'Percentual de alunos que abandonaram' },
  ];

  const variacaoMatriculas = form.matriculas - form.matriculasAnterior;
  const variacaoPct = form.matriculasAnterior > 0
    ? ((variacaoMatriculas / form.matriculasAnterior) * 100).toFixed(1)
    : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Lançar Dados de Fluxo Escolar</h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{escola.nome}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Preview variação */}
          <div className="grid grid-cols-3 gap-3">
            <div className={`rounded-xl p-3 text-center ${form.aprovacao >= 90 ? 'bg-emerald-50' : form.aprovacao >= 80 ? 'bg-yellow-50' : 'bg-red-50'}`}>
              <p className="text-[10px] text-gray-500">Aprovação</p>
              <p className={`text-xl font-bold ${form.aprovacao >= 90 ? 'text-emerald-600' : form.aprovacao >= 80 ? 'text-yellow-600' : 'text-red-500'}`}>{form.aprovacao}%</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${form.evasao <= 2 ? 'bg-emerald-50' : form.evasao <= 4 ? 'bg-yellow-50' : 'bg-red-50'}`}>
              <p className="text-[10px] text-gray-500">Evasão</p>
              <p className={`text-xl font-bold ${form.evasao <= 2 ? 'text-emerald-600' : form.evasao <= 4 ? 'text-yellow-600' : 'text-red-500'}`}>{form.evasao}%</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${variacaoMatriculas >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <p className="text-[10px] text-gray-500">Var. Matrículas</p>
              <p className={`text-xl font-bold ${variacaoMatriculas >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {variacaoMatriculas >= 0 ? '+' : ''}{variacaoPct}%
              </p>
            </div>
          </div>

          {/* Campos */}
          {fields.map(({ key, label, unit, min, max, step, hint }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={min} max={max} step={step}
                    value={form[key]}
                    onChange={e => set(key, +e.target.value)}
                    className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center font-bold focus:outline-none focus:border-[#00A86B]"
                  />
                  <span className="text-xs text-gray-400 w-10">{unit}</span>
                </div>
              </div>
              <input
                type="range" min={min} max={max} step={step}
                value={form[key]}
                onChange={e => set(key, +e.target.value)}
                className="w-full accent-[#00A86B]"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
            Cancelar
          </button>
          <button onClick={handleSave} className={`px-5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap flex items-center gap-2 ${saved ? 'bg-emerald-500 text-white' : 'bg-[#00A86B] text-white hover:bg-[#009960]'}`}>
            {saved ? <><i className="ri-check-line"></i> Salvo!</> : <><i className="ri-save-line"></i> Salvar Dados</>}
          </button>
        </div>
      </div>
    </div>
  );
}
