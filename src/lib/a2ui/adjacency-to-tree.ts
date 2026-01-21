/**
 * Adjacency List to Tree Conversion
 *
 * A2UI documents use an adjacency list representation where components
 * reference their children by ID. This module converts that flat structure
 * into a tree structure suitable for React rendering.
 */

import type {
  A2UIComponent,
  A2UIDocument,
  ComponentId,
} from './types';

/**
 * Tree node with resolved children
 */
export interface TreeNode {
  component: A2UIComponent;
  children: TreeNode[];
}

/**
 * Builds a tree structure from an A2UI document's adjacency list
 *
 * @param document - The A2UI document
 * @returns The root tree node
 */
export function buildTree(document: A2UIDocument): TreeNode | null {
  const { root, components } = document;

  if (!root || !components[root]) {
    return null;
  }

  return buildNodeTree(root, components, new Set());
}

/**
 * Recursively builds a tree node and its children
 */
function buildNodeTree(
  componentId: ComponentId,
  components: Record<ComponentId, A2UIComponent>,
  visited: Set<ComponentId>
): TreeNode | null {
  // Prevent infinite loops from circular references
  if (visited.has(componentId)) {
    console.warn(`Circular reference detected for component: ${componentId}`);
    return null;
  }

  const component = components[componentId];
  if (!component) {
    console.warn(`Component not found: ${componentId}`);
    return null;
  }

  visited.add(componentId);

  const childIds = getChildIds(component);
  const children: TreeNode[] = [];

  for (const childId of childIds) {
    const childNode = buildNodeTree(childId, components, new Set(visited));
    if (childNode) {
      children.push(childNode);
    }
  }

  return {
    component,
    children,
  };
}

/**
 * Extracts child component IDs from a component
 */
function getChildIds(component: A2UIComponent): ComponentId[] {
  const ids: ComponentId[] = [];

  // Standard children array
  if ('children' in component && Array.isArray((component as unknown as Record<string, unknown>).children)) {
    ids.push(...(component as unknown as Record<string, unknown>).children as ComponentId[]);
  }

  // Card header/footer actions
  if (component.type === 'Card') {
    const card = component as import('./types').CardComponent;
    if (card.headerActions) {
      ids.push(...card.headerActions);
    }
    if (card.footerActions) {
      ids.push(...card.footerActions);
    }
  }

  // ListItem leading/trailing content
  if (component.type === 'ListItem') {
    const listItem = component as import('./types').ListItemComponent;
    if (listItem.leadingContent) {
      ids.push(listItem.leadingContent);
    }
    if (listItem.trailingContent) {
      ids.push(listItem.trailingContent);
    }
  }

  // Alert actions
  if (component.type === 'Alert') {
    const alert = component as import('./types').AlertComponent;
    if (alert.actions) {
      ids.push(...alert.actions);
    }
  }

  // List template and empty state
  if (component.type === 'List') {
    const list = component as import('./types').ListComponent;
    if (list.itemTemplate) {
      ids.push(list.itemTemplate);
    }
    if (list.emptyState) {
      ids.push(list.emptyState);
    }
  }

  // Tabs content
  if (component.type === 'Tabs') {
    const tabs = component as import('./types').TabsComponent;
    for (const tab of tabs.tabs) {
      ids.push(tab.content);
    }
  }

  return ids;
}

/**
 * Flattens a tree back into an adjacency list
 * Useful for serialization after tree manipulation
 */
export function flattenTree(tree: TreeNode): Record<ComponentId, A2UIComponent> {
  const components: Record<ComponentId, A2UIComponent> = {};

  function traverse(node: TreeNode) {
    components[node.component.id] = node.component;
    for (const child of node.children) {
      traverse(child);
    }
  }

  traverse(tree);
  return components;
}

/**
 * Gets all component IDs in an A2UI document
 */
export function getAllComponentIds(document: A2UIDocument): ComponentId[] {
  return Object.keys(document.components);
}

/**
 * Finds a component by ID in the document
 */
export function findComponent(
  document: A2UIDocument,
  componentId: ComponentId
): A2UIComponent | undefined {
  return document.components[componentId];
}

/**
 * Finds the parent component of a given component
 */
export function findParent(
  document: A2UIDocument,
  componentId: ComponentId
): A2UIComponent | undefined {
  for (const [_id, component] of Object.entries(document.components)) {
    const childIds = getChildIds(component);
    if (childIds.includes(componentId)) {
      return component;
    }
  }
  return undefined;
}

/**
 * Gets the path from root to a component
 */
export function getComponentPath(
  document: A2UIDocument,
  componentId: ComponentId
): ComponentId[] {
  const path: ComponentId[] = [];
  let currentId: ComponentId | undefined = componentId;

  while (currentId) {
    path.unshift(currentId);
    const parent = findParent(document, currentId);
    currentId = parent?.id;
  }

  return path;
}

/**
 * Validates that an A2UI document has no orphan components
 */
export function validateDocument(document: A2UIDocument): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!document.root) {
    errors.push('Document has no root component');
    return { valid: false, errors };
  }

  if (!document.components[document.root]) {
    errors.push(`Root component '${document.root}' not found in components`);
    return { valid: false, errors };
  }

  // Find all reachable components
  const reachable = new Set<ComponentId>();
  const queue: ComponentId[] = [document.root];

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (reachable.has(id)) continue;

    const component = document.components[id];
    if (!component) {
      errors.push(`Referenced component '${id}' not found`);
      continue;
    }

    reachable.add(id);
    const childIds = getChildIds(component);
    queue.push(...childIds);
  }

  // Check for orphans
  for (const id of Object.keys(document.components)) {
    if (!reachable.has(id)) {
      errors.push(`Orphan component: '${id}' is not reachable from root`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
