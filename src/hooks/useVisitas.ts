import { useState, useEffect, useCallback } from 'react';
import { useFirebaseSync } from './useFirebaseSync';
import { supabase, VisitaDB, EncaminhamentoDB } from '@/lib/supabase';

export type StatusVisita = 'Agendada' | 'Realizada' | 'Cancelada' | 'Reagendada';
export type StatusEncaminhamento = 'Pendente' | 'Em andamento' | 'Concluído';
export type TipoVisita =
  | 'Acompanhamento CdG'
  | 'Intervenção Pedagógica'
  | 'SMAR'
  | 'Plano de Ação'
  | 'Busca Ativa'
  | 'Visita Técnica Geral';

export interface Encaminhamento {
  id: number;
  visita_id: number;
  descricao: string;
  responsavel: string;
  prazo: string;
  status: StatusEncaminhamento;
}

export interface Visita extends VisitaDB {
  encaminhamentos: Encaminhamento[];
}

export interface NovaVisitaInput {
  escola_id: number;
  escola_nome: string;
  data: string;
  hora: string;
  tipo: TipoVisita;
  objetivo: string;
  status: StatusVisita;
  relato: string;
  pontos_fortes: string;
  pontos_atencao: string;
  encaminhamentos: Omit<Encaminhamento, 'id' | 'visita_id'>[];
}

export function useVisitas() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisitas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('visitas')
        .select('*, encaminhamentos(*)')
        .order('data', { ascending: false });

      if (err) throw err;
      setVisitas((data ?? []) as Visita[]);
    } catch (e) {
      setError('Erro ao carregar visitas.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitas();
  }, [fetchVisitas]);

  useFirebaseSync('visitas', fetchVisitas);

  const addVisita = useCallback(async (input: NovaVisitaInput): Promise<boolean> => {
    try {
      const { encaminhamentos: encs, ...visitaData } = input;

      const { data: novaVisita, error: errVisita } = await supabase
        .from('visitas')
        .insert({
          escola_id: visitaData.escola_id,
          escola_nome: visitaData.escola_nome,
          data: visitaData.data,
          hora: visitaData.hora,
          tipo: visitaData.tipo,
          objetivo: visitaData.objetivo,
          status: visitaData.status,
          relato: visitaData.relato,
          pontos_fortes: visitaData.pontos_fortes,
          pontos_atencao: visitaData.pontos_atencao,
        })
        .select()
        .maybeSingle();

      if (errVisita || !novaVisita) throw errVisita;

      if (encs.length > 0) {
        const encsComId = encs.map(e => ({ ...e, visita_id: novaVisita.id }));
        const { error: errEncs } = await supabase.from('encaminhamentos').insert(encsComId);
        if (errEncs) throw errEncs;
      }

      await fetchVisitas();
      return true;
    } catch (e) {
      console.error('Erro ao salvar visita:', e);
      return false;
    }
  }, [fetchVisitas]);

  const updateEncaminhamento = useCallback(async (
    visitaId: number,
    encId: number,
    status: StatusEncaminhamento
  ): Promise<boolean> => {
    try {
      const { error: err } = await supabase
        .from('encaminhamentos')
        .update({ status })
        .eq('id', encId);

      if (err) throw err;

      setVisitas(prev =>
        prev.map(v => {
          if (v.id !== visitaId) return v;
          return {
            ...v,
            encaminhamentos: v.encaminhamentos.map(e =>
              e.id === encId ? { ...e, status } : e
            ),
          };
        })
      );
      return true;
    } catch (e) {
      console.error('Erro ao atualizar encaminhamento:', e);
      return false;
    }
  }, []);

  const deleteVisita = useCallback(async (id: number): Promise<boolean> => {
    try {
      const { error: err } = await supabase.from('visitas').delete().eq('id', id);
      if (err) throw err;
      setVisitas(prev => prev.filter(v => v.id !== id));
      return true;
    } catch (e) {
      console.error('Erro ao excluir visita:', e);
      return false;
    }
  }, []);

  return { visitas, loading, error, addVisita, updateEncaminhamento, deleteVisita, refetch: fetchVisitas };
}
