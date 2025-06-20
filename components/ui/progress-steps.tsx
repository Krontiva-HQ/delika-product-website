import { Check, Clock } from 'lucide-react';

export interface Step {
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  description?: string;
  time?: number;
}

interface ProgressStepsProps {
  steps: Step[];
}

export function ProgressSteps({ steps }: ProgressStepsProps) {
  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute left-6 top-0 h-full w-[2px] bg-gray-200" />

      {/* Steps */}
      <div className="space-y-8">
        {steps.map((step, index) => (
          <div key={index} className="relative flex items-start gap-4">
            {/* Step Indicator */}
            <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
              step.status === 'completed' ? 'border-green-500 bg-green-50' :
              step.status === 'current' ? 'border-blue-500 bg-blue-50 animate-pulse' :
              'border-gray-300 bg-white'
            }`}>
              {step.status === 'completed' ? (
                <Check className="h-6 w-6 text-green-500" />
              ) : step.status === 'current' ? (
                <div className="h-3 w-3 rounded-full bg-blue-500" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-gray-300" />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 pt-2">
              <h3 className={`font-medium ${
                step.status === 'completed' ? 'text-green-600' :
                step.status === 'current' ? 'text-blue-600' :
                'text-gray-500'
              }`}>
                {step.label}
              </h3>
              {step.description && (
                <p className="mt-1 text-sm text-gray-500">{step.description}</p>
              )}
              {step.time && (
                <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(step.time).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 