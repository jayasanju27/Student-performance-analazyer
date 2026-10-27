import React from 'react';

export function Card({ as: Element = 'section', className = '', children, ...props }) {
  return (
    <Element className={`portal-card ${className}`} {...props}>
      {children}
    </Element>
  );
}

export function KpiCard({ label, value, detail, icon: Icon, trend, trendTone, className = '' }) {
  return (
    <Card className={`portal-kpi-card ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="portal-label">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#0B2545]">{value}</p>
        </div>
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E7F5F5] text-[#0E7C86]">
            <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>
      {(detail || trend) && (
        <div className="mt-3 flex min-h-5 flex-wrap items-center gap-2">
          {trend && <Badge tone={trendTone || (trend.startsWith('-') ? 'danger' : 'success')}>{trend}</Badge>}
          {detail && <p className="text-xs text-[#64748B]">{detail}</p>}
        </div>
      )}
    </Card>
  );
}

export function PageHeader({ title, description, actions, className = '' }) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-[#0B2545]">{title}</h1>
        {description && <p className="mt-1 text-sm text-[#64748B]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Badge({ tone = 'neutral', children, className = '' }) {
  const tones = {
    neutral: 'border-slate-200 bg-slate-100 text-slate-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    danger: 'border-rose-200 bg-rose-50 text-rose-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    teal: 'border-teal-200 bg-teal-50 text-teal-800',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone] || tones.neutral} ${className}`}>
      {children}
    </span>
  );
}

export function DataTable({ className = '', children, ...props }) {
  return (
    <div className={`portal-data-table overflow-x-auto ${className}`} {...props}>
      {children}
    </div>
  );
}
