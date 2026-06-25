import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { routeTree } from './routes';

/**
 * App router. Future phases (auth, wallet, contest…) only need to push
 * additional `RouteObject`s into `routeTree` — they should never call
 * `createBrowserRouter` again.
 */
export const appRouter = createBrowserRouter(routeTree);

export const AppRouter = (): JSX.Element => <RouterProvider router={appRouter} />;
