'use client';

import React from 'react';
import type { TextAreaComponent } from '@/lib/a2ui/types';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useBoundValue, useResolvedValue, useDataModel } from '../data-model-context';
import { cn } from '@/lib/utils';

interface A2UITextAreaProps {
  component: TextAreaComponent;
}

const resizeClasses = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
};

export function A2UITextArea({ component }: A2UITextAreaProps) {
  const [value, setValue] = useBoundValue<string>(component.value);
  const errorTextResolved = useResolvedValue(component.errorText ?? '');
  const disabledResolved = useResolvedValue(component.disabled ?? false);

  const errorText = component.errorText ? errorTextResolved : undefined;
  const disabled = component.disabled !== undefined ? disabledResolved : false;

  const { executeAction } = useDataModel();
  const {
    label,
    placeholder,
    helperText,
    required,
    readOnly,
    maxLength,
    rows = 3,
    resize = 'vertical',
    onInput,
    style,
  } = component;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (onInput) {
      executeAction(onInput);
    }
  };

  const hasError = !!errorText;

  return (
    <div className="space-y-2" style={styleToCSS(style)}>
      {label && (
        <Label className={cn(hasError && 'text-destructive')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Textarea
        value={value ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        rows={rows}
        required={required}
        className={cn(
          resizeClasses[resize],
          hasError && 'border-destructive'
        )}
      />
      {(helperText || errorText) && (
        <p className={cn(
          'text-sm',
          hasError ? 'text-destructive' : 'text-muted-foreground'
        )}>
          {errorText || helperText}
        </p>
      )}
    </div>
  );
}

function styleToCSS(style?: TextAreaComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    width: typeof style.width === 'number' ? `${style.width}px` : style.width,
    maxWidth: typeof style.maxWidth === 'number' ? `${style.maxWidth}px` : style.maxWidth,
    opacity: style.opacity,
  };
}
