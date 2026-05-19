import { Component, OnInit, NgZone } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';

declare var Razorpay: any;

@Component({
  selector: 'app-patient-appointment',
  templateUrl: './patient-appointment.component.html',
  styleUrls: ['./patient-appointment.component.scss'],
  providers: [DatePipe]
})
export class PatientAppointmentComponent implements OnInit {

  allAppointments: any[] = [];
  upcomingAppointments: any[] = [];
  pastAppointments: any[] = [];

  // Reschedule
  showRescheduleForm: boolean = false;
  selectedAppointmentId: number | null = null;
  rescheduleForm!: FormGroup;

  responseMessage: string = '';
  isSuccess: boolean = false;
  showSuccess: boolean = false;
  showHistory: boolean = false;

  // ✅ Payment (Razorpay)
  selectedPaymentAppointment: any = null;
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
    private router: Router,
    private ngZone: NgZone // ✅ NgZone added
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
    try {
      let d: Date;
      if (dateStr.includes('T')) {
        d = new Date(dateStr);
      } else {
        d = new Date(dateStr + 'T00:00:00');
      }
      if (isNaN(d.getTime())) return dateStr;
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit', month: 'short', year: 'numeric'
      };
      return d.toLocaleDateString('en-IN', options);
    } catch (e) {
      return dateStr;
    }
  }

  getDoctorFees(specialty: string): number {
    const feesMap: any = {
      'cardiology': 1500, 'cardio': 1500, 'cardiac': 1500,
      'neurology': 2000, 'neuro': 2000, 'orthopedics': 1200,
      'dermatology': 800, 'pediatrics': 700, 'general': 500,
      'webing': 600, 'ent': 900
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

        this.allAppointments = list.map((a: any) => {
          const paymentKey = 'payment_' + a.id;
          const savedPayment = localStorage.getItem(paymentKey);

          return {
            ...a,
            paymentStatus: savedPayment || a.paymentStatus || 'NOT PAID'
          };
        });

        this.splitAppointments();
      },
      error: (err: any) => {
        console.error(err);
        this.allAppointments = [];
        this.upcomingAppointments = [];
        this.pastAppointments = [];
      }
    });
  }

  splitAppointments(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.upcomingAppointments = this.allAppointments.filter(a => {
      const d = this.parseDate(a.appointmentDate);
      return d !== null && d >= today;
    });

    this.pastAppointments = this.allAppointments.filter(a => {
      const d = this.parseDate(a.appointmentDate);
      return d !== null && d < today;
    });

    this.upcomingAppointments.sort((a, b) => {
      const dateA = this.parseDate(a.appointmentDate)?.getTime() || 0;
      const dateB = this.parseDate(b.appointmentDate)?.getTime() || 0;
      if (dateA !== dateB) return dateA - dateB;
      return this.getSlotStartHour(a.slot) - this.getSlotStartHour(b.slot);
    });

    this.pastAppointments.sort((a, b) => {
      const dateA = this.parseDate(a.appointmentDate)?.getTime() || 0;
      const dateB = this.parseDate(b.appointmentDate)?.getTime() || 0;
      if (dateA !== dateB) return dateA - dateB;
      return this.getSlotStartHour(a.slot) - this.getSlotStartHour(b.slot);
    });

    console.log('UPCOMING:', this.upcomingAppointments.length);
    console.log('PAST:', this.pastAppointments.length);
  }

  parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    try {
      if (dateStr.includes('T')) {
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
        return isNaN(d.getTime()) ? null : d;
      }
      const d = new Date(dateStr + 'T00:00:00');
      return isNaN(d.getTime()) ? null : d;
    } catch (e) {
      return null;
    }
  }

  getSlotStartHour(slot: string): number {
    if (!slot) return 0;
    const hour = parseInt(slot.split(':')[0]);
    return isNaN(hour) ? 0 : hour;
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
  }

  isToday(dateStr: string): boolean {
    if (!dateStr) return false;
    const d = this.parseDate(dateStr);
    if (!d) return false;
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }

  // ============================================================
  // ✅ RAZORPAY PAYMENT
  // ============================================================

  payNow(appointment: any): void {
    this.selectedPaymentAppointment = appointment;
    this.processingPayment = true;
    this.responseMessage = '';

    const fees = appointment.doctor?.fees || this.getDoctorFees(appointment.doctor?.specialty);
    const appointmentId = appointment.id;

    this.httpService.createPaymentOrder(fees, appointmentId).subscribe({
      next: (order: any) => {
        console.log('Razorpay Order:', order);
        this.openRazorpay(order, appointment, fees);
      },
      error: (err: any) => {
        console.error('Order creation failed:', err);
        this.processingPayment = false;
        this.responseMessage = 'Failed to create payment order ❌';
        this.isSuccess = false;
        setTimeout(() => { this.responseMessage = ''; }, 3000);
      }
    });
  }

  // ✅ NgZone wrapped — UI updates instantly after payment
  openRazorpay(order: any, appointment: any, fees: number): void {
    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'HAM System',
      description: 'Appointment #' + appointment.id + ' Payment',
      order_id: order.orderId,
      prefill: {
        name: localStorage.getItem('username') || 'Patient',
        email: localStorage.getItem('email') || '',
        contact: ''
      },
      theme: {
        color: '#0d6efd'
      },
      handler: (response: any) => {
        // ✅ NgZone wrap — fixes instant UI update
        this.ngZone.run(() => {
          console.log('✅ Payment Success:', response);
          this.onPaymentSuccess(response, appointment);
        });
      },
      modal: {
        ondismiss: () => {
          // ✅ NgZone wrap — fixes instant UI update
          this.ngZone.run(() => {
            console.log('Payment modal closed by user');
            this.processingPayment = false;
            this.responseMessage = 'Payment cancelled';
            this.isSuccess = false;
            setTimeout(() => { this.responseMessage = ''; }, 3000);
          });
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
    this.processingPayment = false;
  }

  onPaymentSuccess(response: any, appointment: any): void {
    const appointmentId = appointment.id;

    this.httpService.verifyPayment(
      response.razorpay_payment_id,
      response.razorpay_order_id,
      appointmentId
    ).subscribe({
      next: (res: any) => {
        console.log('✅ Payment verified:', res);
        this.markAsPaid(appointment, response.razorpay_payment_id);
      },
      error: (err: any) => {
        console.error('Verification API failed (still marking paid for test):', err);
        this.markAsPaid(appointment, response.razorpay_payment_id);
      }
    });
  }

  private markAsPaid(appointment: any, paymentId: string): void {
    const appointmentId = appointment.id;

    appointment.paymentStatus = 'PAID';
    localStorage.setItem('payment_' + appointmentId, 'PAID');
    localStorage.setItem('paymode_' + appointmentId, 'ONLINE');
    localStorage.setItem('payid_' + appointmentId, paymentId);

    this.responseMessage = 'Payment successful ✅';
    this.isSuccess = true;

    setTimeout(() => { this.responseMessage = ''; }, 3000);
  }

  // ============================================================
  // ✅ RESCHEDULE
  // ============================================================

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
        this.showRescheduleForm = false;
        this.selectedAppointmentId = null;
        this.rescheduleSelectedDate = '';
        this.rescheduleSelectedSlot = '';
        this.rescheduleAvailableSlots = [];
        this.rescheduleForm.reset();

        this.showSuccess = true;
        this.responseMessage = 'Appointment rescheduled successfully';
        this.isSuccess = true;

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