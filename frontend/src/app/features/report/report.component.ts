import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VagaService, Relatorio } from '../../shared/vaga.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-rh-dark">Relatório Consolidado para a Diretoria</h2>
        <p class="text-gray-500 mt-1">Métricas gerais de vagas, finalizações e agrupamentos gerenciais.</p>
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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

  constructor(private vagaService: VagaService) {}

  ngOnInit(): void {
    this.carregarRelatorio();
  }

  carregarRelatorio(): void {
    this.vagaService.getRelatorio().subscribe({
      next: (data) => this.relatorio = data,
      error: (err) => console.error(err)
    });
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
