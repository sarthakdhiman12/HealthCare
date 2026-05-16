import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-doctor-availability',
  templateUrl: './doctor-availability.component.html',
  styleUrls: ['./doctor-availability.component.scss']
})
export class DoctorAvailabilityComponent implements OnInit {

  itemForm!: FormGroup;
  responseMessage: string = '';
  isAdded: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.itemForm = this.formBuilder.group({
      availability: ['', Validators.required]
    });
  }

  onSubmit(): void {
    console.log('Update button clicked');

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

    this.httpService.updateDoctorAvailability(doctorId, availability).subscribe({
      next: (response: any) => {
        console.log('Availability updated:', response);

        this.responseMessage = 'Doctor availability updated successfully';
        this.isAdded = true;

        this.itemForm.reset();
      },
      error: (error: any) => {
        console.error('Error updating doctor availability:', error);

        this.responseMessage = 'Failed to update doctor availability';
        this.isAdded = false;
      }
    });
  }
}