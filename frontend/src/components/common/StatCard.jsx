import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = 'blue', trend, badge }) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-100',
      iconBg: 'bg-blue-600 text-white',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-600 text-white',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-600 text-white',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100',
      iconBg: 'bg-amber-500 text-white',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-100',
      iconBg: 'bg-rose-600 text-white',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-100',
      iconBg: 'bg-purple-600 text-white',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h3>
          
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${trend.startsWith('+') ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {trend}
              </span>
            )}
            {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
          </div>
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${scheme.iconBg} group-hover:scale-105 transition-transform duration-200`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {badge && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">{badge.label}</span>
          <span className={`font-semibold ${badge.color || 'text-slate-700'}`}>{badge.value}</span>
        </div>
      )}
    </div>
  );
}
