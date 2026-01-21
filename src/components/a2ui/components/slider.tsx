'use client';

import React from 'react';
import type { SliderComponent } from '@/lib/a2ui/types';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useBoundValue, useResolvedValue, useDataModel } from '../data-model-context';

interface A2UISliderProps {
  component: SliderComponent;
}

export function A2UISlider({ component }: A2UISliderProps) {
  const [value, setValue] = useBoundValue<number>(component.value);
  const disabledResolved = useResolvedValue(component.disabled ?? false);

  const disabled = component.disabled !== undefined ? disabledResolved : false;

  const { executeAction } = useDataModel();
  const {
    min = 0,
    max = 100,
    step = 1,
    label,
    showValue = false,
    onChange,
    style,
  } = component;

  const handleChange = (values: number[]) => {
    setValue(values[0]);
    if (onChange) {
      executeAction(onChange);
    }
  };

  const currentValue = value ?? min;

  return (
    <div className="space-y-2" style={styleToCSS(style)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && (
            <Label className="text-sm font-medium">{label}</Label>
          )}
          {showValue && (
            <span className="text-sm text-muted-foreground">{currentValue}</span>
          )}
        </div>
      )}
      <Slider
        value={[currentValue]}
        onValueChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
      />
    </div>
  );
}

function styleToCSS(style?: SliderComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    width: typeof style.width === 'number' ? `${style.width}px` : style.width,
    maxWidth: typeof style.maxWidth === 'number' ? `${style.maxWidth}px` : style.maxWidth,
    opacity: style.opacity,
  };
}
