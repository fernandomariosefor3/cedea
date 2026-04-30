import { useState, useCallback } from 'react';
import { useVisitas, StatusEncaminhamento, StatusVisita } from '@/hooks/useVisitas';

interface Props {
  escolaId: number;
  escolaNome: string;
}

const statusCor: Record<StatusVisita, string> = {
  Agendada: 'bg-[#0F2744]/10 text-[#0F2744]',
  Realizada: 'bg-emerald-100 text-emerald-700',
  Cancelada: 'bg-red-100 text-red-700',
  Reagendada: 'bg-yellow-100 text-yellow-700',
};

const statusIcon: Record<StatusVisita, string> = {
  Agendada: 'ri-calendar-line',
  Realizada: 'ri-checkbox-circle-fill',
  Cancelada: 'ri-close-circle-line',
  Reagendada: 'ri-refresh-line',
};

const statusEncCor: Record<StatusEncaminhamento, string> = {
  Pendente: 'bg-gray-100 text-gray-600',
  'Em andamento': 'bg-yellow-100 text-yellow-700',
  Concluído: 'bg-emerald-100 text-emerald-700',
};

const timelineDot: Record<StatusVisita, string> = {
  Agendada: 'bg-[#0F2744]',
  Realizada: 'bg-emerald-500',
  Cancelada: 'bg-red-400',
  Reagendada: 'bg-yellow-400',
};

