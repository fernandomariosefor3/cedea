import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Relatorio {
  id: number;
  titulo: string;
  descricao: string;
  modulo: string;
  formato: 'PDF' | 'Excel';
  tamanho: string;
  data_geracao: string;
  hora_geracao: string;
  gerado_por: string;
  status: 'Pronto' | 'Gerando';
  periodo: string;
  escola: string | null;
}

export interface NovoRelatorioInput {
  titulo: string;
  modulo: string;
  formato: 'PDF' | 'Excel';
  periodo: string;
  escola?: string | null;
}

export const modulosDisponiveis = [
  { label: 'Fluxo Escolar', icon: 'ri-flow-chart', cor: 'bg-blue-50 text-blue-600' },
  { label: 'SIGE', icon: 'ri-file-list-3-line', cor: 'bg-violet-50 text-violet-600' },
  { label: 'CdG', icon: 'ri-refresh-line', cor: 'bg-emerald-50 text-emerald-600' },
  { label: 'Visitas', icon: 'ri-map-pin-line', cor: 'bg-orange-50 text-orange-500' },
  { label: 'Planos de Ação', icon: 'ri-task-line', cor: 'bg-pink-50 text-pink-500' },
  { label: 'Notas', icon: 'ri-graduation-cap-line', cor: 'bg-teal-50 text-teal-600' },
];

export function useRelatorios() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRelatorios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('relatorios')
        .select('*')
        .order('data_geracao', { ascending: false })
        .order('hora_geracao', { ascending: false });

      if (err) throw err;

      setRelatorios((data ?? []) as Relatorio[]);
    } catch (e) {
      setError('Erro ao carregar relatórios.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRelatorios();
  }, [fetchRelatorios]);

  const addRelatorio = useCallback(async (input: NovoRelatorioInput): Promise<Relatorio | null> => {
    try {
      const now = new Date();
      const novo: Omit<Relatorio, 'id'> = {
        titulo: input.titulo,
        descricao: `Relatório gerado automaticamente para o módulo ${input.modulo}.`,
        modulo: input.modulo,
        formato: input.formato,
        tamanho: '—',
        data_geracao: now.toLocaleDateString('pt-BR'),
        hora_geracao: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        gerado_por: 'Superintendente Regional',
        status: 'Gerando',
        periodo: input.periodo,
        escola: input.escola ?? null,
      };

      const { data, error: err } = await supabase
        .from('relatorios')
        .insert(novo)
        .select()
        .maybeSingle();

      if (err || !data) throw err;

      setRelatorios(prev => [data as Relatorio, ...prev]);

      // Simula processamento
      setTimeout(async () => {
        const { error: updateErr } = await supabase
          .from('relatorios')
          .update({
            status: 'Pronto',
            tamanho: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
          })
          .eq('id', data.id);

        if (!updateErr) {
          setRelatorios(prev => prev.map(r =>
            r.id === data.id ? { ...r, status: 'Pronto', tamanho: `${(Math.random() * 3 + 0.5).toFixed(1)} MB` } : r
          ));
        }
      }, 2500);

      return data as Relatorio;
    } catch (e) {
      console.error('Erro ao criar relatório:', e);
      return null;
    }
  }, []);

  const deleteRelatorio = useCallback(async (id: number): Promise<boolean> => {
    try {
      const { error: err } = await supabase.from('relatorios').delete().eq('id', id);
      if (err) throw err;
      setRelatorios(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (e) {
      console.error('Erro ao excluir relatório:', e);
      return false;
    }
  }, []);

  return {
    relatorios,
    loading,
    error,
    addRelatorio,
    deleteRelatorio,
    refetch: fetchRelatorios,
  };
}