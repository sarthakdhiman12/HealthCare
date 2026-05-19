import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {

    // ✅ Step 1: Check if logged in
    if (!this.authService.getLoginStatus()) {
      console.log('❌ RoleGuard: Not logged in → redirecting to /login');
      this.router.navigate(['/login']);
      return false;
    }

    // ✅ Step 2: Check role
    const expectedRoles: string[] = route.data['roles'] || [];
    const currentRole = this.authService.getRole()?.toUpperCase() || '';

    if (expectedRoles.length === 0 || expectedRoles.includes(currentRole)) {
      return true;
    }

    // ❌ Wrong role → redirect to dashboard
    console.log(`❌ RoleGuard: Role "${currentRole}" not allowed. Expected: ${expectedRoles}`);
    this.router.navigate(['/dashboard']);
    return false;
  }
}