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

  formModel: any = {
    username: '',
    password: ''
  };

  showError: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.formModel = this.itemForm.value;

    this.httpService.Login(this.itemForm.value).subscribe({
      next: (response: any) => {
        console.log('Login Response:', response);

        // ✅ USE AuthService methods (triggers BehaviorSubject → navbar updates)
        this.authService.saveToken(response.token);
        this.authService.setRole(response.role);
        this.authService.saveUserId(response.id || response.userId);
        this.authService.saveUserData(response);

        // ✅ Extra IDs (if present)
        if (response.doctorId) {
          localStorage.setItem('doctorId', response.doctorId);
        }

        // ✅ Navigate AFTER everything is saved
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        console.error('Login failed:', error);
        this.showError = true;
        this.errorMessage = 'Invalid username or password';
      }
    });
  }
}