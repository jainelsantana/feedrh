import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VagaService, Vaga } from '../../shared/vaga.service';
import { AuthService } from '../../core/auth.service';

interface GestorFiltro {
  id: number;
  nome: string;
}

interface EtapaPendente {
  vaga: Vaga;
  novaEtapa: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">

      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 class="text-3xl font-bold text-rh-dark">Minhas Vagas</h2>
          <p class="text-gray-500 mt-1">
            {{ userPerfil === 'RH' ? 'Visão completa de todas as requisições de vagas.' : 'Acompanhe o status e a posição das suas solicitações.' }}
          </p>
        </div>
        <div class="flex items-center gap-2 bg-white border border-rh-gray-purple px-4 py-2 rounded-full shadow-sm">
          <span class="material-icons text-rh-purple text-base">account_circle</span>
          <span class="text-sm font-semibold text-gray-700">{{ usuarioNome }}</span>
          <span class="text-xs bg-rh-purple text-white font-bold px-2 py-0.5 rounded-full">{{ userPerfil }}</span>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white border border-rh-gray-purple rounded-2xl shadow-sm p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <label *ngIf="userPerfil === 'RH'" class="flex flex-col gap-1">
            <span class="text-xs font-bold text-gray-500 uppercase">Gestor</span>
            <select [(ngModel)]="filtroGestorId" (ngModelChange)="aplicarFiltros()"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rh-purple/30">
              <option [ngValue]="null">Todos</option>
              <option *ngFor="let gestor of gestoresFiltro" [ngValue]="gestor.id">{{ gestor.nome }}</option>
            </select>
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-xs font-bold text-gray-500 uppercase">Data inicial</span>
            <input type="date" [(ngModel)]="filtroDataInicio" (ngModelChange)="aplicarFiltros()"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rh-purple/30">
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-xs font-bold text-gray-500 uppercase">Data final</span>
            <input type="date" [(ngModel)]="filtroDataFim" (ngModelChange)="aplicarFiltros()"
              class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rh-purple/30">
          </label>

          <button (click)="limparFiltros()"
            class="border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <span class="material-icons text-base">filter_alt_off</span>
            Limpar
          </button>
        </div>
      </div>

      <!-- Sem vagas -->
      <div *ngIf="vagas.length === 0" class="bg-white p-12 rounded-2xl shadow-sm border border-rh-gray-purple text-center">
        <span class="material-icons text-gray-300 text-6xl mb-4">work_off</span>
        <h3 class="text-xl font-bold text-gray-700">Nenhuma vaga encontrada</h3>
        <p class="text-gray-400 mt-1">Você ainda não possui requisições de vagas em aberto.</p>
      </div>

      <!-- Cards de Vagas -->
      <div class="space-y-6">
        <div *ngFor="let vaga of vagas" class="bg-white rounded-2xl shadow-sm border border-rh-gray-purple overflow-hidden hover:shadow-md transition-all duration-300">

          <!-- Cabeçalho do card -->
          <div class="p-6 border-b border-gray-100">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <div class="flex flex-col">
                    <div class="flex flex-wrap items-center gap-2 mb-1">
                      <p class="text-xs font-bold text-rh-purple tracking-wider uppercase">Protocolo #{{ vaga.id | number:'3.0-0' }}</p>
                      <p *ngIf="vaga.posicao_fila_rh" class="text-xs font-bold text-white bg-rh-purple px-2 py-0.5 rounded-full">
                        Fila RH nº {{ vaga.posicao_fila_rh }}
                      </p>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900">{{ vaga.cargo }}</h3>
                  </div>

