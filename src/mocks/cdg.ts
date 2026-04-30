export interface EvidenciaCdG {
  id: number;
  etapaIndex: number;
  descricao: string;
  data: string;
  tipo: 'Documento' | 'Foto' | 'Ata' | 'Relatório' | 'Outro';
}

export interface ChecklistItem {
  id: number;
  etapaIndex: number;
  descricao: string;
  concluido: boolean;
}

export interface CdGEscola {
  escolaId: number;
  etapasConcluidas: number; // 0-5
  statusCdg: 'Em dia' | 'Atrasado' | 'Crítico';
  evidencias: EvidenciaCdG[];
  checklist: ChecklistItem[];
  observacoes: string;
  updatedAt: string;
}

export const checklistPadrao: Omit<ChecklistItem, 'id' | 'concluido'>[] = [
  // Etapa 0 — Planejamento
  { etapaIndex: 0, descricao: 'Diagnóstico situacional realizado' },
  { etapaIndex: 0, descricao: 'Metas e indicadores definidos' },
  { etapaIndex: 0, descricao: 'Plano de Ação elaborado e validado' },
  { etapaIndex: 0, descricao: 'Equipe gestora alinhada com o planejamento' },
  // Etapa 1 — Execução
  { etapaIndex: 1, descricao: 'Ações do Plano de Ação em execução' },
  { etapaIndex: 1, descricao: 'Monitoramento semanal de frequência ativo' },
  { etapaIndex: 1, descricao: 'Registros de acompanhamento pedagógico atualizados' },
  { etapaIndex: 1, descricao: 'SIGE com preenchimento acima de 80%' },
  // Etapa 2 — SMAR
  { etapaIndex: 2, descricao: 'Reunião SMAR realizada com equipe gestora' },
  { etapaIndex: 2, descricao: 'Análise de resultados do bimestre concluída' },
  { etapaIndex: 2, descricao: 'Ata da reunião SMAR registrada' },
  { etapaIndex: 2, descricao: 'Indicadores comparados com metas estabelecidas' },
  // Etapa 3 — Correção de Rotas
  { etapaIndex: 3, descricao: 'Fragilidades identificadas e documentadas' },
  { etapaIndex: 3, descricao: 'Plano de Ação revisado com novas estratégias' },
  { etapaIndex: 3, descricao: 'Responsáveis pelas correções definidos' },
  { etapaIndex: 3, descricao: 'Prazo para correções estabelecido' },
  // Etapa 4 — Parada Reflexiva
  { etapaIndex: 4, descricao: 'Parada Reflexiva agendada e comunicada' },
  { etapaIndex: 4, descricao: 'Participação de toda a equipe pedagógica' },
  { etapaIndex: 4, descricao: 'Boas práticas identificadas e registradas' },
  { etapaIndex: 4, descricao: 'Encaminhamentos para o próximo ciclo definidos' },
];

export const etapasCdG = [
  { nome: 'Planejamento', icone: 'ri-draft-line', cor: '#0F2744' },
  { nome: 'Execução', icone: 'ri-play-circle-line', cor: '#00A86B' },
  { nome: 'SMAR', icone: 'ri-bar-chart-line', cor: '#F59E0B' },
  { nome: 'Correção de Rotas', icone: 'ri-route-line', cor: '#EF4444' },
  { nome: 'Parada Reflexiva', icone: 'ri-pause-circle-line', cor: '#8B5CF6' },
];

function gerarChecklistEscola(etapasConcluidas: number): ChecklistItem[] {
  return checklistPadrao.map((item, idx) => ({
    id: idx + 1,
    ...item,
    concluido: item.etapaIndex < etapasConcluidas,
  }));
}

export const cdgEscolasMock: CdGEscola[] = [
  { escolaId: 1, etapasConcluidas: 5, statusCdg: 'Em dia', evidencias: [
    { id: 1, etapaIndex: 0, descricao: 'Ata de reunião de planejamento — 10/02/2026', data: '2026-02-10', tipo: 'Ata' },
    { id: 2, etapaIndex: 1, descricao: 'Relatório de execução do 1º bimestre', data: '2026-03-15', tipo: 'Relatório' },
  ], checklist: gerarChecklistEscola(5), observacoes: 'Escola referência — todas as etapas concluídas com excelência.', updatedAt: new Date().toISOString() },
  { escolaId: 2, etapasConcluidas: 4, statusCdg: 'Em dia', evidencias: [
    { id: 3, etapaIndex: 0, descricao: 'Diagnóstico situacional 2026', data: '2026-02-12', tipo: 'Documento' },
  ], checklist: gerarChecklistEscola(4), observacoes: '', updatedAt: new Date().toISOString() },
  { escolaId: 3, etapasConcluidas: 2, statusCdg: 'Crítico', evidencias: [], checklist: gerarChecklistEscola(2), observacoes: 'Escola com dificuldades na execução. Necessita intervenção.', updatedAt: new Date().toISOString() },
  { escolaId: 4, etapasConcluidas: 3, statusCdg: 'Atrasado', evidencias: [
    { id: 4, etapaIndex: 2, descricao: 'Ata SMAR — 1º bimestre', data: '2026-03-20', tipo: 'Ata' },
  ], checklist: gerarChecklistEscola(3), observacoes: 'CdG com atraso de 2 semanas.', updatedAt: new Date().toISOString() },
  { escolaId: 5, etapasConcluidas: 5, statusCdg: 'Em dia', evidencias: [
    { id: 5, etapaIndex: 4, descricao: 'Registro da Parada Reflexiva — 25/03/2026', data: '2026-03-25', tipo: 'Foto' },
  ], checklist: gerarChecklistEscola(5), observacoes: '', updatedAt: new Date().toISOString() },
  { escolaId: 6, etapasConcluidas: 1, statusCdg: 'Crítico', evidencias: [], checklist: gerarChecklistEscola(1), observacoes: 'Situação crítica. Apenas planejamento iniciado.', updatedAt: new Date().toISOString() },
  { escolaId: 7, etapasConcluidas: 5, statusCdg: 'Em dia', evidencias: [], checklist: gerarChecklistEscola(5), observacoes: '', updatedAt: new Date().toISOString() },
  { escolaId: 8, etapasConcluidas: 3, statusCdg: 'Atrasado', evidencias: [], checklist: gerarChecklistEscola(3), observacoes: '', updatedAt: new Date().toISOString() },
];
