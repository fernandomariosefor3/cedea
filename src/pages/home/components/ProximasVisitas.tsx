import { useNavigate } from 'react-router-dom';
import { useVisitas } from '@/hooks/useVisitas';

export default function ProximasVisitas() {
  const navigate = useNavigate();
  const { visitas, loading } = useVisitas();

  const proximas = visitas
    .filter(v => v.status === 'Agendada')
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 4);

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800">Próximas Visitas</h3>
        <button
          onClick={() => navigate('/visitas')}
          className="text-xs text-[#00A86B] font-semibold hover:underline cursor-pointer whitespace-nowrap"
        >
          Ver agenda
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#00A86B] rounded-full animate-spin"></div>
        </div>
      ) : proximas.length === 0 ? (
        <div className="text-center py-4 text-gray-400 text-xs">Nenhuma visita agendada</div>
      ) : (
        <div className="space-y-3">
          {proximas.map((visita) => {
            const d = new Date(visita.data + 'T00:00:00');
            const dia = d.getDate().toString().padStart(2, '0');
            const mes = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
            return (
              <div key={visita.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center bg-[#0F2744]/8 rounded-lg">
                  <span className="text-[10px] font-bold text-[#0F2744] leading-tight">{dia}</span>
                  <span className="text-[10px] font-semibold text-[#0F2744]/60 leading-tight">{mes}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{visita.escola_nome}</p>
                  <p className="text-[10px] text-gray-500 truncate">{visita.tipo}</p>
                  <p className="text-[10px] text-gray-400">{visita.hora}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}