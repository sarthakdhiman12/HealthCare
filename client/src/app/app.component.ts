import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'HAM System';

  isLoggedin: boolean = false;
  roleName: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {

    // ✅ LOGIN STATUS (real-time + refresh fix)
    this.authService.loginStatus$.subscribe((status: boolean) => {
      this.isLoggedin = status || !!localStorage.getItem('token');

      // ✅ REDIRECT if already logged in
      if (this.isLoggedin) {
        this.router.navigate(['/dashboard']);
      }
    });

    // ✅ fallback on refresh
    if (!this.isLoggedin) {
      this.isLoggedin = !!localStorage.getItem('token');

      if (this.isLoggedin) {
        this.router.navigate(['/dashboard']);
      }
    }

    // ✅ ROLE
    this.authService.role$.subscribe((role: string | null) => {
      this.roleName = role;
    });

    // ✅ ROLE fallback
    if (!this.roleName) {
      const userData = this.authService.getUserData();

      this.roleName =
        this.authService.getRole() ||
        userData?.role ||
        localStorage.getItem('role') ||
        null;
    }

    // ✅ uppercase role
    if (this.roleName) {
      this.roleName = this.roleName.toUpperCase();
    }
  }

  // ✅ LOGOUT
  logout(): void {
    this.authService.logout();

    this.isLoggedin = false;
    this.roleName = null;

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');

    this.router.navigate(['/login']);
  }
}