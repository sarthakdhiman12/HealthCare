import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-availability',
  templateUrl: './doctor-availability.component.html',
  styleUrls: ['./doctor-availability.component.scss']
})
export class DoctorAvailabilityComponent implements OnInit {

  itemForm!: FormGroup;

  responseMessage: string = '';
  isAdded: boolean = false;
  updating: boolean = false;

  selectedAvailability: string = ''; // 'Yes' | 'No'
  loadingAvailability: boolean = true;

  // ✅ REAL doctorId (backend se aayega)
  realDoctorId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private httpService: HttpService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.formBuilder.group({
      availability: ['', Validators.required]
    });

    this.selectedAvailability = '';
    this.loadingAvailability = true;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.loadingAvailability = false;
      this.setFromLocalStorageOnly();
      if (!this.selectedAvailability) this.setDefaultUIOnly();
      return;
    }

    // ✅ Correct: userId se doctor fetch
    this.httpService.getDoctorByUserId(userId).subscribe({
      next: (res: any) => {
        console.log('GET DOCTOR BY USER RESPONSE =>', res);

        const doctorObj = res?.data || res;

        // ✅ doctorId store
        this.realDoctorId = doctorObj?.doctorId || doctorObj?.id || null;

        // ✅ availability normalize
        const rawAvail = doctorObj?.availability;
        const norm = (rawAvail ?? '').toString().trim().toLowerCase();

        if (norm === 'yes') {
          this.selectedAvailability = 'Yes';
          this.itemForm.patchValue({ availability: 'Yes' });
          localStorage.setItem('availability', 'Yes');
        } else if (norm === 'no') {
          this.selectedAvailability = 'No';
          this.itemForm.patchValue({ availability: 'No' });
          localStorage.setItem('availability', 'No');
        } else {
          this.setFromLocalStorageOnly();
          if (!this.selectedAvailability) this.setDefaultUIOnly();
        }

        this.loadingAvailability = false;
      },
      error: (err: any) => {
        console.error('GET DOCTOR BY USER ERROR =>', err);

        this.setFromLocalStorageOnly();
        if (!this.selectedAvailability) this.setDefaultUIOnly();

        this.loadingAvailability = false;
      }
    });
  }

  selectAvailability(value: string): void {
    if (this.loadingAvailability) return;
    this.selectedAvailability = value;
    this.itemForm.patchValue({ availability: value });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const availability = this.itemForm.value.availability;

    // ✅ use real doctorId
    if (!this.realDoctorId) {
      this.responseMessage = 'Doctor ID not found. Please refresh/login again.';
      this.isAdded = false;
      return;
    }

    this.updating = true;

    this.httpService.updateDoctorAvailability(this.realDoctorId, availability).subscribe({
      next: (response: any) => {
        console.log('Availability updated:', response);

        this.responseMessage = 'Doctor availability updated successfully ✅';
        this.isAdded = true;

        this.selectedAvailability = availability;
        localStorage.setItem('availability', availability);

        this.updating = false;

        setTimeout(() => {
          this.responseMessage = '';
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (error: any) => {
        console.error('Error updating doctor availability:', error);

        this.responseMessage = 'Failed to update doctor availability ❌';
        this.isAdded = false;
        this.updating = false;

        setTimeout(() => { this.responseMessage = ''; }, 1500);
      }
    });
  }

  private setFromLocalStorageOnly(): void {
    const saved = localStorage.getItem('availability');
    const norm = (saved ?? '').toString().trim().toLowerCase();

    if (norm === 'yes') {
      this.selectedAvailability = 'Yes';
      this.itemForm.patchValue({ availability: 'Yes' });
    } else if (norm === 'no') {
      this.selectedAvailability = 'No';
      this.itemForm.patchValue({ availability: 'No' });
    }
  }

  private setDefaultUIOnly(): void {
    this.selectedAvailability = 'No';
    this.itemForm.patchValue({ availability: 'No' });
  }
}
