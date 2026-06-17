import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VagaService } from '../../shared/vaga.service';
import { EmpresaService, Empresa } from '../../shared/empresa.service';

export interface VagaFormState {
  cargo: string;
  empresa_destinada: string;
  senioridade: string;
  resumo_requisitos: string;
  requisitos_obrigatorios: string;
  tipo: string;
  profissional_substituido?: string;
  justificativa_substituicao?: string;
}

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <div class="bg-white rounded-2xl shadow-sm border border-rh-gray-purple p-8">
        <div class="flex items-center gap-3 mb-6">
          <span class="material-icons text-rh-purple text-3xl">add_box</span>
          <h2 class="text-3xl font-bold text-rh-dark">Requisitar Nova Vaga</h2>
        </div>

        <form (ngSubmit)="salvarVaga()" #vagaForm="ngForm" class="space-y-6">
          <!-- Cargo -->
          <div>
            <label class="block text-sm font-semibold text-gray-700">Cargo / Título da Posição</label>
            <input type="text" name="cargo" [(ngModel)]="vaga.cargo" required #cargoRef="ngModel"
              placeholder="Ex: Desenvolvedor Angular Pleno"
              [ngClass]="{'border-red-400 focus:ring-red-200': cargoRef.invalid && cargoRef.touched}"
              class="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rh-purple transition-all" />
            <p *ngIf="cargoRef.invalid && cargoRef.touched" class="text-xs text-red-500 mt-1">O cargo é obrigatório.</p>
          </div>

          <!-- Grid Empresa e Senioridade -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700">Empresa Destinada</label>
              <select name="empresa_destinada" [(ngModel)]="vaga.empresa_destinada" required #empresaRef="ngModel"
                [ngClass]="{'border-red-400': empresaRef.invalid && empresaRef.touched}"
                class="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rh-purple bg-white transition-all">
                <option value="">Selecione uma empresa</option>
                <option *ngFor="let empresa of empresas" [value]="empresa.nome">{{ empresa.nome }}</option>
              </select>
              <p *ngIf="empresaRef.invalid && empresaRef.touched" class="text-xs text-red-500 mt-1">A empresa é obrigatória.</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700">Senioridade</label>
              <select name="senioridade" [(ngModel)]="vaga.senioridade" required #seniorityRef="ngModel"
                [ngClass]="{'border-red-400': seniorityRef.invalid && seniorityRef.touched}"
                class="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rh-purple bg-white transition-all">
                <option value="">Selecione a senioridade</option>
                <option value="Estágio">Estágio</option>
                <option value="Júnior">Júnior</option>
                <option value="Pleno">Pleno</option>
                <option value="Sênior">Sênior</option>
                <option value="Especialista / Lead">Especialista / Lead</option>
              </select>
              <p *ngIf="seniorityRef.invalid && seniorityRef.touched" class="text-xs text-red-500 mt-1">A senioridade é obrigatória.</p>
            </div>
          </div>

          <!-- Requisitos da Vaga -->
          <div class="p-6 bg-purple-50/40 rounded-xl border border-purple-100 space-y-4">
            <div class="flex items-start gap-3">
              <span class="material-icons text-rh-purple text-2xl">fact_check</span>
              <div>
                <h3 class="text-lg font-bold text-rh-dark">Requisitos da Vaga</h3>
                <p class="text-sm text-gray-500">Resuma os principais critérios e destaque o que é indispensável para avançar no processo.</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700">Resumo dos Requisitos</label>
              <textarea name="resumo_requisitos" [(ngModel)]="vaga.resumo_requisitos" required #resumoRef="ngModel"
                rows="3" placeholder="Ex: Atuação com produto digital, boa comunicação com áreas de negócio e experiência em projetos ágeis."
                [ngClass]="{'border-red-400 focus:ring-red-200': resumoRef.invalid && resumoRef.touched}"
                class="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rh-purple transition-all"></textarea>
              <p *ngIf="resumoRef.invalid && resumoRef.touched" class="text-xs text-red-500 mt-1">O resumo dos requisitos é obrigatório.</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700">Requisitos Obrigatórios</label>
              <textarea name="requisitos_obrigatorios" [(ngModel)]="vaga.requisitos_obrigatorios" required #requisitosRef="ngModel"
                rows="4" placeholder="Ex: 3+ anos de experiência na função, domínio de Angular, disponibilidade para modelo híbrido."
                [ngClass]="{'border-red-400 focus:ring-red-200': requisitosRef.invalid && requisitosRef.touched}"
                class="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rh-purple transition-all"></textarea>
              <p *ngIf="requisitosRef.invalid && requisitosRef.touched" class="text-xs text-red-500 mt-1">Informe os requisitos obrigatórios da vaga.</p>
            </div>
          </div>

          <!-- Tipo de Vaga -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo de Vaga</label>
            <div class="flex gap-4">
              <label class="flex-1 flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                [ngClass]="{'border-rh-purple bg-purple-50 text-rh-dark': vaga.tipo === 'Nova posição', 'border-gray-200': vaga.tipo !== 'Nova posição'}">
                <span class="flex items-center gap-2">
                  <input type="radio" name="tipo" value="Nova posição" [(ngModel)]="vaga.tipo" class="text-rh-purple focus:ring-rh-purple h-4 w-4" />
                  <span class="text-sm font-medium">Nova Posição</span>
                </span>
                <span class="material-icons text-lg" [ngClass]="{'text-rh-purple': vaga.tipo === 'Nova posição', 'text-gray-400': vaga.tipo !== 'Nova posição'}">star</span>
              </label>

              <label class="flex-1 flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                [ngClass]="{'border-rh-purple bg-purple-50 text-rh-dark': vaga.tipo === 'Substituição', 'border-gray-200': vaga.tipo !== 'Substituição'}">
                <span class="flex items-center gap-2">
                  <input type="radio" name="tipo" value="Substituição" [(ngModel)]="vaga.tipo" class="text-rh-purple focus:ring-rh-purple h-4 w-4" />
                  <span class="text-sm font-medium">Substituição</span>
                </span>
                <span class="material-icons text-lg" [ngClass]="{'text-rh-purple': vaga.tipo === 'Substituição', 'text-gray-400': vaga.tipo !== 'Substituição'}">swap_horiz</span>
              </label>
            </div>
          </div>

          <!-- Seção de Substituição (Reativa) -->
          <div *ngIf="vaga.tipo === 'Substituição'" class="p-6 bg-red-50/50 rounded-xl border border-red-200 space-y-4 animate-fade-in">
            <div>
              <label class="block text-sm font-semibold text-red-950">Profissional Substituído</label>
              <input type="text" name="profissional_substituido" [(ngModel)]="vaga.profissional_substituido"
                [required]="vaga.tipo === 'Substituição'" #substituidoRef="ngModel"
                placeholder="Ex: Roberto Carlos"
                [ngClass]="{'border-red-400': substituidoRef.invalid && substituidoRef.touched}"
                class="mt-1 w-full p-3 rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white transition-all" />
              <p *ngIf="substituidoRef.invalid && substituidoRef.touched" class="text-xs text-red-600 mt-1">O nome do profissional substituído é obrigatório.</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-red-950">Justificativa da Substituição</label>
              <textarea name="justificativa_substituicao" [(ngModel)]="vaga.justificativa_substituicao"
                [required]="vaga.tipo === 'Substituição'" #justificativaRef="ngModel"
                rows="3" placeholder="Por que este profissional está sendo substituído?"
                [ngClass]="{'border-red-400': justificativaRef.invalid && justificativaRef.touched}"
                class="mt-1 w-full p-3 rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white transition-all"></textarea>
              <p *ngIf="justificativaRef.invalid && justificativaRef.touched" class="text-xs text-red-600 mt-1">A justificativa é obrigatória.</p>
            </div>
          </div>

          <!-- Botões -->
          <div class="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" (click)="cancelar()" class="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" [disabled]="vagaForm.invalid" class="flex-1 bg-gradient-to-r from-rh-purple to-rh-neon text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              <span class="material-icons text-sm">send</span> Solicitar Vaga
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.25s ease-out forwards;
    }
  `]
})
export class JobFormComponent implements OnInit {
  empresas: Empresa[] = [];

  vaga: VagaFormState = {
    cargo: '',
    empresa_destinada: '',
    senioridade: '',
    resumo_requisitos: '',
    requisitos_obrigatorios: '',
    tipo: 'Nova posição',
    profissional_substituido: '',
    justificativa_substituicao: ''
  };

  constructor(
    private vagaService: VagaService,
    private empresaService: EmpresaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarEmpresas();
  }

  carregarEmpresas(): void {
    this.empresaService.getEmpresas().subscribe({
      next: (empresas) => this.empresas = empresas,
      error: (err) => console.error(err)
    });
  }

  salvarVaga(): void {
    const payload = { ...this.vaga };
    // Clear substituição fields if type is new position
    if (payload.tipo === 'Nova posição') {
      delete payload.profissional_substituido;
      delete payload.justificativa_substituicao;
    }

    this.vagaService.createVaga(payload).subscribe({
      next: (vagaCriada) => {
        const posicaoFila = vagaCriada.posicao_fila_rh
          ? `\nSua solicitação é a nº ${vagaCriada.posicao_fila_rh} na fila do RH.`
          : '';
        alert(`Vaga solicitada com sucesso!${posicaoFila}`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        alert(err.error?.detail || 'Erro ao criar requisição de vaga.');
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }
}
