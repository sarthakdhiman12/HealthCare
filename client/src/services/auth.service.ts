import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginStatusSubject = new BehaviorSubject<boolean>(this.getLoginStatus());
  loginStatus$ = this.loginStatusSubject.asObservable();

  private roleSubject = new BehaviorSubject<string | null>(this.getRole());
  role$ = this.roleSubject.asObservable();

  constructor() { }

  setRole(role: any): void {
    if (role !== null && role !== undefined && role !== '') {
      const roleValue = String(role).toUpperCase();
      localStorage.setItem('roleName', roleValue);

      // notify app component immediately
      this.roleSubject.next(roleValue);
    }
  }

  getRole(): string | null {
    return localStorage.getItem('roleName');
  }

  saveToken(token: any): void {
    if (token !== null && token !== undefined && token !== '') {
      localStorage.setItem('token', String(token));
      localStorage.setItem('isLoggedin', 'true');

      // notify app component immediately
      this.loginStatusSubject.next(true);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  saveUserId(userId: any): void {
    if (userId !== null && userId !== undefined && userId !== '') {
      localStorage.setItem('userId', String(userId));
    }
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  saveUserData(user: any): void {
    if (user !== null && user !== undefined) {
      localStorage.setItem('userData', JSON.stringify(user));
    }
  }

  getUserData(): any {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  getLoginStatus(): boolean {
    return localStorage.getItem('isLoggedin') === 'true' || !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedin');
    localStorage.removeItem('roleName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userNo');
    localStorage.removeItem('userData');

    // notify app component immediately
    this.loginStatusSubject.next(false);
    this.roleSubject.next(null);
  }
}