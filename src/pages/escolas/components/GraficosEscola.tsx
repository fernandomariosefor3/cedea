import { EscolaEditavel } from '@/context/DataContext';

interface Props {
  escola: EscolaEditavel;
}

function BarraIndicador({ label, value, meta, cor }: { label: string; value: number; meta?: number; cor: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[10px] text-gray-500 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          {meta !== undefined && (
            <span className="text-[10px] text-gray-400">meta: {meta}%</span>
          )}
          <span className="text-xs font-bold text-gray-700">{value}%</span>
        </div>
      </div>
      <div className="relative w-full bg-gray-100 rounded-full h-2.5">
        {meta !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
            style={{ left: `${meta}%` }}
          ></div>
        )}
        <div
          className={`h-2.5 rounded-full transition-all duration-700 ${cor}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

function RadarSimples({ escola }: { escola: EscolaEditavel }) {
  const indicadores = [
    { label: 'Aprovação', value: escola.aprovacao / 100 },
    { label: 'Frequência', value: escola.frequencia / 100 },
    { label: 'SIGE', value: escola.preenchimentoSige / 100 },
    { label: 'IDEB', value: escola.ideb / 10 },
    { label: 'Evasão', value: 1 - escola.evasao / 10 },
  ];

  const cx = 80;
  const cy = 80;
  const r = 60;
  const n = indicadores.length;

  const points = indicadores.map((ind, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    const x = cx + r * ind.value * Math.cos(angle);
    const y = cy + r * ind.value * Math.sin(angle);
    return { x, y, label: ind.label, angle };
  });

  const gridPoints = (scale: number) =>
    indicadores.map((_, i) => {
      const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
      return `${cx + r * scale * Math.cos(angle)},${cy + r * scale * Math.sin(angle)}`;
    }).join(' ');

  const dataPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {[0.25, 0.5, 0.75, 1].map(scale => (
          <polygon key={scale} points={gridPoints(scale)} fill="none" stroke="#e5e7eb" strokeWidth="1" />
        ))}
        {indicadores.map((_, i) => {
          const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
          return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="#e5e7eb" strokeWidth="1" />;
        })}
        <path d={dataPath} fill="#00A86B" fillOpacity="0.2" stroke="#00A86B" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#00A86B" />
        ))}
        {indicadores.map((ind, i) => {
          const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
          const lx = cx + (r + 16) * Math.cos(angle);
          const ly = cy + (r + 16) * Math.sin(angle);
          return (
            <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#6b7280">
              {ind.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default function GraficosEscola({ escola }: Props) {
  const variacaoMatriculas = escola.matriculas - (escola.matriculasAnterior || escola.matriculas);
  const variacaoPct = escola.matriculasAnterior
    ? (((escola.matriculas - escola.matriculasAnterior) / escola.matriculasAnterior) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-5">
      {/* Indicadores com barras */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Indicadores vs Metas</h4>
          <BarraIndicador label="Aprovação" value={escola.aprovacao} meta={escola.metaAprovacao} cor={escola.aprovacao >= (escola.metaAprovacao || 95) ? 'bg-emerald-400' : escola.aprovacao >= 80 ? 'bg-yellow-400' : 'bg-red-400'} />
          <BarraIndicador label="Frequência" value={escola.frequencia} meta={escola.metaFrequencia} cor={escola.frequencia >= (escola.metaFrequencia || 92) ? 'bg-emerald-400' : escola.frequencia >= 80 ? 'bg-yellow-400' : 'bg-red-400'} />
          <BarraIndicador label="SIGE" value={escola.preenchimentoSige} cor={escola.preenchimentoSige >= 90 ? 'bg-emerald-400' : escola.preenchimentoSige >= 50 ? 'bg-yellow-400' : 'bg-red-400'} />
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] text-gray-500 font-medium">Evasão</span>
              <span className="text-xs font-bold text-gray-700">{escola.evasao}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full transition-all duration-700 ${escola.evasao <= 2 ? 'bg-emerald-400' : escola.evasao <= 4 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${Math.min(escola.evasao * 5, 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Radar */}
        <div>
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Perfil Geral</h4>
          <RadarSimples escola={escola} />
        </div>
      </div>

      {/* Notas e matrículas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-[10px] text-gray-400 font-medium">Nota Português</p>
          <p className="text-2xl font-bold text-[#0F2744] mt-1">{escola.notaPortugues?.toFixed(1) || '—'}</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full bg-[#0F2744]" style={{ width: `${((escola.notaPortugues || 0) / 10) * 100}%` }}></div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-[10px] text-gray-400 font-medium">Nota Matemática</p>
          <p className="text-2xl font-bold text-[#00A86B] mt-1">{escola.notaMatematica?.toFixed(1) || '—'}</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full bg-[#00A86B]" style={{ width: `${((escola.notaMatematica || 0) / 10) * 100}%` }}></div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-[10px] text-gray-400 font-medium">Variação Matrículas</p>
          <p className={`text-2xl font-bold mt-1 ${variacaoMatriculas >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {variacaoMatriculas >= 0 ? '+' : ''}{variacaoMatriculas}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">{variacaoPct}% vs ano anterior</p>
        </div>
      </div>
    </div>
  );
}
