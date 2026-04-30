import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Turma {
  id: number;
  escola_id: number;
  escola_nome?: string;
  turma: string;
  serie: string;
  componente: string;
  professor: string | null;
  total_alunos: number;
  ano: number;
}

export interface Diagnostico {
  id: number;
  turma_id: number;
  escola_id: number;
  periodo: string;
  mes: number;
  ano: number;
  alunos_abaixo: number;
  alunos_basico: number;
  alunos_adequado: number;
  alunos_avancado: number;
  estrategia: string | null;
  status: 'pendente' | 'parcial' | 'concluido';
  observacoes: string | null;
}

export interface TurmaComDiagnostico extends Turma {
  diagnostico: Diagnostico | null;
  pct_adequado: number;
  pct_abaixo: number;
  nivel: 'critico' | 'atencao' | 'bom' | 'otimo';
}

export interface RecomposicaoStats {
  totalTurmas: number;
  turmasComDiagnostico: number;
  mediaAdequado: number;
  turmasCriticas: number;
  turmasOtimas: number;
  totalAlunosAbaixo: number;
}

export interface DiagnosticoInput {
  turma_id: number;
  escola_id: number;
  periodo: string;
  mes: number;
  ano: number;
  alunos_abaixo: number;
  alunos_basico: number;
  alunos_adequado: number;
  alunos_avancado: number;
  estrategia?: string;
  status: 'pendente' | 'parcial' | 'concluido';
  observacoes?: string;
}

function calcNivel(pct: number): 'critico' | 'atencao' | 'bom' | 'otimo' {
  if (pct >= 70) return 'otimo';
  if (pct >= 50) return 'bom';
  if (pct >= 30) return 'atencao';
  return 'critico';
}

export function useRecomposicao(mes: number, ano: number, escolaFiltro?: number | null) {
  const [turmas, setTurmas] = useState<TurmaComDiagnostico[]>([]);
  const [stats, setStats] = useState<RecomposicaoStats>({
    totalTurmas: 0,
    turmasComDiagnostico: 0,
    mediaAdequado: 0,
    turmasCriticas: 0,
    turmasOtimas: 0,
    totalAlunosAbaixo: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let turmasQuery = supabase
        .from('recomposicao_turmas')
        .select('*, escolas(nome)')
        .eq('ano', ano)
        .order('escola_id')
        .order('serie')
        .order('turma');

      if (escolaFiltro) {
        turmasQuery = turmasQuery.eq('escola_id', escolaFiltro);
      }

      const { data: turmasData, error: turmasErr } = await turmasQuery;
      if (turmasErr) throw turmasErr;

      const turmaIds = (turmasData || []).map((t: any) => t.id);

      const { data: diagData, error: diagErr } = await supabase
        .from('recomposicao_diagnosticos')
        .select('*')
        .in('turma_id', turmaIds.length > 0 ? turmaIds : [0])
        .eq('mes', mes)
        .eq('ano', ano);

      if (diagErr) throw diagErr;

      const diagMap = new Map<number, Diagnostico>();
      (diagData || []).forEach((d: any) => diagMap.set(d.turma_id, d));

      const combined: TurmaComDiagnostico[] = (turmasData || []).map((t: any) => {
        const diag = diagMap.get(t.id) ?? null;
        const total = diag ? diag.alunos_abaixo + diag.alunos_basico + diag.alunos_adequado + diag.alunos_avancado : 0;
        const pct_adequado = total > 0 ? Math.round(((diag!.alunos_adequado + diag!.alunos_avancado) / total) * 100) : 0;
        const pct_abaixo = total > 0 ? Math.round((diag!.alunos_abaixo / total) * 100) : 0;
        return {
          ...t,
          escola_nome: t.escolas?.nome ?? '',
          diagnostico: diag,
          pct_adequado: diag ? pct_adequado : 0,
          pct_abaixo: diag ? pct_abaixo : 0,
          nivel: diag ? calcNivel(pct_adequado) : 'critico',
        };
      });

      setTurmas(combined);

      const comDiag = combined.filter((t) => t.diagnostico !== null);
      const mediaAdequado = comDiag.length > 0
        ? Math.round(comDiag.reduce((acc, t) => acc + t.pct_adequado, 0) / comDiag.length)
        : 0;
      const totalAlunosAbaixo = comDiag.reduce((acc, t) => acc + (t.diagnostico?.alunos_abaixo ?? 0), 0);

      setStats({
        totalTurmas: combined.length,
        turmasComDiagnostico: comDiag.length,
        mediaAdequado,
        turmasCriticas: combined.filter((t) => t.nivel === 'critico').length,
        turmasOtimas: combined.filter((t) => t.nivel === 'otimo').length,
        totalAlunosAbaixo,
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados de recomposição');
    } finally {
      setLoading(false);
    }
  }, [mes, ano, escolaFiltro]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const upsertDiagnostico = async (data: DiagnosticoInput): Promise<boolean> => {
    const { error: err } = await supabase
      .from('recomposicao_diagnosticos')
      .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: 'turma_id,mes,ano' });
    if (err) { setError(err.message); return false; }
    await fetchData();
    return true;
  };

  return { turmas, stats, loading, error, upsertDiagnostico, refetch: fetchData };
}
