import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../core/auth.service';

export interface UserResponse {
  id: number;
  nome: string;
  email: string;
  empresa: string;
  perfil: 'RH' | 'GESTOR';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8000/users';

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

  createUser(user: Omit<UserResponse, 'id'> & { senha: string }): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUrl, user, { headers: this.getHeaders() });
  }

  updateUser(id: number, user: Omit<UserResponse, 'id'>): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}`, user, { headers: this.getHeaders() });
  }

  deleteUser(id: number): Observable<{ detail: string }> {
    return this.http.delete<{ detail: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
