import { useState } from 'react';

interface Props {
  titulo?: string;
  dados: Record<string, string | number>;
  contexto: string;
}

function gerarAnalise(contexto: string, dados: Record<string, string | number>): string {
  const entries = Object.entries(dados);
  const positivos: string[] = [];
  const negativos: string[] = [];
  const recomendacoes: string[] = [];

  entries.forEach(([key, val]) => {
    const v = Number(val);
    if (key.toLowerCase().includes('aprovacao') || key.toLowerCase().includes('aprovação')) {
      if (v >= 90) positivos.push(`taxa de aprovação de ${v}% acima da meta`);
      else if (v < 80) negativos.push(`aprovação crítica de ${v}% — abaixo do mínimo aceitável`);
      else negativos.push(`aprovação de ${v}% ainda abaixo da meta de 95%`);
    }
    if (key.toLowerCase().includes('evasao') || key.toLowerCase().includes('evasão')) {
      if (v <= 2) positivos.push(`evasão controlada em ${v}%`);
      else if (v > 4) { negativos.push(`evasão elevada de ${v}% — risco alto`); recomendacoes.push('acionar protocolo de Busca Ativa imediatamente'); }
      else negativos.push(`evasão de ${v}% requer monitoramento`);
    }
    if (key.toLowerCase().includes('frequencia') || key.toLowerCase().includes('frequência')) {
      if (v >= 90) positivos.push(`frequência média de ${v}% dentro da meta`);
      else { negativos.push(`frequência de ${v}% abaixo do esperado`); recomendacoes.push('intensificar acompanhamento de frequência por turma'); }
    }
    if (key.toLowerCase().includes('sige')) {
      if (v >= 90) positivos.push(`preenchimento SIGE de ${v}% — excelente`);
      else if (v < 50) { negativos.push(`SIGE crítico: apenas ${v}% preenchido`); recomendacoes.push('cobrar preenchimento SIGE com urgência — prazo em risco'); }
      else recomendacoes.push(`elevar preenchimento SIGE de ${v}% para acima de 90%`);
    }
    if (key.toLowerCase().includes('ideb')) {
      if (v >= 6.5) positivos.push(`IDEB de ${v} acima da média regional`);
      else if (v < 5.5) { negativos.push(`IDEB de ${v} abaixo da média — atenção`); recomendacoes.push('revisar estratégias pedagógicas e recomposição de aprendizagens'); }
    }
  });

  if (recomendacoes.length === 0) recomendacoes.push('manter o acompanhamento sistemático e registrar boas práticas para replicação');

  let texto = `Com base nos dados de ${contexto}, a análise indica `;
  if (positivos.length > 0) texto += `pontos positivos como ${positivos.slice(0, 2).join(' e ')}. `;
  if (negativos.length > 0) texto += `Entretanto, há preocupações com ${negativos.slice(0, 2).join(' e ')}. `;
  texto += `Recomenda-se: ${recomendacoes.slice(0, 2).join('; ')}.`;

  return texto;
}

export default function AnaliseIA({ titulo = 'Análise por IA', dados, contexto }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analise, setAnalise] = useState('');

  const handleGerar = () => {
    setLoading(true);
    setExpanded(true);
    setTimeout(() => {
      setAnalise(gerarAnalise(contexto, dados));
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="bg-gradient-to-r from-[#0F2744]/5 to-[#00A86B]/5 border border-[#00A86B]/20 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center bg-[#00A86B]/10 rounded-lg">
            <i className="ri-sparkling-line text-[#00A86B] text-sm"></i>
          </div>
          <span className="text-xs font-bold text-gray-700">{titulo}</span>
        </div>
        <button
          onClick={handleGerar}
          className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-[#00A86B] text-white rounded-lg hover:bg-[#009960] cursor-pointer transition-colors whitespace-nowrap"
        >
          <i className="ri-sparkling-line text-xs"></i>
          {analise ? 'Reanalisar' : 'Gerar Análise'}
        </button>
      </div>
      {expanded && (
        <div className="px-5 pb-4">
          {loading ? (
            <div className="flex items-center gap-3 py-2">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-[#00A86B] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
                ))}
              </div>
              <span className="text-xs text-gray-500">Analisando dados...</span>
            </div>
          ) : (
            <p className="text-xs text-gray-600 leading-relaxed border-t border-[#00A86B]/10 pt-3">{analise}</p>
          )}
        </div>
      )}
    </div>
  );
}
