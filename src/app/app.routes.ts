import { Routes } from '@angular/router';
import { ConfirmarPedidosComponent } from './componentes/confirmar-pedidos/confirmar-pedidos.component';

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
  },
  {
    path: 'chat-mozo',
    loadComponent: () => import('./pages/chat-mozo/chat-mozo.page').then( m => m.ChatMozoPage)
  },
  {
    path: 'anonymous',
    loadComponent: () => import('./pages/register-anonymous/register-anonymous.component').then( m => m.RegisterAnonymousComponent)
  },
  {
    path: 'gestion-clientes',
    loadComponent: () => import('./pages/gestion-clientes/gestion-clientes.page').then( m => m.GestionClientesPage)
  },
  {
    path: 'ingreso-mesa',
    loadComponent: () => import('./pages/ingreso-mesa/mesa.page').then( m => m.MesaPage)
  },
  {
    path: 'menu-admin',
    loadComponent: () => import('./pages/menus/menu-admin/menu-admin.page').then( m => m.MenuAdminPage)
  },
  {
    path: 'menu-maitre',
    loadComponent: () => import('./pages/menus/menu-maitre/menu-maitre.page').then( m => m.MenuMaitrePage)
  },
  {
    path: 'menu-mozo',
    loadComponent: () => import('./pages/menus/menu-mozo/menu-mozo.page').then( m => m.MenuMozoPage)
  },
  {
    path: 'menu-cliente',
    loadComponent: () => import('./pages/menus/menu-cliente/menu-cliente.page').then( m => m.MenuClientePage)
  },
  {
    path: 'menu-empleado',
    loadComponent: () => import('./pages/menus/menu-empleado/menu-empleado.page').then( m => m.MenuEmpleadoPage)
  },
  {
    path: 'gestion-ingresos',
    loadComponent: () => import('./pages/gestion-ingresos/gestion-ingresos.page').then( m => m.GestionIngresosPage)
  },
  {
    path: 'menu',
    loadComponent: () => import('./componentes/menu-listado/menu-listado.component').then( m => m.MenuListadoComponent)
  },
  {
    path: 'menu-cliente-esperando',
    loadComponent: () => import('./pages/menus/menu-cliente-esperando/menu-cliente-esperando.page').then( m => m.MenuClienteEsperandoPage)
  },
  {
    path: 'confirmar-pedidos',
    loadComponent: () => import('./componentes/confirmar-pedidos/confirmar-pedidos.component').then( m => m.ConfirmarPedidosComponent)
  },
  {
    path: 'confirmar-pago',
    loadComponent: () => import('./componentes/confirmar-pago/confirmar-pago.component').then( m => m.ConfirmarPagoComponent)
  }
];
