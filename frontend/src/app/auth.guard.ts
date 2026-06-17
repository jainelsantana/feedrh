import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Simulação: Pegamos o perfil armazenado no localStorage (Setado no login)
    // Para simplificar, assumimos que há um usuário logado.
    const perfil = localStorage.getItem('perfil') || 'Gestor'; 
    const expectedRole = route.data['role'];

    if (expectedRole && perfil !== expectedRole) {
      alert('Acesso Negado: Esta área é exclusiva do RH.');
      this.router.navigate(['/dashboard']);
      return false;
    }
    
    return true;
  }
}
