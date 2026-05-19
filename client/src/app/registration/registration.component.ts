import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit, OnDestroy {

  itemForm!: FormGroup;
  showPassword: boolean = false;

  formModel: any = {
    email: '',
    password: '',
    role: '',
    username: '',
    specialty: '',
    availability: ''
  };

  showMessage: boolean = false;
  responseMessage: any;

  // ✅ OTP
  otpSent: boolean = false;
  otpVerified: boolean = false;
  otpValue: string = '';
  otpError: string = '';
  otpSuccess: string = '';
  otpSending: boolean = false;
  otpVerifying: boolean = false;
  otpTimer: number = 0;
  otpTimerInterval: any = null;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      username: ['', Validators.required],
      specialty: [''],
      availability: ['']
    });

    this.onRoleChange();
  }

  ngOnDestroy(): void {
    if (this.otpTimerInterval) {
      clearInterval(this.otpTimerInterval);
    }
  }

  onRoleChange(): void {
    this.itemForm.get('role')?.valueChanges.subscribe((roleValue: string) => {
      const specialtyControl = this.itemForm.get('specialty');
      const availabilityControl = this.itemForm.get('availability');

      if (roleValue === 'DOCTOR') {
        specialtyControl?.setValidators([Validators.required]);
        availabilityControl?.setValidators([Validators.required]);
      } else {
        specialtyControl?.clearValidators();
        availabilityControl?.clearValidators();
        specialtyControl?.setValue('');
        availabilityControl?.setValue('');
      }

      specialtyControl?.updateValueAndValidity();
      availabilityControl?.updateValueAndValidity();
    });
  }

  // ============================================================
  // ✅ OTP METHODS
  // ============================================================

  // ✅ Send OTP
  sendOtp(): void {
    const email = this.itemForm.get('email')?.value;

    if (!email || this.itemForm.get('email')?.invalid) {
      this.otpError = 'Please enter a valid email first';
      return;
    }

    this.otpSending = true;
    this.otpError = '';
    this.otpSuccess = '';
    this.otpValue = '';

    this.httpService.sendOtp(email).subscribe({
      next: (res: any) => {
        console.log('✅ OTP sent:', res);
        this.otpSent = true;
        this.otpSending = false;
        this.otpSuccess = 'OTP sent to ' + email;
        this.otpError = '';
        this.startTimer();
      },
      error: (err: any) => {
        console.error('❌ OTP send failed:', err);
        this.otpSending = false;
        this.otpError = err.error?.message || 'Failed to send OTP. Try again.';
      }
    });
  }

  // ✅ Verify OTP
  verifyOtp(): void {
    const email = this.itemForm.get('email')?.value;

    if (!this.otpValue || this.otpValue.length !== 6) {
      this.otpError = 'Please enter 6-digit OTP';
      return;
    }

    this.otpVerifying = true;
    this.otpError = '';

    this.httpService.verifyOtp(email, this.otpValue).subscribe({
      next: (res: any) => {
        console.log('✅ OTP verified:', res);
        this.otpVerified = true;
        this.otpVerifying = false;
        this.otpSuccess = 'Email verified successfully ✅';
        this.otpError = '';
        this.stopTimer();
      },
      error: (err: any) => {
        console.error('❌ OTP verification failed:', err);
        this.otpVerifying = false;
        this.otpError = err.error?.message || 'Invalid or expired OTP ❌';
        this.otpSuccess = '';
      }
    });
  }

  // ✅ Start 60s resend timer
  startTimer(): void {
    this.stopTimer();
    this.otpTimer = 60;

    this.otpTimerInterval = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer <= 0) {
        this.stopTimer();
      }
    }, 1000);
  }

  // ✅ Stop timer
  stopTimer(): void {
    if (this.otpTimerInterval) {
      clearInterval(this.otpTimerInterval);
      this.otpTimerInterval = null;
    }
    this.otpTimer = 0;
  }

  // ✅ Reset OTP when email changes
  onEmailChange(): void {
    if (this.otpSent || this.otpVerified) {
      this.otpSent = false;
      this.otpVerified = false;
      this.otpValue = '';
      this.otpError = '';
      this.otpSuccess = '';
      this.stopTimer();
    }
  }

  // ============================================================
  // ✅ REGISTER
  // ============================================================

  onRegister(): void {
    // ✅ Check OTP verified
    if (!this.otpVerified) {
      this.otpError = 'Please verify your email first';
      return;
    }

    if (this.itemForm.valid) {
      this.formModel = this.itemForm.value;

      if (this.formModel.role === 'PATIENT') {
        this.registerPatient();
      } else if (this.formModel.role === 'DOCTOR') {
        this.registerDoctors();
      } else if (this.formModel.role === 'RECEPTIONIST') {
        this.registerReceptionist();
      }
    } else {
      this.itemForm.markAllAsTouched();
    }
  }

  registerPatient(): void {
    const patientDetails = {
      email: this.formModel.email,
      password: this.formModel.password,
      username: this.formModel.username,
      role: this.formModel.role
    };

    this.httpService.registerPatient(patientDetails).subscribe({
      next: (response: any) => {
        this.showMessage = true;
        this.responseMessage = response.message || 'Patient registered successfully';
        this.itemForm.reset();
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        this.showMessage = true;
        this.responseMessage = error.error?.message || error.message || 'Registration failed';
      }
    });
  }

  registerDoctors(): void {
    const doctorDetails = {
      email: this.formModel.email,
      password: this.formModel.password,
      username: this.formModel.username,
      role: this.formModel.role,
      specialty: this.formModel.specialty,
      availability: this.formModel.availability
    };

    this.httpService.registerDoctors(doctorDetails).subscribe({
      next: (response: any) => {
        this.showMessage = true;
        this.responseMessage = response.message || 'Doctor registered successfully';
        this.itemForm.reset();
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        this.showMessage = true;
        this.responseMessage = error.error?.message || error.message || 'Registration failed';
      }
    });
  }

  registerReceptionist(): void {
    const receptionistDetails = {
      email: this.formModel.email,
      password: this.formModel.password,
      username: this.formModel.username,
      role: this.formModel.role
    };

    this.httpService.registerReceptionist(receptionistDetails).subscribe({
      next: (response: any) => {
        this.showMessage = true;
        this.responseMessage = response.message || 'Receptionist registered successfully';
        this.itemForm.reset();
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        this.showMessage = true;
        this.responseMessage = error.error?.message || error.message || 'Registration failed';
      }
    });
  }
}