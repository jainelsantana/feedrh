import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { environment } from '../../environments/environment';

export interface Vaga {
  id: number;
  cargo: string;
  data_abertura: string;
  empresa_destinada: string;
  senioridade: string;
  resumo_requisitos?: string;
  requisitos_obrigatorios?: string;
  tipo: string;
  profissional_substituido?: string;
  justificativa_substituicao?: string;
  solicitante_id: number;
  solicitante_nome?: string;
  solicitante_email?: string;
  solicitante_empresa?: string;
  status_decisao_diretoria: string;
  justificativa_negativa?: string;
  quantidade_congelamentos: number;
  etapa_funil: number;
  data_finalizacao?: string;
  posicao_fila_rh?: number | null;
  historico?: VagaHistorico[];
}

export interface VagaHistorico {
  id: number;
  data_registro: string;
  usuario_id: number;
  usuario_nome: string;
  acao: string;
  status_anterior?: string | null;
  status_novo?: string | null;
  justificativa?: string | null;
}

export interface VagaFiltros {
  gestor_id?: number | null;
  empresa?: string;
  senioridade?: string;
  etapa_funil?: number | null;
  status_decisao?: string;
  data_inicio?: string;
  data_fim?: string;
}

export interface RelatorioVaga {
  id: number;
  cargo: string;
  gestor_id: number;
  gestor_nome: string;
  gestor_email?: string | null;
  gestor_empresa?: string | null;
  data_abertura: string;
  empresa_destinada: string;
  senioridade: string;
  tipo: string;
  status_decisao_diretoria: string;
  etapa_funil: number;
  etapa_nome: string;
  justificativa_negativa?: string | null;
  quantidade_congelamentos: number;
  posicao_fila_rh?: number | null;
  data_finalizacao?: string | null;
  resumo_requisitos?: string | null;
  requisitos_obrigatorios?: string | null;
  profissional_substituido?: string | null;
  justificativa_substituicao?: string | null;
  historico?: VagaHistorico[];
}

export interface Relatorio {
  total_abertas: number;
  total_aprovadas: number;
  total_congeladas: number;
  total_negadas: number;
  total_finalizadas_no_mes: number;
  agrupado_por_empresa: { [key: string]: number };
  agrupado_por_senioridade: { [key: string]: number };
  agrupado_por_etapa: { [key: string]: number };
  agrupado_por_gestor: { [key: string]: number };
  vagas: RelatorioVaga[];
}

@Injectable({
  providedIn: 'root'
})
export class VagaService {
  private apiUrl = `${environment.apiUrl}/vagas`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const user = this.authService.currentUserValue;
    return new HttpHeaders({
      'X-User-Id': user ? user.id.toString() : '0'
    });
  }

  private getParams(filtros?: VagaFiltros): HttpParams {
    let params = new HttpParams();
    if (!filtros) {
      return params;
    }
    if (filtros.gestor_id) {
      params = params.set('gestor_id', filtros.gestor_id.toString());
    }
    if (filtros.empresa) {
      params = params.set('empresa', filtros.empresa);
    }
    if (filtros.senioridade) {
      params = params.set('senioridade', filtros.senioridade);
    }
    if (filtros.etapa_funil) {
      params = params.set('etapa_funil', filtros.etapa_funil.toString());
    }
    if (filtros.status_decisao) {
      params = params.set('status_decisao', filtros.status_decisao);
    }
    if (filtros.data_inicio) {
      params = params.set('data_inicio', filtros.data_inicio);
    }
    if (filtros.data_fim) {
      params = params.set('data_fim', filtros.data_fim);
    }
    return params;
  }

  getVagas(filtros?: VagaFiltros): Observable<Vaga[]> {
    return this.http.get<Vaga[]>(this.apiUrl, {
      headers: this.getHeaders(),
      params: this.getParams(filtros)
    });
  }

  createVaga(vaga: Omit<Vaga, 'id' | 'data_abertura' | 'solicitante_id' | 'solicitante_nome' | 'solicitante_email' | 'status_decisao_diretoria' | 'justificativa_negativa' | 'quantidade_congelamentos' | 'etapa_funil' | 'data_finalizacao' | 'posicao_fila_rh' | 'historico'>): Observable<Vaga> {
    return this.http.post<Vaga>(this.apiUrl, vaga, { headers: this.getHeaders() });
  }

  updateDecisaoDiretoria(id: number, status: string, justificativa_negativa?: string): Observable<Vaga> {
    return this.http.patch<Vaga>(
      `${this.apiUrl}/${id}/decisao-diretoria`,
      { status, justificativa_negativa },
      { headers: this.getHeaders() }
    );
  }

  updateEtapaFunil(id: number, etapa: number): Observable<Vaga> {
    return this.http.patch<Vaga>(`${this.apiUrl}/${id}/etapa-funil`, { etapa }, { headers: this.getHeaders() });
  }

  getRelatorio(filtros?: VagaFiltros): Observable<Relatorio> {
    return this.http.get<Relatorio>(`${this.apiUrl}/relatorio`, {
      headers: this.getHeaders(),
      params: this.getParams(filtros)
    });
  }

  exportRelatorioPdf(filtros?: VagaFiltros): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/relatorio/pdf`, {
      headers: this.getHeaders(),
      params: this.getParams(filtros),
      responseType: 'blob'
    });
  }

  exportRelatorioExcel(filtros?: VagaFiltros): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/relatorio/excel`, {
      headers: this.getHeaders(),
      params: this.getParams(filtros),
      responseType: 'blob'
    });
  }
}
