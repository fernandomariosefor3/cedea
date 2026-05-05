/**
 * LocalStorage-backed shim that mimics the subset of the Supabase JS client
 * used by the application's hooks. Every read/write goes through `window.localStorage`,
 * so data persists across reloads on the same browser.
 *
 * Supported chain segments per query:
 *   .from(table)
 *     .select(cols)            -> column projection + nested join expansion
 *     .insert(row | rows)      -> auto-id, returns inserted rows
 *     .update(patch)           -> patches rows that match preceding filters
 *     .delete()                -> deletes rows that match preceding filters
 *     .upsert(row, { onConflict })
 *     .eq(col, val)            -> filter
 *     .in(col, values)         -> filter
 *     .order(col, { ascending })
 *     .maybeSingle() / .single()
 *     .then(...) (thenable; resolves to { data, error })
 *
 * Joins use Supabase syntax:  "*, child(*)"  or  "*, alias:child(*)"
 * The shim resolves them via the relations table below (foreign-key map).
 */

const SEED_VERSION = '2026-04-24-1';

// ─────────────────────────────────────────────────────────────────────────────
// In-memory cache (replaces localStorage; Firebase is the persistent backend)
// ─────────────────────────────────────────────────────────────────────────────

const memCache = new Map<string, Row[]>();

// Called by firebaseSync.ts after loading data from Firebase
export function setTableCache(name: string, rows: Row[]): void {
  memCache.set(name, rows);
}

export function getTableCache(name: string): Row[] {
  return memCache.get(name) ?? [];
}

// Registry for the Firebase write function (injected by firebaseSync.ts)
let _firebaseWriter: ((table: string, rows: Row[]) => void) | null = null;

export function setFirebaseWriter(fn: (table: string, rows: Row[]) => void): void {
  _firebaseWriter = fn;
}

// Whether Firebase has already loaded data (skip local seeding if true)
let _firebasePopulated = false;
export function markFirebasePopulated(): void {
  _firebasePopulated = true;
  seeded = true; // prevent local seed from overwriting Firebase data
}

// ─────────────────────────────────────────────────────────────────────────────
// Type re-exports (kept identical to the original Supabase module so consuming
// hooks and components do not need to change).
// ─────────────────────────────────────────────────────────────────────────────

export interface EscolaDB {
  id: number;
  nome: string;
  diretor: string;
  endereco: string;
  telefone: string;
  email: string;
  ideb: number;
  aprovacao: number;
  evasao: number;
  frequencia: number;
  matriculas: number;
  matriculas_anterior: number;
  preenchimento_sige: number;
  status_semaforo: 'verde' | 'amarelo' | 'vermelho';
  status_cdg: 'Em dia' | 'Atrasado' | 'Crítico';
  etapas_cdg: number;
  foto: string;
  turmas: number | null;
  professores: number | null;
  funcionarios: number | null;
  nota_portugues: number | null;
  nota_matematica: number | null;
  nota_media: number | null;
  visitas_realizadas: number;
  meta_aprovacao: number;
  meta_frequencia: number;
  meta_evasao: number;
  observacoes: string;
  map_url: string | null;
  tipo_escola: string | null;
  zona: string | null;
  updated_at: string;
}

export interface VisitaDB {
  id: number;
  escola_id: number;
  escola_nome: string;
  data: string;
  hora: string;
  tipo: string;
  objetivo: string;
  status: 'Agendada' | 'Realizada' | 'Cancelada' | 'Reagendada';
  relato: string;
  pontos_fortes: string;
  pontos_atencao: string;
  criado_em: string;
  updated_at: string;
  encaminhamentos?: EncaminhamentoDB[];
}

export interface EncaminhamentoDB {
  id: number;
  visita_id: number;
  descricao: string;
  responsavel: string;
  prazo: string;
  status: 'Pendente' | 'Em andamento' | 'Concluído';
}

export interface PlanoAcaoDB {
  id: number;
  titulo: string;
  escola: string;
  problema: string;
  objetivo: string;
  prazo: string;
  status: 'Ativo' | 'Concluído' | 'Revisão';
  created_at: string;
  updated_at: string;
  acoes?: AcaoPlanoDB[];
  versoes?: VersaoPlanoDB[];
}

export interface AcaoPlanoDB {
  id: number;
  plano_id: number;
  descricao: string;
  responsavel: string;
  prazo: string;
  status: 'Pendente' | 'Em andamento' | 'Concluída';
}

export interface VersaoPlanoDB {
  id: number;
  plano_id: number;
  data: string;
  hora: string;
  autor: string;
  status: 'Rascunho' | 'Publicado' | 'Revisado';
}

export interface CdGEscolaDB {
  id: number;
  escola_id: number;
  etapas_concluidas: number;
  status_cdg: 'Em dia' | 'Atrasado' | 'Crítico';
  observacoes: string;
  updated_at: string;
  evidencias?: CdGEvidenciaDB[];
  checklist?: CdGChecklistDB[];
}

export interface CdGEvidenciaDB {
  id: number;
  cdg_escola_id: number;
  etapa_index: number;
  descricao: string;
  data: string;
  tipo: 'Documento' | 'Foto' | 'Ata' | 'Relatório' | 'Outro';
}

export interface CdGChecklistDB {
  id: number;
  cdg_escola_id: number;
  etapa_index: number;
  descricao: string;
  concluido: boolean;
}

export interface RelatorioDB {
  id: number;
  titulo: string;
  descricao: string;
  modulo: string;
  formato: 'PDF' | 'Excel';
  tamanho: string | null;
  data_geracao: string;
  hora_geracao: string;
  gerado_por: string;
  status: 'Pronto' | 'Gerando' | 'Erro';
  periodo: string;
  escola: string | null;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Storage primitives (in-memory cache backed by Firebase)
// ─────────────────────────────────────────────────────────────────────────────

type Row = Record<string, any>;

function readTable<T = Row>(name: string): T[] {
  return (memCache.get(name) as T[]) ?? [];
}

// ✅ CORRIGIDO: sanitiza undefined → null antes de gravar no Firebase
// O Firebase Realtime Database rejeita qualquer campo com valor undefined.
function sanitizeForFirebase(rows: Row[]): Row[] {
  return JSON.parse(JSON.stringify(rows, (_, value) =>
    value === undefined ? null : value
  ));
}

function writeTable(name: string, rows: Row[]): void {
  memCache.set(name, rows);
  // Async write to Firebase (fire-and-forget) — usando dados sanitizados
  if (_firebaseWriter) {
    _firebaseWriter(name, sanitizeForFirebase(rows)); // ✅ CORRIGIDO
  }
  // Notify any listeners (hooks can subscribe for real-time refresh)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(`sefor3:table:${name}`));
  }
}

