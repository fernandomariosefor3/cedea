import { useState } from 'react';
import { modulosDisponiveis } from '@/hooks/useRelatorios';
import { useData } from '@/context/DataContext';

interface Props {
  onClose: () => void;
  onGerar: (titulo: string, modulo: string, formato: string) => void;
}

const periodos = ['Abril 2026', 'Março 2026', 'Fevereiro 2026', 'Bimestre 1/2026', '1º Semestre 2026'];

export default function ModalGerarRelatorio({ onClose, onGerar }: Props) {
  const { escolas } = useData();
  const [step, setStep] = useState(1);
  const [moduloSel, setModuloSel] = useState('');
  const [formato, setFormato] = useState<'PDF' | 'Excel'>('PDF');
  const [periodo, setPeriodo] = useState('Abril 2026');
  const [escolaSel, setEscolaSel] = useState('Todas as escolas');

  const handleGerar = () => {
    const titulo = `${moduloSel} — ${escolaSel === 'Todas as escolas' ? 'Regional 1' : escolaSel} — ${periodo}`;
    onGerar(titulo, moduloSel, formato);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Gerar Novo Relatório</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Etapa {step} de 3</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 px-6 pt-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0 ${step >= s ? 'bg-[#00A86B] text-white' : 'bg-gray-100 text-gray-400'}`}>{s < step ? <i className="ri-check-line text-xs"></i> : s}</div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${step === s ? 'text-gray-700' : 'text-gray-400'}`}>
                {s === 1 ? 'Módulo' : s === 2 ? 'Filtros' : 'Confirmar'}
              </span>
              {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-[#00A86B]' : 'bg-gray-100'}`}></div>}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {step === 1 && (
            <div>
              <p className="text-xs text-gray-500 mb-4">Selecione o módulo para gerar o relatório:</p>
              <div className="grid grid-cols-2 gap-3">
                {modulosDisponiveis.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setModuloSel(m.label)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${moduloSel === m.label ? 'border-[#00A86B] bg-emerald-50/50' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'}`}
                  >
                    <div className={`w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 ${m.cor}`}>
                      <i className={`${m.icon} text-base`}></i>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 leading-tight">{m.label}</span>
                    {moduloSel === m.label && (
                      <div className="ml-auto w-4 h-4 flex items-center justify-center flex-shrink-0">
                        <i className="ri-check-line text-[#00A86B] text-sm"></i>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2">Período</label>
                <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#00A86B] bg-white cursor-pointer">
                  {periodos.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2">Escola</label>
                <select value={escolaSel} onChange={(e) => setEscolaSel(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#00A86B] bg-white cursor-pointer">
                  <option>Todas as escolas</option>
                  {escolas.map((e) => <option key={e.id}>{e.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2">Formato de exportação</label>
                <div className="flex gap-3">
                  {(['PDF', 'Excel'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormato(f)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 cursor-pointer transition-all ${formato === f ? 'border-[#00A86B] bg-emerald-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className={`${f === 'PDF' ? 'ri-file-pdf-2-line text-red-500' : 'ri-file-excel-2-line text-emerald-600'} text-lg`}></i>
                      </div>
                      <span className={`text-xs font-bold ${formato === f ? 'text-[#00A86B]' : 'text-gray-500'}`}>{f}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500">Confirme as configurações do relatório:</p>
              <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                {[
                  { label: 'Módulo', value: moduloSel },
                  { label: 'Período', value: periodo },
                  { label: 'Escola', value: escolaSel },
                  { label: 'Formato', value: formato },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-xs font-semibold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-information-line text-emerald-600 text-sm"></i>
                </div>
                <p className="text-xs text-emerald-700">O relatório será gerado e adicionado à biblioteca. O processo leva alguns segundos.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer whitespace-nowrap">
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </button>
          <button
            onClick={() => step < 3 ? setStep(step + 1) : handleGerar()}
            disabled={step === 1 && !moduloSel}
            className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${step === 1 && !moduloSel ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#00A86B] text-white hover:bg-[#009960]'}`}
          >
            {step === 3 ? 'Gerar Relatório' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
}
