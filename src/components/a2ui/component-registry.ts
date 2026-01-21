/**
 * A2UI Component Registry
 *
 * Maps A2UI component types to their React implementations.
 * This registry pattern allows for extensibility and lazy loading.
 */

import type { ComponentType as ReactComponentType } from 'react';
import type { A2UIComponent, ComponentType } from '@/lib/a2ui/types';

// Registry type for component renderers
export type A2UIComponentRenderer<T extends A2UIComponent = A2UIComponent> = ReactComponentType<{
  component: T;
  children?: React.ReactNode;
}>;

// Component registry
const registry = new Map<ComponentType, A2UIComponentRenderer>();

/**
 * Registers a component renderer for an A2UI component type
 */
export function registerComponent<T extends ComponentType>(
  type: T,
  renderer: A2UIComponentRenderer
) {
  registry.set(type, renderer);
}

/**
 * Gets a component renderer for an A2UI component type
 */
export function getComponentRenderer(type: ComponentType): A2UIComponentRenderer | undefined {
  return registry.get(type);
}

/**
 * Checks if a component type is registered
 */
export function hasComponent(type: ComponentType): boolean {
  return registry.has(type);
}

/**
 * Gets all registered component types
 */
export function getRegisteredTypes(): ComponentType[] {
  return Array.from(registry.keys());
}

/**
 * Initialize the registry with all A2UI components
 * This is called during app initialization
 */
export async function initializeRegistry() {
  // Import all components
  const [
    { A2UIText },
    { A2UIImage },
    { A2UIIcon },
    { A2UIDivider },
    { A2UISpacer },
    { A2UIBadge },
    { A2UIAvatar },
    { A2UIProgress },
    { A2UIRow },
    { A2UIColumn },
    { A2UICard },
    { A2UIContainer },
    { A2UIGrid },
    { A2UIStack },
    { A2UIScrollView },
    { A2UIExpandable },
    { A2UIButton },
    { A2UITextField },
    { A2UITextArea },
    { A2UICheckbox },
    { A2UIRadioGroup },
    { A2UISelect },
    { A2UISlider },
    { A2UISwitch },
    { A2UIList },
    { A2UIListItem },
    { A2UITabs },
    { A2UILink },
    { A2UIAlert },
    { A2UITooltip },
    { A2UILoading },
  ] = await Promise.all([
    import('./components/text'),
    import('./components/image'),
    import('./components/icon'),
    import('./components/divider'),
    import('./components/spacer'),
    import('./components/badge'),
    import('./components/avatar'),
    import('./components/progress'),
    import('./components/row'),
    import('./components/column'),
    import('./components/card'),
    import('./components/container'),
    import('./components/grid'),
    import('./components/stack'),
    import('./components/scroll-view'),
    import('./components/expandable'),
    import('./components/button'),
    import('./components/text-field'),
    import('./components/text-area'),
    import('./components/checkbox'),
    import('./components/radio-group'),
    import('./components/select'),
    import('./components/slider'),
    import('./components/switch'),
    import('./components/list'),
    import('./components/list-item'),
    import('./components/tabs'),
    import('./components/link'),
    import('./components/alert'),
    import('./components/tooltip'),
    import('./components/loading'),
  ]);

  // Register all components
  registerComponent('Text', A2UIText as A2UIComponentRenderer);
  registerComponent('Image', A2UIImage as A2UIComponentRenderer);
  registerComponent('Icon', A2UIIcon as A2UIComponentRenderer);
  registerComponent('Divider', A2UIDivider as A2UIComponentRenderer);
  registerComponent('Spacer', A2UISpacer as A2UIComponentRenderer);
  registerComponent('Badge', A2UIBadge as A2UIComponentRenderer);
  registerComponent('Avatar', A2UIAvatar as A2UIComponentRenderer);
  registerComponent('Progress', A2UIProgress as A2UIComponentRenderer);
  registerComponent('Row', A2UIRow as A2UIComponentRenderer);
  registerComponent('Column', A2UIColumn as A2UIComponentRenderer);
  registerComponent('Card', A2UICard as A2UIComponentRenderer);
  registerComponent('Container', A2UIContainer as A2UIComponentRenderer);
  registerComponent('Grid', A2UIGrid as A2UIComponentRenderer);
  registerComponent('Stack', A2UIStack as A2UIComponentRenderer);
  registerComponent('ScrollView', A2UIScrollView as A2UIComponentRenderer);
  registerComponent('Expandable', A2UIExpandable as A2UIComponentRenderer);
  registerComponent('Button', A2UIButton as A2UIComponentRenderer);
  registerComponent('TextField', A2UITextField as A2UIComponentRenderer);
  registerComponent('TextArea', A2UITextArea as A2UIComponentRenderer);
  registerComponent('Checkbox', A2UICheckbox as A2UIComponentRenderer);
  registerComponent('RadioGroup', A2UIRadioGroup as A2UIComponentRenderer);
  registerComponent('Select', A2UISelect as A2UIComponentRenderer);
  registerComponent('Slider', A2UISlider as A2UIComponentRenderer);
  registerComponent('Switch', A2UISwitch as A2UIComponentRenderer);
  registerComponent('List', A2UIList as A2UIComponentRenderer);
  registerComponent('ListItem', A2UIListItem as A2UIComponentRenderer);
  registerComponent('Tabs', A2UITabs as A2UIComponentRenderer);
  registerComponent('Link', A2UILink as A2UIComponentRenderer);
  registerComponent('Alert', A2UIAlert as A2UIComponentRenderer);
  registerComponent('Tooltip', A2UITooltip as A2UIComponentRenderer);
  registerComponent('Loading', A2UILoading as A2UIComponentRenderer);
}

// Export registry for debugging
export const componentRegistry = registry;
