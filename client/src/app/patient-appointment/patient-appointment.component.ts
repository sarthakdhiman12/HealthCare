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

  // Reschedule
  showRescheduleForm: boolean = false;
  selectedAppointmentId: number | null = null;
  rescheduleForm!: FormGroup;

  responseMessage: string = '';
  isSuccess: boolean = false;
  minDateTime: string = '';

  // ✅ Payment
  showPaymentModal: boolean = false;
  selectedPaymentAppointment: any = null;
  selectedPayMethod: string = 'card';
  processingPayment: boolean = false;

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

  // ✅ Doctor fees based on specialty
  getDoctorFees(specialty: string): number {
    const feesMap: any = {
      'cardiology': 1500,
      'cardio': 1500,
      'cardiac': 1500,
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

        this.appointmentList = list.map((a: any) => {
          const rawTime =
            a.time ||
            a.appointmentTime ||
            a.appointmentDateTime ||
            a.dateTime ||
            null;

          // ✅ Check payment status from localStorage
          const paymentKey = 'payment_' + a.id;
          const savedPayment = localStorage.getItem(paymentKey);

          return {
            ...a,
            appointmentTime: this.parseBackendDateTimeToLocal(rawTime),
            rawAppointmentTime: rawTime,
            paymentStatus: savedPayment || a.paymentStatus || 'NOT PAID'
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

  // ✅ PAYMENT
  payNow(appointment: any): void {
    this.selectedPaymentAppointment = appointment;
    this.selectedPayMethod = 'card';
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedPaymentAppointment = null;
    this.processingPayment = false;
  }

  confirmPayment(): void {
    this.processingPayment = true;

    // ✅ Simulate payment processing (replace with Razorpay later)
    setTimeout(() => {
      const appointment = this.selectedPaymentAppointment;

      if (appointment) {
        appointment.paymentStatus = 'PAID';

        // ✅ Save to localStorage (persist across refresh)
        localStorage.setItem('payment_' + appointment.id, 'PAID');
      }

      this.processingPayment = false;
      this.showPaymentModal = false;

      this.responseMessage = 'Payment successful ✅';
      this.isSuccess = true;

      setTimeout(() => {
        this.responseMessage = '';
      }, 3000);

    }, 2000); // 2 sec delay to simulate processing
  }

  // Reschedule
  openReschedule(appointment: any) {
    this.selectedAppointmentId = appointment.id;
    this.showRescheduleForm = true;
    this.responseMessage = '';

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

    const payload = {
      time: this.datePipe.transform(selected, 'yyyy-MM-dd HH:mm:ss')
    };

    this.httpService.reScheduleAppointment(this.selectedAppointmentId, payload).subscribe({
      next: () => {
        this.responseMessage = 'Appointment rescheduled successfully ✅';
        this.isSuccess = true;
        this.cancelReschedule();
        this.getAppointments();
        setTimeout(() => { this.responseMessage = ''; }, 2000);
      },
      error: (err: any) => {
        console.error(err);
        this.responseMessage = 'Reschedule failed ❌';
        this.isSuccess = false;
      }
    });
  }

  private formatDateForInput(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private parseBackendDateTimeToLocal(raw: any): Date | null {
    if (!raw) return null;
    const str = String(raw).replace('T', ' ').split('.')[0];
    const parts = str.split(/[- :]/);

    if (parts.length < 5) {
      const d = new Date(raw);
      return isNaN(d.getTime()) ? null : d;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);
    const hour = Number(parts[3]);
    const minute = Number(parts[4]);
    const second = parts[5] ? Number(parts[5]) : 0;

    const localDate = new Date(year, month, day, hour, minute, second);
    return isNaN(localDate.getTime()) ? null : localDate;
  }
}