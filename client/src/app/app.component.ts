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

    // ✅ LOGIN STATUS
    this.authService.loginStatus$.subscribe((status: boolean) => {
      this.isLoggedin = status;
    });

    if (!this.isLoggedin) {
      const token = localStorage.getItem('token');
      this.isLoggedin = !!token;
    }

    // ✅ ROLE
    this.authService.role$.subscribe((role: string | null) => {
      this.roleName = role;
    });

    if (!this.roleName) {
      const userData = this.authService.getUserData();
      this.roleName =
        this.authService.getRole() ||
        userData?.role ||
        localStorage.getItem('role') ||
        null;
    }

    if (this.roleName) {
      this.roleName = this.roleName.toUpperCase();
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedin = false;
    this.roleName = null;
    this.router.navigate(['/login']);
  }
}