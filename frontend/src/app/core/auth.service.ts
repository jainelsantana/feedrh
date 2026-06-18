import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  nome: string;
  email: string;
  empresa: string;
  perfil: 'RH' | 'GESTOR';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const saved = localStorage.getItem('feedrh_user');
    if (saved) {
      this.currentUserSubject.next(JSON.parse(saved));
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public updateCurrentUser(user: User): void {
    localStorage.setItem('feedrh_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  public isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  public login(email: string, senha: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/login`, { email, senha }).pipe(
      tap(user => {
        localStorage.setItem('feedrh_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  public logout(): void {
    localStorage.removeItem('feedrh_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
