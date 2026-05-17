import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

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

  onRegister(): void {
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