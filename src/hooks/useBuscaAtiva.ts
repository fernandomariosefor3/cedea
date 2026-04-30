import { useState, useEffect, useCallback } from 'react';
import { useFirebaseSync } from './useFirebaseSync';
import { supabase } from '@/lib/supabase';

export interface AcaoBuscaAtiva {
  id: string;
  aluno_id: string;
  escola_id: number;
  tipo: 'ligação' | 'visita_domiciliar' | 'contato_responsavel' | 'encaminhamento_cras' | 'outro';
  descricao: string;
  resultado?: string;
  responsavel: string;
  data_acao: string;
  status: 'realizada' | 'pendente' | 'sem_sucesso';
  created_at: string;
}

export interface AlunoRisco {
  id: string;
  escola_id: number;
  escola_nome?: string;
  nome: string;
  serie: string;
  turma: string;
  turno: 'manhã' | 'tarde' | 'noite';
  dias_ausente: number;
  faltas_consecutivas: number;
  status: 'em_risco' | 'em_acompanhamento' | 'retornou' | 'evadido';
  motivo_ausencia?: string;
  responsavel?: string;
  telefone_responsavel?: string;
  endereco?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  acoes?: AcaoBuscaAtiva[];
}

export interface NovoAlunoRisco {
  escola_id: number;
  nome: string;
  serie: string;
  turma: string;
  turno: 'manhã' | 'tarde' | 'noite';
  dias_ausente: number;
  faltas_consecutivas: number;
  status: 'em_risco' | 'em_acompanhamento' | 'retornou' | 'evadido';
  motivo_ausencia?: string;
  responsavel?: string;
  telefone_responsavel?: string;
  endereco?: string;
  observacoes?: string;
}

export interface NovaAcao {
  aluno_id: string;
  escola_id: number;
  tipo: 'ligação' | 'visita_domiciliar' | 'contato_responsavel' | 'encaminhamento_cras' | 'outro';
  descricao: string;
  resultado?: string;
  responsavel: string;
  data_acao: string;
  status: 'realizada' | 'pendente' | 'sem_sucesso';
}

export function useBuscaAtiva() {
  const [alunos, setAlunos] = useState<AlunoRisco[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlunos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: alunosData, error: alunosError } = await supabase
        .from('alunos_risco')
        .select('*')
        .order('dias_ausente', { ascending: false });

      if (alunosError) throw alunosError;

      const { data: escolasData } = await supabase
        .from('escolas')
        .select('id, nome');

      const { data: acoesData } = await supabase
        .from('acoes_busca_ativa')
        .select('*')
        .order('data_acao', { ascending: false });

      const escolasMap: Record<number, string> = {};
      (escolasData || []).forEach((e: { id: number; nome: string }) => {
        escolasMap[e.id] = e.nome;
      });

      const acoesMap: Record<string, AcaoBuscaAtiva[]> = {};
      (acoesData || []).forEach((a: AcaoBuscaAtiva) => {
        if (!acoesMap[a.aluno_id]) acoesMap[a.aluno_id] = [];
        acoesMap[a.aluno_id].push(a);
      });

      const enriched: AlunoRisco[] = (alunosData || []).map((a: AlunoRisco) => ({
        ...a,
        escola_nome: escolasMap[a.escola_id] || 'Escola desconhecida',
        acoes: acoesMap[a.id] || [],
      }));

      setAlunos(enriched);
    } catch (err) {
      setError('Erro ao carregar dados de busca ativa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlunos();
  }, [fetchAlunos]);

  useFirebaseSync('busca_ativa', fetchAlunos);

  const addAluno = useCallback(async (data: NovoAlunoRisco): Promise<AlunoRisco | null> => {
    try {
      const { data: novo, error } = await supabase
        .from('alunos_risco')
        .insert([data])
        .select()
        .maybeSingle();
      if (error) throw error;
      await fetchAlunos();
      return novo;
    } catch (err) {
      console.error('Erro ao adicionar aluno:', err);
      return null;
    }
  }, [fetchAlunos]);

  const updateAluno = useCallback(async (id: string, data: Partial<AlunoRisco>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('alunos_risco')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      await fetchAlunos();
      return true;
    } catch (err) {
      console.error('Erro ao atualizar aluno:', err);
      return false;
    }
  }, [fetchAlunos]);

  const addAcao = useCallback(async (data: NovaAcao): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('acoes_busca_ativa')
        .insert([data]);
      if (error) throw error;
      await fetchAlunos();
      return true;
    } catch (err) {
      console.error('Erro ao registrar ação:', err);
      return false;
    }
  }, [fetchAlunos]);

  const stats = {
    total: alunos.length,
    emRisco: alunos.filter(a => a.status === 'em_risco').length,
    emAcompanhamento: alunos.filter(a => a.status === 'em_acompanhamento').length,
    retornaram: alunos.filter(a => a.status === 'retornou').length,
    evadidos: alunos.filter(a => a.status === 'evadido').length,
    totalAcoes: alunos.reduce((acc, a) => acc + (a.acoes?.length || 0), 0),
  };

  return { alunos, loading, error, stats, addAluno, updateAluno, addAcao, refetch: fetchAlunos };
}
