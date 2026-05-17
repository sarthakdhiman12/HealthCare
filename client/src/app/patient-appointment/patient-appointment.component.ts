import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';

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
  showSuccess: boolean = false;

  // ✅ Payment
  showPaymentModal: boolean = false;
  selectedPaymentAppointment: any = null;
  selectedPayMethod: string = 'card';
  processingPayment: boolean = false;

  // ✅ Slot system
  slotLabels: any = {
    '10:00-11:00': '10:00 AM - 11:00 AM',
    '11:00-12:00': '11:00 AM - 12:00 PM',
    '12:00-13:00': '12:00 PM - 1:00 PM',
    '13:00-14:00': '1:00 PM - 2:00 PM',
    '14:00-15:00': '2:00 PM - 3:00 PM',
    '15:00-16:00': '3:00 PM - 4:00 PM',
    '16:00-17:00': '4:00 PM - 5:00 PM'
  };

  allSlots = [
    { value: '10:00-11:00', label: '10:00 AM - 11:00 AM' },
    { value: '11:00-12:00', label: '11:00 AM - 12:00 PM' },
    { value: '12:00-13:00', label: '12:00 PM - 1:00 PM' },
    { value: '13:00-14:00', label: '1:00 PM - 2:00 PM' },
    { value: '14:00-15:00', label: '2:00 PM - 3:00 PM' },
    { value: '15:00-16:00', label: '3:00 PM - 4:00 PM' },
    { value: '16:00-17:00', label: '4:00 PM - 5:00 PM' }
  ];

  // ✅ Reschedule date cards + slots
  rescheduleDateCards: any[] = [];
  rescheduleSelectedDate: string = '';
  rescheduleSelectedSlot: string = '';
  rescheduleAvailableSlots: string[] = [];
  rescheduleLoadingSlots: boolean = false;
  rescheduleDoctorId: number | null = null;

  constructor(
    public httpService: HttpService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.rescheduleForm = this.fb.group({
      date: ['', Validators.required],
      slot: ['', Validators.required]
    });

    this.generateRescheduleDateCards();
    this.getAppointments();
  }

  generateRescheduleDateCards(): void {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    this.rescheduleDateCards = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      this.rescheduleDateCards.push({
        value: this.formatDate(d),
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()],
        dayNum: d.getDate(),
        month: months[d.getMonth()]
      });
    }
  }

  formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getSlotLabel(slot: string): string {
    return this.slotLabels[slot] || slot || 'N/A';
  }

  getReadableDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit', month: 'short', year: 'numeric'
    };
    return d.toLocaleDateString('en-IN', options);
  }

  getDoctorFees(specialty: string): number {
    const feesMap: any = {
      'cardiology': 1500, 'cardio': 1500, 'cardiac': 1500,
      'neurology': 2000, 'orthopedics': 1200, 'dermatology': 800,
      'pediatrics': 700, 'general': 500, 'webing': 600, 'ent': 900
    };
    return feesMap[(specialty || 'general').toLowerCase()] || 500;
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
          const paymentKey = 'payment_' + a.id;
          const savedPayment = localStorage.getItem(paymentKey);

          return {
            ...a,
            paymentStatus: savedPayment || a.paymentStatus || 'NOT PAID'
          };
        });
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

    setTimeout(() => {
      const appointment = this.selectedPaymentAppointment;

      if (appointment) {
        appointment.paymentStatus = 'PAID';
        localStorage.setItem('payment_' + appointment.id, 'PAID');
      }

      this.processingPayment = false;
      this.showPaymentModal = false;
      this.responseMessage = 'Payment successful ✅';
      this.isSuccess = true;

      setTimeout(() => { this.responseMessage = ''; }, 3000);
    }, 2000);
  }

  // ✅ RESCHEDULE — open
  openReschedule(appointment: any) {
    this.selectedAppointmentId = appointment.id;
    this.rescheduleDoctorId = appointment.doctor?.id || null;
    this.showRescheduleForm = true;
    this.responseMessage = '';

    this.rescheduleSelectedDate = '';
    this.rescheduleSelectedSlot = '';
    this.rescheduleAvailableSlots = [];
    this.rescheduleForm.reset();
  }

  cancelReschedule() {
    this.showRescheduleForm = false;
    this.selectedAppointmentId = null;
    this.rescheduleSelectedDate = '';
    this.rescheduleSelectedSlot = '';
    this.rescheduleAvailableSlots = [];
    this.rescheduleForm.reset();
  }

  selectRescheduleDate(dateValue: string): void {
    this.rescheduleSelectedDate = dateValue;
    this.rescheduleSelectedSlot = '';
    this.rescheduleAvailableSlots = [];
    this.rescheduleForm.patchValue({ date: dateValue, slot: '' });

    if (this.rescheduleDoctorId) {
      this.rescheduleLoadingSlots = true;

      this.httpService.getAvailableSlots(this.rescheduleDoctorId, dateValue).subscribe({
        next: (slots: string[]) => {
          this.rescheduleAvailableSlots = slots;
          this.rescheduleLoadingSlots = false;
        },
        error: (err) => {
          console.error('Error loading slots:', err);
          this.rescheduleAvailableSlots = [];
          this.rescheduleLoadingSlots = false;
        }
      });
    }
  }

  selectRescheduleSlot(slotValue: string): void {
    if (!this.isRescheduleSlotAvailable(slotValue)) return;
    this.rescheduleSelectedSlot = slotValue;
    this.rescheduleForm.patchValue({ slot: slotValue });
  }

  isRescheduleSlotAvailable(slotValue: string): boolean {
    if (!this.rescheduleAvailableSlots.includes(slotValue)) return false;
    if (this.isRescheduleSlotPast(slotValue)) return false;
    return true;
  }

  isRescheduleSlotBooked(slotValue: string): boolean {
    return !this.rescheduleAvailableSlots.includes(slotValue);
  }

  isRescheduleSlotPast(slotValue: string): boolean {
    if (!this.rescheduleSelectedDate) return false;
    const today = new Date();
    const selected = new Date(this.rescheduleSelectedDate + 'T00:00:00');
    if (selected.toDateString() === today.toDateString()) {
      const slotStartHour = parseInt(slotValue.split(':')[0]);
      return today.getHours() >= slotStartHour;
    }
    return false;
  }

  getRescheduleAvailableCount(): number {
    return this.allSlots.filter(s => this.isRescheduleSlotAvailable(s.value)).length;
  }

  // ✅ Submit reschedule
  submitReschedule() {
    if (!this.rescheduleSelectedDate || !this.rescheduleSelectedSlot || !this.selectedAppointmentId) {
      this.responseMessage = 'Please select date and slot';
      this.isSuccess = false;
      return;
    }

    const payload = {
      date: this.rescheduleSelectedDate,
      slot: this.rescheduleSelectedSlot
    };

    this.httpService.reScheduleAppointment(this.selectedAppointmentId, payload).subscribe({
      next: () => {
        // ✅ Close form
        this.showRescheduleForm = false;
        this.selectedAppointmentId = null;
        this.rescheduleSelectedDate = '';
        this.rescheduleSelectedSlot = '';
        this.rescheduleAvailableSlots = [];
        this.rescheduleForm.reset();

        // ✅ Show success animation
        this.showSuccess = true;
        this.responseMessage = 'Appointment rescheduled successfully';
        this.isSuccess = true;

        // ✅ 3 sec baad dashboard navigate
        setTimeout(() => {
          this.showSuccess = false;
          this.responseMessage = '';
          this.router.navigate(['/dashboard']);
        }, 3000);
      },
      error: (err: any) => {
        console.error(err);
        this.responseMessage = err.error?.message || 'Reschedule failed ❌';
        this.isSuccess = false;
        setTimeout(() => { this.responseMessage = ''; }, 3000);
      }
    });
  }
}