import { useData } from '@/context/DataContext';

export default function AlertasBanner() {
  const { escolas } = useData();

  const alertasDinamicos = [
    ...(() => {
      const criticas = escolas.filter(e => e.preenchimentoSige < 50);
      return criticas.length > 0 ? [{ id: 1, tipo: 'critico', mensagem: `${criticas.length} escola${criticas.length > 1 ? 's' : ''} com preenchimento SIGE abaixo de 50% — prazo em risco`, modulo: 'Notas' }] : [];
    })(),
    ...(() => {
      const evasao = escolas.filter(e => e.evasao > 5);
      return evasao.length > 0 ? [{ id: 2, tipo: 'atencao', mensagem: `${evasao.length} escola${evasao.length > 1 ? 's' : ''} com evasão acima de 5% — acionar Busca Ativa imediatamente`, modulo: 'Fluxo Escolar' }] : [];
    })(),
    ...(() => {
      const freq = escolas.filter(e => e.frequencia < 85);
      return freq.length > 0 ? [{ id: 3, tipo: 'atencao', mensagem: `${freq.length} escola${freq.length > 1 ? 's' : ''} com frequência abaixo de 85% — monitoramento urgente`, modulo: 'Fluxo Escolar' }] : [];
    })(),
    { id: 4, tipo: 'info', mensagem: 'Parada Reflexiva agendada para 15/04/2026 — confirmar participação das escolas', modulo: 'CdG' },
  ];

  if (alertasDinamicos.length === 0) return null;

  return (
    <div className="bg-orange-50 border-l-4 border-orange-400 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-6 h-6 flex items-center justify-center">
          <i className="ri-alert-line text-orange-500 text-lg"></i>
        </div>
        <p className="text-sm font-bold text-orange-800">Alertas que precisam de atenção</p>
      </div>
      <div className="space-y-2">
        {alertasDinamicos.map((alerta) => (
          <div key={alerta.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${alerta.tipo === 'critico' ? 'bg-red-500' : alerta.tipo === 'atencao' ? 'bg-orange-500' : 'bg-blue-400'}`}></div>
              <p className="text-xs text-gray-700">{alerta.mensagem}</p>
            </div>
            <span className="text-[10px] text-orange-600 font-semibold bg-orange-100 px-2 py-0.5 rounded-full whitespace-nowrap ml-4">{alerta.modulo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
