import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useFirebaseSync } from './useFirebaseSync';

export interface MembroGestor {
  id: number;
  nome: string;
  cargo: string;
  foto: string;
}

export interface Escola {
  id: number;
  nome: string;
  endereco: string;
  diretor: string;
  telefone: string;
  email: string;
  matriculas: number;
  matriculasAnterior: number;
  turmas: number;
  professores: number;
  funcionarios: number;
  ideb: number;
  aprovacao: number;
  evasao: number;
  frequencia: number;
  preenchimentoSige: number;
  statusSemaforo: 'verde' | 'amarelo' | 'vermelho';
  foto: string;
  notaPortugues: number;
  notaMatematica: number;
  notaMedia: number;
  visitasRealizadas: number;
  metaAprovacao: number;
  metaFrequencia: number;
  metaEvasao: number;
  observacoes: string;
  updatedAt: string;
  mapUrl: string;
  tipoEscola: string;
  zona: string;
  statusCdg: string;
  etapasCdg: number;
}

export interface EscolaUpdateInput {
  nome?: string;
  endereco?: string;
  diretor?: string;
  telefone?: string;
  email?: string;
  matriculas?: number;
  turmas?: number;
  professores?: number;
  funcionarios?: number;
  ideb?: number;
  aprovacao?: number;
  evasao?: number;
  frequencia?: number;
  preenchimentoSige?: number;
  statusSemaforo?: 'verde' | 'amarelo' | 'vermelho';
  foto?: string;
  notaPortugues?: number;
  notaMatematica?: number;
  notaMedia?: number;
  visitasRealizadas?: number;
  metaAprovacao?: number;
  metaFrequencia?: number;
  metaEvasao?: number;
  observacoes?: string;
  mapUrl?: string;
  tipoEscola?: string;
  zona?: string;
  statusCdg?: string;
  etapasCdg?: number;
}

function calcSemaforo(escola: Partial<Escola>): 'verde' | 'amarelo' | 'vermelho' {
  const score = ((escola.aprovacao ?? 0) >= 90 ? 1 : (escola.aprovacao ?? 0) >= 80 ? 0.5 : 0)
    + ((escola.evasao ?? 0) <= 2 ? 1 : (escola.evasao ?? 0) <= 4 ? 0.5 : 0)
    + ((escola.frequencia ?? 0) >= 90 ? 1 : (escola.frequencia ?? 0) >= 80 ? 0.5 : 0)
    + ((escola.preenchimentoSige ?? 0) >= 80 ? 1 : (escola.preenchimentoSige ?? 0) >= 50 ? 0.5 : 0);
  if (score >= 3.5) return 'verde';
  if (score >= 2) return 'amarelo';
  return 'vermelho';
}

