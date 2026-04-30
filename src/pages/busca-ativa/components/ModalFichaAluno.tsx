import { useState } from 'react';
import { AlunoRisco, AcaoBuscaAtiva } from '@/hooks/useBuscaAtiva';

interface Props {
  aluno: AlunoRisco;
  onClose: () => void;
  onUpdateStatus: (id: string, status: AlunoRisco['status']) => void;
  onRegistrarAcao: (aluno: AlunoRisco) => void;
}

const statusConfig: Record<AlunoRisco['status'], { label: string; color: string; bg: string; icon: string }> = {
  em_risco: { label: 'Em Risco', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: 'ri-alarm-warning-line' },
  em_acompanhamento: { label: 'Em Acompanhamento', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', icon: 'ri-eye-line' },
  retornou: { label: 'Retornou', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: 'ri-checkbox-circle-line' },
  evadido: { label: 'Evadido', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', icon: 'ri-close-circle-line' },
};

const tipoAcaoLabel: Record<AcaoBuscaAtiva['tipo'], string> = {
  'ligação': 'Ligação',
  'visita_domiciliar': 'Visita Domiciliar',
  'contato_responsavel': 'Contato com Responsável',
  'encaminhamento_cras': 'Encaminhamento CRAS',
  'outro': 'Outro',
};

const tipoAcaoIcon: Record<AcaoBuscaAtiva['tipo'], string> = {
  'ligação': 'ri-phone-line',
  'visita_domiciliar': 'ri-home-4-line',
  'contato_responsavel': 'ri-user-heart-line',
  'encaminhamento_cras': 'ri-government-line',
  'outro': 'ri-more-line',
};

const statusAcaoConfig: Record<AcaoBuscaAtiva['status'], { label: string; color: string }> = {
  realizada: { label: 'Realizada', color: 'text-emerald-600' },
  pendente: { label: 'Pendente', color: 'text-yellow-600' },
  sem_sucesso: { label: 'Sem Sucesso', color: 'text-red-500' },
};

export default function ModalFichaAluno({ aluno, onClose, onUpdateStatus, onRegistrarAcao }: Props) {
  const [abaAtiva, setAbaAtiva] = useState<'ficha' | 'historico'>('ficha');
  const [novoStatus, setNovoStatus] = useState(aluno.status);
  const [salvando, setSalvando] = useState(false);

  const cfg = statusConfig[aluno.status];

  const handleSalvarStatus = async () => {
    if (novoStatus === aluno.status) return;
    setSalvando(true);
    await onUpdateStatus(aluno.id, novoStatus);
    setSalvando(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0F2744]/10 flex-shrink-0">
              <i className="ri-user-3-line text-[#0F2744] text-xl"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">{aluno.nome}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{aluno.serie} — Turma {aluno.turma} — {aluno.turno}</p>
              <p className="text-xs text-gray-400">{aluno.escola_nome}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color} flex items-center gap-1.5`}>
              <i className={`${cfg.icon} text-sm`}></i>
              {cfg.label}
            </span>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
              <i className="ri-close-line text-gray-500"></i>
            </button>
          </div>
        </div>

        {/* Abas */}
        <div className="flex border-b border-gray-100 px-6">
          {(['ficha', 'historico'] as const).map(aba => (
            <button
              key={aba}
              onClick={() => setAbaAtiva(aba)}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${abaAtiva === aba ? 'border-[#00A86B] text-[#00A86B]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {aba === 'ficha' ? 'Ficha do Aluno' : `Histórico de Ações (${aluno.acoes?.length || 0})`}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {abaAtiva === 'ficha' && (
            <div className="space-y-5">
              {/* Indicadores */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-[10px] text-gray-500 font-medium">Dias Ausente</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{aluno.dias_ausente}</p>
                  <p className="text-[10px] text-gray-400">no período</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <p className="text-[10px] text-gray-500 font-medium">Faltas Consecutivas</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{aluno.faltas_consecutivas}</p>
                  <p className="text-[10px] text-gray-400">dias seguidos</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-[10px] text-gray-500 font-medium">Ações Realizadas</p>
                  <p className="text-2xl font-bold text-[#0F2744] mt-1">{aluno.acoes?.length || 0}</p>
                  <p className="text-[10px] text-gray-400">registros</p>
                </div>
              </div>

              {/* Motivo */}
              {aluno.motivo_ausencia && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-yellow-700 mb-1 flex items-center gap-1.5">
                    <i className="ri-error-warning-line"></i>
                    Motivo das Ausências
                  </p>
                  <p className="text-sm text-gray-700">{aluno.motivo_ausencia}</p>
                </div>
              )}

              {/* Dados do responsável */}
              <div>
                <p className="text-xs font-bold text-gray-700 mb-3">Dados do Responsável</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 mb-1">Nome</p>
                    <p className="text-xs font-semibold text-gray-700">{aluno.responsavel || '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 mb-1">Telefone</p>
                    <p className="text-xs font-semibold text-gray-700">{aluno.telefone_responsavel || '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                    <p className="text-[10px] text-gray-400 mb-1">Endereço</p>
                    <p className="text-xs font-semibold text-gray-700">{aluno.endereco || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Observações */}
              {aluno.observacoes && (
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-2">Observações</p>
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">{aluno.observacoes}</p>
                </div>
              )}

              {/* Alterar status */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-700 mb-3">Atualizar Status</p>
                <div className="flex items-center gap-3">
                  <select
                    value={novoStatus}
                    onChange={e => setNovoStatus(e.target.value as AlunoRisco['status'])}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B] cursor-pointer"
                  >
                    <option value="em_risco">Em Risco</option>
                    <option value="em_acompanhamento">Em Acompanhamento</option>
                    <option value="retornou">Retornou</option>
                    <option value="evadido">Evadido</option>
                  </select>
                  <button
                    onClick={handleSalvarStatus}
                    disabled={novoStatus === aluno.status || salvando}
                    className="px-4 py-2 text-xs font-bold bg-[#0F2744] text-white rounded-lg hover:bg-[#0F2744]/90 disabled:opacity-40 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    {salvando ? 'Salvando...' : 'Salvar Status'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {abaAtiva === 'historico' && (
            <div className="space-y-3">
              {(!aluno.acoes || aluno.acoes.length === 0) ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-3">
                    <i className="ri-file-list-3-line text-gray-400 text-xl"></i>
                  </div>
                  <p className="text-sm text-gray-400">Nenhuma ação registrada ainda</p>
                </div>
              ) : (
                aluno.acoes.map(acao => (
                  <div key={acao.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 flex items-center justify-center bg-[#0F2744]/10 rounded-lg flex-shrink-0">
                          <i className={`${tipoAcaoIcon[acao.tipo]} text-[#0F2744] text-sm`}></i>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{tipoAcaoLabel[acao.tipo]}</p>
                          <p className="text-[10px] text-gray-400">{formatDate(acao.data_acao)} — {acao.responsavel}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold ${statusAcaoConfig[acao.status].color}`}>
                        {statusAcaoConfig[acao.status].label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{acao.descricao}</p>
                    {acao.resultado && (
                      <p className="text-[10px] text-gray-400 italic">Resultado: {acao.resultado}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
            Fechar
          </button>
          <button
            onClick={() => onRegistrarAcao(aluno)}
            className="px-5 py-2 text-xs font-bold bg-[#00A86B] text-white rounded-lg hover:bg-[#009960] cursor-pointer transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-add-line"></i>
            Registrar Ação
          </button>
        </div>
      </div>
    </div>
  );
}
