import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'SplashComponent',
    loadComponent: () => import('./componentes/splash/splash.component').then((m) => m.SplashComponent),
  },
  {
    path: '',
    redirectTo: 'SplashComponent',
    pathMatch: 'full',
  },
];
