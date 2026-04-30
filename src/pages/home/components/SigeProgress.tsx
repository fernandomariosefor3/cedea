import { useData } from '@/context/DataContext';

export default function SigeProgress() {
  const { escolas } = useData();
  const total = escolas.length;
  const completas = escolas.filter((e) => e.preenchimentoSige === 100).length;
  const pct = total > 0 ? Math.round((completas / total) * 100) : 0;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800">Preenchimento SIGE</h3>
        <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-1 rounded-full whitespace-nowrap">Faltam 5 dias</span>
      </div>
      <div className="flex flex-col items-center">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="10" />
          <circle
            cx="50" cy="50" r={radius} fill="none" stroke="#00A86B" strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 50 50)"
          />
          <text x="50" y="54" textAnchor="middle" fill="#1F2937" fontSize="18" fontWeight="bold">{pct}%</text>
        </svg>
        <p className="text-xs text-gray-600 font-semibold mt-2">{completas} de {total} escolas</p>
        <p className="text-[10px] text-gray-400 mt-1">com 100% preenchido</p>
      </div>
      <div className="mt-4 space-y-2">
        {escolas.filter((e) => e.preenchimentoSige < 100).slice(0, 3).map((e) => (
          <div key={e.id} className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-600 truncate">{e.nome.replace('EEFM ', '')}</p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-0.5">
                <div
                  className={`h-1.5 rounded-full ${e.preenchimentoSige < 50 ? 'bg-red-400' : 'bg-yellow-400'}`}
                  style={{ width: `${e.preenchimentoSige}%` }}
                ></div>
              </div>
            </div>
            <span className={`text-[10px] font-bold flex-shrink-0 ${e.preenchimentoSige < 50 ? 'text-red-500' : 'text-yellow-600'}`}>{e.preenchimentoSige}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
