import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-rh-dark via-rh-purple to-rh-neon px-4 pt-8 pb-16">
      <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div class="bg-gradient-to-r from-rh-dark to-rh-purple p-8 text-center">
          <div class="flex items-center justify-center gap-2 mb-2">
            <span class="material-icons text-rh-neon text-4xl">diversity_3</span>
          </div>
          <h1 class="text-3xl font-black text-white tracking-widest uppercase">FeedRh</h1>
          <p class="text-purple-200 text-sm mt-1">Sistema de Recrutamento & Seleção</p>
        </div>

        <div class="p-8">
          <div class="flex items-center justify-center mb-4">
            <span class="material-icons text-rh-purple text-4xl">mark_email_read</span>
          </div>
          <h2 class="text-xl font-bold text-rh-dark text-center mb-3">Recuperar senha</h2>
          <p class="text-sm text-gray-600 text-center leading-relaxed mb-6">
            Informe o e-mail cadastrado no FEEDRH. Se existir uma conta vinculada a este e-mail,
            enviaremos instruções para redefinir sua senha.
          </p>

          <div *ngIf="mensagem" class="mb-4 flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl animate-fade-in">
            <span class="material-icons text-base mt-0.5">check_circle</span>
            <span>{{ mensagem }}</span>
          </div>

          <div *ngIf="erro" class="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl animate-fade-in">
            <span class="material-icons text-base">error_outline</span>
            <span>{{ erro }}</span>
          </div>

          <form (ngSubmit)="enviar()" #forgotForm="ngForm" class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">email</span>
                <input
                  type="email"
                  name="email"
                  [(ngModel)]="email"
                  required
                  email
                  #emailRef="ngModel"
                  placeholder="seu@email.com"
                  [ngClass]="{'border-red-400': emailRef.invalid && emailRef.touched}"
                  class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rh-purple transition-all text-sm" />
              </div>
            </div>

            <button type="submit" [disabled]="forgotForm.invalid || carregando"
              class="w-full bg-gradient-to-r from-rh-purple to-rh-neon text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
              <span *ngIf="carregando" class="material-icons text-base animate-spin">refresh</span>
              <span *ngIf="!carregando" class="material-icons text-base">mark_email_read</span>
              {{ carregando ? 'Enviando...' : 'Enviar instruções' }}
            </button>
          </form>

          <a routerLink="/login" class="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-rh-purple hover:text-rh-neon transition-colors">
            <span class="material-icons text-base">arrow_back</span>
            Voltar para login
          </a>
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
export class ForgotPasswordComponent {
  email = '';
  mensagem = '';
  erro = '';
  carregando = false;

  constructor(private authService: AuthService) {}

  enviar(): void {
    this.mensagem = '';
    this.erro = '';

    if (!this.email.trim()) {
      this.erro = 'Informe o e-mail cadastrado.';
      return;
    }

    this.carregando = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.carregando = false;
        this.mensagem = response.detail;
        this.erro = '';
      },
      error: () => {
        this.carregando = false;
        this.mensagem = 'Se o e-mail informado estiver cadastrado, você receberá instruções para redefinir sua senha.';
        this.erro = '';
      }
    });
  }
}
