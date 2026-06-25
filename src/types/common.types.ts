/**
 * Cross-cutting type helpers. Keep this file small — feature-specific
 * shapes belong in their owning feature folder.
 */

export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;

export type Dict<V = unknown> = Record<string, V>;

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AsyncState<T> {
  data: Nullable<T>;
  status: AsyncStatus;
  error: Nullable<string>;
}

export interface SelectOption<V extends string | number = string> {
  value: V;
  label: string;
  disabled?: boolean;
}

export type EmptyObject = Record<string, never>;
