import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'SplashComponent',
    pathMatch: 'full',
  },
  {
    path: 'SplashComponent',
    loadComponent: () => import('./componentes/splash/splash.component').then((m) => m.SplashComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./componentes/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./componentes/home/home.page').then( m => m.HomePage)
  },
];
