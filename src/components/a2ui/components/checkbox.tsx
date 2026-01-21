'use client';

import React from 'react';
import type { CheckboxComponent } from '@/lib/a2ui/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useBoundValue, useResolvedValue, useDataModel } from '../data-model-context';
import { cn } from '@/lib/utils';

interface A2UICheckboxProps {
  component: CheckboxComponent;
}

export function A2UICheckbox({ component }: A2UICheckboxProps) {
  const [checked, setChecked] = useBoundValue<boolean>(component.checked);
  const disabledResolved = useResolvedValue(component.disabled ?? false);
  const indeterminateResolved = useResolvedValue(component.indeterminate ?? false);

  const disabled = component.disabled !== undefined ? disabledResolved : false;
  const indeterminate = component.indeterminate !== undefined ? indeterminateResolved : false;

  const { executeAction } = useDataModel();
  const { label, onChange, style } = component;

  const handleChange = (value: boolean | 'indeterminate') => {
    const newValue = value === 'indeterminate' ? false : value;
    setChecked(newValue);
    if (onChange) {
      executeAction(onChange);
    }
  };

  const checkboxId = `checkbox-${component.id}`;

  return (
    <div className="flex items-center space-x-2" style={styleToCSS(style)}>
      <Checkbox
        id={checkboxId}
        checked={indeterminate ? 'indeterminate' : (checked ?? false)}
        onCheckedChange={handleChange}
        disabled={disabled}
      />
      {label && (
        <Label
          htmlFor={checkboxId}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            disabled && 'cursor-not-allowed opacity-70'
          )}
        >
          {label}
        </Label>
      )}
    </div>
  );
}

function styleToCSS(style?: CheckboxComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    opacity: style.opacity,
  };
}