export default function HistoricoVisitasEscola({ escolaId, escolaNome }: Props) {
  const { visitas: allVisitas, loading, updateEncaminhamento } = useVisitas();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<StatusVisita | 'Todas'>('Todas');

  const visitas = allVisitas
    .filter(v => v.escola_id === escolaId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const filtered = filtroStatus === 'Todas'
    ? visitas
    : visitas.filter(v => v.status === filtroStatus);

  const realizadas = visitas.filter(v => v.status === 'Realizada').length;
  const agendadas = visitas.filter(v => v.status === 'Agendada').length;
  const totalEnc = visitas.flatMap(v => v.encaminhamentos);
  const encPendentes = totalEnc.filter(e => e.status === 'Pendente').length;
  const encConcluidos = totalEnc.filter(e => e.status === 'Concluído').length;

  const handleUpdateEncaminhamento = useCallback(
    async (visitaId: number, encId: number, status: StatusEncaminhamento) => {
      await updateEncaminhamento(visitaId, encId, status);
    },
    [updateEncaminhamento]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#00A86B] rounded-full animate-spin"></div>
          <span className="text-xs">Carregando visitas...</span>
        </div>
      </div>
    );
  }

  if (visitas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full">
          <i className="ri-map-pin-line text-3xl text-gray-400"></i>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">Nenhuma visita registrada</p>
          <p className="text-xs text-gray-400 mt-1">
            As visitas técnicas a <strong>{escolaNome}</strong> aparecerão aqui automaticamente quando forem registradas no módulo de Visitas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total de Visitas', value: visitas.length, icon: 'ri-map-pin-line', color: 'text-[#0F2744]', bg: 'bg-[#0F2744]/5' },
          { label: 'Realizadas', value: realizadas, icon: 'ri-checkbox-circle-line', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Agendadas', value: agendadas, icon: 'ri-calendar-line', color: 'text-[#0F2744]', bg: 'bg-[#0F2744]/5' },
          { label: 'Enc. Pendentes', value: encPendentes, icon: 'ri-arrow-right-circle-line', color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4 flex items-center gap-3`}>
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
              <i className={`${k.icon} text-xl ${k.color}`}></i>
            </div>
            <div>
              <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-[10px] text-gray-500 leading-tight">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progresso encaminhamentos */}
      {totalEnc.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600">Progresso dos Encaminhamentos</p>
            <span className="text-xs font-bold text-gray-700">{encConcluidos}/{totalEnc.length} concluídos</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-emerald-400 transition-all"
              style={{ width: `${totalEnc.length > 0 ? (encConcluidos / totalEnc.length) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="flex gap-4 mt-2">
            <span className="text-[10px] text-gray-400">{encPendentes} pendente{encPendentes !== 1 ? 's' : ''}</span>
            <span className="text-[10px] text-yellow-600">{totalEnc.filter(e => e.status === 'Em andamento').length} em andamento</span>
            <span className="text-[10px] text-emerald-600">{encConcluidos} concluído{encConcluidos !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-[10px] text-gray-400 font-medium">Filtrar:</p>
        {(['Todas', 'Agendada', 'Realizada', 'Reagendada', 'Cancelada'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltroStatus(f)}
            className={`px-3 py-1.5 text-[10px] font-semibold rounded-full cursor-pointer transition-all whitespace-nowrap ${
              filtroStatus === f
                ? 'bg-[#0F2744] text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-gray-400">{filtered.length} visita{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[22px] top-3 bottom-3 w-0.5 bg-gray-200 z-0"></div>

        <div className="space-y-3">
          {filtered.map((visita) => {
            const d = new Date(visita.data + 'T00:00:00');
            const isExpanded = expandedId === visita.id;
            const encTotal = visita.encaminhamentos.length;
            const encConc = visita.encaminhamentos.filter(e => e.status === 'Concluído').length;
            const encPend = visita.encaminhamentos.filter(e => e.status === 'Pendente').length;

            return (
              <div key={visita.id} className="relative pl-12">
                <div className={`absolute left-3.5 top-4 w-4 h-4 rounded-full border-2 border-white z-10 flex items-center justify-center ${timelineDot[visita.status]}`}>
                  <i className={`${statusIcon[visita.status]} text-white text-[8px]`}></i>
                </div>

                <div className={`bg-white border rounded-xl overflow-hidden transition-all ${isExpanded ? 'border-[#00A86B]' : 'border-gray-100 hover:border-gray-200'}`}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : visita.id)}
                    className="w-full flex items-start gap-4 p-4 text-left cursor-pointer"
                  >
                    <div className="flex-shrink-0 text-center w-10">
                      <p className="text-lg font-bold text-[#0F2744] leading-none">{d.getDate().toString().padStart(2, '0')}</p>
                      <p className="text-[9px] text-gray-400 uppercase mt-0.5">
                        {d.toLocaleDateString('pt-BR', { month: 'short' })}
                      </p>
                      <p className="text-[9px] text-gray-300">{d.getFullYear()}</p>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${statusCor[visita.status]}`}>
                          <i className={`${statusIcon[visita.status]} text-[9px]`}></i>
                          {visita.status}
                        </span>
                        <span className="text-[9px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{visita.tipo}</span>
                        <span className="text-[9px] text-gray-400">{visita.hora}</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-1">{visita.objetivo}</p>

                      {encTotal > 0 && (
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] text-gray-400">{encTotal} encaminhamento{encTotal !== 1 ? 's' : ''}</span>
                          {encConc > 0 && <span className="text-[9px] text-emerald-600 font-semibold">{encConc} concluído{encConc !== 1 ? 's' : ''}</span>}
                          {encPend > 0 && <span className="text-[9px] text-orange-500 font-semibold">{encPend} pendente{encPend !== 1 ? 's' : ''}</span>}
                        </div>
                      )}
                    </div>

                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                      <i className={`${isExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-gray-400 text-base transition-transform`}></i>
                    </div>
                  </button>

                  {encTotal > 0 && !isExpanded && (
                    <div className="px-4 pb-3">
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div
                          className="h-1 rounded-full bg-emerald-400"
                          style={{ width: `${(encConc / encTotal) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Objetivo</p>
                        <p className="text-xs text-gray-700 leading-relaxed">{visita.objetivo}</p>
                      </div>

                      {visita.relato && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Relato da Visita</p>
                          <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{visita.relato}</p>
                        </div>
                      )}

                      {(visita.pontos_fortes || visita.pontos_atencao) && (
                        <div className="grid grid-cols-2 gap-3">
                          {visita.pontos_fortes && (
                            <div className="bg-emerald-50 rounded-lg p-3">
                              <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                <i className="ri-thumb-up-line"></i> Pontos Fortes
                              </p>
                              <p className="text-[10px] text-emerald-800 leading-relaxed">{visita.pontos_fortes}</p>
                            </div>
                          )}
                          {visita.pontos_atencao && (
                            <div className="bg-orange-50 rounded-lg p-3">
                              <p className="text-[9px] font-bold text-orange-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                <i className="ri-error-warning-line"></i> Pontos de Atenção
                              </p>
                              <p className="text-[10px] text-orange-800 leading-relaxed">{visita.pontos_atencao}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {encTotal > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                            Encaminhamentos ({encTotal})
                          </p>
                          <div className="space-y-2">
                            {visita.encaminhamentos.map(enc => (
                              <div key={enc.id} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                                <div className="w-4 h-4 flex items-center justify-center bg-[#0F2744]/10 rounded-full flex-shrink-0 mt-0.5">
                                  <i className="ri-arrow-right-line text-[#0F2744] text-[9px]"></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-semibold text-gray-800">{enc.descricao}</p>
                                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    {enc.responsavel && (
                                      <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                                        <i className="ri-user-line text-[9px]"></i>{enc.responsavel}
                                      </span>
                                    )}
                                    {enc.prazo && (
                                      <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                                        <i className="ri-calendar-line text-[9px]"></i>
                                        {new Date(enc.prazo + 'T00:00:00').toLocaleDateString('pt-BR')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <select
                                  value={enc.status}
                                  onChange={e =>
                                    handleUpdateEncaminhamento(visita.id, enc.id, e.target.value as StatusEncaminhamento)
                                  }
                                  className={`text-[9px] font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none flex-shrink-0 ${statusEncCor[enc.status]}`}
                                >
                                  <option value="Pendente">Pendente</option>
                                  <option value="Em andamento">Em andamento</option>
                                  <option value="Concluído">Concluído</option>
                                </select>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] text-gray-400">Progresso</span>
                              <span className="text-[9px] font-bold text-gray-600">{encConc}/{encTotal}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full bg-emerald-400 transition-all"
                                style={{ width: `${(encConc / encTotal) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {visita.status === 'Agendada' && !visita.relato && (
                        <div className="bg-[#0F2744]/5 rounded-lg p-3 flex items-center gap-2">
                          <i className="ri-calendar-event-line text-[#0F2744] text-sm"></i>
                          <p className="text-[10px] text-[#0F2744]">
                            Visita agendada para {new Date(visita.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} às {visita.hora}. O relato será preenchido após a realização.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}