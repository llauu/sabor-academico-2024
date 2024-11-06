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
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then( m => m.HomePage)
  },
  {
    path: 'pruebaQR',
    loadComponent: () => import('./componentes/qr-scanner/qr-scanner.component').then( m => m.Scanner)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
  },  {
    path: 'chat-mozo',
    loadComponent: () => import('./pages/chat-mozo/chat-mozo.page').then( m => m.ChatMozoPage)
  },

];
