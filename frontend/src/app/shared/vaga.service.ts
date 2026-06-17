import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../core/auth.service';

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
  status_decisao_diretoria: string;
  quantidade_congelamentos: number;
  etapa_funil: number;
  data_finalizacao?: string;
  posicao_fila_rh?: number | null;
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
}

@Injectable({
  providedIn: 'root'
})
export class VagaService {
  private apiUrl = 'http://localhost:8000/vagas';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const user = this.authService.currentUserValue;
    return new HttpHeaders({
      'X-User-Id': user ? user.id.toString() : '0'
    });
  }

  getVagas(): Observable<Vaga[]> {
    return this.http.get<Vaga[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createVaga(vaga: Omit<Vaga, 'id' | 'data_abertura' | 'solicitante_id' | 'status_decisao_diretoria' | 'quantidade_congelamentos' | 'etapa_funil' | 'posicao_fila_rh'>): Observable<Vaga> {
    return this.http.post<Vaga>(this.apiUrl, vaga, { headers: this.getHeaders() });
  }

  updateDecisaoDiretoria(id: number, status: string): Observable<Vaga> {
    return this.http.patch<Vaga>(`${this.apiUrl}/${id}/decisao-diretoria`, { status }, { headers: this.getHeaders() });
  }

  updateEtapaFunil(id: number, etapa: number): Observable<Vaga> {
    return this.http.patch<Vaga>(`${this.apiUrl}/${id}/etapa-funil`, { etapa }, { headers: this.getHeaders() });
  }

  getRelatorio(): Observable<Relatorio> {
    return this.http.get<Relatorio>(`${this.apiUrl}/relatorio`, { headers: this.getHeaders() });
  }
}