export function useEscolas() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEscolas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('escolas')
        .select('*, nucleo_gestor(*)')
        .order('nome', { ascending: true });

      if (err) throw err;

      const mapped = (data ?? []).map((e: Record<string, unknown>) => ({
        id: e.id as number,
        nome: e.nome as string,
        endereco: e.endereco as string,
        diretor: e.diretor as string,
        telefone: e.telefone as string,
        email: e.email as string,
        matriculas: e.matriculas as number,
        matriculasAnterior: (e.matriculas_anterior as number) ?? (e.matriculas as number) ?? 0,
        turmas: e.turmas as number,
        professores: e.professores as number,
        funcionarios: e.funcionarios as number,
        ideb: e.ideb as number,
        aprovacao: e.aprovacao as number,
        evasao: e.evasao as number,
        frequencia: e.frequencia as number,
        preenchimentoSige: e.preenchimento_sige as number,
        statusSemaforo: e.status_semaforo as 'verde' | 'amarelo' | 'vermelho',
        foto: (e.foto as string) || '',
        notaPortugues: e.nota_portugues as number,
        notaMatematica: e.nota_matematica as number,
        notaMedia: e.nota_media as number,
        visitasRealizadas: e.visitas_realizadas as number,
        metaAprovacao: e.meta_aprovacao as number,
        metaFrequencia: e.meta_frequencia as number,
        metaEvasao: e.meta_evasao as number,
        observacoes: e.observacoes as string,
        updatedAt: e.updated_at as string,
        mapUrl: e.map_url as string,
        tipoEscola: e.tipo_escola as string,
        zona: e.zona as string,
        statusCdg: e.status_cdg as string,
        etapasCdg: e.etapas_cdg as number,
      }));

      setEscolas(mapped);
    } catch (e) {
      setError('Erro ao carregar escolas.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEscolas();
  }, [fetchEscolas]);

  useFirebaseSync('escolas', fetchEscolas);

  const updateEscola = useCallback(async (id: number, data: EscolaUpdateInput): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      // Recalcula semáforo se dados relevantes mudaram
      if (data.aprovacao !== undefined || data.evasao !== undefined || data.frequencia !== undefined || data.preenchimentoSige !== undefined) {
        const current = escolas.find(e => e.id === id);
        if (current) {
          updateData.status_semaforo = calcSemaforo({ ...current, ...data });
        }
      }

      // Mapeia camelCase para snake_case
      const snakeData: Record<string, unknown> = {};
      Object.entries(updateData).forEach(([key, value]) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        snakeData[snakeKey] = value;
      });

      const { error: err } = await supabase
        .from('escolas')
        .update(snakeData)
        .eq('id', id);

      if (err) throw err;

      setEscolas(prev => prev.map(e => {
        if (e.id !== id) return e;
        const updated = { ...e, ...data, updatedAt: new Date().toISOString() };
        if (data.aprovacao !== undefined || data.evasao !== undefined || data.frequencia !== undefined || data.preenchimentoSige !== undefined) {
          updated.statusSemaforo = calcSemaforo(updated);
        }
        return updated;
      }));

      return true;
    } catch (e) {
      console.error('Erro ao atualizar escola:', e);
      return false;
    }
  }, [escolas]);

  const createEscola = useCallback(async (data: EscolaUpdateInput): Promise<boolean> => {
    try {
      function calcSemaforoLocal(d: Partial<Escola>): 'verde' | 'amarelo' | 'vermelho' {
        return calcSemaforo(d);
      }
      const statusSemaforo = calcSemaforoLocal(data as Partial<Escola>);

      const insertData: Record<string, unknown> = {
        nome: data.nome ?? '',
        diretor: data.diretor ?? '',
        endereco: data.endereco ?? '',
        telefone: data.telefone ?? null,
        email: data.email ?? null,
        matriculas: data.matriculas ?? 0,
        turmas: data.turmas ?? null,
        professores: data.professores ?? null,
        funcionarios: data.funcionarios ?? null,
        ideb: data.ideb ?? 0,
        aprovacao: data.aprovacao ?? 0,
        evasao: data.evasao ?? 0,
        frequencia: data.frequencia ?? 0,
        preenchimento_sige: data.preenchimentoSige ?? 0,
        status_semaforo: statusSemaforo,
        tipo_escola: data.tipoEscola ?? null,
        zona: data.zona ?? 'Urbana',
        observacoes: data.observacoes ?? '',
        foto: data.foto ?? null,
        meta_aprovacao: 95,
        meta_frequencia: 92,
        meta_evasao: 2,
        visitas_realizadas: 0,
        updated_at: new Date().toISOString(),
      };

      const { data: inserted, error: err } = await supabase
        .from('escolas')
        .insert(insertData)
        .select()
        .maybeSingle();

      if (err) throw err;
      if (!inserted) throw new Error('Nenhum dado retornado após insert');

      const nova: Escola = {
        id: inserted.id as number,
        nome: inserted.nome as string,
        endereco: inserted.endereco as string,
        diretor: inserted.diretor as string,
        telefone: inserted.telefone as string,
        email: inserted.email as string,
        matriculas: inserted.matriculas as number,
        matriculasAnterior: (inserted.matriculas_anterior as number) ?? (inserted.matriculas as number) ?? 0,
        turmas: inserted.turmas as number,
        professores: inserted.professores as number,
        funcionarios: inserted.funcionarios as number,
        ideb: inserted.ideb as number,
        aprovacao: inserted.aprovacao as number,
        evasao: inserted.evasao as number,
        frequencia: inserted.frequencia as number,
        preenchimentoSige: inserted.preenchimento_sige as number,
        statusSemaforo: inserted.status_semaforo as 'verde' | 'amarelo' | 'vermelho',
        foto: inserted.foto as string,
        notaPortugues: inserted.nota_portugues as number,
        notaMatematica: inserted.nota_matematica as number,
        notaMedia: inserted.nota_media as number,
        visitasRealizadas: inserted.visitas_realizadas as number,
        metaAprovacao: inserted.meta_aprovacao as number,
        metaFrequencia: inserted.meta_frequencia as number,
        metaEvasao: inserted.meta_evasao as number,
        observacoes: inserted.observacoes as string,
        updatedAt: inserted.updated_at as string,
        mapUrl: inserted.map_url as string,
        tipoEscola: inserted.tipo_escola as string,
        zona: inserted.zona as string,
        statusCdg: inserted.status_cdg as string,
        etapasCdg: inserted.etapas_cdg as number,
      };

      setEscolas(prev => [...prev, nova].sort((a, b) => a.nome.localeCompare(b.nome)));
      return true;
    } catch (e) {
      console.error('Erro ao criar escola:', e);
      return false;
    }
  }, []);

  const getEscolaById = useCallback((id: number) => {
    return escolas.find(e => e.id === id);
  }, [escolas]);

  const stats = {
    totalEscolas: escolas.length,
    mediaAprovacao: escolas.length > 0 ? +(escolas.reduce((s, e) => s + e.aprovacao, 0) / escolas.length).toFixed(1) : 0,
    mediaEvasao: escolas.length > 0 ? +(escolas.reduce((s, e) => s + e.evasao, 0) / escolas.length).toFixed(1) : 0,
    mediaFrequencia: escolas.length > 0 ? +(escolas.reduce((s, e) => s + e.frequencia, 0) / escolas.length).toFixed(1) : 0,
    mediaIdeb: escolas.length > 0 ? +(escolas.reduce((s, e) => s + e.ideb, 0) / escolas.length).toFixed(1) : 0,
    mediaSige: escolas.length > 0 ? Math.round(escolas.reduce((s, e) => s + e.preenchimentoSige, 0) / escolas.length) : 0,
    totalMatriculas: escolas.reduce((s, e) => s + e.matriculas, 0),
    escolasVerdes: escolas.filter(e => e.statusSemaforo === 'verde').length,
    escolasAmarelas: escolas.filter(e => e.statusSemaforo === 'amarelo').length,
    escolasVermelhas: escolas.filter(e => e.statusSemaforo === 'vermelho').length,
  };

  return {
    escolas,
    loading,
    error,
    updateEscola,
    createEscola,
    getEscolaById,
    stats,
    refetch: fetchEscolas,
  };
}