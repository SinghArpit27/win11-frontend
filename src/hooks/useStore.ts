import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

import type { AppDispatch, RootState } from '@store/store';

/**
 * Typed Redux hooks. Always prefer these over the bare `useDispatch` /
 * `useSelector` imports — they erase the `any` shape from the store.
 */
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
