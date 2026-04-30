import { useState } from 'react';
import { AcaoPlano, PlanoAcao } from '@/hooks/usePlanos';

interface Props {
  plano: PlanoAcao;
  onUpdateAcao: (acaoId: number, data: Partial<AcaoPlano>) => void;
  onAddAcao: (acao: Omit<AcaoPlano, 'id' | 'plano_id'>) => void;
  onRemoveAcao: (acaoId: number) => void;
}

const statusCor: Record<AcaoPlano['status'], string> = {
  'Pendente': 'bg-gray-100 text-gray-600',
  'Em andamento': 'bg-yellow-100 text-yellow-700',
  'Concluída': 'bg-emerald-100 text-emerald-700',
};

const statusIcone: Record<AcaoPlano['status'], string> = {
  'Pendente': 'ri-time-line',
  'Em andamento': 'ri-loader-4-line',
  'Concluída': 'ri-checkbox-circle-fill',
};

export default function PainelAcoes({ plano, onUpdateAcao, onAddAcao, onRemoveAcao }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<Partial<AcaoPlano>>({});
  const [novaAcao, setNovaAcao] = useState({ descricao: '', responsavel: '', prazo: '', status: 'Pendente' as AcaoPlano['status'] });
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const startEdit = (acao: AcaoPlano) => {
    setEditingId(acao.id);
    setEditRow({ ...acao });
  };

  const saveEdit = () => {
    if (editingId === null) return;
    onUpdateAcao(editingId, editRow);
    setEditingId(null);
    setEditRow({});
  };

  const handleAdd = () => {
    if (!novaAcao.descricao.trim()) return;
    onAddAcao(novaAcao);
    setNovaAcao({ descricao: '', responsavel: '', prazo: '', status: 'Pendente' });
    setShowForm(false);
  };

  const concluidas = plano.acoes.filter(a => a.status === 'Concluída').length;
  const pct = plano.acoes.length > 0 ? Math.round((concluidas / plano.acoes.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progresso geral */}
      <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
        <div className="flex-1">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-700">Execução do Plano</span>
            <span className="text-xs font-bold text-gray-700">{pct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-[#0F2744]'}`}
              style={{ width: `${pct}%` }}
            ></div>
          </div>
        </div>
        <div className="flex gap-4 text-center flex-shrink-0">
          <div>
            <p className="text-lg font-bold text-emerald-600">{concluidas}</p>
            <p className="text-[10px] text-gray-400">Concluídas</p>
          </div>
          <div>
            <p className="text-lg font-bold text-yellow-600">{plano.acoes.filter(a => a.status === 'Em andamento').length}</p>
            <p className="text-[10px] text-gray-400">Em andamento</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-500">{plano.acoes.filter(a => a.status === 'Pendente').length}</p>
            <p className="text-[10px] text-gray-400">Pendentes</p>
          </div>
        </div>
      </div>

      {/* Lista de ações */}
      <div className="space-y-2">
        {plano.acoes.map((acao, idx) => {
          const isEditing = editingId === acao.id;
          const isDeleting = confirmDelete === acao.id;

          return (
            <div
              key={acao.id}
              className={`rounded-xl border transition-all ${isEditing ? 'border-[#00A86B] bg-[#00A86B]/5' : 'border-gray-100 bg-gray-50'}`}
            >
              {isDeleting ? (
                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-xs text-red-600 font-semibold">Excluir esta ação?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmDelete(null)} className="text-[10px] font-semibold px-3 py-1.5 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 whitespace-nowrap">Cancelar</button>
                    <button onClick={() => { onRemoveAcao(acao.id); setConfirmDelete(null); }} className="text-[10px] font-bold px-3 py-1.5 bg-red-500 text-white rounded-lg cursor-pointer hover:bg-red-600 whitespace-nowrap">Excluir</button>
                  </div>
                </div>
              ) : isEditing ? (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-600 block mb-1">Descrição da Ação</label>
                    <input
                      value={editRow.descricao ?? ''}
                      onChange={e => setEditRow(prev => ({ ...prev, descricao: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-600 block mb-1">Responsável</label>
                      <input
                        value={editRow.responsavel ?? ''}
                        onChange={e => setEditRow(prev => ({ ...prev, responsavel: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-600 block mb-1">Prazo</label>
                      <input
                        type="date"
                        value={editRow.prazo ?? ''}
                        onChange={e => setEditRow(prev => ({ ...prev, prazo: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-600 block mb-1">Status</label>
                      <select
                        value={editRow.status ?? 'Pendente'}
                        onChange={e => setEditRow(prev => ({ ...prev, status: e.target.value as AcaoPlano['status'] }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B] bg-white cursor-pointer"
                      >
                        <option value="Pendente">Pendente</option>
                        <option value="Em andamento">Em andamento</option>
                        <option value="Concluída">Concluída</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)} className="text-[10px] font-semibold px-3 py-1.5 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 whitespace-nowrap">Cancelar</button>
                    <button onClick={saveEdit} className="text-[10px] font-bold px-4 py-1.5 bg-[#00A86B] text-white rounded-lg cursor-pointer hover:bg-[#009960] whitespace-nowrap flex items-center gap-1">
                      <i className="ri-save-line text-xs"></i> Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Número */}
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-500 flex-shrink-0">
                    {idx + 1}
                  </div>

                  {/* Checkbox status rápido */}
                  <button
                    onClick={() => onUpdateAcao(acao.id, { status: acao.status === 'Concluída' ? 'Pendente' : acao.status === 'Pendente' ? 'Em andamento' : 'Concluída' })}
                    className={`w-5 h-5 flex items-center justify-center rounded-md border-2 flex-shrink-0 cursor-pointer transition-all ${acao.status === 'Concluída' ? 'bg-emerald-400 border-emerald-400' : acao.status === 'Em andamento' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}
                  >
                    {acao.status === 'Concluída' && <i className="ri-check-line text-white text-[10px]"></i>}
                    {acao.status === 'Em andamento' && <div className="w-2 h-2 rounded-full bg-yellow-400"></div>}
                  </button>

                  {/* Descrição */}
                  <p className={`text-xs flex-1 min-w-0 ${acao.status === 'Concluída' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {acao.descricao}
                  </p>

                  {/* Meta info */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {acao.responsavel && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-1 hidden lg:flex">
                        <i className="ri-user-line text-[10px]"></i>{acao.responsavel}
                      </span>
                    )}
                    {acao.prazo && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <i className="ri-calendar-line text-[10px]"></i>
                        {acao.prazo.includes('-')
                          ? new Date(acao.prazo + 'T00:00:00').toLocaleDateString('pt-BR')
                          : acao.prazo}
                      </span>
                    )}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${statusCor[acao.status]}`}>
                      <i className={`${statusIcone[acao.status]} text-[10px]`}></i>
                      {acao.status}
                    </span>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(acao)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                      <i className="ri-edit-line text-gray-400 text-xs"></i>
                    </button>
                    <button onClick={() => setConfirmDelete(acao.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer transition-colors">
                      <i className="ri-delete-bin-line text-red-400 text-xs"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Formulário nova ação */}
      {showForm ? (
        <div className="border border-dashed border-[#00A86B] rounded-xl p-4 space-y-3 bg-[#00A86B]/5">
          <p className="text-[10px] font-bold text-[#00A86B] uppercase tracking-wide">Nova Ação</p>
          <div>
            <input
              value={novaAcao.descricao}
              onChange={e => setNovaAcao(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva a ação a ser executada..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B] bg-white"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <input
                value={novaAcao.responsavel}
                onChange={e => setNovaAcao(prev => ({ ...prev, responsavel: e.target.value }))}
                placeholder="Responsável"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B] bg-white"
              />
            </div>
            <div>
              <input
                type="date"
                value={novaAcao.prazo}
                onChange={e => setNovaAcao(prev => ({ ...prev, prazo: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B] bg-white"
              />
            </div>
            <div>
              <select
                value={novaAcao.status}
                onChange={e => setNovaAcao(prev => ({ ...prev, status: e.target.value as AcaoPlano['status'] }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B] bg-white cursor-pointer"
              >
                <option value="Pendente">Pendente</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Concluída">Concluída</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="text-[10px] font-semibold px-3 py-1.5 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 whitespace-nowrap">Cancelar</button>
            <button
              onClick={handleAdd}
              disabled={!novaAcao.descricao.trim()}
              className="text-[10px] font-bold px-4 py-1.5 bg-[#00A86B] text-white rounded-lg cursor-pointer hover:bg-[#009960] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1"
            >
              <i className="ri-add-line text-xs"></i> Adicionar Ação
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-gray-300 rounded-xl text-xs font-semibold text-gray-500 hover:border-[#00A86B] hover:text-[#00A86B] hover:bg-[#00A86B]/5 cursor-pointer transition-all"
        >
          <i className="ri-add-line"></i> Adicionar Nova Ação
        </button>
      )}
    </div>
  );
}
