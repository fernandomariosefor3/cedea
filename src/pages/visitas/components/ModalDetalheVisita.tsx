import { useState } from 'react';
import { Visita, StatusEncaminhamento } from '@/hooks/useVisitas';

interface Props {
  visita: Visita;
  onClose: () => void;
  onUpdateEncaminhamento: (visitaId: number, encId: number, status: StatusEncaminhamento) => void;
  onDelete: (id: number) => void;
}

const statusEncCor: Record<StatusEncaminhamento, string> = {
  Pendente: 'bg-gray-100 text-gray-600',
  'Em andamento': 'bg-yellow-100 text-yellow-700',
  Concluído: 'bg-emerald-100 text-emerald-700',
};

const statusVisitaCor: Record<string, string> = {
  Agendada: 'bg-sky-100 text-sky-700',
  Realizada: 'bg-emerald-100 text-emerald-700',
  Cancelada: 'bg-red-100 text-red-700',
  Reagendada: 'bg-yellow-100 text-yellow-700',
};

export default function ModalDetalheVisita({
  visita,
  onClose,
  onUpdateEncaminhamento,
  onDelete,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dataFormatada = new Date(visita.data + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const pendentes = visita.encaminhamentos.filter(e => e.status === 'Pendente').length;
  const emAndamento = visita.encaminhamentos.filter(e => e.status === 'Em andamento').length;
  const concluidos = visita.encaminhamentos.filter(e => e.status === 'Concluído').length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusVisitaCor[visita.status]}`}
                >
                  {visita.status}
                </span>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {visita.tipo}
                </span>
              </div>
              <h2 className="text-sm font-bold text-gray-800">{visita.escola_nome}</h2>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">
                {dataFormatada} às {visita.hora}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
              >
                <i className="ri-delete-bin-line text-red-400 text-sm"></i>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <i className="ri-close-line text-gray-500"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Objetivo</p>
            <p className="text-sm text-gray-700 leading-relaxed">{visita.objetivo}</p>
          </div>

          {visita.relato && (
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">
                Relato da Visita
              </p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
                {visita.relato}
              </p>
            </div>
          )}

          {(visita.pontos_fortes || visita.pontos_atencao) && (
            <div className="grid grid-cols-2 gap-4">
              {visita.pontos_fortes && (
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <i className="ri-thumb-up-line"></i> Pontos Fortes
                  </p>
                  <p className="text-xs text-emerald-800 leading-relaxed">{visita.pontos_fortes}</p>
                </div>
              )}
              {visita.pontos_atencao && (
                <div className="bg-orange-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <i className="ri-error-warning-line"></i> Pontos de Atenção
                  </p>
                  <p className="text-xs text-orange-800 leading-relaxed">{visita.pontos_atencao}</p>
                </div>
              )}
            </div>
          )}

          {/* Encaminhamentos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                Encaminhamentos ({visita.encaminhamentos.length})
              </p>
              {visita.encaminhamentos.length > 0 && (
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-gray-500">{pendentes} pendente{pendentes !== 1 ? 's' : ''}</span>
                  <span className="text-yellow-600">{emAndamento} em andamento</span>
                  <span className="text-emerald-600">{concluidos} concluído{concluidos !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {visita.encaminhamentos.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs bg-gray-50 rounded-xl">
                Nenhum encaminhamento registrado para esta visita.
              </div>
            ) : (
              <div className="space-y-2">
                {visita.encaminhamentos.map(enc => (
                  <div key={enc.id} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="w-5 h-5 flex items-center justify-center bg-[#0F2744]/10 rounded-full flex-shrink-0 mt-0.5">
                      <i className="ri-arrow-right-line text-[#0F2744] text-xs"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800">{enc.descricao}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {enc.responsavel && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <i className="ri-user-line text-[10px]"></i>
                            {enc.responsavel}
                          </span>
                        )}
                        {enc.prazo && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <i className="ri-calendar-line text-[10px]"></i>
                            {new Date(enc.prazo + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <select
                      value={enc.status}
                      onChange={e =>
                        onUpdateEncaminhamento(visita.id, enc.id, e.target.value as StatusEncaminhamento)
                      }
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${statusEncCor[enc.status]}`}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em andamento">Em andamento</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Confirm delete overlay */}
        {confirmDelete && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-4 rounded-2xl z-10">
            <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full">
              <i className="ri-delete-bin-line text-red-500 text-xl"></i>
            </div>
            <p className="text-sm font-bold text-gray-800">Excluir esta visita?</p>
            <p className="text-xs text-gray-500 text-center max-w-xs">
              Esta ação não pode ser desfeita. Todos os encaminhamentos também serão removidos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDelete(visita.id);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 cursor-pointer whitespace-nowrap"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
