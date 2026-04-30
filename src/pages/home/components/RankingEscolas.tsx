import { useState } from 'react';
import { useData } from '@/context/DataContext';

const statusColors: Record<string, string> = {
  'Em dia': 'bg-emerald-100 text-emerald-700',
  'Atrasado': 'bg-yellow-100 text-yellow-700',
  'Crítico': 'bg-red-100 text-red-700',
};

type SortKey = 'ideb' | 'aprovacao' | 'frequencia';

export default function RankingEscolas() {
  const { escolas } = useData();
  const [sortKey, setSortKey] = useState<SortKey>('ideb');
  const sorted = [...escolas].sort((a, b) => b[sortKey] - a[sortKey]);

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-gray-800">Ranking de Escolas — Desempenho Geral</h3>
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 cursor-pointer bg-white"
        >
          <option value="ideb">Por IDEB</option>
          <option value="aprovacao">Por Aprovação</option>
          <option value="frequencia">Por Frequência</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 rounded-lg">
              <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5 rounded-l-lg">#</th>
              <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Escola</th>
              <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">IDEB</th>
              <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5">Aprovação</th>
              <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5 rounded-r-lg">Semáforo</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((escola, idx) => (
              <tr key={escola.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx === 0 ? 'bg-emerald-50/30' : ''}`}>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    {idx === 0 && <i className="ri-trophy-line text-yellow-500 text-sm"></i>}
                    <span className={`text-xs font-bold ${idx === 0 ? 'text-yellow-600' : 'text-gray-400'}`}>{idx + 1}º</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <p className="text-xs font-semibold text-gray-800 truncate max-w-[180px]">{escola.nome}</p>
                  <p className="text-[10px] text-gray-400">{escola.diretor}</p>
                </td>
                <td className="px-3 py-3">
                  <span className="text-sm font-bold text-gray-800">{escola.ideb.toFixed(1)}</span>
                </td>
                <td className="px-3 py-3">
                  <span className="text-xs font-semibold text-gray-700">{escola.aprovacao.toFixed(1)}%</span>
                </td>
                <td className="px-3 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${escola.statusSemaforo === 'verde' ? 'bg-emerald-100 text-emerald-700' : escola.statusSemaforo === 'amarelo' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {escola.statusSemaforo === 'verde' ? 'Ótimo' : escola.statusSemaforo === 'amarelo' ? 'Atenção' : 'Crítico'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
