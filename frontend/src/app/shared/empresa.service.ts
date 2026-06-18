import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../core/auth.service';

export interface Empresa {
  id: number;
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private apiUrl = '/api/empresas';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const user = this.authService.currentUserValue;
    return new HttpHeaders({
      'X-User-Id': user ? user.id.toString() : '0'
    });
  }

  getEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createEmpresa(nome: string): Observable<Empresa> {
    return this.http.post<Empresa>(this.apiUrl, { nome }, { headers: this.getHeaders() });
  }

  updateEmpresa(id: number, nome: string): Observable<Empresa> {
    return this.http.patch<Empresa>(`${this.apiUrl}/${id}`, { nome }, { headers: this.getHeaders() });
  }

  deleteEmpresa(id: number): Observable<{ detail: string }> {
    return this.http.delete<{ detail: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
