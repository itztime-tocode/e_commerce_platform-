/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrackingStatus } from '../types';
import { Check, Package, ClipboardCheck, Gift, Truck, MapPin, Smile } from 'lucide-react';

interface OrderTimelineProps {
  status: TrackingStatus;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  const steps: { label: string; statusId: TrackingStatus; icon: React.ReactNode; desc: string }[] = [
    {
      label: 'Order Placed',
      statusId: 'placed',
      icon: <ClipboardCheck size={16} />,
      desc: 'Purchase authenticated and logged.'
    },
    {
      label: 'Processing',
      statusId: 'processing',
      icon: <Gift size={16} />,
      desc: 'Authenticity checks and quality review.'
    },
    {
      label: 'Packed',
      statusId: 'packed',
      icon: <Package size={16} />,
      desc: 'Insured packaging in climate-sealed boxes.'
    },
    {
      label: 'Shipped',
      statusId: 'shipped',
      icon: <Truck size={16} />,
      desc: 'In-transit via secure transport.'
    },
    {
      label: 'Out for Delivery',
      statusId: 'delivery',
      icon: <MapPin size={16} />,
      desc: 'Assigned to localized custom courier.'
    },
    {
      label: 'Delivered',
      statusId: 'delivered',
      icon: <Smile size={16} />,
      desc: 'Handover complete. Signatures logged.'
    }
  ];

  const statusWeights: Record<TrackingStatus, number> = {
    placed: 1,
    processing: 2,
    packed: 3,
    shipped: 4,
    delivery: 5,
    delivered: 6
  };

  const currentWeight = statusWeights[status] || 1;

  return (
    <div className="w-full font-display">
      <div className="relative">
        {/* Horizontal joining path link */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-stone-800 hidden md:block" />
        <div 
          className="absolute top-6 left-6 h-0.5 bg-gold-500 hidden md:block transition-all duration-1000"
          style={{ width: `${((currentWeight - 1) / (steps.length - 1)) * 100}%` }}
        />

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
          {steps.map((step, idx) => {
            const stepWeight = statusWeights[step.statusId];
            const isCompleted = stepWeight < currentWeight;
            const isActive = stepWeight === currentWeight;

            return (
              <div key={idx} className="flex md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-3">
                
                {/* Node bubble */}
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border transition-all duration-500 ${
                    isCompleted 
                      ? 'bg-gold-500 border-gold-500 text-black shadow-lg gold-border-glow'
                      : isActive 
                        ? 'bg-stone-900 border-gold-400 text-gold-400 font-bold scale-110 shadow-xl gold-border-glow'
                        : 'bg-stone-950 border-white/10 text-stone-600'
                  }`}
                >
                  {isCompleted ? <Check size={16} className="stroke-[3]" /> : step.icon}
                </div>

                {/* Narrative content block */}
                <div>
                  <h4 className={`text-xs uppercase tracking-widest font-semibold transition-colors duration-500 ${
                    isActive ? 'text-gold-400 font-bold' : isCompleted ? 'text-white' : 'text-stone-500'
                  }`}>
                    {step.label}
                  </h4>
                  <p className="text-[10px] text-stone-400 leading-relaxed max-w-[150px] md:mx-auto mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
