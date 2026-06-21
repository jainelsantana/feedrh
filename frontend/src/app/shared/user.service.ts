import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { environment } from '../../environments/environment';

export interface UserResponse {
  id: number;
  nome: string;
  email: string;
  empresa: string;
  perfil: 'RH' | 'GESTOR';
  must_change_password?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  ultimo_reset_senha?: string | null;
}

export interface UserCreateResponse extends UserResponse {
  message: string;
  email_enviado?: boolean | null;
}

export interface ResetPasswordResponse {
  message: string;
  email_enviado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const user = this.authService.currentUserValue;
    return new HttpHeaders({
      'X-User-Id': user ? user.id.toString() : '0'
    });
  }

  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createUser(user: Pick<UserResponse, 'nome' | 'email' | 'empresa' | 'perfil'> & { senha: string }): Observable<UserCreateResponse> {
    return this.http.post<UserCreateResponse>(this.apiUrl, user, { headers: this.getHeaders() });
  }

  updateUser(id: number, user: Omit<UserResponse, 'id'>): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}`, user, { headers: this.getHeaders() });
  }

  deleteUser(id: number): Observable<{ detail: string }> {
    return this.http.delete<{ detail: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  resetPassword(id: number): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(`${this.apiUrl}/${id}/reset-password`, {}, { headers: this.getHeaders() });
  }
}
