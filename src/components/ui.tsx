import type { ReactNode } from 'react';

export type Tone = 'green' | 'blue' | 'red' | 'amber' | 'teal' | 'indigo' | 'purple' | 'rose' | 'sky' | 'orange';

export const TONE_BG: Record<Tone, string> = {
  green: 'from-green-50 via-white to-green-50/40',
  blue: 'from-sky-50 via-white to-blue-50/40',
  red: 'from-rose-50 via-white to-red-50/40',
  amber: 'from-amber-50 via-white to-orange-50/40',
  teal: 'from-teal-50 via-white to-cyan-50/40',
  indigo: 'from-indigo-50 via-white to-violet-50/40',
  purple: 'from-purple-50 via-white to-fuchsia-50/40',
  rose: 'from-rose-50 via-white to-pink-50/40',
  sky: 'from-sky-50 via-white to-cyan-50/40',
  orange: 'from-orange-50 via-white to-amber-50/40',
};

export const TONE_RING: Record<Tone, string> = {
  green: 'ring-green-100',
  blue: 'ring-sky-100',
  red: 'ring-rose-100',
  amber: 'ring-amber-100',
  teal: 'ring-teal-100',
  indigo: 'ring-indigo-100',
  purple: 'ring-purple-100',
  rose: 'ring-rose-100',
  sky: 'ring-sky-100',
  orange: 'ring-orange-100',
};

export const TONE_SOLID: Record<Tone, string> = {
  green: 'bg-green-600 hover:bg-green-700 focus:ring-green-400/50 shadow-green-600/20',
  blue: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-400/50 shadow-sky-600/20',
  red: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-400/50 shadow-rose-600/20',
  amber: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-400/50 shadow-amber-600/20',
  teal: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-400/50 shadow-teal-600/20',
  indigo: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-400/50 shadow-indigo-600/20',
  purple: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-400/50 shadow-purple-600/20',
  rose: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-400/50 shadow-rose-600/20',
  sky: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-400/50 shadow-sky-600/20',
  orange: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-400/50 shadow-orange-600/20',
};

export const TONE_SOFT: Record<Tone, string> = {
  green: 'bg-green-50 text-green-700',
  blue: 'bg-sky-50 text-sky-700',
  red: 'bg-rose-50 text-rose-700',
  amber: 'bg-amber-50 text-amber-700',
  teal: 'bg-teal-50 text-teal-700',
  indigo: 'bg-indigo-50 text-indigo-700',
  purple: 'bg-purple-50 text-purple-700',
  rose: 'bg-rose-50 text-rose-700',
  sky: 'bg-sky-50 text-sky-700',
  orange: 'bg-orange-50 text-orange-700',
};

export const TONE_BADGE: Record<Tone, string> = {
  green: 'bg-emerald-500 text-white',
  blue: 'bg-sky-500 text-white',
  red: 'bg-rose-500 text-white',
  amber: 'bg-amber-500 text-white',
  teal: 'bg-teal-500 text-white',
  indigo: 'bg-indigo-500 text-white',
  purple: 'bg-purple-500 text-white',
  rose: 'bg-rose-500 text-white',
  sky: 'bg-sky-500 text-white',
  orange: 'bg-orange-500 text-white',
};

type SectionProps = {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
};

