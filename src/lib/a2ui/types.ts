/**
 * A2UI TypeScript Types
 * Based on the A2UI specification from https://a2ui.org/
 *
 * A2UI is an AI-to-UI language that enables AI models to generate
 * structured UI specifications in JSON format.
 */

// JSON Pointer type (RFC 6901)
export type JsonPointer = string;

// ============================================================================
// Data Model Types
// ============================================================================

export interface DataModel {
  [key: string]: unknown;
}

// ============================================================================
// Component ID and Reference Types
// ============================================================================

export type ComponentId = string;

// ============================================================================
// Common Style Types
// ============================================================================

export type Alignment = 'start' | 'center' | 'end' | 'stretch';
export type MainAxisAlignment = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
export type CrossAxisAlignment = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type FontWeight = 'normal' | 'bold' | 'light' | 'medium' | 'semibold';
export type TextStyle = 'normal' | 'italic';
export type TextDecoration = 'none' | 'underline' | 'line-through';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type Variant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';

// ============================================================================
// Action Types
// ============================================================================

export interface Action {
  type: 'update' | 'submit' | 'navigate' | 'custom';
  target?: JsonPointer; // JSON pointer to data model field
  value?: unknown; // Value to set (can include JSON pointer for copy)
  url?: string; // For navigate actions
  customAction?: string; // For custom actions
  handler?: string; // Alias for customAction (used in game templates)
  params?: Record<string, unknown>; // Parameters for custom handlers
  payload?: Record<string, unknown>; // Additional data for custom actions
}

// ============================================================================
// Base Component Interface
// ============================================================================

export interface BaseComponent {
  id: ComponentId;
  type: string;
  visible?: boolean | JsonPointer;
  enabled?: boolean | JsonPointer;
  style?: ComponentStyle;
}

