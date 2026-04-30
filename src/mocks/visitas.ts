export type StatusVisita = 'Agendada' | 'Realizada' | 'Cancelada' | 'Reagendada';
export type StatusEncaminhamento = 'Pendente' | 'Em andamento' | 'Concluído';
export type TipoVisita = 'Acompanhamento CdG' | 'Intervenção Pedagógica' | 'SMAR' | 'Plano de Ação' | 'Busca Ativa' | 'Visita Técnica Geral';

export interface Encaminhamento {
  id: number;
  descricao: string;
  responsavel: string;
  prazo: string;
  status: StatusEncaminhamento;
}

export interface Visita {
  id: number;
  escolaId: number;
  escolaNome: string;
  data: string;
  hora: string;
  tipo: TipoVisita;
  objetivo: string;
  status: StatusVisita;
  relato: string;
  pontosFortesObservados: string;
  pontosAtencao: string;
  encaminhamentos: Encaminhamento[];
  criadoEm: string;
}

export const visitasMock: Visita[] = [
  {
    id: 1,
    escolaId: 3,
    escolaNome: 'EEFM Dom Lustosa',
    data: '2026-03-07',
    hora: '08:00',
    tipo: 'Acompanhamento CdG',
    objetivo: 'Acompanhamento CdG — Etapa Execução e verificação de indicadores críticos',
    status: 'Realizada',
    relato: 'Visita realizada com presença da diretora Maria José e coordenadores pedagógicos. Identificadas fragilidades no preenchimento do SIGE e baixa frequência em turmas do 2º ano. Equipe demonstrou comprometimento com as metas.',
    pontosFortesObservados: 'Boa receptividade da equipe gestora. Projeto de leitura em andamento com resultados positivos nas turmas do 1º ano.',
    pontosAtencao: 'Preenchimento SIGE abaixo de 70%. Frequência de 3 turmas abaixo de 80%. Evasão crescente no turno noturno.',
    encaminhamentos: [
      { id: 1, descricao: 'Elevar preenchimento SIGE para 90% até 30/04', responsavel: 'Maria José Rodrigues', prazo: '2026-04-30', status: 'Em andamento' },
      { id: 2, descricao: 'Realizar busca ativa dos alunos ausentes do turno noturno', responsavel: 'Coordenação Pedagógica', prazo: '2026-04-15', status: 'Pendente' },
      { id: 3, descricao: 'Apresentar plano de recuperação de frequência na próxima visita', responsavel: 'Maria José Rodrigues', prazo: '2026-04-07', status: 'Concluído' },
    ],
    criadoEm: '2026-03-07T10:30:00',
  },
  {
    id: 2,
    escolaId: 6,
    escolaNome: 'EEFM Joaquim Nabuco',
    data: '2026-03-09',
    hora: '09:30',
    tipo: 'Intervenção Pedagógica',
    objetivo: 'Intervenção urgente — evasão crítica e SIGE abaixo de 50%',
    status: 'Realizada',
    relato: 'Situação crítica confirmada. Evasão de 5,8% com concentração no 3º ano noturno. Diretor Paulo Henrique apresentou dificuldades na gestão da equipe. SIGE com apenas 45% de preenchimento. Necessária intervenção imediata.',
    pontosFortesObservados: 'Professores de matemática com bom engajamento. Infraestrutura da escola em bom estado.',
    pontosAtencao: 'Evasão acima de 5%. SIGE crítico. Baixo engajamento da coordenação pedagógica. Ausência de plano de ação estruturado.',
    encaminhamentos: [
      { id: 4, descricao: 'Elaborar Plano de Ação emergencial para redução de evasão', responsavel: 'Paulo Henrique Dias', prazo: '2026-03-20', status: 'Concluído' },
      { id: 5, descricao: 'Completar preenchimento SIGE — mínimo 80%', responsavel: 'Secretaria Escolar', prazo: '2026-04-10', status: 'Em andamento' },
      { id: 6, descricao: 'Reunião com pais dos alunos em risco de evasão', responsavel: 'Paulo Henrique Dias', prazo: '2026-03-25', status: 'Concluído' },
    ],
    criadoEm: '2026-03-09T11:00:00',
  },
  {
    id: 3,
    escolaId: 4,
    escolaNome: 'EEFM Liceu do Conjunto Ceará',
    data: '2026-03-11',
    hora: '14:00',
    tipo: 'Plano de Ação',
    objetivo: 'Revisão e validação do Plano de Ação 2026',
    status: 'Realizada',
    relato: 'Plano de Ação revisado com a equipe gestora. Metas ajustadas para aprovação (meta: 93%) e frequência (meta: 90%). Ações bem estruturadas, porém com cronograma apertado. CdG na etapa 3 com atraso de 2 semanas.',
    pontosFortesObservados: 'Plano de Ação bem elaborado. Equipe pedagógica engajada. Bom relacionamento com a comunidade escolar.',
    pontosAtencao: 'CdG com atraso. Frequência de 88,7% ainda abaixo da meta. Necessidade de reforço nas ações de recomposição.',
    encaminhamentos: [
      { id: 7, descricao: 'Concluir etapa 4 do CdG até 20/04', responsavel: 'Roberto Alves Sousa', prazo: '2026-04-20', status: 'Em andamento' },
      { id: 8, descricao: 'Implementar ações de recomposição de aprendizagens no contra turno', responsavel: 'Coordenação Pedagógica', prazo: '2026-04-30', status: 'Pendente' },
    ],
    criadoEm: '2026-03-11T15:30:00',
  },
  {
    id: 4,
    escolaId: 2,
    escolaNome: 'EEFM Presidente Castelo Branco',
    data: '2026-04-14',
    hora: '10:00',
    tipo: 'SMAR',
    objetivo: 'SMAR — Análise de resultados do 1º bimestre',
    status: 'Agendada',
    relato: '',
    pontosFortesObservados: '',
    pontosAtencao: '',
    encaminhamentos: [],
    criadoEm: '2026-03-20T09:00:00',
  },
  {
    id: 5,
    escolaId: 1,
    escolaNome: 'EEFM Governador Virgílio Távora',
    data: '2026-04-18',
    hora: '08:30',
    tipo: 'Visita Técnica Geral',
    objetivo: 'Visita de acompanhamento — escola referência da regional',
    status: 'Agendada',
    relato: '',
    pontosFortesObservados: '',
    pontosAtencao: '',
    encaminhamentos: [],
    criadoEm: '2026-03-22T10:00:00',
  },
];
