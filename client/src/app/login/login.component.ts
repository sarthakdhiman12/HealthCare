import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  itemForm!: FormGroup;
  showError: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;
  isLoggedin: boolean = false;
  roleName: string = '';

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      this.isLoggedin = true;
      this.roleName = this.authService.getRole() || '';
    }

    this.itemForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  scrollTo(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onLogin(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.httpService.Login(this.itemForm.value).subscribe({
      next: (response: any) => {
        this.authService.saveToken(response.token);
        this.authService.setRole(response.role);
        this.authService.saveUserId(response.id || response.userId);
        this.authService.saveUserData(response);

        if (response.doctorId) {
          localStorage.setItem('doctorId', response.doctorId);
        }

        this.isLoggedin = true;
        this.roleName = response.role;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Invalid username or password';
      }
    });
  }

  logout(): void {
    this.isLoggedin = false;
    this.roleName = '';
    this.router.navigate(['/login']);
  }
}