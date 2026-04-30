import { useState, useRef, useEffect } from 'react';
import MainLayout from '@/components/feature/MainLayout';
import { useRelatorios, Relatorio, modulosDisponiveis } from '@/hooks/useRelatorios';
import { useData } from '@/context/DataContext';
import { useCdG } from '@/hooks/useCdG';
import { useVisitas } from '@/hooks/useVisitas';
import ModalGerarRelatorio from './components/ModalGerarRelatorio';
import RelatorioRegionalIA from './components/RelatorioRegionalIA';

const formatoIcon: Record<string, string> = {
  PDF: 'ri-file-pdf-2-line',
  Excel: 'ri-file-excel-2-line',
};
const formatoCor: Record<string, string> = {
  PDF: 'text-red-500 bg-red-50',
  Excel: 'text-emerald-600 bg-emerald-50',
};

function ModalVisualizarRelatorio({ rel, onClose }: { rel: Relatorio; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Detalhes do Relatório</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className={`w-14 h-14 flex items-center justify-center rounded-2xl mx-auto ${formatoCor[rel.formato]}`}>
            <i className={`${formatoIcon[rel.formato]} text-3xl`}></i>
          </div>
          <div className="text-center">
            <h4 className="text-sm font-bold text-gray-800">{rel.titulo}</h4>
            <p className="text-xs text-gray-500 mt-1">{rel.descricao}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            {[
              { label: 'Módulo', value: rel.modulo },
              { label: 'Formato', value: rel.formato },
              { label: 'Período', value: rel.periodo },
              { label: 'Escola', value: rel.escola ?? 'Todas as escolas' },
              { label: 'Gerado em', value: `${rel.data_geracao} às ${rel.hora_geracao}` },
              { label: 'Gerado por', value: rel.gerado_por },
              { label: 'Tamanho', value: rel.tamanho },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{item.label}</span>
                <span className="text-xs font-semibold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
            Fechar
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold bg-[#00A86B] text-white rounded-lg hover:bg-[#009960] cursor-pointer transition-colors whitespace-nowrap">
            <i className="ri-download-2-line"></i> Baixar {rel.formato}
          </button>
        </div>
      </div>
    </div>
  );
}

function DropdownMaisOpcoes({ rel, onDelete, onShare }: { rel: Relatorio; onDelete: (id: number) => void; onShare: (titulo: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
      >
        <i className="ri-more-2-line text-gray-500 text-sm"></i>
      </button>
      {open && (
        <div className="absolute right-0 top-9 w-44 bg-white border border-gray-200 rounded-xl z-50 overflow-hidden">
          <button
            onClick={() => { onShare(rel.titulo); setOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <i className="ri-share-line text-gray-400 text-sm"></i>
            Compartilhar link
          </button>
          <button
            onClick={() => { onDelete(rel.id); setOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
          >
            <i className="ri-delete-bin-line text-red-400 text-sm"></i>
            Excluir relatório
          </button>
        </div>
      )}
    </div>
  );
}

export default function RelatoriosPage() {
  const { stats } = useData();
  const { cdgData } = useCdG();
  const { visitas } = useVisitas();
  const { relatorios, loading, addRelatorio, deleteRelatorio } = useRelatorios();
  const [search, setSearch] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('Todos');
  const [filtroFormato, setFiltroFormato] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [baixando, setBaixando] = useState<number | null>(null);
  const [gerandoId, setGerandoId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [visualizando, setVisualizando] = useState<Relatorio | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleBaixar = (id: number, titulo: string, formato: string) => {
    setBaixando(id);
    setTimeout(() => {
      setBaixando(null);
      showToast(`"${titulo}" exportado em ${formato} com sucesso!`);
    }, 1800);
  };

  const handleGerar = async (titulo: string, modulo: string, formato: string) => {
    const novo = await addRelatorio({
      titulo,
      modulo,
      formato: formato as 'PDF' | 'Excel',
      periodo: 'Abril 2026',
    });

    if (novo) {
      setGerandoId(novo.id);
      setTimeout(() => setGerandoId(null), 2500);
      showToast(`Relatório "${titulo}" gerado com sucesso!`);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteRelatorio(id);
    showToast('Relatório excluído.');
  };

  const handleShare = (titulo: string) => {
    showToast(`Link de "${titulo}" copiado para a área de transferência!`);
  };

  const filtrados = relatorios.filter((r) => {
    const matchSearch = r.titulo.toLowerCase().includes(search.toLowerCase()) || r.modulo.toLowerCase().includes(search.toLowerCase());
    const matchModulo = filtroModulo === 'Todos' || r.modulo === filtroModulo;
    const matchFormato = filtroFormato === 'Todos' || r.formato === filtroFormato;
    return matchSearch && matchModulo && matchFormato;
  });

  const totalPDF = relatorios.filter(r => r.formato === 'PDF').length;
  const totalExcel = relatorios.filter(r => r.formato === 'Excel').length;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#00A86B] rounded-full animate-spin"></div>
            <span className="text-sm">Carregando relatórios...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {toastMsg && (
          <div className="fixed top-20 right-8 z-50 bg-[#0F2744] text-white text-xs font-semibold px-5 py-3 rounded-xl flex items-center gap-3">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-check-line text-[#00A86B] text-sm"></i>
            </div>
            {toastMsg}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total de Relatórios', value: relatorios.length, icon: 'ri-file-chart-line', cor: 'text-[#0F2744]', bg: 'bg-[#0F2744]/10' },
            { label: 'Arquivos PDF', value: totalPDF, icon: 'ri-file-pdf-2-line', cor: 'text-red-500', bg: 'bg-red-50' },
            { label: 'Arquivos Excel', value: totalExcel, icon: 'ri-file-excel-2-line', cor: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Escolas Monitoradas', value: stats.totalEscolas, icon: 'ri-school-line', cor: 'text-orange-500', bg: 'bg-orange-50' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl p-5 flex items-center gap-4">
              <div className={`w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0 ${k.bg}`}>
                <i className={`${k.icon} text-xl ${k.cor}`}></i>
              </div>
              <div>
                <p className={`text-2xl font-bold ${k.cor}`}>{k.value}</p>
                <p className="text-[10px] text-gray-500 font-medium">{k.label}</p>
              </div>
            </div>
          ))}
        </div>

        <RelatorioRegionalIA cdgData={cdgData} visitasData={visitas} />

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar relatório ou módulo..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#00A86B]"
            />
          </div>
          <select
            value={filtroModulo}
            onChange={(e) => setFiltroModulo(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-600 bg-white focus:outline-none focus:border-[#00A86B] cursor-pointer"
          >
            <option value="Todos">Todos os módulos</option>
            {modulosDisponiveis.map((m) => <option key={m.label}>{m.label}</option>)}
          </select>
          <select
            value={filtroFormato}
            onChange={(e) => setFiltroFormato(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-600 bg-white focus:outline-none focus:border-[#00A86B] cursor-pointer"
          >
            <option value="Todos">PDF e Excel</option>
            <option value="PDF">Somente PDF</option>
            <option value="Excel">Somente Excel</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#00A86B] text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-[#009960] transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line text-sm"></i>
            </div>
            Gerar Novo Relatório
          </button>
        </div>

        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Biblioteca de Relatórios</h3>
            <span className="text-xs text-gray-400">{filtrados.length} relatório{filtrados.length !== 1 ? 's' : ''}</span>
          </div>

          {filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mb-3">
                <i className="ri-file-search-line text-2xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 font-medium text-sm">Nenhum relatório encontrado</p>
              <p className="text-gray-400 text-xs mt-1">Tente ajustar os filtros ou gere um novo relatório</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtrados.map((rel) => (
                <div key={rel.id} className={`flex items-center gap-5 px-6 py-4 hover:bg-gray-50/50 transition-colors ${rel.status === 'Gerando' ? 'opacity-70' : ''}`}>
                  <div className={`w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0 ${formatoCor[rel.formato]}`}>
                    <i className={`${formatoIcon[rel.formato]} text-xl`}></i>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-bold text-gray-800 truncate">{rel.titulo}</p>
                      {rel.status === 'Gerando' && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 whitespace-nowrap flex-shrink-0">Gerando...</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{rel.descricao}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <i className="ri-time-line text-[10px]"></i>
                        {rel.data_geracao} às {rel.hora_geracao}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <i className="ri-user-line text-[10px]"></i>
                        {rel.gerado_por}
                      </span>
                      {rel.tamanho !== '—' && (
                        <span className="text-[10px] text-gray-400">{rel.tamanho}</span>
                      )}
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                        modulosDisponiveis.find(m => m.label === rel.modulo)?.cor || 'bg-gray-100 text-gray-500'
                      }`}>{rel.modulo}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {rel.status === 'Gerando' ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-[#00A86B] rounded-full animate-spin"></div>
                        <span className="text-[10px]">Processando</span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleBaixar(rel.id, rel.titulo, rel.formato)}
                          disabled={baixando === rel.id}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                            baixando === rel.id
                              ? 'bg-gray-100 text-gray-400'
                              : rel.formato === 'PDF'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {baixando === rel.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
                              Baixando...
                            </>
                          ) : (
                            <>
                              <i className="ri-download-2-line text-xs"></i>
                              Baixar {rel.formato}
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setVisualizando(rel)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                          title="Visualizar detalhes"
                        >
                          <i className="ri-eye-line text-gray-500 text-sm"></i>
                        </button>
                        <DropdownMaisOpcoes rel={rel} onDelete={handleDelete} onShare={handleShare} />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Módulos com Exportação Disponível</h3>
          <div className="grid grid-cols-6 gap-3">
            {modulosDisponiveis.map((m) => (
              <button
                key={m.label}
                onClick={() => { setFiltroModulo(m.label); setShowModal(true); }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group"
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${m.cor} group-hover:scale-110 transition-transform`}>
                  <i className={`${m.icon} text-lg`}></i>
                </div>
                <p className="text-[10px] font-semibold text-gray-600 text-center leading-tight">{m.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <ModalGerarRelatorio
          onClose={() => setShowModal(false)}
          onGerar={handleGerar}
        />
      )}

      {visualizando && (
        <ModalVisualizarRelatorio
          rel={visualizando}
          onClose={() => setVisualizando(null)}
        />
      )}
    </MainLayout>
  );
}