function nextId(rows: Row[], key: string = 'id'): number {
  let max = 0;
  for (const r of rows) {
    const v = Number(r[key]);
    if (!Number.isNaN(v) && v > max) max = v;
  }
  return max + 1;
}

function nowIso(): string {
  return new Date().toISOString();
}

// ─────────────────────────────────────────────────────────────────────────────
// Foreign-key relations used to expand join syntax in `.select(...)`.
// Format: child table -> { parent table, parent.child key on the child side }
// (the child column that references parent.id)
// ─────────────────────────────────────────────────────────────────────────────

interface Relation {
  parent: string;       // referenced table
  childKey: string;     // column on the child side referencing parent.id
}

const RELATIONS: Record<string, Relation> = {
  // child table -> parent
  encaminhamentos: { parent: 'visitas', childKey: 'visita_id' },
  acoes_plano: { parent: 'planos_acao', childKey: 'plano_id' },
  versoes_plano: { parent: 'planos_acao', childKey: 'plano_id' },
  cdg_evidencias: { parent: 'cdg_escolas', childKey: 'cdg_escola_id' },
  cdg_checklist: { parent: 'cdg_escolas', childKey: 'cdg_escola_id' },
  nucleo_gestor: { parent: 'escolas', childKey: 'escola_id' },
  // For the inverse direction (parent referencing escolas), we use a parent-side
  // hint because Supabase syntax `escolas(nome)` means "look up the parent escola
  // for this row using the foreign key column matching the parent table name".
};

// Parent join hints: child column on the *current* table that references the
// parent table's `id`. Used by `ppdt_face`, `ppdt_pca`, `recomposicao_turmas`
// when they do `select('*, escolas(nome)')`.
const PARENT_FK: Record<string, string> = {
  escolas: 'escola_id',
};

// ─────────────────────────────────────────────────────────────────────────────
// SELECT projection parsing
//   "*, encaminhamentos(*)"
//   "*, acoes:acoes_plano(*), versoes:versoes_plano(*)"
//   "*, escolas(nome)"
//   "id, nome"
// ─────────────────────────────────────────────────────────────────────────────

interface JoinSpec {
  alias: string;        // alias to attach on the result row
  table: string;        // referenced table
  cols: string[] | '*'; // columns to keep from the joined row(s)
}

interface SelectSpec {
  cols: string[] | '*';
  joins: JoinSpec[];
}

function parseSelect(input: string | undefined): SelectSpec {
  const s = (input ?? '*').trim();
  if (!s) return { cols: '*', joins: [] };

  const pieces = splitTopLevel(s, ',').map((p) => p.trim()).filter(Boolean);
  const cols: string[] = [];
  const joins: JoinSpec[] = [];

  for (const piece of pieces) {
    if (piece === '*') {
      cols.push('*');
      continue;
    }
    // join syntax detection: contains "(" at top-level
    const parenStart = piece.indexOf('(');
    if (parenStart !== -1 && piece.endsWith(')')) {
      // optional alias prefix:  alias:table(cols)
      const head = piece.slice(0, parenStart);
      const inner = piece.slice(parenStart + 1, -1).trim();
      let alias: string;
      let table: string;
      if (head.includes(':')) {
        const [a, t] = head.split(':').map((x) => x.trim());
        alias = a;
        table = t;
      } else {
        alias = head.trim();
        table = head.trim();
      }
      const joinCols: string[] | '*' =
        inner === '*' ? '*' : inner.split(',').map((x) => x.trim()).filter(Boolean);
      joins.push({ alias, table, cols: joinCols });
    } else {
      cols.push(piece);
    }
  }

  const colsOut: string[] | '*' = cols.includes('*') ? '*' : cols;
  return { cols: colsOut, joins };
}

function splitTopLevel(s: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buf = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === sep && depth === 0) {
      out.push(buf);
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf) out.push(buf);
  return out;
}

function projectCols(row: Row, cols: string[] | '*'): Row {
  if (cols === '*') return { ...row };
  const out: Row = {};
  for (const c of cols) out[c] = row[c];
  return out;
}