                  <!-- Badge status diretoria -->
                  <span [ngClass]="{
                    'bg-yellow-100 text-yellow-800 border-yellow-200': vaga.status_decisao_diretoria === 'Pendente',
                    'bg-green-100 text-green-800 border-green-200': vaga.status_decisao_diretoria === 'Aprovada',
                    'bg-blue-100 text-blue-800 border-blue-200': vaga.status_decisao_diretoria === 'Congelada',
                    'bg-red-100 text-red-800 border-red-200': vaga.status_decisao_diretoria === 'Negada'
                  }" class="text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1">
                    <span class="material-icons text-xs">
                      {{ vaga.status_decisao_diretoria === 'Aprovada' ? 'check_circle' :
                         vaga.status_decisao_diretoria === 'Congelada' ? 'pause_circle' :
                         vaga.status_decisao_diretoria === 'Negada' ? 'cancel' : 'schedule' }}
                    </span>
                    {{ vaga.status_decisao_diretoria }}
                  </span>
                  <span *ngIf="userPerfil === 'RH' && vaga.quantidade_congelamentos > 0" class="text-xs font-bold px-3 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                    <span class="material-icons text-xs">ac_unit</span>
                    {{ vaga.quantidade_congelamentos }} {{ vaga.quantidade_congelamentos === 1 ? 'congelamento' : 'congelamentos' }}
                  </span>
                </div>

                <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                  <span class="flex items-center gap-1"><span class="material-icons text-xs">business</span>{{ vaga.empresa_destinada }}</span>
                  <span class="flex items-center gap-1"><span class="material-icons text-xs">trending_up</span>{{ vaga.senioridade }}</span>
                  <span class="flex items-center gap-1"><span class="material-icons text-xs">assignment</span>{{ vaga.tipo }}</span>
                  <span class="flex items-center gap-1"><span class="material-icons text-xs">calendar_today</span>{{ vaga.data_abertura | date:'dd/MM/yyyy' }}</span>
                  <span *ngIf="userPerfil === 'RH'" class="flex items-center gap-1"><span class="material-icons text-xs">person</span>{{ vaga.solicitante_nome || ('Gestor #' + vaga.solicitante_id) }}</span>
                </div>
              </div>

              <!-- Controles do RH para avançar etapa -->
              <div *ngIf="userPerfil === 'RH'" class="flex items-center gap-2 shrink-0">
                <button (click)="alterarEtapa(vaga, -1)" [disabled]="vaga.etapa_funil <= 1"
                  class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors">
                  <span class="material-icons text-sm">navigate_before</span>
                </button>
                <span class="text-sm font-bold text-gray-700 w-20 text-center">{{ vaga.etapa_funil }} / 9</span>
                <button (click)="alterarEtapa(vaga, 1)" [disabled]="vaga.etapa_funil >= 9"
                  class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors">
                  <span class="material-icons text-sm">navigate_next</span>
                </button>
              </div>
            </div>
          </div>

          <!-- SEÇÃO DE POSIÇÃO NA FILA (Visão Gestor) -->
          <div *ngIf="userPerfil === 'GESTOR'" class="px-6 py-5 bg-purple-50/40 border-b border-purple-100">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-bold text-rh-dark flex items-center gap-2">
                <span class="material-icons text-rh-purple text-base">timeline</span>
                Posição da sua solicitação no processo
              </h4>
              <div class="text-right">
                <p class="text-xs text-gray-400">Etapa atual</p>
                <p class="text-sm font-bold text-rh-purple">{{ etapas[vaga.etapa_funil - 1] }}</p>
              </div>
            </div>

            <!-- Timeline das 9 etapas -->
            <div class="flex items-start gap-0 overflow-x-auto pb-2">
              <div *ngFor="let etapa of etapas; let i = index"
                class="flex flex-col items-center min-w-[80px] flex-1">

                <!-- Linha conectora + círculo -->
                <div class="flex items-center w-full">
                  <!-- Linha esquerda -->
                  <div class="flex-1 h-0.5 transition-colors duration-500"
                    [ngClass]="i === 0 ? 'bg-transparent' : (i < vaga.etapa_funil ? 'bg-rh-purple' : 'bg-gray-200')"></div>

                  <!-- Círculo da etapa -->
                  <div class="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0 z-10"
                    [ngClass]="{
                      'border-rh-purple bg-rh-purple text-white shadow-lg shadow-purple-200 scale-110': i + 1 === vaga.etapa_funil,
                      'border-rh-purple bg-white text-rh-purple': i + 1 < vaga.etapa_funil,
                      'border-gray-300 bg-white text-gray-400': i + 1 > vaga.etapa_funil
                    }">
                    <span *ngIf="i + 1 < vaga.etapa_funil" class="material-icons text-sm">check</span>
                    <span *ngIf="i + 1 === vaga.etapa_funil" class="text-xs font-bold">{{ i + 1 }}</span>
                    <span *ngIf="i + 1 > vaga.etapa_funil" class="text-xs text-gray-400">{{ i + 1 }}</span>
                  </div>

                  <!-- Linha direita -->
                  <div class="flex-1 h-0.5 transition-colors duration-500"
                    [ngClass]="i + 1 === etapas.length ? 'bg-transparent' : (i + 1 < vaga.etapa_funil ? 'bg-rh-purple' : 'bg-gray-200')"></div>
                </div>

                <!-- Label da etapa -->
                <p class="text-center text-[9px] mt-1.5 leading-tight max-w-[72px] font-medium transition-colors"
                  [ngClass]="{
                    'text-rh-purple font-bold': i + 1 === vaga.etapa_funil,
                    'text-gray-600': i + 1 < vaga.etapa_funil,
                    'text-gray-400': i + 1 > vaga.etapa_funil
                  }">
                  {{ etapasAbrev[i] }}
                </p>
              </div>
            </div>

            <!-- Legenda de posição -->
            <div class="mt-4 flex flex-col sm:flex-row gap-3">
              <div *ngIf="vaga.posicao_fila_rh" class="flex-1 bg-white border-2 border-rh-purple rounded-xl p-3 flex items-center gap-3">
                <div class="w-10 h-10 bg-rh-purple rounded-full flex items-center justify-center shrink-0">
                  <span class="material-icons text-white text-base">format_list_numbered</span>
                </div>
                <div>
                  <p class="text-xs text-gray-500 font-medium">Fila do RH</p>
                  <p class="text-sm font-bold text-rh-dark">Sua solicitação é a nº {{ vaga.posicao_fila_rh }}</p>
                </div>
              </div>

              <!-- Etapa atual destacada -->
              <div class="flex-1 bg-white border-2 border-rh-purple rounded-xl p-3 flex items-center gap-3">
                <div class="w-10 h-10 bg-rh-purple rounded-full flex items-center justify-center shrink-0">
                  <span class="material-icons text-white text-base">{{ getIconeEtapa(vaga.etapa_funil) }}</span>
                </div>
                <div>
                  <p class="text-xs text-gray-500 font-medium">Etapa {{ vaga.etapa_funil }} de 9</p>
                  <p class="text-sm font-bold text-rh-dark">{{ etapas[vaga.etapa_funil - 1] }}</p>
                </div>
              </div>

              <!-- Próxima etapa (se não finalizada) -->
              <div *ngIf="vaga.etapa_funil < 9" class="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <span class="material-icons text-gray-400 text-base">arrow_forward</span>
                </div>
                <div>
                  <p class="text-xs text-gray-400 font-medium">Próxima etapa</p>
                  <p class="text-sm font-semibold text-gray-600">{{ etapas[vaga.etapa_funil] }}</p>
                </div>
              </div>

              <!-- Se finalizada -->
              <div *ngIf="vaga.etapa_funil === 9" class="flex-1 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                  <span class="material-icons text-white text-base">celebration</span>
                </div>
                <div>
                  <p class="text-xs text-green-600 font-medium">Processo concluído!</p>
                  <p class="text-sm font-bold text-green-800">Vaga Finalizada</p>
                </div>
              </div>
            </div>
          </div>

          <!-- SEÇÃO DO FUNIL (Visão RH - barra de progresso compacta) -->
          <div *ngIf="userPerfil === 'RH'" class="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div class="flex justify-between text-[9px] md:text-[10px] text-gray-400 font-semibold mb-2 overflow-x-auto">
              <span *ngFor="let etapa of etapasAbrev; let i = index"
                [ngClass]="{'text-rh-purple font-bold': vaga.etapa_funil === i + 1}">
                {{ etapa }}
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div class="bg-gradient-to-r from-rh-purple to-rh-neon h-2.5 rounded-full transition-all duration-700"
                [style.width]="(vaga.etapa_funil / 9 * 100) + '%'">
              </div>
            </div>
            <p class="text-xs text-rh-purple font-bold mt-2">
              {{ (vaga.etapa_funil / 9 * 100) | number:'1.0-0' }}% — {{ etapas[vaga.etapa_funil - 1] }}
            </p>
          </div>

          <!-- Requisitos da vaga -->
          <div class="px-6 py-4 bg-white border-b border-gray-100">
            <h4 class="text-sm font-bold text-rh-dark flex items-center gap-2 mb-3">
              <span class="material-icons text-rh-purple text-base">fact_check</span>
              Requisitos da vaga
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase mb-1">Resumo</p>
                <p class="text-gray-700 leading-relaxed break-words">{{ vaga.resumo_requisitos || 'Não informado' }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase mb-1">Obrigatórios</p>
                <p class="text-gray-700 leading-relaxed break-words">{{ vaga.requisitos_obrigatorios || 'Não informado' }}</p>
              </div>
            </div>
          </div>

          <!-- Info de substituição -->
          <div *ngIf="vaga.tipo === 'Substituição'" class="px-6 py-3 bg-orange-50/50 border-b border-orange-100 text-sm flex flex-col sm:flex-row gap-2">
            <span class="text-orange-700"><span class="font-semibold">Substituindo:</span> {{ vaga.profissional_substituido }}</span>
            <span class="hidden sm:block text-orange-300">•</span>
            <span class="text-gray-500"><span class="font-semibold">Motivo:</span> {{ vaga.justificativa_substituicao }}</span>
          </div>

          <div *ngIf="vaga.justificativa_negativa" class="px-6 py-4 bg-red-50/70 border-b border-red-100">
            <h4 class="text-sm font-bold text-red-800 flex items-center gap-2 mb-2">
              <span class="material-icons text-red-600 text-base">gpp_bad</span>
              Justificativa da negativa
            </h4>
            <p class="text-sm text-red-900 leading-relaxed break-words">{{ vaga.justificativa_negativa }}</p>
          </div>

          <div *ngIf="vaga.historico?.length" class="px-6 py-4 bg-gray-50">
            <h4 class="text-sm font-bold text-rh-dark flex items-center gap-2 mb-3">
              <span class="material-icons text-rh-purple text-base">history</span>
              Histórico da vaga
            </h4>
            <div class="space-y-2">
              <div *ngFor="let item of (vaga.historico || [])" class="bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span class="font-bold text-gray-700">{{ item.acao }}: {{ item.status_anterior || 'Novo' }} → {{ item.status_novo }}</span>
                  <span class="text-gray-400">{{ item.data_registro | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <p class="text-gray-500 mt-1">Responsável: {{ item.usuario_nome }}</p>
                <p *ngIf="item.justificativa" class="text-red-800 mt-1 break-words"><strong>Justificativa:</strong> {{ item.justificativa }}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div *ngIf="etapaPendente as etapaConfirmacao" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-rh-gray-purple">
          <div class="flex items-start gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <span class="material-icons text-rh-purple">published_with_changes</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-rh-dark">Confirmar avanço de etapa</h3>
              <p class="text-sm text-gray-500 mt-1">
                Avançar "{{ etapaConfirmacao.vaga.cargo }}" para "{{ etapas[etapaConfirmacao.novaEtapa - 1] }}"?
              </p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-2 justify-end">
            <button (click)="cancelarAvancoEtapa()" class="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">
              Cancelar
            </button>
            <button (click)="confirmarAvancoEtapa()" class="px-4 py-2 rounded-lg bg-rh-purple text-white font-bold hover:bg-purple-700">
              Confirmar avanço
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  vagas: Vaga[] = [];
  vagasOriginais: Vaga[] = [];
  gestoresFiltro: GestorFiltro[] = [];
  filtroGestorId: number | null = null;
  filtroDataInicio = '';
  filtroDataFim = '';
  etapaPendente: EtapaPendente | null = null;
  userPerfil: 'RH' | 'GESTOR' = 'GESTOR';
  usuarioNome = '';

  etapas = [
    'Fila de Espera',
    'Divulgação',
    'Triagem',
    'Entrevista Inicial',
    'Testes Psicológicos',
    'Parecer Psicológico',
    'Entrevista com Gestor',
    'Aguardando Retorno',
    'Finalizada'
  ];

  etapasAbrev = [
    'Fila', 'Divulgação', 'Triagem', 'Entrev.', 'Testes',
    'Parecer', 'Ent. Gestor', 'Retorno', 'Finalizada'
  ];

  constructor(private vagaService: VagaService, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.userPerfil = user?.perfil ?? 'GESTOR';
    this.usuarioNome = user?.nome ?? '';
    this.carregarVagas();
  }

  carregarVagas(): void {
    this.vagaService.getVagas().subscribe({
      next: (data) => {
        this.vagasOriginais = data;
        this.atualizarGestoresFiltro();
        this.aplicarFiltros();
      },
      error: (err) => console.error(err)
    });
  }

  atualizarGestoresFiltro(): void {
    const gestores = new Map<number, string>();
    for (const vaga of this.vagasOriginais) {
      gestores.set(vaga.solicitante_id, vaga.solicitante_nome || `Gestor #${vaga.solicitante_id}`);
    }
    this.gestoresFiltro = Array.from(gestores, ([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  aplicarFiltros(): void {
    this.vagas = this.vagasOriginais.filter((vaga) => {
      const dataAbertura = vaga.data_abertura.slice(0, 10);
      const gestorOk = this.userPerfil !== 'RH' || !this.filtroGestorId || vaga.solicitante_id === this.filtroGestorId;
      const inicioOk = !this.filtroDataInicio || dataAbertura >= this.filtroDataInicio;
      const fimOk = !this.filtroDataFim || dataAbertura <= this.filtroDataFim;
      return gestorOk && inicioOk && fimOk;
    });
  }

  limparFiltros(): void {
    this.filtroGestorId = null;
    this.filtroDataInicio = '';
    this.filtroDataFim = '';
    this.aplicarFiltros();
  }

  alterarEtapa(vaga: Vaga, delta: number): void {
    const novaEtapa = vaga.etapa_funil + delta;
    if (novaEtapa >= 1 && novaEtapa <= 9) {
      if (delta > 0) {
        this.etapaPendente = { vaga, novaEtapa };
        return;
      }
      this.salvarEtapa(vaga, novaEtapa);
    }
  }

  confirmarAvancoEtapa(): void {
    const etapaPendente = this.etapaPendente;
    if (!etapaPendente) {
      return;
    }
    this.salvarEtapa(etapaPendente.vaga, etapaPendente.novaEtapa);
    this.etapaPendente = null;
  }

  cancelarAvancoEtapa(): void {
    this.etapaPendente = null;
  }

  private salvarEtapa(vaga: Vaga, novaEtapa: number): void {
    this.vagaService.updateEtapaFunil(vaga.id, novaEtapa).subscribe({
      next: (updated) => {
        Object.assign(vaga, updated);
        const index = this.vagasOriginais.findIndex(item => item.id === vaga.id);
        if (index >= 0) {
          this.vagasOriginais[index] = vaga;
        }
      },
      error: (err) => alert(err.error?.detail || 'Erro ao alterar etapa.')
    });
  }

  getIconeEtapa(etapa: number): string {
    const icones: Record<number, string> = {
      1: 'queue',
      2: 'campaign',
      3: 'manage_search',
      4: 'record_voice_over',
      5: 'psychology',
      6: 'rate_review',
      7: 'groups',
      8: 'hourglass_empty',
      9: 'check_circle'
    };
    return icones[etapa] ?? 'circle';
  }
}
