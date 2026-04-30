import { useState } from 'react';
import MainLayout from '@/components/feature/MainLayout';
import { useVisitas, Visita, StatusVisita, StatusEncaminhamento, NovaVisitaInput } from '@/hooks/useVisitas';
import ModalNovaVisita from './components/ModalNovaVisita';
import ModalDetalheVisita from './components/ModalDetalheVisita';
import AnaliseIA from '@/components/feature/AnaliseIA';

const statusCor: Record<StatusVisita, string> = {
  Agendada: 'bg-sky-100 text-sky-700',
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

export default function VisitasPage() {
  const { visitas, loading, addVisita, updateEncaminhamento, deleteVisita } = useVisitas();
  const [novaVisitaOpen, setNovaVisitaOpen] = useState(false);
  const [detalheVisita, setDetalheVisita] = useState<Visita | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<StatusVisita | 'Todas'>('Todas');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = visitas.filter(v => {
    const matchStatus = filtroStatus === 'Todas' || v.status === filtroStatus;
    const matchSearch =
      v.escola_nome.toLowerCase().includes(search.toLowerCase()) ||
      v.objetivo.toLowerCase().includes(search.toLowerCase()) ||
      v.tipo.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  const agendadas = visitas.filter(v => v.status === 'Agendada').length;
  const realizadas = visitas.filter(v => v.status === 'Realizada').length;
  const totalEnc = visitas.flatMap(v => v.encaminhamentos);
  const encPendentes = totalEnc.filter(e => e.status === 'Pendente').length;
  const encConcluidos = totalEnc.filter(e => e.status === 'Concluído').length;

  const handleSaveVisita = async (input: NovaVisitaInput) => {
    const ok = await addVisita(input);
    setNovaVisitaOpen(false);
    if (ok) showToast('Visita registrada com sucesso!');
    else showToast('Erro ao salvar visita. Tente novamente.');
  };

  const handleUpdateEncaminhamento = async (
    visitaId: number,
    encId: number,
    status: StatusEncaminhamento
  ) => {
    await updateEncaminhamento(visitaId, encId, status);
    if (detalheVisita?.id === visitaId) {
      setDetalheVisita(prev =>
        prev
          ? {
              ...prev,
              encaminhamentos: prev.encaminhamentos.map(e =>
                e.id === encId ? { ...e, status } : e
              ),
            }
          : null
      );
    }
  };

  const handleDelete = async (id: number) => {
    await deleteVisita(id);
    setDetalheVisita(null);
    showToast('Visita excluída.');
  };

  return (
    <MainLayout>
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-white text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
          <i className="ri-checkbox-circle-fill text-base"></i>
          {toast}
        </div>
      )}

      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Total de Visitas</p>
            <p className="text-2xl font-bold text-[#0F2744] mt-1">{visitas.length}</p>
            <p className="text-[10px] text-gray-400 mt-1">registradas em 2026</p>
          </div>
          <div className="bg-white rounded-xl p-5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Agendadas</p>
            <p className="text-2xl font-bold text-sky-600 mt-1">{agendadas}</p>
            <p className="text-[10px] text-gray-400 mt-1">próximas visitas</p>
          </div>
          <div className="bg-white rounded-xl p-5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Realizadas</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{realizadas}</p>
            <p className="text-[10px] text-gray-400 mt-1">com relato registrado</p>
          </div>
          <div className="bg-white rounded-xl p-5">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Encaminhamentos</p>
            <p className="text-2xl font-bold text-orange-500 mt-1">{encPendentes}</p>
            <p className="text-[10px] text-gray-400 mt-1">{encConcluidos} concluídos de {totalEnc.length}</p>
          </div>
        </div>

        {/* Próximas visitas agendadas */}
        {agendadas > 0 && (
          <div className="bg-white rounded-xl p-5">
            <p className="text-xs font-bold text-gray-700 mb-3">Próximas Visitas Agendadas</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {visitas
                .filter(v => v.status === 'Agendada')
                .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
                .map(v => {
                  const d = new Date(v.data + 'T00:00:00');
                  return (
                    <div
                      key={v.id}
                      onClick={() => setDetalheVisita(v)}
                      className="flex-shrink-0 bg-[#0F2744]/5 rounded-xl p-4 cursor-pointer hover:bg-[#0F2744]/10 transition-colors min-w-[200px]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-[#0F2744] rounded-lg flex-shrink-0">
                          <i className="ri-calendar-line text-white text-sm"></i>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0F2744]">
                            {d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}
                          </p>
                          <p className="text-[10px] text-gray-400">{v.hora}</p>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-gray-800 leading-tight">
                        {v.escola_nome.replace('EEFM ', '')}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{v.tipo}</p>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Filtros + botão nova visita */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por escola, tipo ou objetivo..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#00A86B]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['Todas', 'Agendada', 'Realizada', 'Reagendada', 'Cancelada'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltroStatus(f)}
                className={`px-3 py-2 text-xs font-semibold rounded-full cursor-pointer transition-all whitespace-nowrap ${
                  filtroStatus === f
                    ? 'bg-[#0F2744] text-white'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setNovaVisitaOpen(true)}
            className="ml-auto flex items-center gap-2 bg-[#00A86B] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-[#009960] cursor-pointer transition-colors whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            Nova Visita
          </button>
        </div>

        {/* Lista de visitas */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <i className="ri-loader-4-line text-3xl text-[#00A86B] animate-spin"></i>
              <p className="text-sm text-gray-400">Carregando visitas...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.length === 0 ? (
              <div className="bg-white rounded-xl py-16 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mb-3">
                  <i className="ri-map-pin-line text-2xl text-gray-400"></i>
                </div>
                <p className="text-gray-500 font-medium text-sm">Nenhuma visita encontrada</p>
                <p className="text-gray-400 text-xs mt-1">Tente ajustar os filtros ou registre uma nova visita</p>
              </div>
            ) : (
              sorted.map(visita => {
                const d = new Date(visita.data + 'T00:00:00');
                const encTotal = visita.encaminhamentos.length;
                const encConc = visita.encaminhamentos.filter(e => e.status === 'Concluído').length;
                const encPend = visita.encaminhamentos.filter(e => e.status === 'Pendente').length;

                return (
                  <div
                    key={visita.id}
                    onClick={() => setDetalheVisita(visita)}
                    className="bg-white rounded-xl p-5 cursor-pointer hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-14 text-center">
                        <div className="bg-[#0F2744] rounded-xl py-2 px-1">
                          <p className="text-white text-lg font-bold leading-none">
                            {d.getDate().toString().padStart(2, '0')}
                          </p>
                          <p className="text-white/60 text-[10px] uppercase mt-0.5">
                            {d.toLocaleDateString('pt-BR', { month: 'short' })}
                          </p>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{visita.hora}</p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${statusCor[visita.status as StatusVisita]}`}
                          >
                            <i className={`${statusIcon[visita.status as StatusVisita]} text-[10px]`}></i>
                            {visita.status}
                          </span>
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {visita.tipo}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-800">{visita.escola_nome}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{visita.objetivo}</p>

                        {encTotal > 0 && (
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <i className="ri-arrow-right-line text-[10px]"></i>
                              {encTotal} encaminhamento{encTotal !== 1 ? 's' : ''}
                            </span>
                            {encConc > 0 && (
                              <span className="text-[10px] text-emerald-600 font-semibold">
                                {encConc} concluído{encConc !== 1 ? 's' : ''}
                              </span>
                            )}
                            {encPend > 0 && (
                              <span className="text-[10px] text-orange-500 font-semibold">
                                {encPend} pendente{encPend !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 flex-shrink-0">
                        <i className="ri-arrow-right-s-line text-gray-400"></i>
                      </div>
                    </div>

                    {encTotal > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-gray-400">Progresso dos encaminhamentos</span>
                          <span className="text-[10px] font-bold text-gray-600">
                            {encConc}/{encTotal}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-emerald-400 transition-all"
                            style={{ width: `${(encConc / encTotal) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        <AnaliseIA
          titulo="Análise IA — Visitas Técnicas"
          contexto="Visitas Técnicas da Regional"
          dados={{
            totalVisitas: visitas.length,
            realizadas,
            agendadas,
            encaminhamentosPendentes: encPendentes,
            encaminhamentosConcluidos: encConcluidos,
          }}
        />
      </div>

      {novaVisitaOpen && (
        <ModalNovaVisita onSave={handleSaveVisita} onClose={() => setNovaVisitaOpen(false)} />
      )}

      {detalheVisita && (
        <ModalDetalheVisita
          visita={detalheVisita}
          onClose={() => setDetalheVisita(null)}
          onUpdateEncaminhamento={handleUpdateEncaminhamento}
          onDelete={handleDelete}
        />
      )}
    </MainLayout>
  );
}
