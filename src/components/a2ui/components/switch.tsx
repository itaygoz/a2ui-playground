'use client';

import React from 'react';
import type { SwitchComponent } from '@/lib/a2ui/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useBoundValue, useResolvedValue, useDataModel } from '../data-model-context';
import { cn } from '@/lib/utils';

interface A2UISwitchProps {
  component: SwitchComponent;
}

export function A2UISwitch({ component }: A2UISwitchProps) {
  const [checked, setChecked] = useBoundValue<boolean>(component.checked);
  const disabledResolved = useResolvedValue(component.disabled ?? false);

  const disabled = component.disabled !== undefined ? disabledResolved : false;

  const { executeAction } = useDataModel();
  const { label, onChange, style } = component;

  const handleChange = (newChecked: boolean) => {
    setChecked(newChecked);
    if (onChange) {
      executeAction(onChange);
    }
  };

  const switchId = `switch-${component.id}`;

  return (
    <div className="flex items-center space-x-2" style={styleToCSS(style)}>
      <Switch
        id={switchId}
        checked={checked ?? false}
        onCheckedChange={handleChange}
        disabled={disabled}
      />
      {label && (
        <Label
          htmlFor={switchId}
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

function styleToCSS(style?: SwitchComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    opacity: style.opacity,
  };
}
