import MainLayout from '@/components/feature/MainLayout';
import KpiCard from './components/KpiCard';
import AlertasBanner from './components/AlertasBanner';
import RankingEscolas from './components/RankingEscolas';
import ProximasVisitas from './components/ProximasVisitas';
import SigeProgress from './components/SigeProgress';
import { useData } from '@/context/DataContext';

export default function HomePage() {
  const { stats, loading, error } = useData();

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#00A86B] rounded-full animate-spin"></div>
            <span className="text-sm">Carregando dashboard...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full mx-auto mb-3">
              <i className="ri-error-warning-line text-red-500 text-xl"></i>
            </div>
            <p className="text-gray-600 font-medium">{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-5">
          <KpiCard label="Total de Escolas" value={String(stats.totalEscolas)} icon="ri-school-line" color="text-[#0F2744]" bgColor="bg-[#0F2744]/10" trend={`${stats.totalMatriculas.toLocaleString('pt-BR')} matrículas`} trendUp />
          <KpiCard label="Taxa de Aprovação" value={`${stats.mediaAprovacao}%`} icon="ri-graduation-cap-line" color="text-emerald-600" bgColor="bg-emerald-50" trend={`IDEB médio: ${stats.mediaIdeb}`} trendUp={stats.mediaAprovacao >= 90} />
          <KpiCard label="Evasão Escolar" value={`${stats.mediaEvasao}%`} icon="ri-user-unfollow-line" color="text-orange-500" bgColor="bg-orange-50" trend={stats.mediaEvasao <= 2 ? 'Controlada' : 'Requer atenção'} trendUp={stats.mediaEvasao <= 2} />
          <KpiCard label="Preenchimento SIGE" value={`${stats.mediaSige}%`} icon="ri-file-list-3-line" color="text-violet-600" bgColor="bg-violet-50" trend={`${stats.escolasVerdes} escolas no verde`} trendUp={stats.mediaSige >= 80} />
        </div>
        <AlertasBanner />
        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3"><RankingEscolas /></div>
          <div className="col-span-2 space-y-5">
            <ProximasVisitas />
            <SigeProgress />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}