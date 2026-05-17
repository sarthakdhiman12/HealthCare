import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

import { ActivatedRoute, Router } from '@angular/router';

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

  selectedAvailability: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private httpService: HttpService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.itemForm = this.formBuilder.group({
      availability: ['', Validators.required]
    });


    const savedAvailability = localStorage.getItem('availability');

    if (savedAvailability) {
      this.selectedAvailability = savedAvailability;

      this.itemForm.patchValue({
        availability: savedAvailability
      });
    }
  }


  // ✅ Toggle selection
  selectAvailability(value: string): void {
    this.selectedAvailability = value;
    this.itemForm.patchValue({ availability: value });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const doctorId = localStorage.getItem('userId');
    const availability = this.itemForm.value.availability;

    if (!doctorId) {
      this.responseMessage = 'Doctor ID not found. Please login again.';
      this.isAdded = false;
      return;
    }

    this.updating = true;

    this.httpService.updateDoctorAvailability(doctorId, availability).subscribe({
      next: (response: any) => {
        console.log('Availability updated:', response);
        this.responseMessage = 'Doctor availability updated successfully ✅';
        this.isAdded = true;
        this.selectedAvailability = availability;

        // ✅ ADD THIS LINE
        localStorage.setItem('availability', availability);

        this.updating = false;

        setTimeout(() => { this.responseMessage = '';  this.router.navigate(['/dashboard'])}, 1500);
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
}