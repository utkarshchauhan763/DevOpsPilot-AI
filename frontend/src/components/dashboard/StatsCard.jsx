import { Activity, TrendingDown, TrendingUp } from "lucide-react";

function StatsCard({ title, value, icon: Icon, description }) {
  return (
    <div className="panel panel-hover p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>

        <div className="rounded-lg bg-cyan-500/10 p-2">
          <Icon size={20} className="text-cyan-400" />
        </div>
      </div>

      <h2 className="mt-4 text-3xl font-bold text-white">
        {value}
      </h2>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <Activity size={13} className="text-cyan-400" />
        {description}
      </div>
    </div>
  );
}

export default StatsCard;