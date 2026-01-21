'use client';

import React from 'react';
import type { TextFieldComponent } from '@/lib/a2ui/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBoundValue, useResolvedValue, useDataModel } from '../data-model-context';
import { cn } from '@/lib/utils';

interface A2UITextFieldProps {
  component: TextFieldComponent;
}

export function A2UITextField({ component }: A2UITextFieldProps) {
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
    minLength,
    pattern,
    inputType = 'text',
    onInput,
    onSubmit,
    style,
  } = component;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (onInput) {
      executeAction(onInput);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      executeAction(onSubmit);
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
      <Input
        type={inputType}
        value={value ?? ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        required={required}
        className={cn(hasError && 'border-destructive')}
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

function styleToCSS(style?: TextFieldComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    width: typeof style.width === 'number' ? `${style.width}px` : style.width,
    maxWidth: typeof style.maxWidth === 'number' ? `${style.maxWidth}px` : style.maxWidth,
    opacity: style.opacity,
  };
}
