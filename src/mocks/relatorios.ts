export type FormatoRelatorio = 'PDF' | 'Excel';
export type StatusRelatorio = 'Pronto' | 'Gerando' | 'Erro';

export interface Relatorio {
  id: number;
  titulo: string;
  descricao: string;
  modulo: string;
  formato: FormatoRelatorio;
  tamanho: string;
  dataGeracao: string;
  horaGeracao: string;
  geradoPor: string;
  status: StatusRelatorio;
  periodo: string;
  escola: string | null;
}

export const relatorios: Relatorio[] = [
  {
    id: 1,
    titulo: 'Fluxo Escolar — Regional 1 — Março 2026',
    descricao: 'Frequência, matrícula, aprovação e evasão de todas as escolas da regional no mês de março.',
    modulo: 'Fluxo Escolar',
    formato: 'PDF',
    tamanho: '2,4 MB',
    dataGeracao: '01/04/2026',
    horaGeracao: '08:15',
    geradoPor: 'Superintendente Regional',
    status: 'Pronto',
    periodo: 'Março 2026',
    escola: null,
  },
  {
    id: 2,
    titulo: 'Preenchimento SIGE — Bimestre 1/2026',
    descricao: 'Percentual de preenchimento de notas por escola e por disciplina no primeiro bimestre.',
    modulo: 'Preenchimento de Notas',
    formato: 'Excel',
    tamanho: '1,1 MB',
    dataGeracao: '31/03/2026',
    horaGeracao: '17:42',
    geradoPor: 'Superintendente Regional',
    status: 'Pronto',
    periodo: 'Bimestre 1/2026',
    escola: null,
  },
  {
    id: 3,
    titulo: 'CdG Cearense — Status por Escola — Abril 2026',
    descricao: 'Situação de cada escola nas 5 etapas do Ciclo de Gestão Cearense com evidências registradas.',
    modulo: 'CdG Cearense',
    formato: 'PDF',
    tamanho: '3,7 MB',
    dataGeracao: '02/04/2026',
    horaGeracao: '09:00',
    geradoPor: 'Superintendente Regional',
    status: 'Pronto',
    periodo: 'Abril 2026',
    escola: null,
  },
  {
    id: 4,
    titulo: 'Ranking de Escolas — IDEB e Aprovação — 2026',
    descricao: 'Classificação geral das escolas por IDEB, taxa de aprovação e status do CdG.',
    modulo: 'Dashboard',
    formato: 'PDF',
    tamanho: '1,8 MB',
    dataGeracao: '28/03/2026',
    horaGeracao: '14:30',
    geradoPor: 'Superintendente Regional',
    status: 'Pronto',
    periodo: '1º Semestre 2026',
    escola: null,
  },
  {
    id: 5,
    titulo: 'Planos de Ação — Execução e Pendências',
    descricao: 'Relatório consolidado de todos os planos de ação ativos, com percentual de execução e ações pendentes.',
    modulo: 'Plano de Ação',
    formato: 'Excel',
    tamanho: '0,9 MB',
    dataGeracao: '30/03/2026',
    horaGeracao: '11:20',
    geradoPor: 'Superintendente Regional',
    status: 'Pronto',
    periodo: 'Março 2026',
    escola: null,
  },
  {
    id: 6,
    titulo: 'Fluxo Escolar — EEFM Dom Lustosa',
    descricao: 'Análise detalhada de frequência, evasão e aprovação da EEFM Dom Lustosa no 1º bimestre.',
    modulo: 'Fluxo Escolar',
    formato: 'PDF',
    tamanho: '1,2 MB',
    dataGeracao: '25/03/2026',
    horaGeracao: '16:05',
    geradoPor: 'Superintendente Regional',
    status: 'Pronto',
    periodo: 'Bimestre 1/2026',
    escola: 'EEFM Dom Lustosa',
  },
  {
    id: 7,
    titulo: 'Indicadores Gerais — Regional 1 — Fevereiro 2026',
    descricao: 'Painel consolidado de KPIs da regional: aprovação, evasão, frequência e SIGE.',
    modulo: 'Dashboard',
    formato: 'PDF',
    tamanho: '2,0 MB',
    dataGeracao: '01/03/2026',
    horaGeracao: '07:50',
    geradoPor: 'Superintendente Regional',
    status: 'Pronto',
    periodo: 'Fevereiro 2026',
    escola: null,
  },
  {
    id: 8,
    titulo: 'SIGE — Escolas Críticas — Março 2026',
    descricao: 'Lista de escolas com preenchimento SIGE abaixo de 50%, com histórico de cobranças enviadas.',
    modulo: 'Preenchimento de Notas',
    formato: 'Excel',
    tamanho: '0,6 MB',
    dataGeracao: '20/03/2026',
    horaGeracao: '13:10',
    geradoPor: 'Superintendente Regional',
    status: 'Pronto',
    periodo: 'Março 2026',
    escola: null,
  },
];

export const modulosDisponiveis = [
  { label: 'Dashboard', icon: 'ri-dashboard-3-line', cor: 'bg-[#0F2744]/10 text-[#0F2744]' },
  { label: 'Fluxo Escolar', icon: 'ri-flow-chart', cor: 'bg-emerald-50 text-emerald-700' },
  { label: 'Preenchimento de Notas', icon: 'ri-file-list-3-line', cor: 'bg-violet-50 text-violet-700' },
  { label: 'CdG Cearense', icon: 'ri-loop-right-line', cor: 'bg-orange-50 text-orange-700' },
  { label: 'Plano de Ação', icon: 'ri-task-line', cor: 'bg-teal-50 text-teal-700' },
  { label: 'Escolas da Regional', icon: 'ri-school-line', cor: 'bg-yellow-50 text-yellow-700' },
];
