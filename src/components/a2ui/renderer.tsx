'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import type { A2UIDocument, DataModel, Action, ComponentType } from '@/lib/a2ui/types';
import { buildTree, type TreeNode } from '@/lib/a2ui/adjacency-to-tree';
import { DataModelProvider, useDataModel } from './data-model-context';
import { getComponentRenderer, initializeRegistry } from './component-registry';

interface A2UIRendererProps {
  document: A2UIDocument;
  onDataModelChange?: (dataModel: DataModel) => void;
  onAction?: (action: Action) => void;
  className?: string;
}

/**
 * Main A2UI Renderer Component
 *
 * Renders an A2UI document to React components.
 * Handles data binding, actions, and component lifecycle.
 */
export function A2UIRenderer({
  document,
  onDataModelChange,
  onAction,
  className,
}: A2UIRendererProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Derive dataModel directly from document - DataModelProvider handles local state
  const dataModel = useMemo(
    () => document.dataModel ?? {},
    [document.dataModel]
  );

  // Initialize the component registry
  useEffect(() => {
    initializeRegistry().then(() => {
      setIsInitialized(true);
    });
  }, []);

  // Handle data model changes - propagate to parent
  const handleDataModelChange = useCallback(
    (newDataModel: DataModel) => {
      onDataModelChange?.(newDataModel);
    },
    [onDataModelChange]
  );

  // Build the tree from adjacency list
  const tree = useMemo(() => buildTree(document), [document]);

  if (!isInitialized) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          No components to render
        </div>
      </div>
    );
  }

  return (
    <DataModelProvider
      dataModel={dataModel}
      onDataModelChange={handleDataModelChange}
      onAction={onAction}
    >
      <div className={className}>
        <ComponentRenderer node={tree} document={document} />
      </div>
    </DataModelProvider>
  );
}

interface ComponentRendererProps {
  node: TreeNode;
  document: A2UIDocument;
}

/**
 * Renders a single component by type - wrapped to satisfy static analysis
 */
function DynamicComponentWrapper({
  componentType,
  component,
  children,
}: {
  componentType: ComponentType;
  component: TreeNode['component'];
  children: React.ReactNode;
}) {
  const RendererComponent = getComponentRenderer(componentType);

  if (!RendererComponent) {
    console.warn(`No renderer found for component type: ${componentType}`);
    return (
      <div className="p-2 border border-dashed border-yellow-500 rounded text-yellow-600 text-sm">
        Unknown component: {componentType}
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/static-components -- Dynamic component rendering is intentional for A2UI
  return <RendererComponent component={component}>{children}</RendererComponent>;
}

/**
 * Recursively renders a tree node and its children
 */
function ComponentRenderer({ node, document }: ComponentRendererProps) {
  const { component, children } = node;
  const { resolveValue: resolve } = useDataModel();

  // Check visibility
  const visible = component.visible !== undefined
    ? resolve<boolean>(component.visible as boolean | string)
    : true;

  if (!visible) {
    return null;
  }

  // Render children
  const childElements = children.map((childNode) => (
    <ComponentRenderer
      key={childNode.component.id}
      node={childNode}
      document={document}
    />
  ));

  return (
    <DynamicComponentWrapper
      componentType={component.type as ComponentType}
      component={component}
    >
      {childElements}
    </DynamicComponentWrapper>
  );
}

/**
 * Hook for accessing the current A2UI document context
 */
export function useA2UIDocument() {
  // This would be implemented with a document context if needed
  return null;
}

/**
 * Utility component for rendering a single A2UI component by ID
 */
interface SingleComponentRendererProps {
  document: A2UIDocument;
  componentId: string;
}

export function SingleComponentRenderer({
  document,
  componentId,
}: SingleComponentRendererProps) {
  const component = document.components[componentId];

  if (!component) {
    return null;
  }

  const tree = buildTree({
    ...document,
    root: componentId,
  });

  if (!tree) {
    return null;
  }

  return <ComponentRenderer node={tree} document={document} />;
}

/**
 * Error boundary for A2UI rendering
 */
interface A2UIErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface A2UIErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class A2UIErrorBoundary extends React.Component<
  A2UIErrorBoundaryProps,
  A2UIErrorBoundaryState
> {
  constructor(props: A2UIErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): A2UIErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('A2UI Render Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 border border-red-500 rounded bg-red-50 text-red-700">
            <h3 className="font-semibold">Render Error</h3>
            <p className="text-sm mt-1">{this.state.error?.message}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapped renderer with error boundary
 */
export function SafeA2UIRenderer(props: A2UIRendererProps) {
  return (
    <A2UIErrorBoundary>
      <A2UIRenderer {...props} />
    </A2UIErrorBoundary>
  );
}
