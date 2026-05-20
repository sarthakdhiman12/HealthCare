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

  // ✅ CAPTCHA
  captchaNum1: number = 0;
  captchaNum2: number = 0;
  captchaAnswer: any = '';
  captchaError: string = '';

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

    this.generateCaptcha();
  }

  generateCaptcha(): void {
    this.captchaNum1 = Math.floor(Math.random() * 10) + 1;
    this.captchaNum2 = Math.floor(Math.random() * 10) + 1;
    this.captchaAnswer = '';
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
    this.itemForm.markAllAsTouched();

    const correctAnswer = this.captchaNum1 + this.captchaNum2;
    let captchaValid = true;

    if (this.captchaAnswer === '' || this.captchaAnswer === null || this.captchaAnswer === undefined) {
      this.captchaError = 'Please solve the captcha';
      captchaValid = false;
    } else if (Number(this.captchaAnswer) !== correctAnswer) {
      this.generateCaptcha();
      this.captchaError = 'Wrong captcha! Try again.'; // ✅ SET AFTER generateCaptcha
      captchaValid = false;
    } else {
      this.captchaError = '';
    }

    // ✅ Stop if form invalid OR captcha wrong
    if (this.itemForm.invalid || !captchaValid) {
      return;
    }

    // ✅ Both valid → proceed with login
    this.captchaError = '';
    this.showError = false;

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
        this.generateCaptcha();
        this.captchaError = ''; // ✅ Clear captcha error on login fail (new captcha shown)
      }
    });
  }

  logout(): void {
    this.isLoggedin = false;
    this.roleName = '';
    this.router.navigate(['/login']);
  }
}