import React from 'react';
import { Check, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export const TimelineStepper = ({ status, isEscalated, createdAt, resolvedAt }) => {
  const steps = [
    {
      id: 1,
      name: 'Submitted',
      desc: createdAt ? new Date(createdAt).toLocaleDateString() : 'Received',
      completed: true,
      current: status === 'PENDING'
    },
    {
      id: 2,
      name: 'Under Review',
      desc: status === 'PENDING' ? 'Awaiting assignment' : 'Department investigating',
      completed: ['IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'].includes(status),
      current: status === 'IN_PROGRESS'
    },
    {
      id: 3,
      name: isEscalated || status === 'ESCALATED' ? 'Escalated to Admin' : 'SLA Compliance',
      desc: isEscalated || status === 'ESCALATED' ? '48h SLA breached' : 'Within 48h resolution window',
      isEscalated: isEscalated || status === 'ESCALATED',
      completed: ['ESCALATED', 'RESOLVED', 'CLOSED'].includes(status),
      current: status === 'ESCALATED'
    },
    {
      id: 4,
      name: 'Resolved',
      desc: resolvedAt ? new Date(resolvedAt).toLocaleDateString() : 'Final resolution',
      completed: ['RESOLVED', 'CLOSED'].includes(status),
      current: ['RESOLVED', 'CLOSED'].includes(status)
    }
  ];

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0"></div>

        {steps.map((step, idx) => {
          const isDone = step.completed;
          const isCurrent = step.current;
          const isAlert = step.isEscalated;

          let circleClass = 'bg-white border-2 border-slate-300 text-slate-400';
          if (isAlert) {
            circleClass = 'bg-rose-600 border-2 border-rose-600 text-white animate-pulse';
          } else if (isDone) {
            circleClass = 'bg-emerald-600 border-2 border-emerald-600 text-white';
          } else if (isCurrent) {
            circleClass = 'bg-indigo-600 border-2 border-indigo-600 text-white ring-4 ring-indigo-100';
          }

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${circleClass}`}>
                {isAlert ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : isDone ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <div className="text-center mt-2">
                <p className={`text-xs font-semibold ${isCurrent ? 'text-indigo-600 font-bold' : isAlert ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                  {step.name}
                </p>
                <p className="text-[11px] text-slate-400 hidden sm:block max-w-[90px] truncate">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
