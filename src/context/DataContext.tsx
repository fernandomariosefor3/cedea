import { createContext, useContext, ReactNode } from 'react';
import { useEscolas, Escola, EscolaUpdateInput } from '@/hooks/useEscolas';
import { NovaEscolaInput } from '@/pages/escolas/components/ModalNovaEscola';

export interface MembroGestor {
  id: number;
  nome: string;
  cargo: string;
  foto: string;
}

export interface EscolaEditavel extends Escola {
  nucleoGestor?: MembroGestor[];
}

interface DataContextType {
  escolas: EscolaEditavel[];
  loading: boolean;
  error: string | null;
  updateEscola: (id: number, data: Partial<EscolaEditavel>) => Promise<boolean>;
  createEscola: (data: NovaEscolaInput) => Promise<boolean>;
  deleteEscola: (id: number) => Promise<boolean>;
  getEscolaById: (id: number) => EscolaEditavel | undefined;
  stats: {
    totalEscolas: number;
    mediaAprovacao: number;
    mediaEvasao: number;
    mediaFrequencia: number;
    mediaIdeb: number;
    mediaSige: number;
    totalMatriculas: number;
    escolasVerdes: number;
    escolasAmarelas: number;
    escolasVermelhas: number;
  };
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { escolas, loading, error, updateEscola: updateEscolaHook, createEscola: createEscolaHook, deleteEscola: deleteEscolaHook, getEscolaById, stats } = useEscolas();

  const updateEscola = async (id: number, data: Partial<EscolaEditavel>): Promise<boolean> => {
    const { nucleoGestor: _ng, ...rest } = data;
    return updateEscolaHook(id, rest as EscolaUpdateInput);
  };

  const createEscola = async (data: NovaEscolaInput): Promise<boolean> => {
    return createEscolaHook(data as EscolaUpdateInput);
  };

  const deleteEscola = async (id: number): Promise<boolean> => {
    return deleteEscolaHook(id);
  };

  const escolasEditaveis: EscolaEditavel[] = escolas.map((e) => ({ ...e, nucleoGestor: [] }));

  const getEscolaEditavelById = (id: number): EscolaEditavel | undefined => {
    const e = getEscolaById(id);
    return e ? { ...e, nucleoGestor: [] } : undefined;
  };

  return (
    <DataContext.Provider value={{ escolas: escolasEditaveis, loading, error, updateEscola, createEscola, deleteEscola, getEscolaById: getEscolaEditavelById, stats }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}