export function Section({ id, tone = 'green', className = '', children }: SectionProps) {
  return (
    <section
      id={id}
      className={`relative py-12 sm:py-16 lg:py-20 bg-gradient-to-b ${TONE_BG[tone]} ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  tone?: Tone;
  className?: string;
};

export function SectionHeader({ title, subtitle, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 ${className}`}>
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-base text-gray-600/90 mt-1.5 max-w-2xl mx-auto sm:mx-0">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

type CardProps = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
};

export function Card({ children, className = '', interactive = false }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white border border-gray-100/70 shadow-sm ${
        interactive ? 'hover:shadow-md hover:-translate-y-0.5 hover:border-gray-200/80 transition-all duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

type BadgeProps = {
  tone?: Tone;
  children: ReactNode;
  className?: string;
};

export function Badge({ tone = 'green', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${TONE_SOFT[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

type SolidBadgeProps = {
  tone?: Tone;
  children: ReactNode;
  className?: string;
};

export function SolidBadge({ tone = 'green', children, className = '' }: SolidBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${TONE_BADGE[tone]} ${className}`}>
      {children}
    </span>
  );
}

type RiskBadgeProps = {
  level: 'low' | 'moderate' | 'high' | string;
  label: string;
};

export function RiskBadge({ level, label }: RiskBadgeProps) {
  const tone: Tone = level === 'high' ? 'red' : level === 'moderate' ? 'amber' : 'green';
  return <SolidBadge tone={tone}>{label}</SolidBadge>;
}

type SeverityBadgeProps = {
  severity: 'low' | 'moderate' | 'high' | 'unknown' | string;
  label: string;
};

export function SeverityBadge({ severity, label }: SeverityBadgeProps) {
  const cls =
    severity === 'high'
      ? 'bg-rose-100 text-rose-700 border border-rose-200'
      : severity === 'moderate'
        ? 'bg-amber-100 text-amber-700 border border-amber-200'
        : severity === 'low'
          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
          : 'bg-gray-100 text-gray-600 border border-gray-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
};

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="rounded-2xl bg-white border border-dashed border-gray-200 p-8 sm:p-10 text-center">
      {icon && <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">{icon}</div>}
      <p className="text-base font-semibold text-gray-800">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  );
}

type LoadingStateProps = {
  tone?: Tone;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function LoadingState({ tone: _tone }: LoadingStateProps = {}) {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-[3px] border-gray-200 border-t-gray-400 rounded-full animate-spin" />
    </div>
  );
}

type FieldProps = {
  label?: string;
  required?: boolean;
  className?: string;
  tone?: Tone;
  children: ReactNode;
};

export function Field({ label, required, className = '', tone = 'green', children }: FieldProps) {
  const ringMap: Record<Tone, string> = {
    green: 'focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100',
    blue: 'focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100',
    red: 'focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100',
    amber: 'focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100',
    teal: 'focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100',
    indigo: 'focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100',
    purple: 'focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100',
    rose: 'focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100',
    sky: 'focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100',
    orange: 'focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100',
  };
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="block text-xs font-semibold text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </span>
      )}
      <div className={`rounded-xl border border-gray-200 bg-white transition-all ${ringMap[tone]}`}>
        {children}
      </div>
    </label>
  );
}

type PrimaryButtonProps = {
  tone?: Tone;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
};

export function PrimaryButton({ tone = 'green', loading, icon, children, className = '', onClick, disabled, type = 'button' }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-4 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] ${TONE_SOLID[tone]} ${className}`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

type SecondaryButtonProps = {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function SecondaryButton({ icon, children, className = '', onClick }: SecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-gray-800 font-semibold text-sm border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 active:scale-95 transition-all duration-150 min-h-[40px] ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

type IconBadgeProps = {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export function IconBadge({ tone = 'green', children, className = '', size = 'md' }: IconBadgeProps) {
  const sizeCls = size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-14 h-14' : 'w-11 h-11';
  return (
    <div className={`${sizeCls} rounded-xl ${TONE_SOFT[tone]} flex items-center justify-center flex-shrink-0 ${className}`}>
      {children}
    </div>
  );
}

type GradientIconProps = {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const GRADIENT: Record<Tone, string> = {
  green: 'from-green-500 to-emerald-600',
  blue: 'from-sky-500 to-blue-600',
  red: 'from-rose-500 to-red-600',
  amber: 'from-amber-500 to-orange-600',
  teal: 'from-teal-500 to-cyan-600',
  indigo: 'from-indigo-500 to-violet-600',
  purple: 'from-purple-500 to-fuchsia-600',
  rose: 'from-rose-500 to-pink-600',
  sky: 'from-sky-500 to-cyan-600',
  orange: 'from-orange-500 to-amber-600',
};

export function GradientIcon({ tone = 'green', children, className = '', size = 'md' }: GradientIconProps) {
  const sizeCls = size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-14 h-14' : 'w-11 h-11';
  return (
    <div className={`${sizeCls} rounded-xl bg-gradient-to-br ${GRADIENT[tone]} flex items-center justify-center shadow-md flex-shrink-0 ${className}`}>
      {children}
    </div>
  );
}

type StatProps = {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  tone?: Tone;
  sublabel?: string;
};

export function StatCard({ icon, value, label, tone = 'green', sublabel }: StatProps) {
  return (
    <Card className="p-4 sm:p-5">
      <GradientIcon tone={tone} size="sm" className="mb-3">
        {icon}
      </GradientIcon>
      <div className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
      <div className="text-xs sm:text-sm text-gray-500 mt-0.5 font-medium">{label}</div>
      {sublabel && <div className="text-[11px] text-gray-400 mt-1">{sublabel}</div>}
    </Card>
  );
}
