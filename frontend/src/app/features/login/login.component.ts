import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-rh-dark via-rh-purple to-rh-neon px-4">
      
      <!-- Card de Login -->
      <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        
        <!-- Header do Card -->
        <div class="bg-gradient-to-r from-rh-dark to-rh-purple p-8 text-center">
          <div class="flex items-center justify-center gap-2 mb-2">
            <span class="material-icons text-rh-neon text-4xl">diversity_3</span>
          </div>
          <h1 class="text-3xl font-black text-white tracking-widest uppercase">FeedRh</h1>
          <p class="text-purple-200 text-sm mt-1">Sistema de Recrutamento & Seleção</p>
        </div>

        <!-- Body do Card -->
        <div class="p-8">
          <h2 class="text-xl font-bold text-rh-dark text-center mb-6">Acesse sua conta</h2>

          <div *ngIf="erro" class="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl animate-fade-in">
            <span class="material-icons text-base">error_outline</span>
            <span>{{ erro }}</span>
          </div>

          <form (ngSubmit)="entrar()" #loginForm="ngForm" class="space-y-5">
            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">email</span>
                <input
                  type="email" name="email" [(ngModel)]="email" required email #emailRef="ngModel"
                  placeholder="seu@email.com"
                  [ngClass]="{'border-red-400': emailRef.invalid && emailRef.touched}"
                  class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rh-purple transition-all text-sm" />
              </div>
            </div>

            <!-- Senha -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">lock</span>
                <input
                  [type]="mostrarSenha ? 'text' : 'password'"
                  name="senha" [(ngModel)]="senha" required minlength="6" #senhaRef="ngModel"
                  placeholder="••••••••"
                  [ngClass]="{'border-red-400': senhaRef.invalid && senhaRef.touched}"
                  class="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rh-purple transition-all text-sm" />
                <button type="button" (click)="mostrarSenha = !mostrarSenha" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rh-purple transition-colors">
                  <span class="material-icons text-lg">{{ mostrarSenha ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <!-- Botão -->
            <button type="submit" [disabled]="loginForm.invalid || carregando"
              class="w-full bg-gradient-to-r from-rh-purple to-rh-neon text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg mt-2">
              <span *ngIf="carregando" class="material-icons text-base animate-spin">refresh</span>
              <span *ngIf="!carregando" class="material-icons text-base">login</span>
              {{ carregando ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.25s ease-out; }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .animate-spin { animation: spin 0.8s linear infinite; }
  `]
})
export class LoginComponent {
  email = '';
  senha = '';
  erro = '';
  carregando = false;
  mostrarSenha = false;

  constructor(private authService: AuthService, private router: Router) {}

  entrar(): void {
    this.erro = '';
    this.carregando = true;

    this.authService.login(this.email, this.senha).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.carregando = false;
        this.erro = err.error?.detail || 'Erro ao conectar. Verifique se o servidor está rodando.';
      }
    });
  }
}
