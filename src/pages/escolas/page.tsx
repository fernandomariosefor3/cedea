import { useState } from 'react';
import MainLayout from '@/components/feature/MainLayout';
import { useData, EscolaEditavel } from '@/context/DataContext';
import ModalEditarEscola from './components/ModalEditarEscola';
import ModalNovaEscola, { NovaEscolaInput } from './components/ModalNovaEscola';
import GraficosEscola from './components/GraficosEscola';
import AnaliseIA from '@/components/feature/AnaliseIA';
import HistoricoVisitasEscola from './components/HistoricoVisitasEscola';

const semaforo: Record<string, string> = {
  verde: 'bg-emerald-400',
  amarelo: 'bg-yellow-400',
  vermelho: 'bg-red-500',
};
const semaforoLabel: Record<string, string> = { verde: 'Ótimo', amarelo: 'Atenção', vermelho: 'Crítico' };
const semaforoText: Record<string, string> = {
  verde: 'text-emerald-700 bg-emerald-50',
  amarelo: 'text-yellow-700 bg-yellow-50',
  vermelho: 'text-red-700 bg-red-50',
};
const TABS = ['Visão Geral', 'Visitas', 'Gráficos', 'Análise IA'] as const;
const tabs = TABS;

export default function EscolasPage() {
  const { escolas, loading, error, updateEscola, createEscola, deleteEscola } = useData();
  const [selected, setSelected] = useState<EscolaEditavel | null>(null);
  const [activeTab, setActiveTab] = useState('Visão Geral');
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'verde' | 'amarelo' | 'vermelho'>('todos');
  const [editando, setEditando] = useState(false);
  const [criando, setCriando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [savedToastMsg, setSavedToastMsg] = useState('Escola atualizada com sucesso!');

  const filtered = escolas.filter((e) => {
    const matchSearch = e.nome.toLowerCase().includes(search.toLowerCase());
    const matchFiltro = filtro === 'todos' || e.statusSemaforo === filtro;
    return matchSearch && matchFiltro;
  });

  const handleSave = async (data: Partial<EscolaEditavel>) => {
    if (!selected) return;
    const success = await updateEscola(selected.id, data);
    setSelected({ ...selected, ...data });
    setEditando(false);
    setSavedToastMsg('Escola atualizada com sucesso!');
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
    if (!success) console.warn('Erro ao salvar no Supabase, mas UI foi atualizada.');
  };

  const handleCreate = async (data: NovaEscolaInput): Promise<boolean> => {
    const success = await createEscola(data);
    if (success) {
      setCriando(false);
      setSavedToastMsg('Escola cadastrada com sucesso!');
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }
    return success;
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    const success = await deleteEscola(selected.id);
    setDeleting(false);
    if (success) {
      setSelected(null);
      setConfirmDelete(false);
      setSavedToastMsg('Escola excluída com sucesso!');
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#00A86B] rounded-full animate-spin"></div>
            <span className="text-sm">Carregando escolas...</span>
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
          {savedToastMsg}
        </div>
      )}

      <div className="flex gap-6">
        {/* Lista lateral */}
        <div className="w-80 flex-shrink-0 space-y-3">
          <button
            onClick={() => setCriando(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#00A86B] text-white text-xs font-bold py-2.5 rounded-lg hover:bg-[#009960] cursor-pointer transition-colors whitespace-nowrap"
          >
            <i className="ri-add-line text-sm"></i>
            Nova Escola
          </button>
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar escola..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#00A86B]"
            />
          </div>
          <div className="flex gap-1.5">
            {(['todos', 'verde', 'amarelo', 'vermelho'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`flex-1 text-[10px] font-semibold py-1.5 rounded-full cursor-pointer transition-all whitespace-nowrap ${filtro === f ? 'bg-[#0F2744] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
              >
                {f === 'todos' ? 'Todos' : semaforoLabel[f]}
              </button>
            ))}
          </div>
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filtered.map((escola) => (
              <div
                key={escola.id}
                onClick={() => { setSelected(escola); setActiveTab('Visão Geral'); setConfirmDelete(false); }}
                className={`bg-white rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-0.5 ${selected?.id === escola.id ? 'ring-2 ring-[#00A86B]' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{escola.nome}</p>
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-0.5 ${semaforo[escola.statusSemaforo]}`}></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{escola.diretor}</p>
                <div className="flex gap-3 mt-2">
                  <span className="text-[10px] text-gray-500">Meta 26: <strong className="text-gray-700">{escola.ideb}</strong></span>
                  <span className="text-[10px] text-gray-500">Aprov: <strong className="text-gray-700">{escola.aprovacao}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Painel principal */}
        <div className="flex-1">
          {!selected ? (
            <div className="bg-white rounded-xl h-96 flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                <i className="ri-school-line text-3xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 font-medium">Selecione uma escola para ver o perfil completo</p>
              <p className="text-gray-400 text-sm mt-1">{escolas.length} escolas disponíveis na regional</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl">
              {/* Header da escola */}
              <div className="relative h-44 rounded-t-xl overflow-hidden">
                <img src={selected.foto} alt={selected.nome} className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-white font-bold text-lg leading-tight">{selected.nome}</h2>
                      <p className="text-white/70 text-xs mt-1">{selected.endereco}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${semaforoText[selected.statusSemaforo]}`}>
                        {semaforoLabel[selected.statusSemaforo]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Barra de ações abaixo do header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                <p className="text-xs text-gray-400">{selected.diretor}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-100 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <i className="ri-delete-bin-line text-xs"></i>
                    Excluir
                  </button>
                  <button
                    onClick={() => setEditando(true)}
                    className="flex items-center gap-1.5 bg-[#0F2744] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#1a3a5c] cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <i className="ri-edit-line text-xs"></i>
                    Editar Escola
                  </button>
                </div>
              </div>

              {/* Diálogo de confirmação de exclusão */}
              {confirmDelete && (
                <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-full flex-shrink-0">
                      <i className="ri-error-warning-line text-red-600 text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-red-700">Confirmar exclusão</p>
                      <p className="text-xs text-red-600 mt-0.5">
                        Tem certeza que deseja excluir <strong>{selected.nome}</strong>? Esta ação não pode ser desfeita.
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-red-700 cursor-pointer transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          {deleting ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Excluindo...</> : <><i className="ri-delete-bin-line text-xs"></i> Sim, excluir</>}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="text-xs font-semibold text-gray-600 px-4 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors whitespace-nowrap"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-gray-100 px-6">
                <div className="flex gap-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeTab === tab ? 'border-[#00A86B] text-[#00A86B]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                      {tab === 'Análise IA' && <i className="ri-sparkling-line text-xs"></i>}
                      {tab === 'Visitas' && <i className="ri-map-pin-line text-xs"></i>}
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conteúdo das tabs */}
              <div className="p-6">
                {activeTab === 'Visão Geral' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Informações</h4>
                        {[
                          { icon: 'ri-user-line', label: 'Diretor(a)', value: selected.diretor },
                          { icon: 'ri-phone-line', label: 'Telefone', value: selected.telefone },
                          { icon: 'ri-mail-line', label: 'E-mail', value: selected.email },
                          { icon: 'ri-group-line', label: 'Professores', value: `${selected.professores || '—'} docentes` },
                          { icon: 'ri-building-line', label: 'Turmas', value: `${selected.turmas || '—'} turmas` },
                        ].map((item) => (
                          <div key={item.label} className="flex items-start gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0">
                              <i className={`${item.icon} text-gray-500 text-sm`}></i>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400">{item.label}</p>
                              <p className="text-xs text-gray-700 font-medium">{item.value}</p>
                            </div>
                          </div>
                        ))}
                        {selected.tipoEscola && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0">
                              <i className="ri-school-line text-gray-500 text-sm"></i>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400">Tipo</p>
                              <p className="text-xs text-gray-700 font-medium">{selected.tipoEscola.split(' — ')[0]}</p>
                            </div>
                          </div>
                        )}
                        {selected.zona && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0">
                              <i className={`${selected.zona === 'Urbana' ? 'ri-building-2-line' : 'ri-plant-line'} text-gray-500 text-sm`}></i>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400">Zona</p>
                              <p className="text-xs text-gray-700 font-medium">{selected.zona}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="col-span-2 grid grid-cols-3 gap-3">
                        {[
                          { label: 'Meta 2026', value: selected.ideb.toFixed(1), color: 'text-[#0F2744]', bg: 'bg-[#0F2744]/5' },
                          { label: 'Aprovação', value: `${selected.aprovacao}%`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                          { label: 'Evasão', value: `${selected.evasao}%`, color: 'text-orange-500', bg: 'bg-orange-50' },
                          { label: 'Frequência', value: `${selected.frequencia}%`, color: 'text-violet-600', bg: 'bg-violet-50' },
                          { label: 'Matrículas', value: selected.matriculas.toString(), color: 'text-teal-600', bg: 'bg-teal-50' },
                          { label: 'SIGE', value: `${selected.preenchimentoSige}%`, color: 'text-teal-600', bg: 'bg-teal-50' },
                        ].map((item) => (
                          <div key={item.label} className={`${item.bg} rounded-xl p-4`}>
                            <p className="text-[10px] text-gray-500 font-medium">{item.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mapa de localização */}
                    {selected.mapUrl && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                            <i className="ri-map-pin-line text-[#0F2744]"></i>
                            Localização
                          </h4>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.endereco)}`}
                            target="_blank"
                            rel="nofollow noreferrer"
                            className="text-[10px] text-[#0F2744] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <i className="ri-external-link-line text-[10px]"></i>
                            Abrir no Google Maps
                          </a>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-gray-100 h-48">
                          <iframe
                            src={selected.mapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Localização de ${selected.nome}`}
                          ></iframe>
                        </div>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <i className="ri-map-pin-2-line text-[10px]"></i>
                          {selected.endereco}
                        </p>
                      </div>
                    )}

                    {selected.observacoes && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-amber-700 mb-1">Observações</p>
                        <p className="text-xs text-amber-800">{selected.observacoes}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Gráficos' && (
                  <GraficosEscola escola={selected} />
                )}

                {activeTab === 'Análise IA' && (
                  <div className="space-y-4">
                    <AnaliseIA
                      titulo={`Análise IA — ${selected.nome}`}
                      contexto={selected.nome}
                      dados={{
                        aprovacao: selected.aprovacao,
                        evasao: selected.evasao,
                        frequencia: selected.frequencia,
                        sige: selected.preenchimentoSige,
                        ideb: selected.ideb,
                      }}
                    />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-3">Pontos Fortes</p>
                        <ul className="space-y-2">
                          {selected.aprovacao >= 90 && <li className="flex items-center gap-2 text-xs text-gray-600"><i className="ri-checkbox-circle-fill text-emerald-500"></i>Aprovação acima de 90%</li>}
                          {selected.evasao <= 2 && <li className="flex items-center gap-2 text-xs text-gray-600"><i className="ri-checkbox-circle-fill text-emerald-500"></i>Evasão controlada</li>}
                          {selected.frequencia >= 90 && <li className="flex items-center gap-2 text-xs text-gray-600"><i className="ri-checkbox-circle-fill text-emerald-500"></i>Frequência dentro da meta</li>}
                          {selected.preenchimentoSige >= 90 && <li className="flex items-center gap-2 text-xs text-gray-600"><i className="ri-checkbox-circle-fill text-emerald-500"></i>SIGE em dia</li>}
                          {selected.ideb >= 6.5 && <li className="flex items-center gap-2 text-xs text-gray-600"><i className="ri-checkbox-circle-fill text-emerald-500"></i>IDEB acima da média</li>}
                          {selected.aprovacao < 90 && selected.evasao > 2 && selected.frequencia < 90 && selected.preenchimentoSige < 90 && selected.ideb < 6.5 && (
                            <li className="text-xs text-gray-400 italic">Nenhum ponto forte identificado ainda</li>
                          )}
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-3">Pontos de Atenção</p>
                        <ul className="space-y-2">
                          {selected.aprovacao < 90 && <li className="flex items-center gap-2 text-xs text-gray-600"><i className="ri-error-warning-line text-orange-400"></i>Aprovação abaixo da meta</li>}
                          {selected.evasao > 2 && <li className="flex items-center gap-2 text-xs text-gray-600"><i className="ri-error-warning-line text-orange-400"></i>Evasão acima do tolerável</li>}
                          {selected.frequencia < 90 && <li className="flex items-center gap-2 text-xs text-gray-600"><i className="ri-error-warning-line text-orange-400"></i>Frequência abaixo da meta</li>}
                          {selected.preenchimentoSige < 80 && <li className="flex items-center gap-2 text-xs text-gray-600"><i className="ri-error-warning-line text-orange-400"></i>SIGE com preenchimento baixo</li>}
                          {selected.ideb < 6 && <li className="flex items-center gap-2 text-xs text-gray-600"><i className="ri-error-warning-line text-orange-400"></i>IDEB abaixo da média regional</li>}
                          {selected.aprovacao >= 90 && selected.evasao <= 2 && selected.frequencia >= 90 && selected.preenchimentoSige >= 80 && selected.ideb >= 6 && (
                            <li className="text-xs text-gray-400 italic">Nenhum ponto crítico identificado</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Visitas' && (
                  <HistoricoVisitasEscola
                    escolaId={selected.id}
                    escolaNome={selected.nome}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {editando && selected && (
        <ModalEditarEscola
          escola={selected}
          onSave={handleSave}
          onClose={() => setEditando(false)}
        />
      )}
      {criando && (
        <ModalNovaEscola
          onSave={handleCreate}
          onClose={() => setCriando(false)}
        />
      )}
    </MainLayout>
  );
}