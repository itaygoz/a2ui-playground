'use client';

import React from 'react';
import type { RadioGroupComponent } from '@/lib/a2ui/types';
import { Label } from '@/components/ui/label';
import { useBoundValue, useResolvedValue, useDataModel } from '../data-model-context';
import { cn } from '@/lib/utils';

interface A2UIRadioGroupProps {
  component: RadioGroupComponent;
}

export function A2UIRadioGroup({ component }: A2UIRadioGroupProps) {
  const [value, setValue] = useBoundValue<string>(component.value);
  const disabledResolved = useResolvedValue(component.disabled ?? false);

  const disabled = component.disabled !== undefined ? disabledResolved : false;

  const { executeAction } = useDataModel();
  const { label, options, orientation = 'vertical', onChange, style } = component;

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (onChange) {
      executeAction(onChange);
    }
  };

  return (
    <div className="space-y-2" style={styleToCSS(style)}>
      {label && (
        <Label className="text-sm font-medium">{label}</Label>
      )}
      <div
        className={cn(
          'flex gap-4',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        )}
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const optionId = `radio-${component.id}-${option.value}`;
          const isDisabled = disabled || option.disabled;
          const isChecked = value === option.value;

          return (
            <div key={option.value} className="flex items-center space-x-2">
              <button
                type="button"
                role="radio"
                id={optionId}
                aria-checked={isChecked}
                disabled={isDisabled}
                onClick={() => !isDisabled && handleChange(option.value)}
                className={cn(
                  'h-4 w-4 rounded-full border border-primary',
                  'ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isChecked && 'bg-primary',
                  isDisabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {isChecked && (
                  <div className="flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  </div>
                )}
              </button>
              <Label
                htmlFor={optionId}
                className={cn(
                  'text-sm font-normal',
                  isDisabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {option.label}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function styleToCSS(style?: RadioGroupComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    width: typeof style.width === 'number' ? `${style.width}px` : style.width,
    opacity: style.opacity,
  };
}
