import { useState } from 'react';
import MainLayout from '@/components/feature/MainLayout';
import { useData } from '@/context/DataContext';
import { Escola } from '@/hooks/useEscolas';
import ModalLancarFluxo from './components/ModalLancarFluxo';
import AnaliseIA from '@/components/feature/AnaliseIA';

const semCor: Record<string, string> = { verde: 'bg-emerald-400', amarelo: 'bg-yellow-400', vermelho: 'bg-red-500' };
const semLabel: Record<string, string> = { verde: 'Ótimo', amarelo: 'Atenção', vermelho: 'Crítico' };
const semBg: Record<string, string> = { verde: 'border-emerald-200', amarelo: 'border-yellow-200', vermelho: 'border-red-200' };

export default function FluxoEscolarPage() {
  const { escolas, loading, error, updateEscola, stats } = useData();
  const [filtro, setFiltro] = useState<'todos' | 'verde' | 'amarelo' | 'vermelho'>('todos');
  const [search, setSearch] = useState('');
  const [editando, setEditando] = useState<Escola | null>(null);
  const [savedToast, setSavedToast] = useState('');

  const filtered = escolas.filter(e => {
    const matchSearch = e.nome.toLowerCase().includes(search.toLowerCase());
    const matchFiltro = filtro === 'todos' || e.statusSemaforo === filtro;
    return matchSearch && matchFiltro;
  });

  const counts = {
    verde: escolas.filter(e => e.statusSemaforo === 'verde').length,
    amarelo: escolas.filter(e => e.statusSemaforo === 'amarelo').length,
    vermelho: escolas.filter(e => e.statusSemaforo === 'vermelho').length,
  };

  const handleSave = async (data: Partial<Escola>) => {
    if (!editando) return;
    const success = await updateEscola(editando.id, data);
    if (success) {
      setSavedToast(editando.nome);
      setEditando(null);
      setTimeout(() => setSavedToast(''), 3000);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#00A86B] rounded-full animate-spin"></div>
            <span className="text-sm">Carregando dados...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full mx-auto mb-3">
              <i className="ri-error-warning-line text-red-500 text-xl"></i>
            </div>
            <p className="text-gray-600 font-medium">{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {savedToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-white text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
          <i className="ri-checkbox-circle-fill text-base"></i>
          Dados de fluxo atualizados!
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Matrículas Total</p>
            <p className="text-2xl font-bold text-[#0F2744] mt-1">{stats.totalMatriculas.toLocaleString('pt-BR')}</p>
            <p className="text-[10px] text-gray-400 mt-1">todas as escolas</p>
          </div>
          <div className="bg-white rounded-xl p-5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Frequência Média</p>
            <p className={`text-2xl font-bold mt-1 ${stats.mediaFrequencia >= 90 ? 'text-emerald-600' : stats.mediaFrequencia >= 80 ? 'text-yellow-600' : 'text-red-500'}`}>{stats.mediaFrequencia}%</p>
            <p className="text-[10px] text-gray-400 mt-1">meta: 92%</p>
          </div>
          <div className="bg-white rounded-xl p-5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Aprovação Média</p>
            <p className={`text-2xl font-bold mt-1 ${stats.mediaAprovacao >= 90 ? 'text-emerald-600' : stats.mediaAprovacao >= 80 ? 'text-yellow-600' : 'text-red-500'}`}>{stats.mediaAprovacao}%</p>
            <p className="text-[10px] text-gray-400 mt-1">meta: 95%</p>
          </div>
          <div className="bg-white rounded-xl p-5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Evasão Média</p>
            <p className={`text-2xl font-bold mt-1 ${stats.mediaEvasao <= 2 ? 'text-emerald-600' : stats.mediaEvasao <= 4 ? 'text-yellow-600' : 'text-red-500'}`}>{stats.mediaEvasao}%</p>
            <p className="text-[10px] text-gray-400 mt-1">meta: &lt;2%</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {(['verde', 'amarelo', 'vermelho'] as const).map((s) => (
            <div
              key={s}
              className={`bg-white rounded-xl p-5 border-l-4 ${s === 'verde' ? 'border-emerald-400' : s === 'amarelo' ? 'border-yellow-400' : 'border-red-500'} cursor-pointer hover:-translate-y-0.5 transition-transform`}
              onClick={() => setFiltro(filtro === s ? 'todos' : s)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{semLabel[s]}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{counts[s]}</p>
                  <p className="text-[10px] text-gray-400">escolas</p>
                </div>
                <div className={`w-10 h-10 flex items-center justify-center rounded-full ${semCor[s]}`}>
                  <i className={`${s === 'verde' ? 'ri-checkbox-circle-fill' : s === 'amarelo' ? 'ri-error-warning-line' : 'ri-alarm-warning-line'} text-white text-lg`}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar escola..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#00A86B]"
            />
          </div>
          <div className="flex gap-2">
            {(['todos', 'verde', 'amarelo', 'vermelho'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-2 text-xs font-semibold rounded-full cursor-pointer transition-all whitespace-nowrap ${filtro === f ? 'bg-[#0F2744] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
              >
                {f === 'todos' ? 'Todos' : semLabel[f]}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 ml-auto">{filtered.length} escola{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {filtered.map(escola => (
            <div
              key={escola.id}
              className={`bg-white rounded-xl p-5 border ${semBg[escola.statusSemaforo]} hover:-translate-y-0.5 transition-transform`}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-bold text-gray-800 leading-tight flex-1 pr-2">{escola.nome.replace('EEFM ', '')}</p>
                <div className={`w-4 h-4 rounded-full flex-shrink-0 ${semCor[escola.statusSemaforo]}`}></div>
              </div>
              <p className="text-[10px] text-gray-400 mb-3">{escola.diretor}</p>

              <div className="space-y-2.5">
                {[
                  { label: 'Frequência', value: escola.frequencia, cor: escola.frequencia >= 90 ? 'bg-emerald-400' : escola.frequencia >= 80 ? 'bg-yellow-400' : 'bg-red-400' },
                  { label: 'Aprovação', value: escola.aprovacao, cor: escola.aprovacao >= 90 ? 'bg-emerald-400' : escola.aprovacao >= 80 ? 'bg-yellow-400' : 'bg-red-400' },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] text-gray-500">{m.label}</span>
                      <span className="text-[10px] font-bold text-gray-700">{m.value}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${m.cor}`} style={{ width: `${m.value}%` }}></div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between pt-1 border-t border-gray-50">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400">Matrículas</p>
                    <p className="text-sm font-bold text-gray-700">{escola.matriculas}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400">Evasão</p>
                    <p className={`text-sm font-bold ${escola.evasao > 4 ? 'text-red-500' : escola.evasao > 2 ? 'text-yellow-600' : 'text-emerald-600'}`}>{escola.evasao}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400">IDEB</p>
                    <p className="text-sm font-bold text-gray-700">{escola.ideb}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEditando(escola)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 text-[10px] font-bold py-2 rounded-lg bg-[#0F2744]/5 text-[#0F2744] hover:bg-[#0F2744]/10 cursor-pointer transition-colors whitespace-nowrap"
              >
                <i className="ri-edit-line text-xs"></i>
                Lançar Dados
              </button>
            </div>
          ))}
        </div>

        <AnaliseIA
          titulo="Análise IA — Fluxo Escolar Regional"
          contexto="Fluxo Escolar da Regional"
          dados={{
            aprovacao: stats.mediaAprovacao,
            evasao: stats.mediaEvasao,
            frequencia: stats.mediaFrequencia,
          }}
        />
      </div>

      {editando && (
        <ModalLancarFluxo
          escola={editando}
          onSave={handleSave}
          onClose={() => setEditando(null)}
        />
      )}
    </MainLayout>
  );
}