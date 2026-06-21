import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-reset-password',
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
            <span class="material-icons text-rh-purple text-4xl">key</span>
          </div>
          <h2 class="text-xl font-bold text-rh-dark text-center mb-3">Redefinir senha</h2>
          <p class="text-sm text-gray-600 text-center leading-relaxed mb-6">
            Crie uma nova senha para acessar sua conta no FEEDRH.
          </p>

          <div *ngIf="mensagem" class="mb-4 flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl animate-fade-in">
            <span class="material-icons text-base mt-0.5">check_circle</span>
            <span>{{ mensagem }}</span>
          </div>

          <div *ngIf="erro" class="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl animate-fade-in">
            <span class="material-icons text-base mt-0.5">error_outline</span>
            <span>{{ erro }}</span>
          </div>

          <form (ngSubmit)="redefinir()" #resetForm="ngForm" class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Nova senha</label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">lock</span>
                <input
                  [type]="mostrarNovaSenha ? 'text' : 'password'"
                  name="novaSenha"
                  [(ngModel)]="novaSenha"
                  required
                  minlength="6"
                  #novaSenhaRef="ngModel"
                  placeholder="••••••••"
                  [ngClass]="{'border-red-400': novaSenhaRef.invalid && novaSenhaRef.touched}"
                  class="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rh-purple transition-all text-sm" />
                <button type="button" (click)="mostrarNovaSenha = !mostrarNovaSenha" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rh-purple transition-colors">
                  <span class="material-icons text-lg">{{ mostrarNovaSenha ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Confirmar nova senha</label>
              <div class="relative">
                <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">lock</span>
                <input
                  [type]="mostrarConfirmarSenha ? 'text' : 'password'"
                  name="confirmarSenha"
                  [(ngModel)]="confirmarSenha"
                  required
                  minlength="6"
                  #confirmarSenhaRef="ngModel"
                  placeholder="••••••••"
                  [ngClass]="{'border-red-400': confirmarSenhaRef.invalid && confirmarSenhaRef.touched}"
                  class="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rh-purple transition-all text-sm" />
                <button type="button" (click)="mostrarConfirmarSenha = !mostrarConfirmarSenha" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rh-purple transition-colors">
                  <span class="material-icons text-lg">{{ mostrarConfirmarSenha ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <button type="submit" [disabled]="resetForm.invalid || carregando || !token || !!mensagem"
              class="w-full bg-gradient-to-r from-rh-purple to-rh-neon text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
              <span *ngIf="carregando" class="material-icons text-base animate-spin">refresh</span>
              <span *ngIf="!carregando" class="material-icons text-base">restart_alt</span>
              {{ carregando ? 'Redefinindo...' : 'Redefinir senha' }}
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
export class ResetPasswordComponent implements OnInit {
  token = '';
  novaSenha = '';
  confirmarSenha = '';
  erro = '';
  mensagem = '';
  carregando = false;
  mostrarNovaSenha = false;
  mostrarConfirmarSenha = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.erro = 'Link inválido ou expirado. Solicite uma nova recuperação de senha.';
    }
  }

  redefinir(): void {
    this.erro = '';
    this.mensagem = '';

    if (!this.token) {
      this.erro = 'Link inválido ou expirado. Solicite uma nova recuperação de senha.';
      return;
    }

    if (!this.novaSenha || !this.confirmarSenha) {
      this.erro = 'Informe e confirme a nova senha.';
      return;
    }

    if (this.novaSenha.length < 6) {
      this.erro = 'A senha deve ter no mínimo 6 caracteres.';
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.erro = 'As senhas não conferem.';
      return;
    }

    this.carregando = true;
    this.authService.resetPassword(this.token, this.novaSenha, this.confirmarSenha).subscribe({
      next: () => {
        this.carregando = false;
        this.mensagem = 'Senha redefinida com sucesso. Você já pode acessar sua conta.';
        this.erro = '';
        this.novaSenha = '';
        this.confirmarSenha = '';
      },
      error: (err) => {
        this.carregando = false;
        this.erro = err.error?.detail || 'Não foi possível redefinir a senha.';
      }
    });
  }
}
