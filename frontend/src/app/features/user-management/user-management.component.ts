import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserResponse } from '../../shared/user.service';
import { EmpresaService, Empresa } from '../../shared/empresa.service';
import { AuthService } from '../../core/auth.service';

interface NovoUsuarioState {
  nome: string;
  email: string;
  senha: string;
  empresa: string;
  perfil: 'RH' | 'GESTOR';
}

interface UsuarioEditState {
  nome: string;
  email: string;
  empresa: string;
  perfil: 'RH' | 'GESTOR';
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-rh-dark">Gerenciamento de Usuários e Empresas</h2>
        <p class="text-gray-500 mt-1">Cadastre usuários do RH, Gestores e empresas disponíveis na plataforma.</p>
      </div>

      <div *ngIf="mensagemUsuario" class="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
        {{ mensagemUsuario }}
      </div>
      <div *ngIf="erroUsuario" class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
        {{ erroUsuario }}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="space-y-6">
        <!-- Formulário de Cadastro -->
        <div class="bg-white rounded-2xl shadow-sm border border-rh-gray-purple p-6 h-fit">
          <h3 class="text-xl font-bold text-rh-dark mb-4 flex items-center gap-2">
            <span class="material-icons text-rh-purple">person_add</span> Novo Usuário
          </h3>
          
