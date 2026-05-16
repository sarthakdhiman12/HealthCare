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

  itemForm!: FormGroup;

  // ✅ Added this because your test file expects formModel
  formModel!: FormGroup;

  responseMessage: string = '';
  isAdded: boolean = false;

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

    // ✅ Make formModel point to the same form
    this.formModel = this.itemForm;

    const now = new Date();

    // min = current date time
    this.minDateTime = this.formatDateForInput(now);

    // max = next month same date
    const nextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
      now.getHours(),
      now.getMinutes()
    );

    this.maxDateTime = this.formatDateForInput(nextMonth);
  }

  // helper for datetime-local format
  formatDateForInput(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  // fetch doctors
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

  // click Book
  addAppointment(doc: any): void {
    const userId = Number(localStorage.getItem('userId'));

    this.itemForm.patchValue({
      doctorId: doc.id,
      patientId: userId
    });

    this.isAdded = true;
  }

  // submit
  onSubmit(): void {
    if (this.itemForm.invalid) {
      return;
    }

    const selectedDate = new Date(this.itemForm.value.time);

    const minDate = new Date(this.minDateTime);
    const maxDate = new Date(this.maxDateTime);

    // HARD validation
    if (selectedDate < minDate || selectedDate > maxDate) {
      this.responseMessage = 'Please select a date and time from today up to one month ahead only.';
      return;
    }

    const formValue = { ...this.itemForm.value };

    formValue.time = this.datePipe.transform(
      formValue.time,
      'yyyy-MM-dd HH:mm:ss'
    );

    this.httpService.ScheduleAppointment(formValue).subscribe({
      next: () => {
        this.responseMessage = 'Appointment Scheduled Successfully';

        this.itemForm.reset();
        this.isAdded = false;

        setTimeout(() => {
          this.responseMessage = '';
          this.router.navigate(['/dashboard']);
        }, 3000);
      },
      error: (err: any) => {
        console.error(err);
        this.responseMessage = 'Failed to schedule appointment';
      }
    });
  }
}
``