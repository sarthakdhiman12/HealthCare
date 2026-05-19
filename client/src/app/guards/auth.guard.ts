import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {

    // ✅ Check if user is logged in
    if (this.authService.getLoginStatus()) {
      return true;
    }

    // ❌ Not logged in → redirect to login
    console.log('❌ AuthGuard: Not logged in → redirecting to /login');
    this.router.navigate(['/login']);
    return false;
  }
}