          <form (ngSubmit)="cadastrarUsuario()" #userForm="ngForm" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700">Nome Completo</label>
              <input type="text" name="nome" [(ngModel)]="novoUsuario.nome" required #nameRef="ngModel"
                [ngClass]="{'border-red-400': nameRef.invalid && nameRef.touched}"
                placeholder="Nome completo"
                class="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rh-purple text-sm" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700">E-mail</label>
              <input type="email" name="email" [(ngModel)]="novoUsuario.email" required email #emailRef="ngModel"
                [ngClass]="{'border-red-400': emailRef.invalid && emailRef.touched}"
                placeholder="nome@empresa.com"
                class="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rh-purple text-sm" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700">Senha de Acesso</label>
              <div class="relative">
                <input [type]="mostrarSenha ? 'text' : 'password'" name="senha" [(ngModel)]="novoUsuario.senha"
                  required minlength="6" #senhaRef="ngModel"
                  [ngClass]="{'border-red-400': senhaRef.invalid && senhaRef.touched}"
                  placeholder="Mínimo 6 caracteres"
                  class="mt-1 w-full p-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rh-purple text-sm" />
                <button type="button" (click)="mostrarSenha = !mostrarSenha" class="absolute right-3 top-1/2 text-gray-400 hover:text-rh-purple transition-colors">
                  <span class="material-icons text-lg">{{ mostrarSenha ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              <p *ngIf="senhaRef.invalid && senhaRef.touched" class="text-xs text-red-500 mt-1">Mínimo de 6 caracteres.</p>
              <p *ngIf="novoUsuario.perfil === 'GESTOR'" class="mt-2 rounded-lg bg-purple-50 px-3 py-2 text-xs font-medium text-rh-dark">
                Ao cadastrar um gestor, essa senha será enviada por e-mail para o endereço informado.
              </p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700">Empresa</label>
              <select name="empresa" [(ngModel)]="novoUsuario.empresa" required #empresaRef="ngModel"
                [ngClass]="{'border-red-400': empresaRef.invalid && empresaRef.touched}"
                class="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rh-purple bg-white text-sm">
                <option value="">Selecione uma empresa</option>
                <option *ngFor="let empresa of empresas" [value]="empresa.nome">{{ empresa.nome }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700">Perfil de Acesso</label>
              <div class="mt-2 flex gap-3">
                <label class="flex-1 flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all"
                  [ngClass]="{'border-rh-purple bg-purple-50': novoUsuario.perfil === 'GESTOR', 'border-gray-200': novoUsuario.perfil !== 'GESTOR'}">
                  <span class="flex items-center gap-2 text-sm font-medium">
                    <input type="radio" name="perfil" value="GESTOR" [(ngModel)]="novoUsuario.perfil" class="text-rh-purple h-4 w-4" />
                    Gestor
                  </span>
                  <span class="material-icons text-sm" [ngClass]="{'text-rh-purple': novoUsuario.perfil === 'GESTOR', 'text-gray-400': novoUsuario.perfil !== 'GESTOR'}">manage_accounts</span>
                </label>
                <label class="flex-1 flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all"
                  [ngClass]="{'border-rh-purple bg-purple-50': novoUsuario.perfil === 'RH', 'border-gray-200': novoUsuario.perfil !== 'RH'}">
                  <span class="flex items-center gap-2 text-sm font-medium">
                    <input type="radio" name="perfil" value="RH" [(ngModel)]="novoUsuario.perfil" class="text-rh-purple h-4 w-4" />
                    RH
                  </span>
                  <span class="material-icons text-sm" [ngClass]="{'text-rh-purple': novoUsuario.perfil === 'RH', 'text-gray-400': novoUsuario.perfil !== 'RH'}">admin_panel_settings</span>
                </label>
              </div>
            </div>

            <button type="submit" [disabled]="userForm.invalid"
              class="w-full bg-rh-purple text-white py-3 rounded-lg font-bold hover:bg-rh-dark transition-all disabled:opacity-40 shadow-sm flex items-center justify-center gap-2 mt-2 text-sm">
              <span class="material-icons text-sm">save</span> Criar Usuário
            </button>
          </form>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-rh-gray-purple p-6 h-fit">
          <h3 class="text-xl font-bold text-rh-dark mb-4 flex items-center gap-2">
            <span class="material-icons text-rh-purple">business</span> Empresas
          </h3>

          <form (ngSubmit)="cadastrarEmpresa()" #empresaForm="ngForm" class="space-y-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700">Nova Empresa</label>
              <input type="text" name="novaEmpresa" [(ngModel)]="novaEmpresa.nome" required minlength="2" #novaEmpresaRef="ngModel"
                [ngClass]="{'border-red-400': novaEmpresaRef.invalid && novaEmpresaRef.touched}"
                placeholder="Nome da empresa"
                class="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rh-purple text-sm" />
            </div>

            <button type="submit" [disabled]="empresaForm.invalid"
              class="w-full bg-white text-rh-purple border border-rh-purple py-3 rounded-lg font-bold hover:bg-purple-50 transition-all disabled:opacity-40 flex items-center justify-center gap-2 text-sm">
              <span class="material-icons text-sm">add_business</span> Cadastrar Empresa
            </button>
          </form>

          <div class="mt-5 border-t border-gray-100 pt-4">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Empresas cadastradas</p>
            <div class="space-y-2">
              <div *ngFor="let empresa of empresas" class="flex items-center justify-between gap-2 rounded-lg border border-purple-100 bg-purple-50/50 px-3 py-2">
                <ng-container *ngIf="empresaEditandoId === empresa.id; else empresaResumo">
                  <input type="text" [name]="'empresaEditando' + empresa.id" [(ngModel)]="empresaEmEdicao"
                    class="min-w-0 flex-1 rounded-md border border-purple-200 bg-white px-2 py-1 text-sm text-rh-dark focus:outline-none focus:ring-2 focus:ring-rh-purple" />
                  <button type="button" (click)="salvarEdicaoEmpresa(empresa)" title="Salvar empresa"
                    class="h-8 w-8 rounded-md bg-rh-purple text-white hover:bg-rh-dark transition-colors flex items-center justify-center">
                    <span class="material-icons text-base">check</span>
                  </button>
                  <button type="button" (click)="cancelarEdicaoEmpresa()" title="Cancelar edição"
                    class="h-8 w-8 rounded-md border border-gray-300 text-gray-600 hover:bg-white transition-colors flex items-center justify-center">
                    <span class="material-icons text-base">close</span>
                  </button>
                </ng-container>

                <ng-template #empresaResumo>
                  <span class="min-w-0 flex-1 truncate text-sm font-semibold text-rh-dark">{{ empresa.nome }}</span>
                  <button type="button" (click)="editarEmpresa(empresa)" title="Editar empresa"
                    class="h-8 w-8 rounded-md border border-purple-200 text-rh-purple hover:bg-white transition-colors flex items-center justify-center">
                    <span class="material-icons text-base">edit</span>
                  </button>
                  <button type="button" (click)="apagarEmpresa(empresa)" title="Apagar empresa"
                    class="h-8 w-8 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center">
                    <span class="material-icons text-base">delete</span>
                  </button>
                </ng-template>
              </div>
            </div>
          </div>
        </div>
        </div>

        <!-- Tabela de Usuários -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-rh-gray-purple overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-xl font-bold text-rh-dark flex items-center gap-2">
              <span class="material-icons text-rh-purple">group</span> Usuários Cadastrados
            </h3>
            <span class="text-xs bg-purple-100 text-rh-dark px-3 py-1 rounded-full font-bold">Total: {{ usuarios.length }}</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-purple-50 border-b border-purple-100 text-rh-dark text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th class="p-4">Nome</th>
                  <th class="p-4">E-mail</th>
                  <th class="p-4">Empresa</th>
                  <th class="p-4">Perfil</th>
                  <th class="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm text-gray-700">
                <tr *ngFor="let u of usuarios" class="hover:bg-purple-50/40 transition-colors">
                  <td class="p-4 font-medium text-gray-900">
                    <div *ngIf="usuarioEditandoId !== u.id; else editarNomeUsuario" class="flex items-center gap-2">
                      <span class="material-icons text-gray-400 text-base">person</span>
                      {{ u.nome }}
                    </div>
                    <ng-template #editarNomeUsuario>
                      <input type="text" [name]="'usuarioNome' + u.id" [(ngModel)]="usuarioEmEdicao.nome"
                        class="w-full min-w-[150px] rounded-md border border-purple-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-rh-purple" />
                    </ng-template>
                  </td>

                  <td class="p-4">
                    <span *ngIf="usuarioEditandoId !== u.id; else editarEmailUsuario">{{ u.email }}</span>
                    <ng-template #editarEmailUsuario>
                      <input type="email" [name]="'usuarioEmail' + u.id" [(ngModel)]="usuarioEmEdicao.email"
                        class="w-full min-w-[180px] rounded-md border border-purple-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-rh-purple" />
                    </ng-template>
                  </td>

                  <td class="p-4">
                    <span *ngIf="usuarioEditandoId !== u.id; else editarEmpresaUsuario">{{ u.empresa }}</span>
                    <ng-template #editarEmpresaUsuario>
                      <select [name]="'usuarioEmpresa' + u.id" [(ngModel)]="usuarioEmEdicao.empresa"
                        class="w-full min-w-[160px] rounded-md border border-purple-200 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-rh-purple">
                        <option *ngFor="let empresa of empresas" [value]="empresa.nome">{{ empresa.nome }}</option>
                      </select>
                    </ng-template>
                  </td>

                  <td class="p-4">
                    <span *ngIf="usuarioEditandoId !== u.id" [ngClass]="{
                      'bg-purple-100 text-rh-purple border-purple-200': u.perfil === 'RH',
                      'bg-blue-100 text-blue-800 border-blue-200': u.perfil === 'GESTOR'
                    }" class="text-xs font-semibold px-3 py-1 rounded-full border">
                      {{ u.perfil }}
                    </span>
                    <select *ngIf="usuarioEditandoId === u.id" [name]="'usuarioPerfil' + u.id" [(ngModel)]="usuarioEmEdicao.perfil"
                      class="w-full min-w-[120px] rounded-md border border-purple-200 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-rh-purple">
                      <option value="GESTOR">GESTOR</option>
                      <option value="RH">RH</option>
                    </select>
                  </td>

                  <td class="p-4">
                    <div *ngIf="usuarioEditandoId !== u.id; else editarAcoesUsuario" class="flex items-center justify-end gap-2">
                      <button *ngIf="u.perfil === 'GESTOR'" type="button" (click)="resetarSenhaGestor(u)" [disabled]="resetandoSenhaId === u.id"
                        title="Resetar senha"
                        class="h-8 rounded-md border border-blue-200 px-2 text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-wait">
                        <span class="material-icons text-base">{{ resetandoSenhaId === u.id ? 'sync' : 'lock_reset' }}</span>
                        <span class="hidden xl:inline text-xs font-semibold">Resetar senha</span>
                      </button>
                      <button type="button" (click)="editarUsuario(u)" title="Editar usuário"
                        class="h-8 w-8 rounded-md border border-purple-200 text-rh-purple hover:bg-purple-50 transition-colors flex items-center justify-center">
                        <span class="material-icons text-base">edit</span>
                      </button>
                      <button type="button" (click)="apagarUsuario(u)" [disabled]="isUsuarioLogado(u)"
                        [title]="isUsuarioLogado(u) ? 'Você não pode apagar sua própria conta' : 'Apagar usuário'"
                        class="h-8 w-8 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                        <span class="material-icons text-base">delete</span>
                      </button>
                    </div>
                    <ng-template #editarAcoesUsuario>
                      <div class="flex items-center justify-end gap-2">
                        <button type="button" (click)="salvarEdicaoUsuario(u)" title="Salvar usuário"
                          class="h-8 w-8 rounded-md bg-rh-purple text-white hover:bg-rh-dark transition-colors flex items-center justify-center">
                          <span class="material-icons text-base">check</span>
                        </button>
                        <button type="button" (click)="cancelarEdicaoUsuario()" title="Cancelar edição"
                          class="h-8 w-8 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center">
                          <span class="material-icons text-base">close</span>
                        </button>
                      </div>
                    </ng-template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  usuarios: UserResponse[] = [];
  empresas: Empresa[] = [];
  mostrarSenha = false;
  empresaEditandoId: number | null = null;
  empresaEmEdicao = '';
  usuarioEditandoId: number | null = null;
  resetandoSenhaId: number | null = null;
  mensagemUsuario = '';
  erroUsuario = '';
  usuarioEmEdicao: UsuarioEditState = {
    nome: '',
    email: '',
    empresa: '',
    perfil: 'GESTOR'
  };

  novoUsuario: NovoUsuarioState = {
    nome: '',
    email: '',
    senha: '',
    empresa: '',
    perfil: 'GESTOR'
  };

  novaEmpresa = {
    nome: ''
  };

  constructor(
    private userService: UserService,
    private empresaService: EmpresaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
    this.carregarEmpresas();
  }

  carregarUsuarios(): void {
    this.userService.getUsers().subscribe({
      next: (data) => this.usuarios = data,
      error: (err) => console.error(err)
    });
  }

  carregarEmpresas(): void {
    this.empresaService.getEmpresas().subscribe({
      next: (data) => this.empresas = data,
      error: (err) => console.error(err)
    });
  }

  cadastrarUsuario(): void {
    this.mensagemUsuario = '';
    this.erroUsuario = '';
    const perfilCriado = this.novoUsuario.perfil;
    this.userService.createUser(this.novoUsuario).subscribe({
      next: (user) => {
        this.usuarios.push(user);
        this.novoUsuario = { nome: '', email: '', senha: '', empresa: '', perfil: 'GESTOR' };
        if (perfilCriado === 'GESTOR') {
          this.mensagemUsuario = user.email_enviado
            ? 'Gestor cadastrado com sucesso. E-mail de acesso enviado ao gestor.'
            : 'Gestor cadastrado, mas não foi possível enviar o e-mail de acesso. Verifique as configurações SMTP.';
        } else {
          this.mensagemUsuario = 'Usuário cadastrado com sucesso.';
        }
      },
      error: (err) => this.erroUsuario = err.error?.detail || 'Erro ao cadastrar usuário.'
    });
  }

  editarUsuario(usuario: UserResponse): void {
    this.usuarioEditandoId = usuario.id;
    this.usuarioEmEdicao = {
      nome: usuario.nome,
      email: usuario.email,
      empresa: usuario.empresa,
      perfil: usuario.perfil
    };
  }

  cancelarEdicaoUsuario(): void {
    this.usuarioEditandoId = null;
    this.usuarioEmEdicao = {
      nome: '',
      email: '',
      empresa: '',
      perfil: 'GESTOR'
    };
  }

  salvarEdicaoUsuario(usuario: UserResponse): void {
    if (!this.usuarioEmEdicao.nome.trim() || !this.usuarioEmEdicao.email.trim() || !this.usuarioEmEdicao.empresa) {
      alert('Preencha nome, e-mail e empresa do usuário.');
      return;
    }

    this.userService.updateUser(usuario.id, {
      nome: this.usuarioEmEdicao.nome,
      email: this.usuarioEmEdicao.email,
      empresa: this.usuarioEmEdicao.empresa,
      perfil: this.usuarioEmEdicao.perfil
    }).subscribe({
      next: (usuarioAtualizado) => {
        this.usuarios = this.usuarios.map(item => item.id === usuarioAtualizado.id ? usuarioAtualizado : item);
        if (this.isUsuarioLogado(usuarioAtualizado)) {
          this.authService.updateCurrentUser(usuarioAtualizado);
        }
        this.cancelarEdicaoUsuario();
      },
      error: (err) => alert(err.error?.detail || 'Erro ao editar usuário.')
    });
  }

  apagarUsuario(usuario: UserResponse): void {
    const confirmar = confirm(`Apagar o usuário "${usuario.nome}"?`);
    if (!confirmar) {
      return;
    }

    this.userService.deleteUser(usuario.id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(item => item.id !== usuario.id);
      },
      error: (err) => alert(err.error?.detail || 'Erro ao apagar usuário.')
    });
  }

