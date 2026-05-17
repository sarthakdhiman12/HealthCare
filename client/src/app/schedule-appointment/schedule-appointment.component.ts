import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-schedule-appointment',
  templateUrl: './schedule-appointment.component.html',
  styleUrls: ['./schedule-appointment.component.scss'],
  providers: [DatePipe]
})
export class ScheduleAppointmentComponent implements OnInit {

  doctorList: any[] = [];
  selectedDoctor: any = null;

  itemForm!: FormGroup;
  formModel!: FormGroup;

  responseMessage: string = '';
  isAdded: boolean = false;
  submitting: boolean = false;
  showSuccess: boolean = false;

  minDateTime: string = '';
  maxDateTime: string = '';

  constructor(
    private httpService: HttpService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getDoctors();

    this.itemForm = this.fb.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      time: ['', Validators.required]
    });

    this.formModel = this.itemForm;

    const now = new Date();
    this.minDateTime = this.formatDateForInput(now);

    const nextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
      now.getHours(),
      now.getMinutes()
    );
    this.maxDateTime = this.formatDateForInput(nextMonth);
  }

  // ✅ Doctor fees
  getDoctorFees(specialty: string): number {
    const feesMap: any = {
      'cardiology': 1500,
      'cardio': 1500,
      'cardiac': 1500,
      'cardic': 1500,
      'neurology': 2000,
      'orthopedics': 1200,
      'dermatology': 800,
      'pediatrics': 700,
      'general': 500,
      'webing': 600,
      'ent': 900
    };
    const key = (specialty || 'general').toLowerCase();
    return feesMap[key] || 500;
  }

  formatDateForInput(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  getDoctors(): void {
    this.httpService.getDoctors().subscribe({
      next: (res: any) => {
        this.doctorList = res;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  addAppointment(doc: any): void {
    const userId = Number(localStorage.getItem('userId'));

    this.selectedDoctor = doc;

    this.itemForm.patchValue({
      doctorId: doc.id,
      patientId: userId
    });

    this.isAdded = true;
  }

  cancelBooking(): void {
    this.isAdded = false;
    this.selectedDoctor = null;
    this.itemForm.patchValue({ time: '' });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const selectedDate = new Date(this.itemForm.value.time);
    const minDate = new Date(this.minDateTime);
    const maxDate = new Date(this.maxDateTime);

    if (selectedDate < minDate || selectedDate > maxDate) {
      this.responseMessage = 'Please select a date and time from today up to one month ahead only.';
      return;
    }

    this.submitting = true;

    const formValue = { ...this.itemForm.value };
    formValue.time = this.datePipe.transform(formValue.time, 'yyyy-MM-dd HH:mm:ss');

    this.httpService.ScheduleAppointment(formValue).subscribe({
      next: () => {
        this.isAdded = false;
        this.submitting = false;

        // ✅ Show success animation
        this.showSuccess = true;
        this.responseMessage = 'Appointment Scheduled Successfully';

        this.itemForm.reset();

        setTimeout(() => {
          this.showSuccess = false;
          this.responseMessage = '';
          this.router.navigate(['/dashboard']);
        }, 3000);
      },
      error: (err: any) => {
        console.error(err);
        this.submitting = false;
        this.responseMessage = 'Failed to schedule appointment';
      }
    });
  }
}