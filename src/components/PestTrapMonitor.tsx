import { useState, useEffect } from 'react';
import { Bug, Plus, AlertTriangle, MapPin, X, Search } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { supabase, type PestTrap } from '@/lib/supabase';
import { Section, SectionHeader, Card, RiskBadge, GradientIcon, LoadingState, EmptyState, Field, PrimaryButton } from './ui';

const inputCls = 'w-full bg-transparent px-3.5 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none min-h-[44px]';

export default function PestTrapMonitor() {
  const { t } = useLang();
  const [data, setData] = useState<PestTrap[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ trap_id: '', location_name: '', pest_type: '', count: '', crop_type: '' });
  const [filter, setFilter] = useState('');

  const fetchData = async () => {
    try {
      const { data: rows } = await supabase
        .from('pest_traps')
        .select('*')
        .order('observation_date', { ascending: false });
      setData(rows || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!form.trap_id || !form.location_name || !form.pest_type || !form.crop_type) return;
    setSubmitting(true);
    const count = parseInt(form.count) || 0;
    let risk = 'low';
    if (count > 40) risk = 'high';
    else if (count > 15) risk = 'moderate';
    await supabase.from('pest_traps').insert({
      trap_id: form.trap_id,
      location_name: form.location_name,
      pest_type: form.pest_type,
      count,
      crop_type: form.crop_type,
      risk_level: risk,
      observation_date: new Date().toISOString().split('T')[0],
    });
    setSubmitting(false);
    setShowForm(false);
    setForm({ trap_id: '', location_name: '', pest_type: '', count: '', crop_type: '' });
    fetchData();
  };

  const filtered = data.filter((d) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      d.trap_id.toLowerCase().includes(q) ||
      d.location_name.toLowerCase().includes(q) ||
      d.pest_type.toLowerCase().includes(q) ||
      d.crop_type.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <Section id="pest" tone="amber">
        <LoadingState tone="amber" />
      </Section>
    );
  }

  return (
    <Section id="pest" tone="amber">
      <SectionHeader
        title={t('pest_title')}
        subtitle={t('pest_subtitle')}
        action={
          <div className="flex flex-col sm:flex-row gap-2">
            {data.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder={t('pest_trap_id')}
                  className="w-full sm:w-48 pl-9 pr-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 min-h-[44px]"
                />
              </div>
            )}
            <PrimaryButton tone="amber" icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(!showForm)}>
              {t('pest_add')}
            </PrimaryButton>
          </div>
        }
      />

      {showForm && (
        <Card className="p-4 sm:p-5 mb-6 ring-1 ring-amber-200/60 bg-gradient-to-br from-amber-50/30 to-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">{t('pest_add')}</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field tone="amber" required label={t('pest_trap_id')}>
              <input type="text" value={form.trap_id} onChange={(e) => setForm({ ...form, trap_id: e.target.value })} className={inputCls} placeholder={t('pest_trap_id')} />
            </Field>
            <Field tone="amber" required label={t('pest_location')}>
              <input type="text" value={form.location_name} onChange={(e) => setForm({ ...form, location_name: e.target.value })} className={inputCls} placeholder={t('pest_location')} />
            </Field>
            <Field tone="amber" required label={t('pest_type')}>
              <input type="text" value={form.pest_type} onChange={(e) => setForm({ ...form, pest_type: e.target.value })} className={inputCls} placeholder={t('pest_type')} />
            </Field>
            <Field tone="amber" label={t('pest_count')}>
              <input type="number" value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} className={inputCls} placeholder={t('pest_count')} />
            </Field>
            <Field tone="amber" required label={t('pest_crop')}>
              <input type="text" value={form.crop_type} onChange={(e) => setForm({ ...form, crop_type: e.target.value })} className={inputCls} placeholder={t('pest_crop')} />
            </Field>
            <div className="flex items-end">
              <PrimaryButton tone="amber" loading={submitting} onClick={handleSubmit} className="w-full">
                {submitting ? t('pest_adding') : t('pest_add')}
              </PrimaryButton>
            </div>
          </div>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={<Bug className="w-6 h-6" />} title={t('common_none')} description={t('pest_subtitle')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((trap) => (
            <Card key={trap.id} interactive className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <GradientIcon tone="amber" size="sm">
                    <Bug className="w-4 h-4 text-white" />
                  </GradientIcon>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 text-sm truncate">{trap.trap_id}</div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {trap.location_name}
                    </div>
                  </div>
                </div>
                <RiskBadge level={trap.risk_level} label={t(`weather_${trap.risk_level}`)} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <Mini label={t('pest_type')} value={trap.pest_type} />
                <Mini label={t('pest_count')} value={String(trap.count)} accent />
                <Mini label={t('pest_crop')} value={trap.crop_type} />
                <Mini label={t('pest_date')} value={trap.observation_date} />
              </div>

              {trap.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-600 leading-relaxed">{trap.notes}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-gray-50/60 px-2.5 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">{label}</div>
      <div className={`mt-0.5 truncate ${accent ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{value}</div>
    </div>
  );
}