  resetarSenhaGestor(usuario: UserResponse): void {
    const confirmar = confirm(`Deseja gerar uma nova senha e enviar para ${usuario.nome}?`);
    if (!confirmar) {
      return;
    }

    this.mensagemUsuario = '';
    this.erroUsuario = '';
    this.resetandoSenhaId = usuario.id;
    this.userService.resetPassword(usuario.id).subscribe({
      next: (resposta) => {
        this.resetandoSenhaId = null;
        this.usuarios = this.usuarios.map(item =>
          item.id === usuario.id
            ? { ...item, ultimo_reset_senha: new Date().toISOString(), updated_at: new Date().toISOString() }
            : item
        );
        this.mensagemUsuario = resposta.email_enviado
          ? 'Senha resetada com sucesso. Nova senha enviada ao gestor por e-mail.'
          : 'Senha resetada, mas não foi possível enviar o e-mail. Verifique as configurações SMTP.';
      },
      error: (err) => {
        this.resetandoSenhaId = null;
        this.erroUsuario = err.error?.detail || 'Erro ao resetar senha do gestor.';
      }
    });
  }

  isUsuarioLogado(usuario: UserResponse): boolean {
    return this.authService.currentUserValue?.id === usuario.id;
  }

  cadastrarEmpresa(): void {
    this.empresaService.createEmpresa(this.novaEmpresa.nome).subscribe({
      next: (empresa) => {
        this.empresas = [...this.empresas, empresa].sort((a, b) => a.nome.localeCompare(b.nome));
        this.novaEmpresa = { nome: '' };
      },
      error: (err) => alert(err.error?.detail || 'Erro ao cadastrar empresa.')
    });
  }

