declare module 'react-router-dom' {
  import { ComponentType, ReactNode } from 'react';
  
  export interface NavigateFunction {
    (to: string, options?: { replace?: boolean }): void;
  }
  
  export interface Location {
    pathname: string;
    search: string;
    hash: string;
    state: unknown;
    key: string;
  }
  
  export function useNavigate(): NavigateFunction;
  export function useLocation(): Location;
  
  export interface BrowserRouterProps {
    children?: ReactNode;
  }
  
  export const BrowserRouter: ComponentType<BrowserRouterProps>;
  
  export interface RoutesProps {
    children?: ReactNode;
  }
  
  export const Routes: ComponentType<RoutesProps>;
  
  export interface RouteProps {
    path: string;
    element: ReactNode;
  }
  
  export const Route: ComponentType<RouteProps>;
}



