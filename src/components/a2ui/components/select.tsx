'use client';

import React from 'react';
import type { SelectComponent } from '@/lib/a2ui/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useBoundValue, useResolvedValue, useDataModel } from '../data-model-context';

interface A2UISelectProps {
  component: SelectComponent;
}

export function A2UISelect({ component }: A2UISelectProps) {
  const [value, setValue] = useBoundValue<string>(component.value);
  const disabledResolved = useResolvedValue(component.disabled ?? false);

  const disabled = component.disabled !== undefined ? disabledResolved : false;

  const { executeAction } = useDataModel();
  const { label, placeholder, options, onChange, style } = component;

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
      <Select
        value={value ?? ''}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder || 'Select...'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function styleToCSS(style?: SelectComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    width: typeof style.width === 'number' ? `${style.width}px` : style.width,
    maxWidth: typeof style.maxWidth === 'number' ? `${style.maxWidth}px` : style.maxWidth,
    opacity: style.opacity,
  };
}
