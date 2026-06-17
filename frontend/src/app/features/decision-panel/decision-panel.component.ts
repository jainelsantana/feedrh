import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VagaService, Vaga } from '../../shared/vaga.service';

@Component({
  selector: 'app-decision-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 class="text-3xl font-bold text-rh-dark">Painel de Decisões do RH</h2>
          <p class="text-gray-500 mt-1">Valide requisições pendentes de alinhamento com a Diretoria.</p>
        </div>
        <button (click)="verRelatorio()" class="bg-gradient-to-r from-rh-purple to-rh-neon text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
          <span class="material-icons">bar_chart</span> Gerar Relatório para Diretoria
        </button>
      </div>

      <div *ngIf="vagasPendentes.length === 0 && vagasCongeladas.length === 0" class="bg-white p-8 rounded-2xl shadow-sm border border-rh-gray-purple text-center">
        <span class="material-icons text-green-500 text-5xl mb-4 font-light font-medium">check_circle_outline</span>
        <h3 class="text-xl font-bold text-gray-800">Tudo em dia!</h3>
        <p class="text-gray-500 mt-1">Não há vagas pendentes de decisão no momento.</p>
      </div>

      <!-- Grid de Vagas Pendentes -->
      <div *ngIf="vagasPendentes.length > 0" class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-bold text-rh-dark flex items-center gap-2">
          <span class="material-icons text-rh-purple">pending_actions</span> Pendentes de decisão
        </h3>
        <span class="text-xs bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-full">{{ vagasPendentes.length }} pendente(s)</span>
      </div>

      <div *ngIf="vagasPendentes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let vaga of vagasPendentes" class="bg-white rounded-2xl shadow-sm border border-rh-gray-purple overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
          <div class="p-6">
            <div class="flex justify-between items-start mb-2">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs bg-yellow-100 text-yellow-800 font-bold px-2 py-1 rounded">PENDENTE</span>
                <span *ngIf="vaga.posicao_fila_rh" class="text-xs bg-rh-purple text-white font-bold px-2 py-1 rounded">
                  Fila RH nº {{ vaga.posicao_fila_rh }}
                </span>
                <span *ngIf="vaga.quantidade_congelamentos > 0" class="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded">
                  {{ getTextoCongelamentos(vaga) }}
                </span>
              </div>
              <span class="text-xs text-gray-400">{{ vaga.data_abertura | date:'dd/MM/yyyy' }}</span>
            </div>
            
            <h3 class="text-xl font-bold text-gray-800 mb-1">{{ vaga.cargo }}</h3>
            <p class="text-sm text-gray-500 flex items-center gap-1 mb-4">
              <span class="material-icons text-xs">business</span> {{ vaga.empresa_destinada }} &bull; {{ vaga.senioridade }}
            </p>

            <div class="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs space-y-2">
              <p class="text-gray-700 break-words"><strong>Resumo dos requisitos:</strong> {{ vaga.resumo_requisitos || 'Não informado' }}</p>
              <p class="text-gray-700 break-words"><strong>Obrigatórios:</strong> {{ vaga.requisitos_obrigatorios || 'Não informado' }}</p>
            </div>

            <div *ngIf="vaga.tipo === 'Substituição'" class="p-3 bg-purple-50 rounded-lg border border-purple-100 text-xs mt-3">
              <p class="text-rh-dark"><strong>Substituição:</strong> {{ vaga.profissional_substituido }}</p>
              <p class="text-gray-600 mt-0.5"><strong>Justificativa:</strong> {{ vaga.justificativa_substituicao }}</p>
            </div>
          </div>

          <!-- Ações de Aprovação -->
          <div class="bg-gray-50 p-4 border-t border-gray-100 flex gap-2">
            <button (click)="decidir(vaga.id, 'Aprovada')" class="flex-1 bg-green-50 hover:bg-green-100 text-green-700 font-bold py-2 px-3 rounded-lg border border-green-200 transition-colors flex items-center justify-center gap-1 text-sm">
              <span class="material-icons text-base">check</span> Aprovar
            </button>
            <button (click)="decidir(vaga.id, 'Congelada')" class="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2 px-3 rounded-lg border border-blue-200 transition-colors flex items-center justify-center gap-1 text-sm">
              <span class="material-icons text-base">pause</span> Congelar
            </button>
            <button (click)="abrirModalNegativa(vaga)" class="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2 px-3 rounded-lg border border-red-200 transition-colors flex items-center justify-center gap-1 text-sm">
              <span class="material-icons text-base">block</span> Negar
            </button>
          </div>
        </div>
      </div>

      <!-- Vagas Congeladas -->
      <div *ngIf="vagasCongeladas.length > 0" class="mt-8 mb-4 flex items-center justify-between">
        <h3 class="text-lg font-bold text-rh-dark flex items-center gap-2">
          <span class="material-icons text-blue-600">pause_circle</span> Congeladas
        </h3>
        <span class="text-xs bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full">{{ vagasCongeladas.length }} congelada(s)</span>
      </div>

      <div *ngIf="vagasCongeladas.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let vaga of vagasCongeladas" class="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
          <div class="p-6">
            <div class="flex justify-between items-start mb-2">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded">CONGELADA</span>
                <span class="text-xs bg-white text-blue-700 border border-blue-200 font-bold px-2 py-1 rounded">
                  {{ getTextoCongelamentos(vaga) }}
                </span>
              </div>
              <span class="text-xs text-gray-400">{{ vaga.data_abertura | date:'dd/MM/yyyy' }}</span>
            </div>

            <h3 class="text-xl font-bold text-gray-800 mb-1">{{ vaga.cargo }}</h3>
            <p class="text-sm text-gray-500 flex items-center gap-1 mb-4">
              <span class="material-icons text-xs">business</span> {{ vaga.empresa_destinada }} &bull; {{ vaga.senioridade }}
            </p>

            <div class="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs space-y-2">
              <p class="text-gray-700 break-words"><strong>Resumo dos requisitos:</strong> {{ vaga.resumo_requisitos || 'Não informado' }}</p>
              <p class="text-gray-700 break-words"><strong>Obrigatórios:</strong> {{ vaga.requisitos_obrigatorios || 'Não informado' }}</p>
            </div>

            <div *ngIf="vaga.tipo === 'Substituição'" class="p-3 bg-purple-50 rounded-lg border border-purple-100 text-xs mt-3">
              <p class="text-rh-dark"><strong>Substituição:</strong> {{ vaga.profissional_substituido }}</p>
              <p class="text-gray-600 mt-0.5"><strong>Justificativa:</strong> {{ vaga.justificativa_substituicao }}</p>
            </div>
          </div>

          <div class="bg-blue-50 p-4 border-t border-blue-100">
            <button (click)="retornarParaDecisao(vaga)" class="w-full bg-white hover:bg-blue-100 text-blue-700 font-bold py-2 px-3 rounded-lg border border-blue-200 transition-colors flex items-center justify-center gap-1 text-sm">
              <span class="material-icons text-base">undo</span> Retornar para decisão
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="vagaParaNegar as vagaNegativa" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-rh-gray-purple">
          <div class="flex items-start gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <span class="material-icons text-red-600">block</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-rh-dark">Justificar negativa</h3>
              <p class="text-sm text-gray-500 mt-1">Vaga: {{ vagaNegativa.cargo }}</p>
            </div>
          </div>

          <label class="block">
            <span class="text-xs font-bold text-gray-500 uppercase">Justificativa obrigatoria</span>
            <textarea [(ngModel)]="justificativaNegativa" rows="5"
              class="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
              placeholder="Informe o motivo da negativa"></textarea>
          </label>
          <p *ngIf="erroJustificativa" class="text-sm text-red-600 font-semibold mt-2">{{ erroJustificativa }}</p>

          <div class="flex flex-col sm:flex-row gap-2 justify-end mt-5">
            <button (click)="fecharModalNegativa()" class="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">
              Cancelar
            </button>
            <button (click)="confirmarNegativa()" class="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700">
              Negar vaga
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DecisionPanelComponent implements OnInit {
  vagasPendentes: Vaga[] = [];
  vagasCongeladas: Vaga[] = [];
  vagaParaNegar: Vaga | null = null;
  justificativaNegativa = '';
  erroJustificativa = '';

  constructor(private vagaService: VagaService, private router: Router) {}

  ngOnInit(): void {
    this.carregarVagasPendentes();
  }

  carregarVagasPendentes(): void {
    this.vagaService.getVagas().subscribe({
      next: (vagas) => {
        this.vagasPendentes = vagas
          .filter(v => v.status_decisao_diretoria === 'Pendente')
          .sort((a, b) => {
            const posicaoA = a.posicao_fila_rh ?? Number.MAX_SAFE_INTEGER;
            const posicaoB = b.posicao_fila_rh ?? Number.MAX_SAFE_INTEGER;
            return posicaoA - posicaoB || a.id - b.id;
          });
        this.vagasCongeladas = vagas
          .filter(v => v.status_decisao_diretoria === 'Congelada')
          .sort((a, b) => b.quantidade_congelamentos - a.quantidade_congelamentos || a.id - b.id);
      },
      error: (err) => console.error(err)
    });
  }

  decidir(vagaId: number, decisao: 'Aprovada' | 'Congelada' | 'Negada'): void {
    this.vagaService.updateDecisaoDiretoria(vagaId, decisao).subscribe({
      next: () => {
        alert(`Vaga atualizada para ${decisao} com sucesso!`);
        this.carregarVagasPendentes();
      },
      error: (err) => alert(err.error?.detail || 'Erro ao salvar decisão da diretoria.')
    });
  }

  abrirModalNegativa(vaga: Vaga): void {
    this.vagaParaNegar = vaga;
    this.justificativaNegativa = '';
    this.erroJustificativa = '';
  }

  fecharModalNegativa(): void {
    this.vagaParaNegar = null;
    this.justificativaNegativa = '';
    this.erroJustificativa = '';
  }

  confirmarNegativa(): void {
    const justificativa = this.justificativaNegativa.trim();
    const vagaParaNegar = this.vagaParaNegar;
    if (!vagaParaNegar) {
      return;
    }
    if (!justificativa) {
      this.erroJustificativa = 'Informe a justificativa para negar a vaga.';
      return;
    }

    this.vagaService.updateDecisaoDiretoria(vagaParaNegar.id, 'Negada', justificativa).subscribe({
      next: () => {
        alert('Vaga negada com justificativa registrada.');
        this.fecharModalNegativa();
        this.carregarVagasPendentes();
      },
      error: (err) => {
        this.erroJustificativa = err.error?.detail || 'Erro ao salvar decisão da diretoria.';
      }
    });
  }

  retornarParaDecisao(vaga: Vaga): void {
    this.vagaService.updateDecisaoDiretoria(vaga.id, 'Pendente').subscribe({
      next: () => {
        alert('Vaga retornada para decisão com sucesso!');
        this.carregarVagasPendentes();
      },
      error: (err) => alert(err.error?.detail || 'Erro ao retornar vaga para decisão.')
    });
  }

  getTextoCongelamentos(vaga: Vaga): string {
    const total = vaga.quantidade_congelamentos || 0;
    return `${total} ${total === 1 ? 'congelamento' : 'congelamentos'}`;
  }

  verRelatorio(): void {
    this.router.navigate(['/rh/relatorios']);
  }
}
