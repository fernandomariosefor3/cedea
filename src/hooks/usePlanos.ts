import { useState, useEffect, useCallback } from 'react';
import { useFirebaseSync } from './useFirebaseSync';
import { supabase } from '@/lib/supabase';

export interface AcaoPlano {
  id: number;
  plano_id: number;
  descricao: string;
  responsavel: string;
  prazo: string;
  status: 'Pendente' | 'Em andamento' | 'Concluída';
}

export interface VersaoPlano {
  id: number;
  plano_id: number;
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
  status: 'Ativo' | 'Concluído' | 'Revisão';
  created_at: string;
  updated_at: string;
  acoes: AcaoPlano[];
  versoes: VersaoPlano[];
}

export interface NovoPlanoInput {
  titulo: string;
  escola: string;
  problema: string;
  objetivo: string;
  prazo: string;
  status: 'Ativo' | 'Concluído' | 'Revisão';
}

export function usePlanos() {
  const [planos, setPlanos] = useState<PlanoAcao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('planos_acao')
        .select('*, acoes:acoes_plano(*), versoes:versoes_plano(*)')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setPlanos((data ?? []) as PlanoAcao[]);
    } catch (e) {
      setError('Erro ao carregar planos.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlanos();
  }, [fetchPlanos]);

  useFirebaseSync('planos_acao', fetchPlanos);

  const addPlano = useCallback(async (input: NovoPlanoInput): Promise<PlanoAcao | null> => {
    try {
      const now = new Date();
      const { data: novo, error: err } = await supabase
        .from('planos_acao')
        .insert(input)
        .select()
        .maybeSingle();

      if (err || !novo) throw err;

      // Cria versão inicial
      await supabase.from('versoes_plano').insert({
        plano_id: novo.id,
        data: now.toISOString().split('T')[0],
        hora: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        autor: 'Superintendente Regional',
        status: 'Rascunho',
      });

      await fetchPlanos();
      const updated = await supabase
        .from('planos_acao')
        .select('*, acoes:acoes_plano(*), versoes:versoes_plano(*)')
        .eq('id', novo.id)
        .maybeSingle();

      return updated.data as PlanoAcao;
    } catch (e) {
      console.error('Erro ao criar plano:', e);
      return null;
    }
  }, [fetchPlanos]);

  const updatePlano = useCallback(async (id: number, input: Partial<NovoPlanoInput>): Promise<boolean> => {
    try {
      const now = new Date();
      const { error: err } = await supabase
        .from('planos_acao')
        .update({ ...input, updated_at: now.toISOString() })
        .eq('id', id);

      if (err) throw err;

      // Adiciona versão de revisão
      await supabase.from('versoes_plano').insert({
        plano_id: id,
        data: now.toISOString().split('T')[0],
        hora: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        autor: 'Superintendente Regional',
        status: 'Revisado',
      });

      await fetchPlanos();
      return true;
    } catch (e) {
      console.error('Erro ao atualizar plano:', e);
      return false;
    }
  }, [fetchPlanos]);

  const deletePlano = useCallback(async (id: number): Promise<boolean> => {
    try {
      const { error: err } = await supabase.from('planos_acao').delete().eq('id', id);
      if (err) throw err;
      setPlanos(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (e) {
      console.error('Erro ao excluir plano:', e);
      return false;
    }
  }, []);

  const addAcao = useCallback(async (
    planoId: number,
    acao: Omit<AcaoPlano, 'id' | 'plano_id'>
  ): Promise<boolean> => {
    try {
      const { error: err } = await supabase
        .from('acoes_plano')
        .insert({ ...acao, plano_id: planoId });

      if (err) throw err;

      // Adiciona versão
      const now = new Date();
      await supabase.from('versoes_plano').insert({
        plano_id: planoId,
        data: now.toISOString().split('T')[0],
        hora: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        autor: 'Superintendente Regional',
        status: 'Revisado',
      });

      await fetchPlanos();
      return true;
    } catch (e) {
      console.error('Erro ao adicionar ação:', e);
      return false;
    }
  }, [fetchPlanos]);

  const updateAcao = useCallback(async (
    acaoId: number,
    data: Partial<AcaoPlano>
  ): Promise<boolean> => {
    try {
      const { error: err } = await supabase
        .from('acoes_plano')
        .update(data)
        .eq('id', acaoId);

      if (err) throw err;

      setPlanos(prev =>
        prev.map(p => ({
          ...p,
          acoes: p.acoes.map(a => (a.id === acaoId ? { ...a, ...data } : a)),
        }))
      );
      return true;
    } catch (e) {
      console.error('Erro ao atualizar ação:', e);
      return false;
    }
  }, []);

  const deleteAcao = useCallback(async (acaoId: number, planoId: number): Promise<boolean> => {
    try {
      const { error: err } = await supabase.from('acoes_plano').delete().eq('id', acaoId);
      if (err) throw err;

      setPlanos(prev =>
        prev.map(p => {
          if (p.id !== planoId) return p;
          return { ...p, acoes: p.acoes.filter(a => a.id !== acaoId) };
        })
      );
      return true;
    } catch (e) {
      console.error('Erro ao excluir ação:', e);
      return false;
    }
  }, []);

  return {
    planos,
    loading,
    error,
    addPlano,
    updatePlano,
    deletePlano,
    addAcao,
    updateAcao,
    deleteAcao,
    refetch: fetchPlanos,
  };
}
