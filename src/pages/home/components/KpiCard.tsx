interface KpiCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
  bgColor: string;
  trend?: string;
  trendUp?: boolean;
}

export default function KpiCard({ label, value, icon, color, bgColor, trend, trendUp }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 flex flex-col gap-4 hover:-translate-y-0.5 transition-transform">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${bgColor}`}>
          <i className={`${icon} text-xl ${color}`}></i>
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
            <i className={`${trendUp ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-sm`}></i>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
      </div>
    </div>
  );
}
