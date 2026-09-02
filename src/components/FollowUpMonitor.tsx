import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Calendar, CheckCircle2, Clock, X } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { supabase, type CropReport, type FollowUp } from '@/lib/supabase';
import { Section, SectionHeader, Card, GradientIcon, LoadingState, EmptyState, Field, PrimaryButton, SolidBadge, type Tone } from './ui';

const inputCls = 'w-full bg-transparent px-3.5 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none min-h-[44px]';
const selectCls = 'w-full bg-transparent px-3.5 py-3 text-sm text-gray-800 outline-none min-h-[44px] appearance-none cursor-pointer';

const STATUS_META: Record<string, { tone: Tone; icon: typeof CheckCircle2 }> = {
  completed: { tone: 'green', icon: CheckCircle2 },
  in_progress: { tone: 'blue', icon: Clock },
  pending: { tone: 'amber', icon: ClipboardList },
};

export default function FollowUpMonitor() {
  const { t } = useLang();
  const [reports, setReports] = useState<CropReport[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ report_id: '', action_required: '', due_date: '', notes: '' });

  const fetchData = async () => {
    try {
      const [{ data: reportsData }, { data: fuData }] = await Promise.all([
        supabase.from('crop_reports').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('follow_ups').select('*').order('created_at', { ascending: false }).limit(15),
      ]);
      setReports(reportsData || []);
      setFollowups(fuData || []);
    } catch {
      setReports([]);
      setFollowups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!form.report_id || !form.action_required) return;
    setSubmitting(true);
    await supabase.from('follow_ups').insert({
      report_id: form.report_id,
      action_required: form.action_required,
      due_date: form.due_date || null,
      notes: form.notes || null,
      status: 'pending',
    });
    setSubmitting(false);
    setShowForm(false);
    setForm({ report_id: '', action_required: '', due_date: '', notes: '' });
    fetchData();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('follow_ups').update({ status }).eq('id', id);
    fetchData();
  };

  if (loading) {
    return (
      <Section id="followup" tone="purple">
        <LoadingState tone="purple" />
      </Section>
    );
  }

  return (
    <Section id="followup" tone="purple">
      <SectionHeader
        title={t('followup_title')}
        subtitle={t('followup_subtitle')}
        action={
          <PrimaryButton tone="purple" icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(!showForm)}>
            {t('followup_add')}
          </PrimaryButton>
        }
      />

      {showForm && (
        <Card className="p-4 sm:p-5 mb-6 ring-1 ring-purple-200/60 bg-gradient-to-br from-purple-50/30 to-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">{t('followup_add')}</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="space-y-3">
            <Field tone="purple" required label={t('followup_select_report')}>
              <select value={form.report_id} onChange={(e) => setForm({ ...form, report_id: e.target.value })} className={selectCls}>
                <option value="">{t('followup_select_report')}</option>
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.reporter_name} - {r.crop_type} - {r.detected_disease || 'Unknown'}
                  </option>
                ))}
              </select>
            </Field>
            <Field tone="purple" required label={t('followup_action')}>
              <input type="text" value={form.action_required} onChange={(e) => setForm({ ...form, action_required: e.target.value })} className={inputCls} placeholder={t('followup_action')} />
            </Field>
            <Field tone="purple" label={t('followup_due')}>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className={inputCls} />
            </Field>
            <Field tone="purple" label={t('followup_notes')}>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-transparent px-3.5 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none resize-none" placeholder={t('followup_notes')} />
            </Field>
            <PrimaryButton tone="purple" loading={submitting} onClick={handleSubmit} className="w-full">
              {submitting ? t('followup_adding') : t('followup_add')}
            </PrimaryButton>
          </div>
        </Card>
      )}

      <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-3 flex items-center gap-2">
        <GradientIcon tone="purple" size="sm">
          <ClipboardList className="w-4 h-4 text-white" />
        </GradientIcon>
        {t('followup_list')}
      </h3>

      {followups.length === 0 ? (
        <EmptyState icon={<ClipboardList className="w-6 h-6" />} title={t('common_none')} />
      ) : (
        <div className="space-y-2.5 max-w-3xl">
          {followups.map((f) => {
            const meta = STATUS_META[f.status] || STATUS_META.pending;
            const Icon = meta.icon;
            const report = reports.find((r) => r.id === f.report_id);
            return (
              <Card key={f.id} interactive className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    f.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                    f.status === 'in_progress' ? 'bg-sky-100 text-sky-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{f.action_required}</span>
                      <SolidBadge tone={meta.tone}>{t(`followup_${f.status}`)}</SolidBadge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {report ? `${report.reporter_name} · ${report.crop_type}` : f.report_id.slice(0, 8)}
                    </div>
                    {f.due_date && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5">
                        <Calendar className="w-3 h-3" />
                        {f.due_date}
                      </div>
                    )}
                    {f.notes && <div className="text-sm text-gray-600 mt-2 leading-relaxed">{f.notes}</div>}
                    {f.status !== 'completed' && (
                      <div className="flex gap-2 mt-3">
                        {f.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(f.id, 'in_progress')}
                            className="text-xs px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-medium transition-colors"
                          >
                            {t('followup_in_progress')}
                          </button>
                        )}
                        <button
                          onClick={() => updateStatus(f.id, 'completed')}
                          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {t('followup_completed')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Section>
  );
}
