import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  //Rutas de autenticación (públicas)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },

  // Rutas protegidas (requieren autenticación)
  {
    path: 'articulos',
    loadComponent: () =>
      import('./features/articulos/articulo-list/articulo.component').then(m => m.ArticuloComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'categorias',
    loadComponent: () =>
      import('./features/categorias/categoria-list/categoria.component').then(m => m.CategoriaComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./features/clientes/cliente-list/cliente.component').then(m => m.ClienteComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'trabajadores',
    loadComponent: () =>
      import('./features/trabajadores/trabajador-list/trabajador.component').then(m => m.TrabajadorComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'proveedores',
    loadComponent: () =>
      import('./features/proveedores/proveedor-list/proveedor.component').then(m => m.ProveedorComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'ingresos',
    loadComponent: () =>
      import('./features/ingresos/ingreso-list/ingreso.component').then(m => m.IngresoComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'ventas',
    loadComponent: () =>
      import('./features/ventas/venta-list/venta.component').then(m => m.VentaComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'presentaciones',
    loadComponent: () =>
      import('./features/presentacion/presentacion.component').then(m => m.PresentacionComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'detalle-ingresos',
    loadComponent: () =>
      import('./features/detalle-ingreso/detalle-ingreso.component').then(m => m.DetalleIngresoComponent),
    canActivate: [AuthGuard]
  },

  // Ruta por defecto
  {
    path: 'menu',
   loadComponent: () =>
    import('./features/menu/menu/menu').then(m => m.MenuComponent),

    canActivate: [AuthGuard]
},

{ path: '', redirectTo: 'menu', pathMatch: 'full' }


];
