import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface NovaEscolaInput {
  nome: string;
  diretor: string;
  endereco: string;
  telefone: string;
  email: string;
  matriculas: number;
  turmas: number;
  professores: number;
  funcionarios: number;
  ideb: number;
  aprovacao: number;
  evasao: number;
  frequencia: number;
  preenchimentoSige: number;
  tipoEscola: string;
  zona: string;
  observacoes: string;
  foto: string;
}

interface Props {
  onSave: (data: NovaEscolaInput) => Promise<boolean>;
  onClose: () => void;
}

const TABS = ['Identificação', 'Indicadores', 'Observações'] as const;
type Tab = typeof TABS[number];

const TIPOS_ESCOLA = [
  'Escola Municipal de Ensino Fundamental',
  'Escola Municipal de Ensino Infantil',
  'Escola Municipal de Ensino Médio',
  'Escola Municipal de Ensino Fundamental e Médio',
  'Centro Municipal de Educação Infantil',
  'Escola de Tempo Integral',
];

const ZONAS = ['Urbana', 'Rural'];

const DEFAULT_FOTO = 'https://readdy.ai/api/search-image?query=modern%20school%20building%20exterior%20facade%20with%20green%20trees%20and%20clear%20sky%2C%20clean%20minimalist%20architecture%2C%20bright%20daylight%2C%20educational%20institution&width=800&height=400&seq=escola-default-01&orientation=landscape';

const defaultForm: NovaEscolaInput = {
  nome: '',
  diretor: '',
  endereco: '',
  telefone: '',
  email: '',
  matriculas: 0,
  turmas: 0,
  professores: 0,
  funcionarios: 0,
  ideb: 0,
  aprovacao: 0,
  evasao: 0,
  frequencia: 0,
  preenchimentoSige: 0,
  tipoEscola: '',
  zona: 'Urbana',
  observacoes: '',
  foto: '',
};

