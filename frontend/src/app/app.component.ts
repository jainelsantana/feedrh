import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from './core/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  template: `
    <div class="min-h-screen flex flex-col" [ngClass]="{'bg-rh-gray-purple': !isLoginPage, 'bg-gradient-to-br from-rh-dark via-rh-purple to-rh-neon': isLoginPage}">
      <!-- Navbar (oculta na página de login) -->
      <nav *ngIf="!isLoginPage" class="bg-rh-purple text-white shadow-lg sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4">
          <div class="flex justify-between items-center h-16">
            <!-- Logo -->
            <div class="flex items-center gap-2">
              <span class="material-icons text-rh-neon text-3xl">diversity_3</span>
              <span class="text-2xl font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-rh-neon">FeedRh</span>
            </div>

            <!-- Links Desktop -->
            <div class="hidden md:flex items-center gap-6">
              <a routerLink="/dashboard" routerLinkActive="border-b-2 border-rh-neon font-bold" class="py-5 hover:text-rh-neon transition-colors flex items-center gap-1 text-sm font-medium">
                <span class="material-icons text-lg">dashboard</span> Dashboard
              </a>
              <a routerLink="/vagas/nova" routerLinkActive="border-b-2 border-rh-neon font-bold" class="py-5 hover:text-rh-neon transition-colors flex items-center gap-1 text-sm font-medium">
                <span class="material-icons text-lg">add_circle</span> Nova Vaga
              </a>
              <a *ngIf="usuarioLogado?.perfil === 'RH'" routerLink="/rh/usuarios" routerLinkActive="border-b-2 border-rh-neon font-bold" class="py-5 hover:text-rh-neon transition-colors flex items-center gap-1 text-sm font-medium">
                <span class="material-icons text-lg">people</span> Usuários
              </a>
              <a *ngIf="usuarioLogado?.perfil === 'RH'" routerLink="/rh/decisoes" routerLinkActive="border-b-2 border-rh-neon font-bold" class="py-5 hover:text-rh-neon transition-colors flex items-center gap-1 text-sm font-medium">
                <span class="material-icons text-lg">gavel</span> Decisões
              </a>
              <a *ngIf="usuarioLogado?.perfil === 'RH'" routerLink="/rh/relatorios" routerLinkActive="border-b-2 border-rh-neon font-bold" class="py-5 hover:text-rh-neon transition-colors flex items-center gap-1 text-sm font-medium">
                <span class="material-icons text-lg">analytics</span> Relatório
              </a>
            </div>

            <!-- Usuário + Logout -->
            <div class="flex items-center gap-3">
              <div class="hidden sm:flex items-center gap-2 text-sm text-purple-200">
                <span class="material-icons text-base">account_circle</span>
                <span class="font-semibold">{{ usuarioLogado?.nome }}</span>
                <span class="text-xs bg-rh-neon text-rh-dark font-bold px-2 py-0.5 rounded-full">{{ usuarioLogado?.perfil }}</span>
              </div>
              <button (click)="logout()" class="flex items-center gap-1 text-xs text-purple-200 hover:text-white border border-purple-400 hover:border-white rounded-lg px-3 py-1.5 transition-all">
                <span class="material-icons text-sm">logout</span> Sair
              </button>
            </div>
          </div>
        </div>

        <!-- Menu Mobile -->
        <div class="md:hidden bg-rh-dark border-t border-purple-900 flex justify-around py-2">
          <a routerLink="/dashboard" routerLinkActive="text-rh-neon" class="flex flex-col items-center text-xs text-gray-300 hover:text-rh-neon">
            <span class="material-icons">dashboard</span><span>Dashboard</span>
          </a>
          <a routerLink="/vagas/nova" routerLinkActive="text-rh-neon" class="flex flex-col items-center text-xs text-gray-300 hover:text-rh-neon">
            <span class="material-icons">add_circle</span><span>Nova Vaga</span>
          </a>
          <a *ngIf="usuarioLogado?.perfil === 'RH'" routerLink="/rh/usuarios" routerLinkActive="text-rh-neon" class="flex flex-col items-center text-xs text-gray-300 hover:text-rh-neon">
            <span class="material-icons">people</span><span>Usuários</span>
          </a>
          <a *ngIf="usuarioLogado?.perfil === 'RH'" routerLink="/rh/decisoes" routerLinkActive="text-rh-neon" class="flex flex-col items-center text-xs text-gray-300 hover:text-rh-neon">
            <span class="material-icons">gavel</span><span>Decisões</span>
          </a>
        </div>
      </nav>

      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <footer
        class="px-4 py-3 text-center text-[11px] tracking-wide"
        [ngClass]="isLoginPage ? 'fixed inset-x-0 bottom-0 z-40 bg-rh-dark/25 text-white/80 backdrop-blur-sm' : 'border-t border-purple-100 bg-white/70 text-gray-500'">
        <span class="font-semibold">Desenvolvido por Jainel Santana</span>
        <span class="mx-1 opacity-60">|</span>
        <span>SISTEMAS-TI</span>
      </footer>
    </div>
  `
})
export class AppComponent implements OnInit {
  usuarioLogado: User | null = null;
  isLoginPage = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.usuarioLogado = user;
    });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isLoginPage = e.urlAfterRedirects === '/login';
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
