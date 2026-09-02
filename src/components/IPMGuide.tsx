import { ShieldCheck, Leaf, Bug, FlaskConical } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { Section, SectionHeader, Card, GradientIcon, type Tone } from './ui';

const steps: Array<{ icon: typeof ShieldCheck; titleKey: string; textKey: string; tone: Tone }> = [
  { icon: ShieldCheck, titleKey: 'ipm_prevention', textKey: 'ipm_prevention_text', tone: 'green' },
  { icon: Bug, titleKey: 'ipm_monitoring', textKey: 'ipm_monitoring_text', tone: 'blue' },
  { icon: Leaf, titleKey: 'ipm_biological', textKey: 'ipm_biological_text', tone: 'teal' },
  { icon: FlaskConical, titleKey: 'ipm_chemical', textKey: 'ipm_chemical_text', tone: 'amber' },
];

export default function IPMGuide() {
  const { t } = useLang();
  return (
    <Section id="ipm" tone="green">
      <SectionHeader title={t('ipm_title')} subtitle={t('ipm_subtitle')} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <Card key={i} interactive className="p-5 sm:p-6 flex gap-4 items-start relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-gray-50 to-white opacity-50" />
            <GradientIcon tone={step.tone} size="lg">
              <step.icon className="w-6 h-6 text-white" />
            </GradientIcon>
            <div className="flex-1 min-w-0 relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-[11px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">{t(step.titleKey)}</h3>
              </div>
              <p className="text-sm text-gray-600/90 leading-relaxed">{t(step.textKey)}</p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
