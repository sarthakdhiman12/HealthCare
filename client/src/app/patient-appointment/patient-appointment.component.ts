import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-patient-appointment',
  templateUrl: './patient-appointment.component.html',
  styleUrls: ['./patient-appointment.component.scss'],
  providers: [DatePipe]
})
export class PatientAppointmentComponent implements OnInit {

  appointmentList: any[] = [];

  // reschedule
  showRescheduleForm: boolean = false;
  selectedAppointmentId: number | null = null;
  rescheduleForm!: FormGroup;

  responseMessage: string = '';
  isSuccess: boolean = false;

  minDateTime: string = '';

  constructor(
    public httpService: HttpService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.rescheduleForm = this.fb.group({
      time: ['', Validators.required]
    });

    this.minDateTime = this.formatDateForInput(new Date());
    this.getAppointments();
  }

  getAppointments() {
    const userIdString = localStorage.getItem('userId');
    const userId = userIdString ? parseInt(userIdString, 10) : null;

    if (!userId) {
      this.responseMessage = 'User not found. Please login again.';
      this.isSuccess = false;
      return;
    }

    this.httpService.getAppointmentByPatient(userId).subscribe({
      next: (data: any) => {
        const list = data?.data || data || [];

        // ✅ FIX: Parse appointmentTime as LOCAL Date to avoid 6 hrs gap
        this.appointmentList = list.map((a: any) => {
          const rawTime =
            a.time ||
            a.appointmentTime ||
            a.appointmentDateTime ||
            a.dateTime ||
            null;

          return {
            ...a,
            appointmentTime: this.parseBackendDateTimeToLocal(rawTime), // Date object (safe)
            rawAppointmentTime: rawTime
          };
        });

        console.log('Patient appointments:', this.appointmentList);
      },
      error: (err: any) => {
        console.error(err);
        this.appointmentList = [];
      }
    });
  }

  // open reschedule form for a row
  openReschedule(appointment: any) {
    this.selectedAppointmentId = appointment.id;
    this.showRescheduleForm = true;
    this.responseMessage = '';

    // ✅ current time already Date (because we parsed in getAppointments)
    const current: Date = appointment?.appointmentTime instanceof Date
      ? appointment.appointmentTime
      : new Date();

    this.rescheduleForm.patchValue({
      time: this.formatDateForInput(current)
    });
  }

  cancelReschedule() {
    this.showRescheduleForm = false;
    this.selectedAppointmentId = null;
    this.rescheduleForm.reset();
  }

  submitReschedule() {
    if (this.rescheduleForm.invalid || !this.selectedAppointmentId) {
      this.rescheduleForm.markAllAsTouched();
      return;
    }

    const selected = new Date(this.rescheduleForm.value.time);
    const now = new Date();

    if (selected <= now) {
      this.responseMessage = 'Please select a future date/time.';
      this.isSuccess = false;
      return;
    }

    // ✅ API needs "yyyy-MM-dd HH:mm:ss" format (project spec) [1](https://ltimindtree-my.sharepoint.com/personal/sumit_10854769_ltimindtree_com/Documents/Microsoft%20Teams%20Chat%20Files/project.pdf?web=1)
    const payload = {
      time: this.datePipe.transform(selected, 'yyyy-MM-dd HH:mm:ss')
    };

    this.httpService.reScheduleAppointment(this.selectedAppointmentId, payload).subscribe({
      next: () => {
        this.responseMessage = 'Appointment rescheduled successfully ✅';
        this.isSuccess = true;

        this.cancelReschedule();
        this.getAppointments(); // refresh list
        setTimeout(()=>{
          this.responseMessage = '';
          
        }, 2000)
      },
      error: (err: any) => {
        console.error(err);
        this.responseMessage = 'Reschedule failed ❌';
        this.isSuccess = false;
      }
    });
  }

  // datetime-local helper
  private formatDateForInput(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  /**
   * ✅ MAIN FIX (NO TIMEZONE SHIFT)
   * Backend sends "yyyy-MM-dd HH:mm:ss" without timezone.
   * new Date(string) shifts time (UTC -> IST), so manual parse as LOCAL time.
   */
  private parseBackendDateTimeToLocal(raw: any): Date | null {
    if (!raw) return null;

    // handle ISO too: "2026-05-17T10:30:00" -> "2026-05-17 10:30:00"
    const str = String(raw).replace('T', ' ').split('.')[0];

    // expected: yyyy-MM-dd HH:mm:ss OR yyyy-MM-dd HH:mm
    const parts = str.split(/[- :]/); // [yyyy, MM, dd, HH, mm, ss]

    if (parts.length < 5) {
      // fallback attempt
      const d = new Date(raw);
      return isNaN(d.getTime()) ? null : d;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1; // 0-based
    const day = Number(parts[2]);
    const hour = Number(parts[3]);
    const minute = Number(parts[4]);
    const second = parts[5] ? Number(parts[5]) : 0;

    const localDate = new Date(year, month, day, hour, minute, second);
    return isNaN(localDate.getTime()) ? null : localDate;
  }
}