  editarEmpresa(empresa: Empresa): void {
    this.empresaEditandoId = empresa.id;
    this.empresaEmEdicao = empresa.nome;
  }

  cancelarEdicaoEmpresa(): void {
    this.empresaEditandoId = null;
    this.empresaEmEdicao = '';
  }

  salvarEdicaoEmpresa(empresa: Empresa): void {
    const nomeAnterior = empresa.nome;
    const novoNome = this.empresaEmEdicao.trim();

    if (!novoNome) {
      alert('Informe um nome de empresa válido.');
      return;
    }

    this.empresaService.updateEmpresa(empresa.id, novoNome).subscribe({
      next: (empresaAtualizada) => {
        this.empresas = this.empresas
          .map(item => item.id === empresaAtualizada.id ? empresaAtualizada : item)
          .sort((a, b) => a.nome.localeCompare(b.nome));
        this.usuarios = this.usuarios.map(usuario =>
          usuario.empresa === nomeAnterior ? { ...usuario, empresa: empresaAtualizada.nome } : usuario
        );
        if (this.novoUsuario.empresa === nomeAnterior) {
          this.novoUsuario.empresa = empresaAtualizada.nome;
        }
        this.cancelarEdicaoEmpresa();
      },
      error: (err) => alert(err.error?.detail || 'Erro ao editar empresa.')
    });
  }

  apagarEmpresa(empresa: Empresa): void {
    const confirmar = confirm(`Apagar a empresa "${empresa.nome}"?`);
    if (!confirmar) {
      return;
    }

    this.empresaService.deleteEmpresa(empresa.id).subscribe({
      next: () => {
        this.empresas = this.empresas.filter(item => item.id !== empresa.id);
        if (this.novoUsuario.empresa === empresa.nome) {
          this.novoUsuario.empresa = '';
        }
      },
      error: (err) => alert(err.error?.detail || 'Erro ao apagar empresa.')
    });
  }
}
