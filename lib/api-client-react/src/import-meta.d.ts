/**
 * Minimal `ImportMeta` augmentation so `import.meta.env` type-checks inside
 * this package without pulling in Vite's type definitions as a dependency.
 *
 * Applications that bundle this package (e.g. artifacts/dent-ai) load
 * `vite/client`, which augments `ImportMeta` as well. This file is never
 * imported from application code, so it is not part of those programs and the
 * two declarations do not meet.
 */
interface ImportMeta {
  readonly env?: Record<string, string | undefined>;
}
