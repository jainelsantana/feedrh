import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VagaFiltros, VagaService, Relatorio } from '../../shared/vaga.service';
import { UserResponse, UserService } from '../../shared/user.service';
import { Empresa, EmpresaService } from '../../shared/empresa.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 class="text-3xl font-bold text-rh-dark">Relatório Consolidado para a Diretoria</h2>
          <p class="text-gray-500 mt-1">Métricas gerais de vagas, finalizações e agrupamentos gerenciais.</p>
        </div>
        <div *ngIf="isRh" class="flex flex-col sm:flex-row gap-3">
          <button type="button" (click)="exportar('pdf')" [disabled]="exportando === 'pdf' || !relatorio"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-rh-purple px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-rh-dark disabled:opacity-40 disabled:cursor-wait">
            <span class="material-icons text-base">{{ exportando === 'pdf' ? 'sync' : 'picture_as_pdf' }}</span>
            Exportar PDF
          </button>
          <button type="button" (click)="exportar('excel')" [disabled]="exportando === 'excel' || !relatorio"
            class="inline-flex items-center justify-center gap-2 rounded-lg border border-rh-purple bg-white px-4 py-3 text-sm font-bold text-rh-purple transition-all hover:bg-purple-50 disabled:opacity-40 disabled:cursor-wait">
            <span class="material-icons text-base">{{ exportando === 'excel' ? 'sync' : 'table_view' }}</span>
            Exportar Excel
          </button>
        </div>
      </div>

      <form *ngIf="isRh" (ngSubmit)="aplicarFiltros()" class="mb-8 rounded-2xl border border-rh-gray-purple bg-white p-5 shadow-sm">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label class="block text-xs font-bold uppercase text-gray-500">Gestor</label>
            <select name="gestor_id" [(ngModel)]="filtros.gestor_id"
              class="mt-1 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rh-purple">
              <option [ngValue]="null">Todos</option>
              <option *ngFor="let gestor of gestores" [ngValue]="gestor.id">{{ gestor.nome }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500">Empresa</label>
            <select name="empresa" [(ngModel)]="filtros.empresa"
              class="mt-1 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rh-purple">
              <option value="">Todas</option>
              <option *ngFor="let empresa of empresas" [value]="empresa.nome">{{ empresa.nome }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500">Senioridade</label>
            <select name="senioridade" [(ngModel)]="filtros.senioridade"
              class="mt-1 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rh-purple">
              <option value="">Todas</option>
              <option *ngFor="let senioridade of senioridades" [value]="senioridade">{{ senioridade }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500">Status</label>
            <select name="status_decisao" [(ngModel)]="filtros.status_decisao"
              class="mt-1 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rh-purple">
              <option value="">Todos</option>
              <option *ngFor="let status of statusOptions" [value]="status">{{ status }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500">Etapa</label>
            <select name="etapa_funil" [(ngModel)]="filtros.etapa_funil"
              class="mt-1 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rh-purple">
              <option [ngValue]="null">Todas</option>
              <option *ngFor="let etapa of etapas" [ngValue]="etapa.id">{{ etapa.nome }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500">Data inicial</label>
            <input type="date" name="data_inicio" [(ngModel)]="filtros.data_inicio"
              class="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rh-purple" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-gray-500">Data final</label>
            <input type="date" name="data_fim" [(ngModel)]="filtros.data_fim"
              class="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rh-purple" />
          </div>

          <div class="flex items-end gap-3">
            <button type="submit"
              class="flex-1 rounded-lg bg-rh-dark px-4 py-3 text-sm font-bold text-white transition-all hover:bg-rh-purple">
              Filtrar
            </button>
            <button type="button" (click)="limparFiltros()"
              class="rounded-lg border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50">
              Limpar
            </button>
          </div>
        </div>
      </form>

      <div *ngIf="erroExportacao" class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
        {{ erroExportacao }}
      </div>

      <div *ngIf="!relatorio" class="bg-white p-8 rounded-2xl shadow-sm border border-rh-gray-purple text-center">
        <span class="material-icons text-rh-purple text-5xl mb-4 font-light animate-pulse">sync</span>
        <h3 class="text-xl font-bold text-gray-800">Carregando relatório...</h3>
      </div>

      <div *ngIf="relatorio" class="space-y-8 animate-fade-in">
        <!-- Cards de Métricas Principais -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Total Abertas -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-rh-gray-purple flex items-center gap-4">
            <div class="p-3 bg-purple-100 rounded-xl text-rh-purple flex items-center">
              <span class="material-icons">work_outline</span>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Abertas</p>
              <h4 class="text-2xl font-bold text-gray-900">{{ relatorio.total_abertas }}</h4>
            </div>
          </div>

          <!-- Total Aprovadas -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-rh-gray-purple flex items-center gap-4">
            <div class="p-3 bg-green-100 rounded-xl text-green-700 flex items-center">
              <span class="material-icons">check_circle</span>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Aprovadas</p>
              <h4 class="text-2xl font-bold text-gray-900">{{ relatorio.total_aprovadas }}</h4>
            </div>
          </div>

          <!-- Total Congeladas -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-rh-gray-purple flex items-center gap-4">
            <div class="p-3 bg-blue-100 rounded-xl text-blue-700 flex items-center">
              <span class="material-icons">pause_circle</span>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Congeladas</p>
              <h4 class="text-2xl font-bold text-gray-900">{{ relatorio.total_congeladas }}</h4>
            </div>
          </div>

          <!-- Total Negadas -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-rh-gray-purple flex items-center gap-4">
            <div class="p-3 bg-red-100 rounded-xl text-red-700 flex items-center">
              <span class="material-icons">cancel</span>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Negadas</p>
              <h4 class="text-2xl font-bold text-gray-900">{{ relatorio.total_negadas }}</h4>
            </div>
          </div>

          <!-- Total Finalizadas no Mês -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-rh-gray-purple flex items-center gap-4">
            <div class="p-3 bg-indigo-100 rounded-xl text-indigo-700 flex items-center">
              <span class="material-icons">assignment_turned_in</span>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase">Fechadas (Mês)</p>
              <h4 class="text-2xl font-bold text-gray-900">{{ relatorio.total_finalizadas_no_mes }}</h4>
            </div>
          </div>
        </div>

        <!-- Seção de Agrupamentos -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <!-- Agrupamento por Empresa -->
          <div class="bg-white rounded-2xl shadow-sm border border-rh-gray-purple p-6">
            <h3 class="text-lg font-bold text-rh-dark mb-4 flex items-center gap-2">
              <span class="material-icons text-rh-purple text-xl">business</span> Vagas por Empresa
            </h3>
            <div class="space-y-3">
              <div *ngFor="let item of objectKeys(relatorio.agrupado_por_empresa)" class="flex justify-between items-center border-b border-gray-100 pb-2">
                <span class="text-sm text-gray-700">{{ item }}</span>
                <span class="text-sm font-bold bg-purple-50 text-rh-purple px-3 py-1 rounded-full">{{ relatorio.agrupado_por_empresa[item] }}</span>
              </div>
              <div *ngIf="objectKeys(relatorio.agrupado_por_empresa).length === 0" class="text-gray-400 text-sm text-center">Nenhum dado.</div>
            </div>
          </div>

          <!-- Agrupamento por Gestor -->
          <div class="bg-white rounded-2xl shadow-sm border border-rh-gray-purple p-6">
            <h3 class="text-lg font-bold text-rh-dark mb-4 flex items-center gap-2">
              <span class="material-icons text-rh-purple text-xl">person</span> Vagas por Gestor
            </h3>
            <div class="space-y-3">
              <div *ngFor="let item of objectKeys(relatorio.agrupado_por_gestor)" class="flex justify-between items-center border-b border-gray-100 pb-2">
                <span class="text-sm text-gray-700">{{ item }}</span>
                <span class="text-sm font-bold bg-purple-50 text-rh-purple px-3 py-1 rounded-full">{{ relatorio.agrupado_por_gestor[item] }}</span>
              </div>
              <div *ngIf="objectKeys(relatorio.agrupado_por_gestor).length === 0" class="text-gray-400 text-sm text-center">Nenhum dado.</div>
            </div>
          </div>

          <!-- Agrupamento por Senioridade -->
          <div class="bg-white rounded-2xl shadow-sm border border-rh-gray-purple p-6">
            <h3 class="text-lg font-bold text-rh-dark mb-4 flex items-center gap-2">
              <span class="material-icons text-rh-purple text-xl">bar_chart</span> Vagas por Senioridade
            </h3>
            <div class="space-y-3">
              <div *ngFor="let item of objectKeys(relatorio.agrupado_por_senioridade)" class="flex justify-between items-center border-b border-gray-100 pb-2">
                <span class="text-sm text-gray-700">{{ item }}</span>
                <span class="text-sm font-bold bg-blue-50 text-blue-800 px-3 py-1 rounded-full">{{ relatorio.agrupado_por_senioridade[item] }}</span>
              </div>
              <div *ngIf="objectKeys(relatorio.agrupado_por_senioridade).length === 0" class="text-gray-400 text-sm text-center">Nenhum dado.</div>
            </div>
          </div>

          <!-- Agrupamento por Etapa do Funil -->
          <div class="bg-white rounded-2xl shadow-sm border border-rh-gray-purple p-6">
            <h3 class="text-lg font-bold text-rh-dark mb-4 flex items-center gap-2">
              <span class="material-icons text-rh-purple text-xl">filter_list</span> Vagas por Etapa
            </h3>
            <div class="space-y-3">
              <div *ngFor="let item of objectKeys(relatorio.agrupado_por_etapa)" class="flex justify-between items-center border-b border-gray-100 pb-2">
                <span class="text-sm text-gray-700">{{ item }}</span>
                <span class="text-sm font-bold bg-gray-100 text-gray-800 px-3 py-1 rounded-full">{{ relatorio.agrupado_por_etapa[item] }}</span>
              </div>
              <div *ngIf="objectKeys(relatorio.agrupado_por_etapa).length === 0" class="text-gray-400 text-sm text-center">Nenhum dado.</div>
            </div>
          </div>
        </div>

        <!-- Detalhamento por vaga -->
        <div class="bg-white rounded-2xl shadow-sm border border-rh-gray-purple overflow-hidden">
          <div class="p-6 border-b border-gray-100">
            <h3 class="text-lg font-bold text-rh-dark flex items-center gap-2">
              <span class="material-icons text-rh-purple text-xl">table_chart</span> Detalhamento por Vaga
            </h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th class="text-left px-4 py-3">Data</th>
                  <th class="text-left px-4 py-3">Gestor</th>
                  <th class="text-left px-4 py-3">E-mail</th>
                  <th class="text-left px-4 py-3">Vaga</th>
                  <th class="text-left px-4 py-3">Empresa</th>
                  <th class="text-left px-4 py-3">Tipo</th>
                  <th class="text-left px-4 py-3">Status</th>
                  <th class="text-left px-4 py-3">Etapa</th>
                  <th class="text-left px-4 py-3">Fila</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let vaga of relatorio.vagas" class="border-t border-gray-100">
                  <td class="px-4 py-3 whitespace-nowrap">{{ vaga.data_abertura | date:'dd/MM/yyyy' }}</td>
                  <td class="px-4 py-3">{{ vaga.gestor_nome }}</td>
                  <td class="px-4 py-3">{{ vaga.gestor_email || '-' }}</td>
                  <td class="px-4 py-3 font-semibold text-gray-800">{{ vaga.cargo }}</td>
                  <td class="px-4 py-3">{{ vaga.empresa_destinada }}</td>
                  <td class="px-4 py-3 whitespace-nowrap">{{ vaga.tipo }}</td>
                  <td class="px-4 py-3">
                    <span class="text-xs font-bold px-2 py-1 rounded-full"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800': vaga.status_decisao_diretoria === 'Pendente',
                        'bg-green-100 text-green-800': vaga.status_decisao_diretoria === 'Aprovada',
                        'bg-blue-100 text-blue-800': vaga.status_decisao_diretoria === 'Congelada',
                        'bg-red-100 text-red-800': vaga.status_decisao_diretoria === 'Negada'
                      }">
                      {{ vaga.status_decisao_diretoria }}
                    </span>
                    <p *ngIf="vaga.justificativa_negativa" class="text-xs text-red-700 mt-1 max-w-xs break-words">
                      {{ vaga.justificativa_negativa }}
                    </p>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">{{ vaga.etapa_nome }}</td>
                  <td class="px-4 py-3 whitespace-nowrap">{{ vaga.posicao_fila_rh || '-' }}</td>
                </tr>
                <tr *ngIf="relatorio.vagas.length === 0">
                  <td colspan="9" class="px-4 py-8 text-center text-gray-400">Nenhum dado.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-in {
      animation: fadeIn 0.35s ease-out forwards;
    }
  `]
})
export class ReportComponent implements OnInit {
  relatorio: Relatorio | null = null;
  usuarios: UserResponse[] = [];
  empresas: Empresa[] = [];
  exportando: 'pdf' | 'excel' | null = null;
  erroExportacao = '';
  filtros: VagaFiltros = {
    gestor_id: null,
    empresa: '',
    senioridade: '',
    etapa_funil: null,
    status_decisao: '',
    data_inicio: '',
    data_fim: ''
  };
  senioridades = ['Estágio', 'Júnior', 'Pleno', 'Sênior', 'Especialista / Lead'];
  statusOptions = ['Pendente', 'Aprovada', 'Congelada', 'Negada'];
  etapas = [
    { id: 1, nome: 'Fila de Espera' },
    { id: 2, nome: 'Divulgação' },
    { id: 3, nome: 'Triagem' },
    { id: 4, nome: 'Entrevista Inicial' },
    { id: 5, nome: 'Testes Psicológicos' },
    { id: 6, nome: 'Parecer Psicológico' },
    { id: 7, nome: 'Entrevista com Gestor' },
    { id: 8, nome: 'Aguardando Retorno' },
    { id: 9, nome: 'Finalizada' }
  ];

  constructor(
    private vagaService: VagaService,
    private userService: UserService,
    private empresaService: EmpresaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.carregarFiltros();
    this.carregarRelatorio();
  }

  carregarRelatorio(): void {
    this.relatorio = null;
    this.erroExportacao = '';
    this.vagaService.getRelatorio(this.filtros).subscribe({
      next: (data) => this.relatorio = data,
      error: (err) => {
        console.error(err);
        this.erroExportacao = err.error?.detail || 'Erro ao carregar relatório.';
      }
    });
  }

  carregarFiltros(): void {
    this.userService.getUsers().subscribe({
      next: (usuarios) => this.usuarios = usuarios,
      error: (err) => console.error(err)
    });
    this.empresaService.getEmpresas().subscribe({
      next: (empresas) => this.empresas = empresas,
      error: (err) => console.error(err)
    });
  }

  aplicarFiltros(): void {
    this.carregarRelatorio();
  }

  limparFiltros(): void {
    this.filtros = {
      gestor_id: null,
      empresa: '',
      senioridade: '',
      etapa_funil: null,
      status_decisao: '',
      data_inicio: '',
      data_fim: ''
    };
    this.carregarRelatorio();
  }

  exportar(tipo: 'pdf' | 'excel'): void {
    this.exportando = tipo;
    this.erroExportacao = '';
    const request$ = tipo === 'pdf'
      ? this.vagaService.exportRelatorioPdf(this.filtros)
      : this.vagaService.exportRelatorioExcel(this.filtros);

    request$.subscribe({
      next: (blob) => {
        this.exportando = null;
        this.baixarArquivo(blob, this.nomeArquivo(tipo));
      },
      error: (err) => {
        console.error(err);
        this.exportando = null;
        this.erroExportacao = tipo === 'pdf'
          ? 'Não foi possível exportar o PDF. Tente novamente.'
          : 'Não foi possível exportar o Excel. Tente novamente.';
      }
    });
  }

  baixarArquivo(blob: Blob, nomeArquivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  nomeArquivo(tipo: 'pdf' | 'excel'): string {
    const hoje = new Date().toISOString().slice(0, 10);
    return `feedrh-relatorio-vagas-${hoje}.${tipo === 'pdf' ? 'pdf' : 'xlsx'}`;
  }

  get gestores(): UserResponse[] {
    return this.usuarios.filter(usuario => usuario.perfil === 'GESTOR');
  }

  get isRh(): boolean {
    return this.authService.currentUserValue?.perfil === 'RH';
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