function applyJoins(rows: Row[], baseTable: string, joins: JoinSpec[]): Row[] {
  if (joins.length === 0) return rows.map((r) => ({ ...r }));

  return rows.map((row) => {
    const out: Row = { ...row };
    for (const j of joins) {
      const childRows = readTable(j.table);
      const childRel = RELATIONS[j.table];

      if (childRel && childRel.parent === baseTable) {
        // children of `row`
        const matches = childRows.filter((c) => c[childRel.childKey] === row.id);
        out[j.alias] = matches.map((c) => projectCols(c, j.cols));
      } else if (PARENT_FK[j.table]) {
        // current row points to a parent in `j.table` via PARENT_FK[j.table]
        const fk = PARENT_FK[j.table];
        const parent = childRows.find((p) => p.id === row[fk]);
        out[j.alias] = parent ? projectCols(parent, j.cols) : null;
      } else {
        out[j.alias] = [];
      }
    }
    return out;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Query builder (chainable + thenable)
// ─────────────────────────────────────────────────────────────────────────────

type Filter =
  | { kind: 'eq'; col: string; val: unknown }
  | { kind: 'in'; col: string; vals: unknown[] };

interface OrderSpec {
  col: string;
  ascending: boolean;
}

type Action =
  | { kind: 'select'; spec: SelectSpec }
  | { kind: 'insert'; rows: Row[]; returning: boolean }
  | { kind: 'update'; patch: Row; returning: boolean }
  | { kind: 'delete'; returning: boolean }
  | { kind: 'upsert'; rows: Row[]; onConflict: string[]; returning: boolean };

class QueryBuilder<T = Row> implements PromiseLike<{ data: any; error: any }> {
  private filters: Filter[] = [];
  private orders: OrderSpec[] = [];
  private action: Action = { kind: 'select', spec: { cols: '*', joins: [] } };
  private singleMode: 'none' | 'maybe' | 'strict' = 'none';

  constructor(private readonly table: string) {}

  // — Action setters
  select(cols?: string): this {
    // If we're chaining .insert().select() we keep the action as insert but
    // mark returning=true.
    if (this.action.kind === 'insert' || this.action.kind === 'update' || this.action.kind === 'upsert') {
      (this.action as any).returning = true;
      // also remember projection if provided
      (this.action as any).selectSpec = parseSelect(cols);
      return this;
    }
    this.action = { kind: 'select', spec: parseSelect(cols) };
    return this;
  }

  insert(rows: Row | Row[]): this {
    const list = Array.isArray(rows) ? rows : [rows];
    this.action = { kind: 'insert', rows: list, returning: false };
    return this;
  }

  update(patch: Row): this {
    this.action = { kind: 'update', patch, returning: false };
    return this;
  }

  delete(): this {
    this.action = { kind: 'delete', returning: false };
    return this;
  }

  upsert(rows: Row | Row[], opts?: { onConflict?: string }): this {
    const list = Array.isArray(rows) ? rows : [rows];
    const onConflict = (opts?.onConflict ?? 'id').split(',').map((s) => s.trim());
    this.action = { kind: 'upsert', rows: list, onConflict, returning: false };
    return this;
  }

  // — Filter / ordering
  eq(col: string, val: unknown): this {
    this.filters.push({ kind: 'eq', col, val });
    return this;
  }

  in(col: string, vals: unknown[]): this {
    this.filters.push({ kind: 'in', col, vals: vals ?? [] });
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }): this {
    this.orders.push({ col, ascending: opts?.ascending !== false });
    return this;
  }

  maybeSingle(): this {
    this.singleMode = 'maybe';
    return this;
  }

  single(): this {
    this.singleMode = 'strict';
    return this;
  }

  // — Execution
  private matches(row: Row): boolean {
    for (const f of this.filters) {
      if (f.kind === 'eq') {
        if (row[f.col] !== f.val) return false;
      } else if (f.kind === 'in') {
        if (!f.vals.includes(row[f.col])) return false;
      }
    }
    return true;
  }

  private sortRows(rows: Row[]): Row[] {
    if (this.orders.length === 0) return rows;
    const sorted = [...rows];
    sorted.sort((a, b) => {
      for (const o of this.orders) {
        const av = a[o.col];
        const bv = b[o.col];
        if (av === bv) continue;
        if (av == null) return o.ascending ? -1 : 1;
        if (bv == null) return o.ascending ? 1 : -1;
        if (typeof av === 'number' && typeof bv === 'number') {
          return o.ascending ? av - bv : bv - av;
        }
        const cmp = String(av).localeCompare(String(bv));
        return o.ascending ? cmp : -cmp;
      }
      return 0;
    });
    return sorted;
  }

  private execute(): { data: any; error: any } {
    try {
      const rowsAll = readTable(this.table);

      switch (this.action.kind) {
        case 'select': {
          const selectAction = this.action as Extract<Action, { kind: 'select' }>;
          const filtered = rowsAll.filter((r) => this.matches(r));
          const sorted = this.sortRows(filtered);
          const expanded = applyJoins(sorted, this.table, selectAction.spec.joins);
          const projected =
            selectAction.spec.cols === '*'
              ? expanded
              : expanded.map((r) => {
                  const out: Row = {};
                  for (const c of selectAction.spec.cols as string[]) out[c] = r[c];
                  // keep joined aliases too
                  for (const j of selectAction.spec.joins) out[j.alias] = r[j.alias];
                  return out;
                });
          return this.finalize(projected);
        }
        case 'insert': {
          const inserted: Row[] = [];
          let nextIdValue = nextId(rowsAll);
          for (const incoming of this.action.rows) {
            const row: Row = { ...incoming };
            if (row.id === undefined || row.id === null) {
              row.id = nextIdValue++;
            }
            if (row.created_at === undefined) row.created_at = nowIso();
            if (row.updated_at === undefined) row.updated_at = nowIso();
            rowsAll.push(row);
            inserted.push(row);
          }
          writeTable(this.table, rowsAll);
          return this.finalize(inserted.map((r) => ({ ...r })));
        }
        case 'update': {
          const updated: Row[] = [];
          for (const r of rowsAll) {
            if (this.matches(r)) {
              Object.assign(r, this.action.patch);
              if (r.updated_at === undefined || this.action.patch.updated_at === undefined) {
                r.updated_at = nowIso();
              }
              updated.push(r);
            }
          }
          writeTable(this.table, rowsAll);
          return this.finalize(updated.map((r) => ({ ...r })));
        }
        case 'delete': {
          const kept: Row[] = [];
          const deleted: Row[] = [];
          for (const r of rowsAll) {
            if (this.matches(r)) deleted.push(r);
            else kept.push(r);
          }
          writeTable(this.table, kept);
          return this.finalize(deleted.map((r) => ({ ...r })));
        }
        case 'upsert': {
          const onConflict = this.action.onConflict;
          const out: Row[] = [];
          let nextIdValue = nextId(rowsAll);
          for (const incoming of this.action.rows) {
            const idx = rowsAll.findIndex((existing) =>
              onConflict.every((k) => existing[k] === incoming[k]),
            );
            if (idx >= 0) {
              Object.assign(rowsAll[idx], incoming, { updated_at: nowIso() });
              out.push(rowsAll[idx]);
            } else {
              const row: Row = { ...incoming };
              if (row.id === undefined || row.id === null) row.id = nextIdValue++;
              if (row.created_at === undefined) row.created_at = nowIso();
              if (row.updated_at === undefined) row.updated_at = nowIso();
              rowsAll.push(row);
              out.push(row);
            }
          }
          writeTable(this.table, rowsAll);
          return this.finalize(out.map((r) => ({ ...r })));
        }
      }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  private finalize(rows: Row[]): { data: any; error: any } {
    if (this.singleMode === 'maybe') {
      return { data: rows[0] ?? null, error: null };
    }
    if (this.singleMode === 'strict') {
      if (rows.length !== 1) {
        return { data: null, error: new Error('Expected exactly 1 row') };
      }
      return { data: rows[0], error: null };
    }
    return { data: rows, error: null };
  }

  then<TR1 = { data: any; error: any }, TR2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TR1 | PromiseLike<TR1>) | null,
    onrejected?: ((reason: any) => TR2 | PromiseLike<TR2>) | null,
  ): PromiseLike<TR1 | TR2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public client
// ─────────────────────────────────────────────────────────────────────────────

export const supabase = {
  from(table: string): QueryBuilder {
    ensureSeeded();
    return new QueryBuilder(table);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Seeding
// ─────────────────────────────────────────────────────────────────────────────

let seeded = false;

function ensureSeeded(): void {
  if (seeded) return;
  // If Firebase populated the cache, skip local seeding
  if (_firebasePopulated) {
    seeded = true;
    return;
  }
  seedAll();
  seeded = true;
  // Write seed data to Firebase so future sessions use Firebase
  if (_firebaseWriter) {
    memCache.forEach((rows, table) => {
      _firebaseWriter!(table, rows);
    });
  }
}

function seedAll(): void {
  // ── escolas ────────────────────────────────────────────────────────────────
  const escolas: EscolaDB[] = [
    mkEscola(1, 'EEFM Governador Virgílio Távora', 'Ana Paula Ferreira', 'Rua das Flores, 120 — Fortaleza', '(85) 3101-2200', 'eefm.virgilio@seduc.ce.gov.br', 6.8, 94.2, 1.8, 92.5, 1240, 1198, 98, 'verde', 'Em dia', 5),
    mkEscola(2, 'EEFM Presidente Castelo Branco', 'Carlos Eduardo Lima', 'Av. Bezerra de Menezes, 450 — Fortaleza', '(85) 3101-3300', 'eefm.castelo@seduc.ce.gov.br', 6.4, 91.7, 2.3, 90.1, 980, 1010, 87, 'amarelo', 'Em dia', 4),
    mkEscola(3, 'EEFM Dom Lustosa', 'Maria José Rodrigues', 'Rua Dom Lustosa, 88 — Fortaleza', '(85) 3101-4400', 'eefm.domlustosa@seduc.ce.gov.br', 5.9, 88.4, 4.1, 85.3, 760, 820, 62, 'vermelho', 'Crítico', 2),
    mkEscola(4, 'EEFM Liceu do Conjunto Ceará', 'Roberto Alves Sousa', 'Rua Coronel Matos, 200 — Fortaleza', '(85) 3101-5500', 'eefm.liceu@seduc.ce.gov.br', 6.1, 90.2, 3.0, 88.7, 1100, 1080, 75, 'amarelo', 'Atrasado', 3),
    mkEscola(5, 'EEFM Deputado Paulino Rocha', 'Fernanda Costa Melo', 'Av. Paulino Rocha, 340 — Fortaleza', '(85) 3101-6600', 'eefm.paulino@seduc.ce.gov.br', 7.1, 96.0, 1.2, 94.8, 890, 870, 100, 'verde', 'Em dia', 5),
    mkEscola(6, 'EEFM Joaquim Nabuco', 'Paulo Henrique Dias', 'Rua Joaquim Nabuco, 55 — Fortaleza', '(85) 3101-7700', 'eefm.nabuco@seduc.ce.gov.br', 5.5, 84.1, 5.8, 82.0, 640, 710, 45, 'vermelho', 'Crítico', 1),
    mkEscola(7, 'EEFM Presidente Médici', 'Luciana Barros Neto', 'Rua Presidente Médici, 180 — Fortaleza', '(85) 3101-8800', 'eefm.medici@seduc.ce.gov.br', 6.6, 93.5, 2.0, 91.4, 1050, 1020, 91, 'verde', 'Em dia', 5),
    mkEscola(8, 'EEFM Monsenhor Tabosa', 'Antônio Ferreira Gomes', 'Rua Monsenhor Tabosa, 290 — Fortaleza', '(85) 3101-9900', 'eefm.tabosa@seduc.ce.gov.br', 6.0, 89.8, 3.5, 87.2, 820, 840, 68, 'amarelo', 'Atrasado', 3),
  ];
  writeTable('escolas', escolas);

  // ── nucleo_gestor (empty seed) ─────────────────────────────────────────────
  writeTable('nucleo_gestor', []);

  // ── visitas + encaminhamentos ──────────────────────────────────────────────
  const visitas: VisitaDB[] = [
    mkVisita(1, 3, 'EEFM Dom Lustosa', '2026-03-07', '08:00', 'Acompanhamento CdG',
      'Acompanhamento CdG — Etapa Execução e verificação de indicadores críticos', 'Realizada',
      'Visita realizada com presença da diretora Maria José e coordenadores pedagógicos. Identificadas fragilidades no preenchimento do SIGE e baixa frequência em turmas do 2º ano. Equipe demonstrou comprometimento com as metas.',
      'Boa receptividade da equipe gestora. Projeto de leitura em andamento com resultados positivos nas turmas do 1º ano.',
      'Preenchimento SIGE abaixo de 70%. Frequência de 3 turmas abaixo de 80%. Evasão crescente no turno noturno.',
      '2026-03-07T10:30:00'),
    mkVisita(2, 6, 'EEFM Joaquim Nabuco', '2026-03-09', '09:30', 'Intervenção Pedagógica',
      'Intervenção urgente — evasão crítica e SIGE abaixo de 50%', 'Realizada',
      'Situação crítica confirmada. Evasão de 5,8% com concentração no 3º ano noturno. Diretor Paulo Henrique apresentou dificuldades na gestão da equipe. SIGE com apenas 45% de preenchimento. Necessária intervenção imediata.',
      'Professores de matemática com bom engajamento. Infraestrutura da escola em bom estado.',
      'Evasão acima de 5%. SIGE crítico. Baixo engajamento da coordenação pedagógica. Ausência de plano de ação estruturado.',
      '2026-03-09T11:00:00'),
    mkVisita(3, 4, 'EEFM Liceu do Conjunto Ceará', '2026-03-11', '14:00', 'Plano de Ação',
      'Revisão e validação do Plano de Ação 2026', 'Realizada',
      'Plano de Ação revisado com a equipe gestora. Metas ajustadas para aprovação (meta: 93%) e frequência (meta: 90%). Ações bem estruturadas, porém com cronograma apertado. CdG na etapa 3 com atraso de 2 semanas.',
      'Plano de Ação bem elaborado. Equipe pedagógica engajada. Bom relacionamento com a comunidade escolar.',
      'CdG com atraso. Frequência de 88,7% ainda abaixo da meta. Necessidade de reforço nas ações de recomposição.',
      '2026-03-11T15:30:00'),
    mkVisita(4, 2, 'EEFM Presidente Castelo Branco', '2026-04-14', '10:00', 'SMAR',
      'SMAR — Análise de resultados do 1º bimestre', 'Agendada', '', '', '', '2026-03-20T09:00:00'),
    mkVisita(5, 1, 'EEFM Governador Virgílio Távora', '2026-04-18', '08:30', 'Visita Técnica Geral',
      'Visita de acompanhamento — escola referência da regional', 'Agendada', '', '', '', '2026-03-22T10:00:00'),
  ];
  writeTable('visitas', visitas);

  const encaminhamentos: EncaminhamentoDB[] = [
    { id: 1, visita_id: 1, descricao: 'Elevar preenchimento SIGE para 90% até 30/04', responsavel: 'Maria José Rodrigues', prazo: '2026-04-30', status: 'Em andamento' },
    { id: 2, visita_id: 1, descricao: 'Realizar busca ativa dos alunos ausentes do turno noturno', responsavel: 'Coordenação Pedagógica', prazo: '2026-04-15', status: 'Pendente' },
    { id: 3, visita_id: 1, descricao: 'Apresentar plano de recuperação de frequência na próxima visita', responsavel: 'Maria José Rodrigues', prazo: '2026-04-07', status: 'Concluído' },
    { id: 4, visita_id: 2, descricao: 'Elaborar Plano de Ação emergencial para redução de evasão', responsavel: 'Paulo Henrique Dias', prazo: '2026-03-20', status: 'Concluído' },
    { id: 5, visita_id: 2, descricao: 'Completar preenchimento SIGE — mínimo 80%', responsavel: 'Secretaria Escolar', prazo: '2026-04-10', status: 'Em andamento' },
    { id: 6, visita_id: 2, descricao: 'Reunião com pais dos alunos em risco de evasão', responsavel: 'Paulo Henrique Dias', prazo: '2026-03-25', status: 'Concluído' },
    { id: 7, visita_id: 3, descricao: 'Concluir etapa 4 do CdG até 20/04', responsavel: 'Roberto Alves Sousa', prazo: '2026-04-20', status: 'Em andamento' },
    { id: 8, visita_id: 3, descricao: 'Implementar ações de recomposição de aprendizagens no contra turno', responsavel: 'Coordenação Pedagógica', prazo: '2026-04-30', status: 'Pendente' },
  ];
  writeTable('encaminhamentos', encaminhamentos);

  // ── planos_acao + acoes_plano + versoes_plano ──────────────────────────────
  const planos: PlanoAcaoDB[] = [
    {
      id: 1,
      titulo: 'Redução da Evasão Escolar — 2026',
      escola: 'EEFM Dom Lustosa',
      problema: 'Taxa de evasão de 4,1% no 1º semestre, acima da meta regional de 2%. Identificados 31 alunos em risco de abandono, principalmente no 1º ano do Ensino Médio.',
      objetivo: 'Reduzir a taxa de evasão para abaixo de 2% até dezembro de 2026, por meio de ações de busca ativa, acompanhamento individualizado e fortalecimento do vínculo escola-família.',
      prazo: '31/12/2026',
      status: 'Ativo',
      created_at: '2026-03-01T09:15:00.000Z',
      updated_at: '2026-03-15T11:00:00.000Z',
    },
    {
      id: 2,
      titulo: 'Melhoria do Preenchimento SIGE',
      escola: 'EEFM Joaquim Nabuco',
      problema: 'Apenas 45% das notas lançadas no SIGE, comprometendo o monitoramento pedagógico e o repasse de recursos.',
      objetivo: 'Atingir 100% de preenchimento do SIGE até o fechamento do bimestre em 30/04/2026.',
      prazo: '30/04/2026',
      status: 'Ativo',
      created_at: '2026-03-20T10:00:00.000Z',
      updated_at: '2026-03-25T16:00:00.000Z',
    },
    {
      id: 3,
      titulo: 'Fortalecimento do CdG — Etapas 3 e 4',
      escola: 'EEFM Liceu do Conjunto Ceará',
      problema: 'Escola parada na etapa 3 (SMAR) do Ciclo de Gestão há 6 semanas, sem avanço para Correção de Rotas.',
      objetivo: 'Concluir as etapas SMAR e Correção de Rotas até 30/04/2026, com evidências documentadas.',
      prazo: '30/04/2026',
      status: 'Revisão',
      created_at: '2026-03-28T08:30:00.000Z',
      updated_at: '2026-03-28T08:30:00.000Z',
    },
  ];
  writeTable('planos_acao', planos);

  writeTable('acoes_plano', [
    { id: 1, plano_id: 1, descricao: 'Mapear todos os alunos com mais de 5 faltas consecutivas', responsavel: 'Coordenação Pedagógica', prazo: '2026-04-10', status: 'Concluída' },
    { id: 2, plano_id: 1, descricao: 'Realizar visitas domiciliares para alunos evadidos', responsavel: 'PPDT + Assistente Social', prazo: '2026-04-20', status: 'Em andamento' },
    { id: 3, plano_id: 1, descricao: 'Implementar projeto de tutoria entre pares', responsavel: 'Coordenação Pedagógica', prazo: '2026-04-30', status: 'Pendente' },
    { id: 4, plano_id: 1, descricao: 'Reunião com famílias dos alunos em risco', responsavel: 'Direção + PPDT', prazo: '2026-04-15', status: 'Em andamento' },
    { id: 5, plano_id: 2, descricao: 'Capacitação de professores no uso do SIGE', responsavel: 'Coordenação TI', prazo: '2026-04-08', status: 'Concluída' },
    { id: 6, plano_id: 2, descricao: 'Monitoramento diário do preenchimento por disciplina', responsavel: 'Coordenação Pedagógica', prazo: '2026-04-30', status: 'Em andamento' },
    { id: 7, plano_id: 2, descricao: 'Relatório semanal para superintendência', responsavel: 'Direção', prazo: '2026-04-30', status: 'Em andamento' },
    { id: 8, plano_id: 3, descricao: 'Realizar reunião de SMAR com equipe gestora', responsavel: 'Direção + Superintendência', prazo: '2026-04-12', status: 'Pendente' },
    { id: 9, plano_id: 3, descricao: 'Elaborar relatório de análise de resultados', responsavel: 'Coordenação Pedagógica', prazo: '2026-04-18', status: 'Pendente' },
    { id: 10, plano_id: 3, descricao: 'Definir correções de rota com metas revisadas', responsavel: 'Equipe Gestora', prazo: '2026-04-25', status: 'Pendente' },
  ]);

  writeTable('versoes_plano', [
    { id: 1, plano_id: 1, data: '2026-03-01', hora: '09:15', autor: 'Maria José Rodrigues', status: 'Rascunho' },
    { id: 2, plano_id: 1, data: '2026-03-10', hora: '14:30', autor: 'Superintendente Regional', status: 'Revisado' },
    { id: 3, plano_id: 1, data: '2026-03-15', hora: '11:00', autor: 'Maria José Rodrigues', status: 'Publicado' },
    { id: 4, plano_id: 2, data: '2026-03-20', hora: '10:00', autor: 'Paulo Henrique Dias', status: 'Rascunho' },
    { id: 5, plano_id: 2, data: '2026-03-25', hora: '16:00', autor: 'Superintendente Regional', status: 'Publicado' },
    { id: 6, plano_id: 3, data: '2026-03-28', hora: '08:30', autor: 'Roberto Alves Sousa', status: 'Rascunho' },
  ]);

  // ── cdg_escolas + cdg_checklist ────────────────────────────────────────────
  const cdgRows: CdGEscolaDB[] = [
    { id: 1, escola_id: 1, etapas_concluidas: 5, status_cdg: 'Em dia', observacoes: 'Escola referência — todas as etapas concluídas com excelência.', updated_at: nowIso() },
    { id: 2, escola_id: 2, etapas_concluidas: 4, status_cdg: 'Em dia', observacoes: '', updated_at: nowIso() },
    { id: 3, escola_id: 3, etapas_concluidas: 2, status_cdg: 'Crítico', observacoes: 'Escola com dificuldades na execução. Necessita intervenção.', updated_at: nowIso() },
    { id: 4, escola_id: 4, etapas_concluidas: 3, status_cdg: 'Atrasado', observacoes: 'CdG com atraso de 2 semanas.', updated_at: nowIso() },
    { id: 5, escola_id: 5, etapas_concluidas: 5, status_cdg: 'Em dia', observacoes: '', updated_at: nowIso() },
    { id: 6, escola_id: 6, etapas_concluidas: 1, status_cdg: 'Crítico', observacoes: 'Situação crítica. Apenas planejamento iniciado.', updated_at: nowIso() },
    { id: 7, escola_id: 7, etapas_concluidas: 5, status_cdg: 'Em dia', observacoes: '', updated_at: nowIso() },
    { id: 8, escola_id: 8, etapas_concluidas: 3, status_cdg: 'Atrasado', observacoes: '', updated_at: nowIso() },
  ];
  writeTable('cdg_escolas', cdgRows);
  writeTable('cdg_evidencias', [
    { id: 1, cdg_escola_id: 1, etapa_index: 0, descricao: 'Ata de reunião de planejamento — 10/02/2026', data: '2026-02-10', tipo: 'Ata' },
    { id: 2, cdg_escola_id: 1, etapa_index: 1, descricao: 'Relatório de execução do 1º bimestre', data: '2026-03-15', tipo: 'Relatório' },
    { id: 3, cdg_escola_id: 2, etapa_index: 0, descricao: 'Diagnóstico situacional 2026', data: '2026-02-12', tipo: 'Documento' },
    { id: 4, cdg_escola_id: 4, etapa_index: 2, descricao: 'Ata SMAR — 1º bimestre', data: '2026-03-20', tipo: 'Ata' },
    { id: 5, cdg_escola_id: 5, etapa_index: 4, descricao: 'Registro da Parada Reflexiva — 25/03/2026', data: '2026-03-25', tipo: 'Foto' },
  ]);
  writeTable('cdg_checklist', generateCdgChecklist(cdgRows));

  // ── relatorios ─────────────────────────────────────────────────────────────
  const relatorios: RelatorioDB[] = [
    mkRelatorio(1, 'Fluxo Escolar — Regional 1 — Março 2026', 'Frequência, matrícula, aprovação e evasão de todas as escolas da regional no mês de março.', 'Fluxo Escolar', 'PDF', '2,4 MB', '01/04/2026', '08:15', 'Pronto', 'Março 2026', null),
    mkRelatorio(2, 'Preenchimento SIGE — Bimestre 1/2026', 'Percentual de preenchimento de notas por escola e por disciplina no primeiro bimestre.', 'Preenchimento de Notas', 'Excel', '1,1 MB', '31/03/2026', '17:42', 'Pronto', 'Bimestre 1/2026', null),
    mkRelatorio(3, 'CdG Cearense — Status por Escola — Abril 2026', 'Situação de cada escola nas 5 etapas do Ciclo de Gestão Cearense com evidências registradas.', 'CdG Cearense', 'PDF', '3,7 MB', '02/04/2026', '09:00', 'Pronto', 'Abril 2026', null),
    mkRelatorio(4, 'Ranking de Escolas — IDEB e Aprovação — 2026', 'Classificação geral das escolas por IDEB, taxa de aprovação e status do CdG.', 'Dashboard', 'PDF', '1,8 MB', '28/03/2026', '14:30', 'Pronto', '1º Semestre 2026', null),
    mkRelatorio(5, 'Planos de Ação — Execução e Pendências', 'Relatório consolidado de todos os planos de ação ativos, com percentual de execução e ações pendentes.', 'Plano de Ação', 'Excel', '0,9 MB', '30/03/2026', '11:20', 'Pronto', 'Março 2026', null),
    mkRelatorio(6, 'Fluxo Escolar — EEFM Dom Lustosa', 'Análise detalhada de frequência, evasão e aprovação da EEFM Dom Lustosa no 1º bimestre.', 'Fluxo Escolar', 'PDF', '1,2 MB', '25/03/2026', '16:05', 'Pronto', 'Bimestre 1/2026', 'EEFM Dom Lustosa'),
    mkRelatorio(7, 'Indicadores Gerais — Regional 1 — Fevereiro 2026', 'Painel consolidado de KPIs da regional: aprovação, evasão, frequência e SIGE.', 'Dashboard', 'PDF', '2,0 MB', '01/03/2026', '07:50', 'Pronto', 'Fevereiro 2026', null),
    mkRelatorio(8, 'SIGE — Escolas Críticas — Março 2026', 'Lista de escolas com preenchimento SIGE abaixo de 50%, com histórico de cobranças enviadas.', 'Preenchimento de Notas', 'Excel', '0,6 MB', '20/03/2026', '13:10', 'Pronto', 'Março 2026', null),
  ];
  writeTable('relatorios', relatorios);

  // ── busca_ativa: alunos_risco + acoes_busca_ativa ──────────────────────────
  writeTable('alunos_risco', [
    { id: 'a1', escola_id: 3, nome: 'João Pedro Almeida', serie: '1º Ano EM', turma: '1A', turno: 'manhã', dias_ausente: 12, faltas_consecutivas: 8, status: 'em_risco', motivo_ausencia: 'Trabalho informal no contraturno', responsavel: 'Maria Almeida', telefone_responsavel: '(85) 99888-1212', endereco: 'Rua das Acácias, 45 — Conjunto Tabajara', observacoes: 'Mãe relatou dificuldades financeiras.', created_at: '2026-03-15T09:00:00Z', updated_at: '2026-03-20T10:00:00Z' },
    { id: 'a2', escola_id: 3, nome: 'Ana Beatriz Silva', serie: '2º Ano EM', turma: '2B', turno: 'tarde', dias_ausente: 7, faltas_consecutivas: 4, status: 'em_acompanhamento', motivo_ausencia: 'Saúde — tratamento médico', responsavel: 'José Silva', telefone_responsavel: '(85) 99777-3434', endereco: 'Travessa Boa Esperança, 12', observacoes: '', created_at: '2026-03-18T08:30:00Z', updated_at: '2026-03-22T11:00:00Z' },
    { id: 'a3', escola_id: 6, nome: 'Carlos Henrique Souza', serie: '3º Ano EM', turma: '3A', turno: 'noite', dias_ausente: 18, faltas_consecutivas: 14, status: 'em_risco', motivo_ausencia: 'Conflito familiar', responsavel: 'Rita Souza', telefone_responsavel: '(85) 99666-5656', endereco: 'Rua Coronel Joca, 200', observacoes: 'Encaminhado ao CRAS.', created_at: '2026-03-10T07:30:00Z', updated_at: '2026-03-25T14:00:00Z' },
    { id: 'a4', escola_id: 6, nome: 'Lucas Mendes', serie: '1º Ano EM', turma: '1C', turno: 'noite', dias_ausente: 22, faltas_consecutivas: 22, status: 'evadido', motivo_ausencia: 'Mudança de cidade', responsavel: 'Antônio Mendes', telefone_responsavel: '(85) 99555-7878', endereco: 'Rua dos Coqueiros, 78', observacoes: 'Família mudou-se para Sobral.', created_at: '2026-03-05T09:15:00Z', updated_at: '2026-03-30T15:30:00Z' },
    { id: 'a5', escola_id: 4, nome: 'Maria Eduarda Costa', serie: '2º Ano EM', turma: '2A', turno: 'manhã', dias_ausente: 5, faltas_consecutivas: 3, status: 'retornou', motivo_ausencia: 'Gripe forte', responsavel: 'Patrícia Costa', telefone_responsavel: '(85) 99444-9090', endereco: 'Av. das Palmeiras, 333', observacoes: 'Aluna retornou sem novas faltas.', created_at: '2026-03-12T10:00:00Z', updated_at: '2026-03-28T13:20:00Z' },
  ]);
  writeTable('acoes_busca_ativa', [
    { id: 'ac1', aluno_id: 'a1', escola_id: 3, tipo: 'ligação', descricao: 'Contato telefônico com a mãe do aluno', resultado: 'Mãe confirmou que João trabalha em horário escolar.', responsavel: 'Coordenação Pedagógica', data_acao: '2026-03-16', status: 'realizada', created_at: '2026-03-16T10:00:00Z' },
    { id: 'ac2', aluno_id: 'a1', escola_id: 3, tipo: 'visita_domiciliar', descricao: 'Visita domiciliar agendada com PPDT', resultado: '', responsavel: 'PPDT', data_acao: '2026-04-05', status: 'pendente', created_at: '2026-03-22T11:00:00Z' },
    { id: 'ac3', aluno_id: 'a3', escola_id: 6, tipo: 'encaminhamento_cras', descricao: 'Encaminhamento ao CRAS para suporte familiar', resultado: 'Família atendida pelo CRAS — acompanhamento iniciado.', responsavel: 'Direção', data_acao: '2026-03-20', status: 'realizada', created_at: '2026-03-20T14:30:00Z' },
    { id: 'ac4', aluno_id: 'a5', escola_id: 4, tipo: 'contato_responsavel', descricao: 'Contato com responsável para confirmar retorno', resultado: 'Confirmado retorno regular.', responsavel: 'Coordenação', data_acao: '2026-03-26', status: 'realizada', created_at: '2026-03-26T09:30:00Z' },
  ]);

  // ── PPDT (Face e PCA) ──────────────────────────────────────────────────────
  writeTable('ppdt_face', seedFace());
  writeTable('ppdt_pca', seedPca());

  // ── Recomposição ───────────────────────────────────────────────────────────
  const turmas = seedTurmas();
  writeTable('recomposicao_turmas', turmas);
  writeTable('recomposicao_diagnosticos', seedDiagnosticos(turmas));
}

function mkEscola(
  id: number, nome: string, diretor: string, endereco: string, telefone: string, email: string,
  ideb: number, aprovacao: number, evasao: number, frequencia: number,
  matriculas: number, matriculas_anterior: number, preenchimento_sige: number,
  status_semaforo: 'verde' | 'amarelo' | 'vermelho',
  status_cdg: 'Em dia' | 'Atrasado' | 'Crítico',
  etapas_cdg: number,
): EscolaDB {
  return {
    id, nome, diretor, endereco, telefone, email,
    ideb, aprovacao, evasao, frequencia,
    matriculas, matriculas_anterior, preenchimento_sige,
    status_semaforo, status_cdg, etapas_cdg,
    foto: '',
    turmas: Math.max(8, Math.round(matriculas / 35)),
    professores: Math.max(15, Math.round(matriculas / 22)),
    funcionarios: Math.max(8, Math.round(matriculas / 60)),
    nota_portugues: +(6 + Math.random() * 2).toFixed(1),
    nota_matematica: +(6 + Math.random() * 2).toFixed(1),
    nota_media: +(6 + Math.random() * 2).toFixed(1),
    visitas_realizadas: Math.floor(Math.random() * 5) + 1,
    meta_aprovacao: 95,
    meta_frequencia: 92,
    meta_evasao: 2,
    observacoes: '',
    map_url: null,
    tipo_escola: 'Escola Municipal de Ensino Fundamental e Médio',
    zona: 'Urbana',
    updated_at: nowIso(),
  };
}

function mkVisita(
  id: number, escola_id: number, escola_nome: string, data: string, hora: string,
  tipo: string, objetivo: string,
  status: 'Agendada' | 'Realizada' | 'Cancelada' | 'Reagendada',
  relato: string, pontos_fortes: string, pontos_atencao: string, criado_em: string,
): VisitaDB {
  return { id, escola_id, escola_nome, data, hora, tipo, objetivo, status, relato, pontos_fortes, pontos_atencao, criado_em, updated_at: nowIso() };
}

function mkRelatorio(
  id: number, titulo: string, descricao: string, modulo: string,
  formato: 'PDF' | 'Excel', tamanho: string, data_geracao: string, hora_geracao: string,
  status: 'Pronto' | 'Gerando' | 'Erro', periodo: string, escola: string | null,
): RelatorioDB {
  return { id, titulo, descricao, modulo, formato, tamanho, data_geracao, hora_geracao, gerado_por: 'Superintendente Regional', status, periodo, escola, created_at: nowIso() };
}

function generateCdgChecklist(rows: CdGEscolaDB[]): CdGChecklistDB[] {
  const padrao: Omit<CdGChecklistDB, 'id' | 'cdg_escola_id' | 'concluido'>[] = [
    { etapa_index: 0, descricao: 'Diagnóstico situacional realizado' },
    { etapa_index: 0, descricao: 'Metas e indicadores definidos' },
    { etapa_index: 0, descricao: 'Plano de Ação elaborado e validado' },
    { etapa_index: 0, descricao: 'Equipe gestora alinhada com o planejamento' },
    { etapa_index: 1, descricao: 'Ações do Plano de Ação em execução' },
    { etapa_index: 1, descricao: 'Monitoramento semanal de frequência ativo' },
    { etapa_index: 1, descricao: 'Registros de acompanhamento pedagógico atualizados' },
    { etapa_index: 1, descricao: 'SIGE com preenchimento acima de 80%' },
    { etapa_index: 2, descricao: 'Reunião SMAR realizada com equipe gestora' },
    { etapa_index: 2, descricao: 'Análise de resultados do bimestre concluída' },
    { etapa_index: 2, descricao: 'Ata da reunião SMAR registrada' },
    { etapa_index: 2, descricao: 'Indicadores comparados com metas estabelecidas' },
    { etapa_index: 3, descricao: 'Fragilidades identificadas e documentadas' },
    { etapa_index: 3, descricao: 'Plano de Ação revisado com novas estratégias' },
    { etapa_index: 3, descricao: 'Responsáveis pelas correções definidos' },
    { etapa_index: 3, descricao: 'Prazo para correções estabelecido' },
    { etapa_index: 4, descricao: 'Parada Reflexiva agendada e comunicada' },
    { etapa_index: 4, descricao: 'Participação de toda a equipe pedagógica' },
    { etapa_index: 4, descricao: 'Boas práticas identificadas e registradas' },
    { etapa_index: 4, descricao: 'Encaminhamentos para o próximo ciclo definidos' },
  ];
  const out: CdGChecklistDB[] = [];
  let nextChecklistId = 1;
  for (const cdg of rows) {
    for (const item of padrao) {
      out.push({
        id: nextChecklistId++,
        cdg_escola_id: cdg.id,
        etapa_index: item.etapa_index,
        descricao: item.descricao,
        concluido: item.etapa_index < cdg.etapas_concluidas,
      });
    }
  }
  return out;
}

function seedFace(): Row[] {
  const out: Row[] = [];
  let id = 1;
  const escolasIds = [1, 2, 3, 4, 5, 6, 7, 8];
  const meses = [3, 4];
  for (const m of meses) {
    for (const eid of escolasIds) {
      const totalAlunos = 600 + Math.floor(Math.random() * 700);
      const ppdtsTotal = 3 + Math.floor(Math.random() * 4);
      const ppdtsAtivos = Math.max(0, ppdtsTotal - Math.floor(Math.random() * 2));
      const reunioesPrevistas = 4;
      const reunioesRealizadas = Math.max(0, reunioesPrevistas - Math.floor(Math.random() * 2));
      const ratio = ppdtsAtivos / ppdtsTotal;
      const status = ratio >= 0.9 ? 'concluido' : ratio >= 0.5 ? 'parcial' : 'pendente';
      out.push({
        id: id++, escola_id: eid, mes: m, ano: 2026,
        total_alunos: totalAlunos,
        alunos_atendidos: Math.round(totalAlunos * (0.6 + Math.random() * 0.35)),
        reunioes_realizadas: reunioesRealizadas,
        reunioes_previstas: reunioesPrevistas,
        ppdts_ativos: ppdtsAtivos,
        ppdts_total: ppdtsTotal,
        status,
        observacoes: null,
        updated_at: nowIso(),
      });
    }
  }
  return out;
}

function seedPca(): Row[] {
  const out: Row[] = [];
  let id = 1;
  const escolasIds = [1, 2, 3, 4, 5, 6, 7, 8];
  const meses = [3, 4];
  for (const m of meses) {
    for (const eid of escolasIds) {
      const coordTotal = 4 + Math.floor(Math.random() * 4);
      const coordAtivos = Math.max(1, coordTotal - Math.floor(Math.random() * 2));
      const metaHoras = 40;
      const horas = Math.round(metaHoras * (0.4 + Math.random() * 0.6));
      const encontrosPrev = 4;
      const encontros = Math.max(0, encontrosPrev - Math.floor(Math.random() * 2));
      const ratio = horas / metaHoras;
      const status = ratio >= 0.9 ? 'concluido' : ratio >= 0.5 ? 'parcial' : 'pendente';
      out.push({
        id: id++, escola_id: eid, mes: m, ano: 2026,
        coordenadores_ativos: coordAtivos,
        coordenadores_total: coordTotal,
        horas_formacao: horas,
        meta_horas: metaHoras,
        encontros_realizados: encontros,
        encontros_previstos: encontrosPrev,
        status,
        observacoes: null,
        updated_at: nowIso(),
      });
    }
  }
  return out;
}

function seedTurmas(): Row[] {
  const out: Row[] = [];
  let id = 1;
  const escolasIds = [1, 2, 3, 4, 5, 6, 7, 8];
  const series = ['6º Ano EF', '7º Ano EF', '8º Ano EF', '9º Ano EF', '1º Ano EM', '2º Ano EM', '3º Ano EM'];
  const componentes = ['Português', 'Matemática'];
  for (const eid of escolasIds) {
    const seriesEscola = series.slice(0, 4);
    for (const s of seriesEscola) {
      for (const c of componentes) {
        out.push({
          id: id++, escola_id: eid, turma: 'A', serie: s, componente: c,
          professor: null, total_alunos: 25 + Math.floor(Math.random() * 12), ano: 2026,
        });
      }
    }
  }
  return out;
}

function seedDiagnosticos(turmas: Row[]): Row[] {
  const out: Row[] = [];
  let id = 1;
  const meses = [3, 4];
  for (const m of meses) {
    for (const t of turmas) {
      // ~70% das turmas têm diagnóstico
      if (Math.random() < 0.7) {
        const total = t.total_alunos as number;
        const abaixo = Math.floor(total * (0.1 + Math.random() * 0.3));
        const basico = Math.floor((total - abaixo) * (0.2 + Math.random() * 0.3));
        const adequado = Math.floor((total - abaixo - basico) * 0.6);
        const avancado = Math.max(0, total - abaixo - basico - adequado);
        const ratio = (adequado + avancado) / total;
        const status = ratio >= 0.7 ? 'concluido' : ratio >= 0.4 ? 'parcial' : 'pendente';
        out.push({
          id: id++, turma_id: t.id, escola_id: t.escola_id,
          periodo: `${m}/2026`, mes: m, ano: 2026,
          alunos_abaixo: abaixo, alunos_basico: basico, alunos_adequado: adequado, alunos_avancado: avancado,
          estrategia: null, status, observacoes: null, updated_at: nowIso(),
        });
      }
    }
  }
  return out;
}
