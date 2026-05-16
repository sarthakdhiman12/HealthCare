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

    // ✅ LOGIN STATUS (with fallback)
    this.authService.loginStatus$.subscribe((status: boolean) => {
      this.isLoggedin = status;
    });

    // ✅ If BehaviorSubject missed it, check localStorage
    if (!this.isLoggedin) {
      const token = localStorage.getItem('token');
      this.isLoggedin = !!token;
    }

    // ✅ ROLE (with fallback)
    this.authService.role$.subscribe((role: string | null) => {
      this.roleName = role;
    });

    // ✅ If role$ is null, fallback to localStorage/userData
    if (!this.roleName) {
      const userData = this.authService.getUserData();
      this.roleName =
        this.authService.getRole() ||
        userData?.role ||
        localStorage.getItem('role') ||
        null;
    }

    // ✅ UPPERCASE
    if (this.roleName) {
      this.roleName = this.roleName.toUpperCase();
    }

    console.log('Login Status:', this.isLoggedin);
    console.log('Role Name:', this.roleName);
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedin = false;
    this.roleName = null;
    this.router.navigate(['/login']);
  }
}