import { useState } from 'react';
import { NovoAlunoRisco } from '@/hooks/useBuscaAtiva';
import { useData } from '@/context/DataContext';

interface Props {
  onSave: (data: NovoAlunoRisco) => Promise<unknown>;
  onClose: () => void;
}

export default function ModalNovoAluno({ onSave, onClose }: Props) {
  const { escolas } = useData();
  const [form, setForm] = useState<NovoAlunoRisco>({
    escola_id: escolas[0]?.id ? Number(escolas[0].id) : 0,
    nome: '',
    serie: '1º Ano EM',
    turma: 'A',
    turno: 'manhã',
    dias_ausente: 0,
    faltas_consecutivas: 0,
    status: 'em_risco',
    motivo_ausencia: '',
    responsavel: '',
    telefone_responsavel: '',
    endereco: '',
    observacoes: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const set = <K extends keyof NovoAlunoRisco>(key: K, value: NovoAlunoRisco[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.nome.trim() || !form.escola_id) return;
    setSalvando(true);
    const ok = await onSave(form);
    setSalvando(false);
    if (ok) {
      setSalvo(true);
      setTimeout(() => { setSalvo(false); onClose(); }, 900);
    }
  };

  const series = ['1º Ano EM', '2º Ano EM', '3º Ano EM', '1º Ano EJA', '2º Ano EJA', '3º Ano EJA'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Adicionar Aluno em Risco</h2>
            <p className="text-xs text-gray-400 mt-0.5">Registrar novo caso de busca ativa</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Escola */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Escola <span className="text-red-400">*</span></label>
            <select
              value={form.escola_id}
              onChange={e => set('escola_id', Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer"
            >
              {escolas.map(e => (
                <option key={e.id} value={Number(e.id)}>{e.nome}</option>
              ))}
            </select>
          </div>

          {/* Nome */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Nome do Aluno <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={form.nome}
              onChange={e => set('nome', e.target.value)}
              placeholder="Nome completo do aluno"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B]"
            />
          </div>

          {/* Série, Turma, Turno */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Série</label>
              <select
                value={form.serie}
                onChange={e => set('serie', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer"
              >
                {series.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Turma</label>
              <select
                value={form.turma}
                onChange={e => set('turma', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer"
              >
                {['A', 'B', 'C', 'D', 'E'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Turno</label>
              <select
                value={form.turno}
                onChange={e => set('turno', e.target.value as NovoAlunoRisco['turno'])}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer"
              >
                <option value="manhã">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
            </div>
          </div>

          {/* Faltas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Dias Ausente</label>
              <input
                type="number"
                min={0}
                value={form.dias_ausente}
                onChange={e => set('dias_ausente', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Faltas Consecutivas</label>
              <input
                type="number"
                min={0}
                value={form.faltas_consecutivas}
                onChange={e => set('faltas_consecutivas', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B]"
              />
            </div>
          </div>

          {/* Status e Motivo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value as NovoAlunoRisco['status'])}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer"
              >
                <option value="em_risco">Em Risco</option>
                <option value="em_acompanhamento">Em Acompanhamento</option>
                <option value="retornou">Retornou</option>
                <option value="evadido">Evadido</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Motivo das Ausências</label>
              <input
                type="text"
                value={form.motivo_ausencia}
                onChange={e => set('motivo_ausencia', e.target.value)}
                placeholder="Ex: Trabalho informal"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B]"
              />
            </div>
          </div>

          {/* Responsável */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Nome do Responsável</label>
              <input
                type="text"
                value={form.responsavel}
                onChange={e => set('responsavel', e.target.value)}
                placeholder="Nome completo"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Telefone</label>
              <input
                type="text"
                value={form.telefone_responsavel}
                onChange={e => set('telefone_responsavel', e.target.value)}
                placeholder="(85) 99999-9999"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B]"
              />
            </div>
          </div>

          {/* Endereço */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Endereço</label>
            <input
              type="text"
              value={form.endereco}
              onChange={e => set('endereco', e.target.value)}
              placeholder="Rua, número — Bairro"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B]"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={e => set('observacoes', e.target.value)}
              placeholder="Informações adicionais relevantes..."
              rows={3}
              maxLength={500}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!form.nome.trim() || !form.escola_id || salvando}
            className={`px-5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap flex items-center gap-2 disabled:opacity-40 ${salvo ? 'bg-emerald-500 text-white' : 'bg-[#00A86B] text-white hover:bg-[#009960]'}`}
          >
            {salvo ? <><i className="ri-check-line"></i> Salvo!</> : salvando ? 'Salvando...' : <><i className="ri-add-line"></i> Adicionar Aluno</>}
          </button>
        </div>
      </div>
    </div>
  );
}