export interface ComponentStyle {
  padding?: string | number;
  margin?: string | number;
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  backgroundColor?: string;
  borderRadius?: string | number;
  borderWidth?: string | number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  flex?: number;
  gap?: string | number;
  // Flexbox properties
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  // Typography (for components that support it)
  fontSize?: string | number;
  lineHeight?: string | number;
  fontWeight?: string | number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

// ============================================================================
// Display Components
// ============================================================================

export interface TextComponent extends BaseComponent {
  type: 'Text';
  text?: string | JsonPointer;
  // Shorthand properties for simpler authoring
  content?: string | JsonPointer;  // Alias for text
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
  align?: TextAlign;
  color?: string;
  textStyle?: {
    size?: Size;
    weight?: FontWeight;
    color?: string;
    align?: TextAlign;
    style?: TextStyle;
    decoration?: TextDecoration;
    lineHeight?: number;
    letterSpacing?: number;
  };
}

export interface ImageComponent extends BaseComponent {
  type: 'Image';
  src: string | JsonPointer;
  alt?: string;
  fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  aspectRatio?: string;
}

export interface IconComponent extends BaseComponent {
  type: 'Icon';
  name: string;
  size?: Size | number;
  color?: string;
}

export interface DividerComponent extends BaseComponent {
  type: 'Divider';
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
}

export interface SpacerComponent extends BaseComponent {
  type: 'Spacer';
  size?: Size | number;
}

export interface BadgeComponent extends BaseComponent {
  type: 'Badge';
  text?: string | JsonPointer;
  content?: string | JsonPointer;  // Alias for text
  variant?: Variant | 'outline';  // Extended variants
  size?: Size;
}

export interface AvatarComponent extends BaseComponent {
  type: 'Avatar';
  src?: string | JsonPointer;
  alt?: string;
  fallback?: string;
  size?: Size | number;
}

export interface ProgressComponent extends BaseComponent {
  type: 'Progress';
  value: number | JsonPointer;
  max?: number;
  variant?: Variant;
  showLabel?: boolean;
}

// ============================================================================
// Layout Components
// ============================================================================

export interface RowComponent extends BaseComponent {
  type: 'Row';
  children: ComponentId[];
  mainAxisAlignment?: MainAxisAlignment;
  crossAxisAlignment?: CrossAxisAlignment;
  wrap?: boolean;
  gap?: string | number;
}

export interface ColumnComponent extends BaseComponent {
  type: 'Column';
  children: ComponentId[];
  mainAxisAlignment?: MainAxisAlignment;
  crossAxisAlignment?: CrossAxisAlignment;
  gap?: string | number;
}

export interface CardComponent extends BaseComponent {
  type: 'Card';
  children: ComponentId[];
  title?: string | JsonPointer;
  subtitle?: string | JsonPointer;
  headerActions?: ComponentId[];
  footerActions?: ComponentId[];
  variant?: 'default' | 'outlined' | 'elevated';
}

export interface ContainerComponent extends BaseComponent {
  type: 'Container';
  children: ComponentId[];
  maxWidth?: string | number;
  centered?: boolean;
}

export interface GridComponent extends BaseComponent {
  type: 'Grid';
  children: ComponentId[];
  columns?: number | string;
  rows?: number | string;
  gap?: string | number;
  columnGap?: string | number;
  rowGap?: string | number;
}

export interface StackComponent extends BaseComponent {
  type: 'Stack';
  children: ComponentId[];
  direction?: 'horizontal' | 'vertical';
  spacing?: string | number;
  alignment?: Alignment;
}

export interface ScrollViewComponent extends BaseComponent {
  type: 'ScrollView';
  children: ComponentId[];
  direction?: 'horizontal' | 'vertical' | 'both';
  showScrollbar?: boolean;
}

export interface ExpandableComponent extends BaseComponent {
  type: 'Expandable';
  children: ComponentId[];
  title: string | JsonPointer;
  expanded?: boolean | JsonPointer;
  onToggle?: Action;
}

// ============================================================================
// Input Components
// ============================================================================

export interface ButtonComponent extends BaseComponent {
  type: 'Button';
  label: string | JsonPointer;
  variant?: ButtonVariant;
  size?: Size;
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean | JsonPointer;
  disabled?: boolean | JsonPointer;
  fullWidth?: boolean;
  onPress: Action;
}

export interface TextFieldComponent extends BaseComponent {
  type: 'TextField';
  value: JsonPointer;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string | JsonPointer;
  required?: boolean;
  disabled?: boolean | JsonPointer;
  readOnly?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  inputType?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  multiline?: boolean;
  rows?: number;
  onInput?: Action;
  onSubmit?: Action;
}

export interface TextAreaComponent extends BaseComponent {
  type: 'TextArea';
  value: JsonPointer;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string | JsonPointer;
  required?: boolean;
  disabled?: boolean | JsonPointer;
  readOnly?: boolean;
  maxLength?: number;
  rows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  onInput?: Action;
}

export interface CheckboxComponent extends BaseComponent {
  type: 'Checkbox';
  checked: JsonPointer;
  label?: string;
  disabled?: boolean | JsonPointer;
  indeterminate?: boolean | JsonPointer;
  onChange?: Action;
}

export interface RadioGroupComponent extends BaseComponent {
  type: 'RadioGroup';
  value: JsonPointer;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean | JsonPointer;
  onChange?: Action;
}

export interface SelectComponent extends BaseComponent {
  type: 'Select';
  value: JsonPointer;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  label?: string;
  placeholder?: string;
  disabled?: boolean | JsonPointer;
  multiple?: boolean;
  searchable?: boolean;
  onChange?: Action;
}

export interface SliderComponent extends BaseComponent {
  type: 'Slider';
  value: JsonPointer;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  disabled?: boolean | JsonPointer;
  onChange?: Action;
}

export interface SwitchComponent extends BaseComponent {
  type: 'Switch';
  checked: JsonPointer;
  label?: string;
  disabled?: boolean | JsonPointer;
  onChange?: Action;
}

export interface DatePickerComponent extends BaseComponent {
  type: 'DatePicker';
  value: JsonPointer;
  label?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean | JsonPointer;
  onChange?: Action;
}

// ============================================================================
// List Components
// ============================================================================

export interface ListComponent extends BaseComponent {
  type: 'List';
  items: JsonPointer; // Points to array in data model
  itemTemplate: ComponentId; // Reference to template component
  emptyState?: ComponentId;
  separator?: boolean;
  selectable?: boolean;
  selectedIndex?: JsonPointer;
  onItemSelect?: Action;
}

export interface ListItemComponent extends BaseComponent {
  type: 'ListItem';
  children: ComponentId[];
  leadingContent?: ComponentId;
  trailingContent?: ComponentId;
  onPress?: Action;
}

// ============================================================================
// Navigation Components
// ============================================================================

export interface TabsComponent extends BaseComponent {
  type: 'Tabs';
  tabs: Array<{
    id: string;
    label: string;
    content: ComponentId;
    icon?: string;
    disabled?: boolean;
  }>;
  activeTab: JsonPointer;
  variant?: 'default' | 'pills' | 'underline';
  onChange?: Action;
}

export interface LinkComponent extends BaseComponent {
  type: 'Link';
  text: string | JsonPointer;
  href: string;
  external?: boolean;
  underline?: boolean;
}

// ============================================================================
// Feedback Components
// ============================================================================

export interface AlertComponent extends BaseComponent {
  type: 'Alert';
  title?: string | JsonPointer;
  message: string | JsonPointer;
  variant: Variant;
  dismissible?: boolean;
  onDismiss?: Action;
  actions?: ComponentId[];
}

export interface TooltipComponent extends BaseComponent {
  type: 'Tooltip';
  content: string | JsonPointer;
  children: ComponentId[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export interface LoadingComponent extends BaseComponent {
  type: 'Loading';
  size?: Size;
  text?: string;
  variant?: 'spinner' | 'dots' | 'bar';
}

// ============================================================================
// Union Type for All Components
// ============================================================================

export type A2UIComponent =
  // Display
  | TextComponent
  | ImageComponent
  | IconComponent
  | DividerComponent
  | SpacerComponent
  | BadgeComponent
  | AvatarComponent
  | ProgressComponent
  // Layout
  | RowComponent
  | ColumnComponent
  | CardComponent
  | ContainerComponent
  | GridComponent
  | StackComponent
  | ScrollViewComponent
  | ExpandableComponent
  // Input
  | ButtonComponent
  | TextFieldComponent
  | TextAreaComponent
  | CheckboxComponent
  | RadioGroupComponent
  | SelectComponent
  | SliderComponent
  | SwitchComponent
  | DatePickerComponent
  // List
  | ListComponent
  | ListItemComponent
  // Navigation
  | TabsComponent
  | LinkComponent
  // Feedback
  | AlertComponent
  | TooltipComponent
  | LoadingComponent;

// ============================================================================
// A2UI Document Structure
// ============================================================================

/**
 * A2UI uses an adjacency list representation where components
 * reference their children by ID. This allows for a flat structure
 * that can be easily transmitted and parsed.
 */
export interface A2UIDocument {
  /** Version of the A2UI specification */
  version?: string;

  /** The root component ID */
  root: ComponentId;

  /** Flat map of all components by their ID */
  components: Record<ComponentId, A2UIComponent>;

  /** The data model for data binding */
  dataModel?: DataModel;

  /** Optional metadata about the document */
  meta?: {
    title?: string;
    description?: string;
    author?: string;
    created?: string;
    modified?: string;
    // Game-specific metadata
    gameType?: string;
    phase?: string;
    [key: string]: unknown;  // Allow additional custom metadata
  };
}

// ============================================================================
// Type Guards
// ============================================================================

export function isLayoutComponent(component: A2UIComponent): component is
  | RowComponent
  | ColumnComponent
  | CardComponent
  | ContainerComponent
  | GridComponent
  | StackComponent
  | ScrollViewComponent
  | ExpandableComponent {
  return ['Row', 'Column', 'Card', 'Container', 'Grid', 'Stack', 'ScrollView', 'Expandable'].includes(component.type);
}

export function hasChildren(component: A2UIComponent): component is A2UIComponent & { children: ComponentId[] } {
  return 'children' in component && Array.isArray((component as unknown as Record<string, unknown>).children);
}

export function isInputComponent(component: A2UIComponent): component is
  | ButtonComponent
  | TextFieldComponent
  | TextAreaComponent
  | CheckboxComponent
  | RadioGroupComponent
  | SelectComponent
  | SliderComponent
  | SwitchComponent
  | DatePickerComponent {
  return ['Button', 'TextField', 'TextArea', 'Checkbox', 'RadioGroup', 'Select', 'Slider', 'Switch', 'DatePicker'].includes(component.type);
}

// ============================================================================
// Component Type to Interface Mapping
// ============================================================================

export type ComponentTypeMap = {
  Text: TextComponent;
  Image: ImageComponent;
  Icon: IconComponent;
  Divider: DividerComponent;
  Spacer: SpacerComponent;
  Badge: BadgeComponent;
  Avatar: AvatarComponent;
  Progress: ProgressComponent;
  Row: RowComponent;
  Column: ColumnComponent;
  Card: CardComponent;
  Container: ContainerComponent;
  Grid: GridComponent;
  Stack: StackComponent;
  ScrollView: ScrollViewComponent;
  Expandable: ExpandableComponent;
  Button: ButtonComponent;
  TextField: TextFieldComponent;
  TextArea: TextAreaComponent;
  Checkbox: CheckboxComponent;
  RadioGroup: RadioGroupComponent;
  Select: SelectComponent;
  Slider: SliderComponent;
  Switch: SwitchComponent;
  DatePicker: DatePickerComponent;
  List: ListComponent;
  ListItem: ListItemComponent;
  Tabs: TabsComponent;
  Link: LinkComponent;
  Alert: AlertComponent;
  Tooltip: TooltipComponent;
  Loading: LoadingComponent;
};

export type ComponentType = keyof ComponentTypeMap;
