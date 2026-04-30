import { useState } from 'react';
import MainLayout from '@/components/feature/MainLayout';
import { useData } from '@/context/DataContext';
import { Escola } from '@/hooks/useEscolas';
import AnaliseIA from '@/components/feature/AnaliseIA';

interface EditRow {
  sige: number;
  notaPortugues: number;
  notaMatematica: number;
}

export default function NotasPage() {
  const { escolas, loading, error, updateEscola, stats } = useData();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<EditRow>({ sige: 0, notaPortugues: 0, notaMatematica: 0 });
  const [enviando, setEnviando] = useState<Set<number>>(new Set());
  const [enviados, setEnviados] = useState<Set<number>>(new Set());
  const [savedToast, setSavedToast] = useState('');
  const [bimestre, setBimestre] = useState('1/2026');

  const sorted = [...escolas].sort((a, b) => a.preenchimentoSige - b.preenchimentoSige);
  const criticas = escolas.filter(e => e.preenchimentoSige < 50).length;

  const startEdit = (escola: Escola) => {
    setEditingId(escola.id);
    setEditRow({
      sige: escola.preenchimentoSige,
      notaPortugues: escola.notaPortugues ?? 0,
      notaMatematica: escola.notaMatematica ?? 0,
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (escola: Escola) => {
    const success = await updateEscola(escola.id, {
      preenchimentoSige: editRow.sige,
      notaPortugues: editRow.notaPortugues,
      notaMatematica: editRow.notaMatematica,
      notaMedia: +((editRow.notaPortugues + editRow.notaMatematica) / 2).toFixed(1),
    });
    if (success) {
      setSavedToast(escola.nome);
      setEditingId(null);
      setTimeout(() => setSavedToast(''), 3000);
    }
  };

  const handleCobrar = (id: number) => {
    setEnviando(prev => new Set(prev).add(id));
    setTimeout(() => {
      setEnviando(prev => { const s = new Set(prev); s.delete(id); return s; });
      setEnviados(prev => new Set(prev).add(id));
      setTimeout(() => setEnviados(prev => { const s = new Set(prev); s.delete(id); return s; }), 3000);
    }, 1500);
  };

  const handleCobrarEmMassa = () => {
    const criticas = escolas.filter(e => e.preenchimentoSige < 50);
    criticas.forEach(e => handleCobrar(e.id));
    setSavedToast(`Cobrança enviada para ${criticas.length} escola${criticas.length > 1 ? 's' : ''}!`);
    setTimeout(() => setSavedToast(''), 3500);
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
          {savedToast}
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">SIGE Médio</p>
            <p className={`text-2xl font-bold mt-1 ${stats.mediaSige >= 80 ? 'text-emerald-600' : stats.mediaSige >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>{stats.mediaSige}%</p>
            <p className="text-[10px] text-gray-400 mt-1">meta: 100%</p>
          </div>
          <div className="bg-white rounded-xl p-5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Escolas Completas</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{escolas.filter(e => e.preenchimentoSige === 100).length}</p>
            <p className="text-[10px] text-gray-400 mt-1">de {escolas.length} escolas</p>
          </div>
          <div className="bg-white rounded-xl p-5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Situação Crítica</p>
            <p className={`text-2xl font-bold mt-1 ${criticas > 0 ? 'text-red-500' : 'text-emerald-600'}`}>{criticas}</p>
            <p className="text-[10px] text-gray-400 mt-1">abaixo de 50%</p>
          </div>
          <div className="bg-white rounded-xl p-5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Nota Média Regional</p>
            <p className="text-2xl font-bold text-[#0F2744] mt-1">{stats.mediaIdeb.toFixed(1)}</p>
            <p className="text-[10px] text-gray-400 mt-1">Meta 2026</p>
          </div>
        </div>

        {criticas > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-lg">
                <i className="ri-alarm-warning-line text-red-500 text-lg"></i>
              </div>
              <p className="text-sm font-semibold text-red-700">{criticas} escola{criticas > 1 ? 's' : ''} com menos de 50% de preenchimento — prazo em risco</p>
            </div>
            <button
              onClick={handleCobrarEmMassa}
              className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cobrar em Massa
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-gray-800">Monitoramento SIGE & Notas</h3>
              <select
                value={bimestre}
                onChange={e => setBimestre(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 cursor-pointer bg-white"
              >
                {['1/2026', '2/2026', '3/2026', '4/2026'].map(b => (
                  <option key={b} value={b}>Bimestre {b}</option>
                ))}
              </select>
            </div>
            <span className="text-xs text-gray-500">Prazo: <strong className="text-red-500">30/04/2026</strong></span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">Escola</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">SIGE %</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Português</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Matemática</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(escola => {
                  const isEditing = editingId === escola.id;
                  const isEnviando = enviando.has(escola.id);
                  const isEnviado = enviados.has(escola.id);
                  return (
                    <tr
                      key={escola.id}
                      className={`border-b border-gray-50 transition-colors ${isEditing ? 'bg-[#00A86B]/5' : escola.preenchimentoSige < 50 ? 'bg-red-50/30 hover:bg-red-50/50' : escola.preenchimentoSige === 100 ? 'bg-emerald-50/20 hover:bg-emerald-50/40' : 'hover:bg-gray-50/50'}`}
                    >
                      <td className="px-6 py-3">
                        <p className="text-xs font-semibold text-gray-800">{escola.nome}</p>
                        <p className="text-[10px] text-gray-400">{escola.diretor}</p>
                      </td>

                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number" min={0} max={100} step={1}
                              value={editRow.sige}
                              onChange={e => setEditRow(prev => ({ ...prev, sige: Math.min(100, Math.max(0, +e.target.value)) }))}
                              className="w-16 border border-[#00A86B] rounded-lg px-2 py-1 text-xs text-center font-bold focus:outline-none"
                            />
                            <span className="text-xs text-gray-400">%</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-100 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${escola.preenchimentoSige === 100 ? 'bg-emerald-400' : escola.preenchimentoSige < 50 ? 'bg-red-400' : 'bg-yellow-400'}`}
                                style={{ width: `${escola.preenchimentoSige}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs font-bold ${escola.preenchimentoSige === 100 ? 'text-emerald-600' : escola.preenchimentoSige < 50 ? 'text-red-500' : 'text-yellow-600'}`}>
                              {escola.preenchimentoSige}%
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="number" min={0} max={10} step={0.1}
                            value={editRow.notaPortugues}
                            onChange={e => setEditRow(prev => ({ ...prev, notaPortugues: +e.target.value }))}
                            className="w-16 border border-[#00A86B] rounded-lg px-2 py-1 text-xs text-center font-bold focus:outline-none"
                          />
                        ) : (
                          <span className="text-sm font-bold text-gray-700">{escola.notaPortugues?.toFixed(1) ?? '—'}</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="number" min={0} max={10} step={0.1}
                            value={editRow.notaMatematica}
                            onChange={e => setEditRow(prev => ({ ...prev, notaMatematica: +e.target.value }))}
                            className="w-16 border border-[#00A86B] rounded-lg px-2 py-1 text-xs text-center font-bold focus:outline-none"
                          />
                        ) : (
                          <span className="text-sm font-bold text-gray-700">{escola.notaMatematica?.toFixed(1) ?? '—'}</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {escola.preenchimentoSige === 100 ? (
                          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1 w-fit">
                            <i className="ri-check-line"></i> Completo
                          </span>
                        ) : escola.preenchimentoSige < 50 ? (
                          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700 w-fit block">Crítico</span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 w-fit block">Em andamento</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(escola)}
                                className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 bg-[#00A86B] text-white rounded-lg hover:bg-[#009960] cursor-pointer transition-colors whitespace-nowrap"
                              >
                                <i className="ri-save-line text-xs"></i> Salvar
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors whitespace-nowrap"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(escola)}
                                className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 bg-[#0F2744]/5 text-[#0F2744] rounded-lg hover:bg-[#0F2744]/10 cursor-pointer transition-colors whitespace-nowrap"
                              >
                                <i className="ri-edit-line text-xs"></i> Lançar
                              </button>
                              {escola.preenchimentoSige < 100 && (
                                <button
                                  onClick={() => handleCobrar(escola.id)}
                                  disabled={isEnviando || isEnviado}
                                  className={`flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                                    isEnviado
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : isEnviando
                                      ? 'bg-gray-100 text-gray-400'
                                      : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                  }`}
                                >
                                  <i className={`text-xs ${isEnviado ? 'ri-check-line' : isEnviando ? 'ri-loader-4-line animate-spin' : 'ri-mail-send-line'}`}></i>
                                  {isEnviado ? 'Enviado!' : isEnviando ? 'Enviando...' : 'Cobrar'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <AnaliseIA
          titulo="Análise IA — Preenchimento SIGE & Notas"
          contexto="Preenchimento SIGE e Notas da Regional"
          dados={{
            sige: stats.mediaSige,
            aprovacao: stats.mediaAprovacao,
            ideb: stats.mediaIdeb,
          }}
        />
      </div>
    </MainLayout>
  );
}