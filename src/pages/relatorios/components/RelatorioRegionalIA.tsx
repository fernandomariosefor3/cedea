import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { CdGEscola } from '@/hooks/useCdG';
import { Visita } from '@/hooks/useVisitas';

interface Props {
  cdgData: CdGEscola[];
  visitasData: Visita[];
}

interface SecaoRelatorio {
  titulo: string;
  icone: string;
  cor: string;
  conteudo: string[];
  alertas?: string[];
  destaques?: string[];
}

function gerarRelatorioCompleto(
  escolas: ReturnType<typeof useData>['escolas'],
  stats: ReturnType<typeof useData>['stats'],
  cdgData: CdGEscola[],
  visitasData: Visita[]
): SecaoRelatorio[] {
  const getCdG = (id: number) => cdgData.find(c => c.escola_id === id);

  const escolasVerdes = escolas.filter(e => e.statusSemaforo === 'verde');
  const escolasVermelhas = escolas.filter(e => e.statusSemaforo === 'vermelho');
  const melhorEscola = [...escolas].sort((a, b) => b.ideb - a.ideb)[0];

  const secaoGeral: SecaoRelatorio = {
    titulo: 'Visão Geral da Regional',
    icone: 'ri-dashboard-3-line',
    cor: 'text-[#0F2744]',
    conteudo: [
      `A Regional conta com ${stats.totalEscolas} escolas e ${stats.totalMatriculas.toLocaleString('pt-BR')} alunos matriculados.`,
      `O IDEB médio regional é de ${stats.mediaIdeb}, com destaque para ${melhorEscola?.nome} (IDEB ${melhorEscola?.ideb.toFixed(1)}).`,
      `${escolasVerdes.length} escola${escolasVerdes.length !== 1 ? 's' : ''} (${Math.round((escolasVerdes.length / stats.totalEscolas) * 100)}%) estão no semáforo verde.`,
      `${escolasVermelhas.length} escola${escolasVermelhas.length !== 1 ? 's' : ''} apresentam situação crítica e necessitam de intervenção imediata.`,
    ],
    alertas: escolasVermelhas.map(e => `${e.nome}: IDEB ${e.ideb.toFixed(1)}, evasão ${e.evasao}%, SIGE ${e.preenchimentoSige}%`),
    destaques: escolasVerdes.slice(0, 3).map(e => `${e.nome}: aprovação ${e.aprovacao}%, frequência ${e.frequencia}%`),
  };

  const escolasEvasaoCritica = escolas.filter(e => e.evasao > 4);
  const escolasFreqBaixa = escolas.filter(e => e.frequencia < 85);

  const secaoFluxo: SecaoRelatorio = {
    titulo: 'Fluxo Escolar',
    icone: 'ri-flow-chart',
    cor: 'text-emerald-600',
    conteudo: [
      `A taxa de aprovação média regional é de ${stats.mediaAprovacao}%, ${stats.mediaAprovacao >= 90 ? 'acima' : 'abaixo'} da meta de 95%.`,
      `A frequência média é de ${stats.mediaFrequencia}%, ${stats.mediaFrequencia >= 92 ? 'dentro' : 'abaixo'} da meta de 92%.`,
      `A evasão média regional é de ${stats.mediaEvasao}%, ${stats.mediaEvasao <= 2 ? 'dentro do tolerável' : 'acima do limite aceitável de 2%'}.`,
    ],
    alertas: [
      ...escolasEvasaoCritica.map(e => `Evasão crítica: ${e.nome} — ${e.evasao}%`),
      ...escolasFreqBaixa.map(e => `Frequência baixa: ${e.nome} — ${e.frequencia}%`),
    ],
    destaques: escolas.filter(e => e.aprovacao >= 94).map(e => `${e.nome}: aprovação ${e.aprovacao}%`),
  };

  const escolasSigeCritico = escolas.filter(e => e.preenchimentoSige < 50);
  const escolasSigeCompleto = escolas.filter(e => e.preenchimentoSige === 100);

  const secaoNotas: SecaoRelatorio = {
    titulo: 'Preenchimento SIGE & Notas',
    icone: 'ri-file-list-3-line',
    cor: 'text-violet-600',
    conteudo: [
      `O preenchimento médio do SIGE na regional é de ${stats.mediaSige}%.`,
      `${escolasSigeCompleto.length} escola${escolasSigeCompleto.length !== 1 ? 's' : ''} atingiram 100% de preenchimento.`,
      `${escolasSigeCritico.length} escola${escolasSigeCritico.length !== 1 ? 's' : ''} estão em situação crítica (abaixo de 50%).`,
    ],
    alertas: escolasSigeCritico.map(e => `SIGE crítico: ${e.nome} — apenas ${e.preenchimentoSige}% preenchido`),
    destaques: escolasSigeCompleto.map(e => `${e.nome}: SIGE 100% concluído`),
  };

  const cdgEmDia = escolas.filter(e => getCdG(e.id)?.status_cdg === 'Em dia').length;
  const cdgCritico = escolas.filter(e => getCdG(e.id)?.status_cdg === 'Crítico').length;
  const mediaEtapas = cdgData.length > 0
    ? (cdgData.reduce((s, c) => s + c.etapas_concluidas, 0) / cdgData.length).toFixed(1)
    : '0';
  const totalEvidencias = cdgData.reduce((s, c) => s + c.evidencias.length, 0);

  const secaoCdG: SecaoRelatorio = {
    titulo: 'Ciclo de Gestão Cearense (CdG)',
    icone: 'ri-loop-right-line',
    cor: 'text-orange-600',
    conteudo: [
      `A média de etapas concluídas do CdG na regional é de ${mediaEtapas}/5.`,
      `${cdgEmDia} escola${cdgEmDia !== 1 ? 's' : ''} estão em dia com o ciclo de gestão.`,
      `${cdgCritico} escola${cdgCritico !== 1 ? 's' : ''} estão em situação crítica no CdG.`,
      `Foram registradas ${totalEvidencias} evidências no total.`,
    ],
    alertas: escolas
      .filter(e => getCdG(e.id)?.status_cdg === 'Crítico')
      .map(e => `CdG crítico: ${e.nome} — ${getCdG(e.id)?.etapas_concluidas ?? 0}/5 etapas`),
    destaques: escolas
      .filter(e => getCdG(e.id)?.etapas_concluidas === 5)
      .map(e => `${e.nome}: CdG completo (5/5 etapas)`),
  };

  const visitasRealizadas = visitasData.filter(v => v.status === 'Realizada').length;
  const visitasAgendadas = visitasData.filter(v => v.status === 'Agendada').length;
  const totalEnc = visitasData.flatMap(v => v.encaminhamentos);
  const encPendentes = totalEnc.filter(e => e.status === 'Pendente').length;
  const encConcluidos = totalEnc.filter(e => e.status === 'Concluído').length;
  const taxaConclusao = totalEnc.length > 0 ? Math.round((encConcluidos / totalEnc.length) * 100) : 0;

  const secaoVisitas: SecaoRelatorio = {
    titulo: 'Visitas Técnicas',
    icone: 'ri-map-pin-line',
    cor: 'text-teal-600',
    conteudo: [
      `Foram realizadas ${visitasRealizadas} visita${visitasRealizadas !== 1 ? 's' : ''} técnica${visitasRealizadas !== 1 ? 's' : ''} no período, com ${visitasAgendadas} agendada${visitasAgendadas !== 1 ? 's' : ''}.`,
      `Total de ${totalEnc.length} encaminhamento${totalEnc.length !== 1 ? 's' : ''} gerado${totalEnc.length !== 1 ? 's' : ''} nas visitas.`,
      `Taxa de conclusão de encaminhamentos: ${taxaConclusao}% (${encConcluidos} de ${totalEnc.length}).`,
      encPendentes > 0
        ? `${encPendentes} encaminhamento${encPendentes !== 1 ? 's' : ''} ainda pendente${encPendentes !== 1 ? 's' : ''} de execução.`
        : 'Todos os encaminhamentos foram concluídos.',
    ],
    alertas: encPendentes > 0 ? [`${encPendentes} encaminhamentos pendentes de visitas anteriores`] : [],
    destaques: visitasData.filter(v => v.status === 'Realizada' && v.encaminhamentos.length > 0)
      .slice(0, 2)
      .map(v => `Visita a ${v.escola_nome}: ${v.encaminhamentos.filter(e => e.status === 'Concluído').length}/${v.encaminhamentos.length} encaminhamentos concluídos`),
  };

  const recomendacoes: string[] = [];
  if (stats.mediaEvasao > 2) recomendacoes.push(`Intensificar protocolo de Busca Ativa nas ${escolasEvasaoCritica.length} escolas com evasão acima de 4%.`);
  if (stats.mediaSige < 80) recomendacoes.push(`Realizar cobrança sistemática do SIGE — ${escolasSigeCritico.length} escolas abaixo de 50%.`);
  if (cdgCritico > 0) recomendacoes.push(`Agendar visitas de intervenção nas ${cdgCritico} escolas com CdG crítico.`);
  if (stats.mediaAprovacao < 90) recomendacoes.push('Implementar ações de recomposição de aprendizagens nas escolas com aprovação abaixo de 90%.');
  if (encPendentes > 3) recomendacoes.push(`Cobrar execução dos ${encPendentes} encaminhamentos pendentes de visitas anteriores.`);
  if (stats.mediaFrequencia < 90) recomendacoes.push('Reforçar estratégias de combate à infrequência nas escolas com frequência abaixo de 90%.');
  if (recomendacoes.length === 0) recomendacoes.push('Regional com bom desempenho geral. Manter o acompanhamento sistemático e registrar boas práticas.');

  const secaoRecomendacoes: SecaoRelatorio = {
    titulo: 'Recomendações e Encaminhamentos',
    icone: 'ri-sparkling-line',
    cor: 'text-[#00A86B]',
    conteudo: recomendacoes,
  };

  return [secaoGeral, secaoFluxo, secaoNotas, secaoCdG, secaoVisitas, secaoRecomendacoes];
}

