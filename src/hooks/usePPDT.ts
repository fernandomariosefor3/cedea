import { useState, useEffect, useCallback } from 'react';
import { useFirebaseSync } from './useFirebaseSync';
import { supabase } from '@/lib/supabase';

export interface FaceRecord {
  id: number;
  escola_id: number;
  escola_nome?: string;
  mes: number;
  ano: number;
  total_alunos: number;
  alunos_atendidos: number;
  reunioes_realizadas: number;
  reunioes_previstas: number;
  ppdts_ativos: number;
  ppdts_total: number;
  status: 'pendente' | 'parcial' | 'concluido';
  observacoes: string | null;
  cobertura_pct?: number;
}

export interface PcaRecord {
  id: number;
  escola_id: number;
  escola_nome?: string;
  mes: number;
  ano: number;
  coordenadores_ativos: number;
  coordenadores_total: number;
  horas_formacao: number;
  meta_horas: number;
  encontros_realizados: number;
  encontros_previstos: number;
  status: 'pendente' | 'parcial' | 'concluido';
  observacoes: string | null;
  pct_horas?: number;
}

export interface PPDTStats {
  totalEscolas: number;
  escolasFaceConcluidas: number;
  escolasPcaConcluidas: number;
  mediaCoberturaPPDT: number;
  mediaHorasPCA: number;
  escolasCriticas: number;
}

export interface FaceInput {
  escola_id: number;
  mes: number;
  ano: number;
  total_alunos: number;
  alunos_atendidos: number;
  reunioes_realizadas: number;
  reunioes_previstas: number;
  ppdts_ativos: number;
  ppdts_total: number;
  status: 'pendente' | 'parcial' | 'concluido';
  observacoes?: string;
}

export interface PcaInput {
  escola_id: number;
  mes: number;
  ano: number;
  coordenadores_ativos: number;
  coordenadores_total: number;
  horas_formacao: number;
  meta_horas: number;
  encontros_realizados: number;
  encontros_previstos: number;
  status: 'pendente' | 'parcial' | 'concluido';
  observacoes?: string;
}

export function usePPDT(mes: number, ano: number) {
  const [faceRecords, setFaceRecords] = useState<FaceRecord[]>([]);
  const [pcaRecords, setPcaRecords] = useState<PcaRecord[]>([]);
  const [stats, setStats] = useState<PPDTStats>({
    totalEscolas: 0,
    escolasFaceConcluidas: 0,
    escolasPcaConcluidas: 0,
    mediaCoberturaPPDT: 0,
    mediaHorasPCA: 0,
    escolasCriticas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [faceRes, pcaRes] = await Promise.all([
        supabase
          .from('ppdt_face')
          .select('*, escolas(nome)')
          .eq('mes', mes)
          .eq('ano', ano)
          .order('escola_id'),
        supabase
          .from('ppdt_pca')
          .select('*, escolas(nome)')
          .eq('mes', mes)
          .eq('ano', ano)
          .order('escola_id'),
      ]);

      if (faceRes.error) throw faceRes.error;
      if (pcaRes.error) throw pcaRes.error;

      const faceData: FaceRecord[] = (faceRes.data || []).map((r: any) => ({
        ...r,
        escola_nome: r.escolas?.nome ?? '',
        cobertura_pct: r.ppdts_total > 0 ? Math.round((r.ppdts_ativos / r.ppdts_total) * 100) : 0,
      }));

      const pcaData: PcaRecord[] = (pcaRes.data || []).map((r: any) => ({
        ...r,
        escola_nome: r.escolas?.nome ?? '',
        pct_horas: r.meta_horas > 0 ? Math.round((r.horas_formacao / r.meta_horas) * 100) : 0,
      }));

      setFaceRecords(faceData);
      setPcaRecords(pcaData);

      const totalEscolas = faceData.length;
      const escolasFaceConcluidas = faceData.filter((f) => f.status === 'concluido').length;
      const escolasPcaConcluidas = pcaData.filter((p) => p.status === 'concluido').length;
      const mediaCoberturaPPDT =
        totalEscolas > 0
          ? Math.round(faceData.reduce((acc, f) => acc + (f.cobertura_pct ?? 0), 0) / totalEscolas)
          : 0;
      const mediaHorasPCA =
        pcaData.length > 0
          ? Math.round((pcaData.reduce((acc, p) => acc + p.horas_formacao, 0) / pcaData.length) * 10) / 10
          : 0;
      const escolasCriticas = faceData.filter((f) => f.status === 'pendente').length;

      setStats({
        totalEscolas,
        escolasFaceConcluidas,
        escolasPcaConcluidas,
        mediaCoberturaPPDT,
        mediaHorasPCA,
        escolasCriticas,
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados PPDT');
    } finally {
      setLoading(false);
    }
  }, [mes, ano]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFirebaseSync('ppdt_face', fetchData);

  const upsertFace = async (data: FaceInput): Promise<boolean> => {
    const { error: err } = await supabase
      .from('ppdt_face')
      .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: 'escola_id,mes,ano' });
    if (err) { setError(err.message); return false; }
    await fetchData();
    return true;
  };

  const upsertPca = async (data: PcaInput): Promise<boolean> => {
    const { error: err } = await supabase
      .from('ppdt_pca')
      .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: 'escola_id,mes,ano' });
    if (err) { setError(err.message); return false; }
    await fetchData();
    return true;
  };

  return {
    faceRecords,
    pcaRecords,
    stats,
    loading,
    error,
    upsertFace,
    upsertPca,
    refetch: fetchData,
  };
}
