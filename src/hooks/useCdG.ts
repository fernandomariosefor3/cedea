import { useState, useEffect, useCallback } from 'react';
import { useFirebaseSync } from './useFirebaseSync';
import { supabase } from '@/lib/supabase';

export interface CdGEvidencia {
  id: number;
  cdg_id: number;
  tipo: string;
  descricao: string;
  arquivo: string;
  dataUpload: string;
}

export interface CdGChecklist {
  id: number;
  cdg_id: number;
  item: string;
  concluido: boolean;
}

export interface CdGEscola {
  id: number;
  escola_id: number;
  etapas_concluidas: number;
  status_cdg: 'Em dia' | 'Atrasado' | 'Crítico';
  observacoes: string;
  updated_at: string;
  evidencias: CdGEvidencia[];
  checklist: CdGChecklist[];
}

export interface CdGInput {
  escola_id: number;
  etapas_concluidas: number;
  status_cdg: 'Em dia' | 'Atrasado' | 'Crítico';
  observacoes: string;
  checklist: Omit<CdGChecklist, 'id' | 'cdg_id'>[];
}

export const etapasCdG = [
  { nome: 'Diagnóstico', icone: 'ri-search-line' },
  { nome: 'Planejamento', icone: 'ri-calendar-todo-line' },
  { nome: 'Execução', icone: 'ri-run-line' },
  { nome: 'Monitoramento', icone: 'ri-line-chart-line' },
  { nome: 'Avaliação', icone: 'ri-award-line' },
];

export function useCdG() {
  const [cdgData, setCdgData] = useState<CdGEscola[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCdG = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('cdg_escolas')
        .select('*, evidencias:cdg_evidencias(*), checklist:cdg_checklist(*)')
        .order('updated_at', { ascending: false });

      if (err) throw err;

      const mapped = (data ?? []).map((c: Record<string, unknown>) => ({
        id: c.id as number,
        escola_id: c.escola_id as number,
        etapas_concluidas: c.etapas_concluidas as number,
        status_cdg: c.status_cdg as 'Em dia' | 'Atrasado' | 'Crítico',
        observacoes: c.observacoes as string,
        updated_at: c.updated_at as string,
        evidencias: (c.evidencias as CdGEvidencia[]) ?? [],
        checklist: (c.checklist as CdGChecklist[]) ?? [],
      }));

      setCdgData(mapped);
    } catch (e) {
      setError('Erro ao carregar dados do CdG.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCdG();
  }, [fetchCdG]);

  useFirebaseSync('cdg_escolas', fetchCdG);

  const getCdGByEscolaId = useCallback((escolaId: number): CdGEscola | undefined => {
    return cdgData.find(c => c.escola_id === escolaId);
  }, [cdgData]);

  const saveCdG = useCallback(async (input: CdGInput): Promise<boolean> => {
    try {
      const existing = cdgData.find(c => c.escola_id === input.escola_id);

      if (existing) {
        // Update
        const { error: err } = await supabase
          .from('cdg_escolas')
          .update({
            etapas_concluidas: input.etapas_concluidas,
            status_cdg: input.status_cdg,
            observacoes: input.observacoes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (err) throw err;

        // Update checklist
        await supabase.from('cdg_checklist').delete().eq('cdg_id', existing.id);
        if (input.checklist.length > 0) {
          const checklistWithId = input.checklist.map(c => ({ ...c, cdg_id: existing.id }));
          await supabase.from('cdg_checklist').insert(checklistWithId);
        }

        setCdgData(prev => prev.map(c => {
          if (c.escola_id !== input.escola_id) return c;
          return {
            ...c,
            etapas_concluidas: input.etapas_concluidas,
            status_cdg: input.status_cdg,
            observacoes: input.observacoes,
            updated_at: new Date().toISOString(),
            checklist: input.checklist.map((item, idx) => ({ ...item, id: idx, cdg_id: existing.id })),
          };
        }));
      } else {
        // Insert
        const { data: novo, error: err } = await supabase
          .from('cdg_escolas')
          .insert({
            escola_id: input.escola_id,
            etapas_concluidas: input.etapas_concluidas,
            status_cdg: input.status_cdg,
            observacoes: input.observacoes,
            updated_at: new Date().toISOString(),
          })
          .select()
          .maybeSingle();

        if (err || !novo) throw err;

        // Insert checklist
        if (input.checklist.length > 0) {
          const checklistWithId = input.checklist.map(c => ({ ...c, cdg_id: novo.id }));
          await supabase.from('cdg_checklist').insert(checklistWithId);
        }

        setCdgData(prev => [...prev, {
          id: novo.id,
          escola_id: input.escola_id,
          etapas_concluidas: input.etapas_concluidas,
          status_cdg: input.status_cdg,
          observacoes: input.observacoes,
          updated_at: new Date().toISOString(),
          evidencias: [],
          checklist: input.checklist.map((item, idx) => ({ ...item, id: idx, cdg_id: novo.id })),
        }]);
      }

      return true;
    } catch (e) {
      console.error('Erro ao salvar CdG:', e);
      return false;
    }
  }, [cdgData]);

  return {
    cdgData,
    loading,
    error,
    getCdGByEscolaId,
    saveCdG,
    refetch: fetchCdG,
  };
}