export default function ModalNovaEscola({ onSave, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Identificação');
  const [form, setForm] = useState<NovaEscolaInput>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof NovaEscolaInput, string>>>({});
  const [fotoPreview, setFotoPreview] = useState<string>('');
  const [fotoLoading, setFotoLoading] = useState(false);
  const [fotoMode, setFotoMode] = useState<'upload' | 'url'>('upload');
  const [fotoUrl, setFotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof NovaEscolaInput>(field: K, value: NovaEscolaInput[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, foto: 'Apenas imagens são permitidas (JPG, PNG, WEBP)' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, foto: 'Imagem muito grande. Máximo 5MB.' }));
      return;
    }

    setFotoLoading(true);
    setErrors(prev => ({ ...prev, foto: undefined }));

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setFotoPreview(result);
      set('foto', result);
      setFotoLoading(false);
    };
    reader.onerror = () => {
      setErrors(prev => ({ ...prev, foto: 'Erro ao ler o arquivo.' }));
      setFotoLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlApply = () => {
    if (!fotoUrl.trim()) return;
    setFotoPreview(fotoUrl.trim());
    set('foto', fotoUrl.trim());
    setErrors(prev => ({ ...prev, foto: undefined }));
  };

  const handleRemoveFoto = () => {
    setFotoPreview('');
    setFotoUrl('');
    set('foto', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof NovaEscolaInput, string>> = {};
    if (!form.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!form.diretor.trim()) newErrors.diretor = 'Diretor(a) é obrigatório';
    if (!form.endereco.trim()) newErrors.endereco = 'Endereço é obrigatório';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setActiveTab('Identificação');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const dataToSave = {
      ...form,
      foto: form.foto || DEFAULT_FOTO,
    };
    const ok = await onSave(dataToSave);
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1000);
    }
  };

  const inputClass = (field?: keyof NovaEscolaInput) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-colors ${
      field && errors[field]
        ? 'border-red-400 focus:border-red-500 bg-red-50'
        : 'border-gray-200 focus:border-[#00A86B]'
    }`;

  const modal = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ zIndex: 100000 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-[#00A86B]/10 rounded-xl">
              <i className="ri-school-line text-[#00A86B] text-base"></i>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">Nova Escola</h2>
              <p className="text-xs text-gray-400 mt-0.5">Cadastrar nova escola na regional</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 mr-6 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'border-[#00A86B] text-[#00A86B]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── IDENTIFICAÇÃO ── */}
          {activeTab === 'Identificação' && (
            <div className="space-y-4">

              {/* Foto da escola */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  Foto da Escola
                  <span className="text-[10px] font-normal text-gray-400 ml-2">(opcional — será usada como capa)</span>
                </label>

                {/* Preview */}
                {fotoPreview ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden mb-2">
                    <img
                      src={fotoPreview}
                      alt="Preview da escola"
                      className="w-full h-full object-cover object-top"
                      onError={() => {
                        setErrors(prev => ({ ...prev, foto: 'URL inválida ou imagem não carregou.' }));
                        setFotoPreview('');
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <button
                      onClick={handleRemoveFoto}
                      className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-lg cursor-pointer transition-colors"
                      title="Remover foto"
                    >
                      <i className="ri-delete-bin-line text-xs"></i>
                    </button>
                    <p className="absolute bottom-2 left-3 text-white text-[10px] font-medium">
                      <i className="ri-checkbox-circle-fill text-emerald-400 mr-1"></i>
                      Foto selecionada
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => fotoMode === 'upload' && fileInputRef.current?.click()}
                    className={`w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
                      fotoMode === 'upload'
                        ? 'border-gray-200 hover:border-[#00A86B] hover:bg-[#00A86B]/5 cursor-pointer'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {fotoLoading ? (
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-[#00A86B] rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl">
                          <i className="ri-image-add-line text-gray-400 text-lg"></i>
                        </div>
                        <p className="text-xs text-gray-400 text-center">
                          {fotoMode === 'upload' ? 'Clique para selecionar uma imagem' : 'Cole a URL da imagem abaixo'}
                        </p>
                        <p className="text-[10px] text-gray-300">
                          {fotoMode === 'upload' ? 'JPG, PNG ou WEBP — máx. 5MB' : ''}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {errors.foto && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                    <i className="ri-error-warning-line"></i>
                    {errors.foto}
                  </p>
                )}

                {/* Toggle upload / URL */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setFotoMode('upload')}
                      className={`px-3 py-1.5 text-[10px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        fotoMode === 'upload' ? 'bg-white text-gray-700' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <i className="ri-upload-2-line mr-1"></i>
                      Upload
                    </button>
                    <button
                      onClick={() => setFotoMode('url')}
                      className={`px-3 py-1.5 text-[10px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        fotoMode === 'url' ? 'bg-white text-gray-700' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <i className="ri-link-m mr-1"></i>
                      URL
                    </button>
                  </div>
                  {fotoMode === 'upload' && !fotoPreview && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] text-[#00A86B] font-semibold hover:underline cursor-pointer whitespace-nowrap"
                    >
                      Selecionar arquivo
                    </button>
                  )}
                </div>

                {/* Input URL */}
                {fotoMode === 'url' && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="url"
                      value={fotoUrl}
                      onChange={e => setFotoUrl(e.target.value)}
                      placeholder="https://exemplo.com/foto-escola.jpg"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A86B]"
                      onKeyDown={e => e.key === 'Enter' && handleUrlApply()}
                    />
                    <button
                      onClick={handleUrlApply}
                      disabled={!fotoUrl.trim()}
                      className="px-3 py-2 bg-[#00A86B] text-white text-xs font-semibold rounded-lg hover:bg-[#009960] cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Aplicar
                    </button>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                    Nome da Escola <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.nome}
                    onChange={e => set('nome', e.target.value)}
                    placeholder="Ex: E.M. João da Silva"
                    className={inputClass('nome')}
                  />
                  {errors.nome && <p className="text-[10px] text-red-500 mt-1">{errors.nome}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                    Diretor(a) <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.diretor}
                    onChange={e => set('diretor', e.target.value)}
                    placeholder="Nome completo"
                    className={inputClass('diretor')}
                  />
                  {errors.diretor && <p className="text-[10px] text-red-500 mt-1">{errors.diretor}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Telefone</label>
                  <input
                    value={form.telefone}
                    onChange={e => set('telefone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className={inputClass()}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                    Endereço <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.endereco}
                    onChange={e => set('endereco', e.target.value)}
                    placeholder="Rua, número, bairro, cidade"
                    className={inputClass('endereco')}
                  />
                  {errors.endereco && <p className="text-[10px] text-red-500 mt-1">{errors.endereco}</p>}
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">E-mail</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="escola@educacao.gov.br"
                    className={inputClass()}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Tipo de Escola</label>
                  <select
                    value={form.tipoEscola}
                    onChange={e => set('tipoEscola', e.target.value)}
                    className={inputClass()}
                  >
                    <option value="">Selecionar tipo...</option>
                    {TIPOS_ESCOLA.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Zona</label>
                  <select
                    value={form.zona}
                    onChange={e => set('zona', e.target.value)}
                    className={inputClass()}
                  >
                    {ZONAS.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Matrículas</label>
                  <input
                    type="number"
                    min={0}
                    value={form.matriculas || ''}
                    onChange={e => set('matriculas', +e.target.value)}
                    placeholder="0"
                    className={inputClass()}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Turmas</label>
                  <input
                    type="number"
                    min={0}
                    value={form.turmas || ''}
                    onChange={e => set('turmas', +e.target.value)}
                    placeholder="0"
                    className={inputClass()}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Professores</label>
                  <input
                    type="number"
                    min={0}
                    value={form.professores || ''}
                    onChange={e => set('professores', +e.target.value)}
                    placeholder="0"
                    className={inputClass()}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Funcionários</label>
                  <input
                    type="number"
                    min={0}
                    value={form.funcionarios || ''}
                    onChange={e => set('funcionarios', +e.target.value)}
                    placeholder="0"
                    className={inputClass()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── INDICADORES ── */}
          {activeTab === 'Indicadores' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                <i className="ri-information-line mr-1"></i>
                Preencha os indicadores iniciais. O semáforo será calculado automaticamente.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { field: 'aprovacao' as keyof NovaEscolaInput, label: 'Taxa de Aprovação (%)', min: 0, max: 100, step: 0.1 },
                  { field: 'evasao' as keyof NovaEscolaInput, label: 'Taxa de Evasão (%)', min: 0, max: 100, step: 0.1 },
                  { field: 'frequencia' as keyof NovaEscolaInput, label: 'Frequência Média (%)', min: 0, max: 100, step: 0.1 },
                  { field: 'ideb' as keyof NovaEscolaInput, label: 'IDEB', min: 0, max: 10, step: 0.1 },
                  { field: 'preenchimentoSige' as keyof NovaEscolaInput, label: 'Preenchimento SIGE (%)', min: 0, max: 100, step: 1 },
                ].map(({ field, label, min, max, step }) => (
                  <div key={field}>
                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">{label}</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={Number(form[field]) || 0}
                        onChange={e => set(field, +e.target.value as NovaEscolaInput[typeof field])}
                        className="flex-1 accent-[#00A86B]"
                      />
                      <input
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={Number(form[field]) || 0}
                        onChange={e => set(field, +e.target.value as NovaEscolaInput[typeof field])}
                        className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-[#00A86B]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── OBSERVAÇÕES ── */}
          {activeTab === 'Observações' && (
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Observações Iniciais</label>
              <textarea
                value={form.observacoes}
                onChange={e => set('observacoes', e.target.value)}
                rows={10}
                maxLength={500}
                placeholder="Registre observações sobre a escola, contexto, pontos de atenção..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00A86B] resize-none"
              />
              <p className="text-[10px] text-gray-400 mt-1 text-right">{form.observacoes.length}/500</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[10px] text-gray-400 flex items-center gap-1">
            <i className="ri-error-warning-line text-red-400"></i>
            Campos com <span className="text-red-400 font-bold mx-0.5">*</span> são obrigatórios
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap flex items-center gap-2 ${
                saved
                  ? 'bg-emerald-500 text-white'
                  : saving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#00A86B] text-white hover:bg-[#009960]'
              }`}
            >
              {saved ? (
                <><i className="ri-check-line"></i> Cadastrada!</>
              ) : saving ? (
                <><div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> Salvando...</>
              ) : (
                <><i className="ri-add-line"></i> Cadastrar Escola</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
