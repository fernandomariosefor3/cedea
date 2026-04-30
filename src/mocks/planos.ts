export interface AcaoPlano {
  id: number;
  descricao: string;
  responsavel: string;
  prazo: string;
  status: 'Pendente' | 'Em andamento' | 'Concluída';
}

export interface VersaoPlano {
  id: number;
  data: string;
  hora: string;
  autor: string;
  status: 'Rascunho' | 'Publicado' | 'Revisado';
}

export interface PlanoAcao {
  id: number;
  titulo: string;
  escola: string;
  problema: string;
  objetivo: string;
  prazo: string;
  acoes: AcaoPlano[];
  versoes: VersaoPlano[];
  status: 'Ativo' | 'Concluído' | 'Revisão';
}

export const planos: PlanoAcao[] = [
  {
    id: 1,
    titulo: 'Redução da Evasão Escolar — 2026',
    escola: 'EEFM Dom Lustosa',
    problema: 'Taxa de evasão de 4,1% no 1º semestre, acima da meta regional de 2%. Identificados 31 alunos em risco de abandono, principalmente no 1º ano do Ensino Médio.',
    objetivo: 'Reduzir a taxa de evasão para abaixo de 2% até dezembro de 2026, por meio de ações de busca ativa, acompanhamento individualizado e fortalecimento do vínculo escola-família.',
    prazo: '31/12/2026',
    status: 'Ativo',
    acoes: [
      { id: 1, descricao: 'Mapear todos os alunos com mais de 5 faltas consecutivas', responsavel: 'Coordenação Pedagógica', prazo: '10/04/2026', status: 'Concluída' },
      { id: 2, descricao: 'Realizar visitas domiciliares para alunos evadidos', responsavel: 'PPDT + Assistente Social', prazo: '20/04/2026', status: 'Em andamento' },
      { id: 3, descricao: 'Implementar projeto de tutoria entre pares', responsavel: 'Coordenação Pedagógica', prazo: '30/04/2026', status: 'Pendente' },
      { id: 4, descricao: 'Reunião com famílias dos alunos em risco', responsavel: 'Direção + PPDT', prazo: '15/04/2026', status: 'Em andamento' },
    ],
    versoes: [
      { id: 1, data: '01/03/2026', hora: '09:15', autor: 'Maria José Rodrigues', status: 'Rascunho' },
      { id: 2, data: '10/03/2026', hora: '14:30', autor: 'Superintendente Regional', status: 'Revisado' },
      { id: 3, data: '15/03/2026', hora: '11:00', autor: 'Maria José Rodrigues', status: 'Publicado' },
    ],
  },
  {
    id: 2,
    titulo: 'Melhoria do Preenchimento SIGE',
    escola: 'EEFM Joaquim Nabuco',
    problema: 'Apenas 45% das notas lançadas no SIGE, comprometendo o monitoramento pedagógico e o repasse de recursos.',
    objetivo: 'Atingir 100% de preenchimento do SIGE até o fechamento do bimestre em 30/04/2026.',
    prazo: '30/04/2026',
    status: 'Ativo',
    acoes: [
      { id: 1, descricao: 'Capacitação de professores no uso do SIGE', responsavel: 'Coordenação TI', prazo: '08/04/2026', status: 'Concluída' },
      { id: 2, descricao: 'Monitoramento diário do preenchimento por disciplina', responsavel: 'Coordenação Pedagógica', prazo: '30/04/2026', status: 'Em andamento' },
      { id: 3, descricao: 'Relatório semanal para superintendência', responsavel: 'Direção', prazo: '30/04/2026', status: 'Em andamento' },
    ],
    versoes: [
      { id: 1, data: '20/03/2026', hora: '10:00', autor: 'Paulo Henrique Dias', status: 'Rascunho' },
      { id: 2, data: '25/03/2026', hora: '16:00', autor: 'Superintendente Regional', status: 'Publicado' },
    ],
  },
  {
    id: 3,
    titulo: 'Fortalecimento do CdG — Etapas 3 e 4',
    escola: 'EEFM Liceu do Conjunto Ceará',
    problema: 'Escola parada na etapa 3 (SMAR) do Ciclo de Gestão há 6 semanas, sem avanço para Correção de Rotas.',
    objetivo: 'Concluir as etapas SMAR e Correção de Rotas até 30/04/2026, com evidências documentadas.',
    prazo: '30/04/2026',
    status: 'Revisão',
    acoes: [
      { id: 1, descricao: 'Realizar reunião de SMAR com equipe gestora', responsavel: 'Direção + Superintendência', prazo: '12/04/2026', status: 'Pendente' },
      { id: 2, descricao: 'Elaborar relatório de análise de resultados', responsavel: 'Coordenação Pedagógica', prazo: '18/04/2026', status: 'Pendente' },
      { id: 3, descricao: 'Definir correções de rota com metas revisadas', responsavel: 'Equipe Gestora', prazo: '25/04/2026', status: 'Pendente' },
    ],
    versoes: [
      { id: 1, data: '28/03/2026', hora: '08:30', autor: 'Roberto Alves Sousa', status: 'Rascunho' },
    ],
  },
];
