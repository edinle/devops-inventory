export type AtlaskitIconLike = unknown;

// Atlaskit icon entrypoints can come through Vite's CJS interop as either:
// - a function component, or
// - a module namespace object with `{ default: fn }`.
export function resolveAtlaskitIcon<T>(icon: T): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maybeDefault = (icon as any)?.default;
  return (maybeDefault ?? icon) as T;
}