export default function RelatorioRegionalIA({ cdgData, visitasData }: Props) {
  const { escolas, stats } = useData();
  const [gerado, setGerado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [secoes, setSecoes] = useState<SecaoRelatorio[]>([]);
  const [expandidas, setExpandidas] = useState<Set<number>>(new Set([0, 5]));
  const [periodo, setPeriodo] = useState('Abril 2026');
  const [exportando, setExportando] = useState(false);
  const [toastExport, setToastExport] = useState('');

  const handleGerar = () => {
    setLoading(true);
    setTimeout(() => {
      const resultado = gerarRelatorioCompleto(escolas, stats, cdgData, visitasData);
      setSecoes(resultado);
      setGerado(true);
      setLoading(false);
      setExpandidas(new Set([0, 5]));
    }, 1800);
  };

  const toggleSecao = (idx: number) => {
    setExpandidas(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleExportar = (formato: string) => {
    setExportando(true);
    setTimeout(() => {
      setExportando(false);
      setToastExport(`Relatório Regional exportado em ${formato}!`);
      setTimeout(() => setToastExport(''), 3000);
    }, 1500);
  };

  const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {toastExport && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-white text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
          <i className="ri-checkbox-circle-fill text-base"></i>
          {toastExport}
        </div>
      )}

      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#0F2744]/5 to-[#00A86B]/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-[#00A86B]/10 rounded-xl">
              <i className="ri-sparkling-line text-[#00A86B] text-lg"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Relatório Regional com Análise IA</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Gerado a partir dos dados reais lançados no sistema</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={periodo}
              onChange={e => setPeriodo(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-600 bg-white cursor-pointer focus:outline-none focus:border-[#00A86B]"
            >
              {['Abril 2026', 'Março 2026', 'Bimestre 1/2026', '1º Semestre 2026'].map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <button
              onClick={handleGerar}
              disabled={loading}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-all whitespace-nowrap ${loading ? 'bg-gray-100 text-gray-400' : 'bg-[#00A86B] text-white hover:bg-[#009960]'}`}
            >
              {loading ? (
                <><div className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div> Gerando...</>
              ) : (
                <><i className="ri-sparkling-line text-xs"></i> {gerado ? 'Reanalisar' : 'Gerar Relatório Regional'}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="px-6 py-12 flex flex-col items-center justify-center gap-4">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-2 h-2 bg-[#00A86B] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.12}s` }}></div>
            ))}
          </div>
          <p className="text-sm text-gray-500 font-medium">Analisando dados de {stats.totalEscolas} escolas...</p>
          <p className="text-xs text-gray-400">Processando fluxo escolar, CdG, visitas e indicadores</p>
        </div>
      )}

      {gerado && !loading && (
        <div>
          <div className="px-6 py-4 bg-[#0F2744] text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-widest">SEDUC Ceará — Superintendência Regional 1</p>
                <h2 className="text-base font-bold mt-0.5">Relatório Regional de Gestão Educacional</h2>
                <p className="text-xs text-white/60 mt-0.5">Período: {periodo} • Gerado em: {dataAtual}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportar('PDF')}
                  disabled={exportando}
                  className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <i className="ri-file-pdf-2-line text-xs"></i> PDF
                </button>
                <button
                  onClick={() => handleExportar('Excel')}
                  disabled={exportando}
                  className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 bg-emerald-500/80 text-white rounded-lg hover:bg-emerald-500 cursor-pointer transition-colors whitespace-nowrap"
                >
                  <i className="ri-file-excel-2-line text-xs"></i> Excel
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3 mt-4">
              {[
                { label: 'Escolas', value: stats.totalEscolas },
                { label: 'Matrículas', value: stats.totalMatriculas.toLocaleString('pt-BR') },
                { label: 'Aprovação', value: `${stats.mediaAprovacao}%` },
                { label: 'IDEB Médio', value: stats.mediaIdeb },
                { label: 'SIGE', value: `${stats.mediaSige}%` },
              ].map(k => (
                <div key={k.label} className="bg-white/10 rounded-lg px-3 py-2 text-center">
                  <p className="text-sm font-bold text-white">{k.value}</p>
                  <p className="text-[10px] text-white/50">{k.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {secoes.map((secao, idx) => (
              <div key={idx}>
                <button
                  onClick={() => toggleSecao(idx)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 flex-shrink-0">
                      <i className={`${secao.icone} text-sm ${secao.cor}`}></i>
                    </div>
                    <span className="text-xs font-bold text-gray-800">{secao.titulo}</span>
                    {secao.alertas && secao.alertas.length > 0 && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                        {secao.alertas.length} alerta{secao.alertas.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <i className={`${expandidas.has(idx) ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-gray-400`}></i>
                </button>

                {expandidas.has(idx) && (
                  <div className="px-6 pb-5 space-y-4">
                    <div className="space-y-2">
                      {secao.conteudo.map((linha, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0 mt-1.5"></div>
                          <p className="text-xs text-gray-700 leading-relaxed">{linha}</p>
                        </div>
                      ))}
                    </div>

                    {secao.alertas && secao.alertas.length > 0 && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <i className="ri-alarm-warning-line"></i> Pontos de Atenção
                        </p>
                        <ul className="space-y-1">
                          {secao.alertas.map((a, i) => (
                            <li key={i} className="text-xs text-red-700 flex items-start gap-2">
                              <i className="ri-arrow-right-line text-red-400 flex-shrink-0 mt-0.5 text-[10px]"></i>
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {secao.destaques && secao.destaques.length > 0 && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <i className="ri-thumb-up-line"></i> Destaques Positivos
                        </p>
                        <ul className="space-y-1">
                          {secao.destaques.map((d, i) => (
                            <li key={i} className="text-xs text-emerald-700 flex items-start gap-2">
                              <i className="ri-checkbox-circle-fill text-emerald-400 flex-shrink-0 mt-0.5 text-[10px]"></i>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[10px] text-gray-400">
              Relatório gerado automaticamente pelo SIGE Regional v1.0 • {dataAtual}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportar('PDF')}
                disabled={exportando}
                className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 cursor-pointer transition-colors whitespace-nowrap"
              >
                {exportando ? <div className="w-3 h-3 border-2 border-red-300 border-t-red-500 rounded-full animate-spin"></div> : <i className="ri-file-pdf-2-line text-xs"></i>}
                Exportar PDF
              </button>
              <button
                onClick={() => handleExportar('Excel')}
                disabled={exportando}
                className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 cursor-pointer transition-colors whitespace-nowrap"
              >
                {exportando ? <div className="w-3 h-3 border-2 border-emerald-300 border-t-emerald-500 rounded-full animate-spin"></div> : <i className="ri-file-excel-2-line text-xs"></i>}
                Exportar Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {!gerado && !loading && (
        <div className="px-6 py-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center bg-[#00A86B]/10 rounded-2xl">
            <i className="ri-sparkling-line text-3xl text-[#00A86B]"></i>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">Relatório Regional com IA</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              Clique em "Gerar Relatório Regional" para criar uma análise completa com dados reais de todas as escolas, CdG, visitas e indicadores.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-2 w-full max-w-md">
            {[
              { icon: 'ri-school-line', label: `${stats.totalEscolas} escolas analisadas` },
              { icon: 'ri-loop-right-line', label: `${cdgData.length} CdGs registrados` },
              { icon: 'ri-map-pin-line', label: `${visitasData.length} visitas técnicas` },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg mx-auto mb-1.5">
                  <i className={`${item.icon} text-gray-500 text-sm`}></i>
                </div>
                <p className="text-[10px] text-gray-500 font-medium leading-tight">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}