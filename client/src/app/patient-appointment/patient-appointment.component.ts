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

  // ✅ MEDICAL RECORDS
  medicalRecords: any[] = [];
  showRecords: boolean = false;
  loadingRecords: boolean = false;

  constructor(
    public httpService: HttpService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.rescheduleForm = this.fb.group({
      date: ['', Validators.required],
      slot: ['', Validators.required]
    });

    this.generateRescheduleDateCards();
    this.getAppointments();
    this.loadMedicalRecords();
  }

  // ============================================================
  // ✅ MEDICAL RECORDS
  // ============================================================

  loadMedicalRecords(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    this.loadingRecords = true;

    this.httpService.getMedicalRecords(Number(userId)).subscribe({
      next: (res: any) => {
        this.medicalRecords = res?.data || res || [];
        this.loadingRecords = false;
        console.log('Medical Records:', this.medicalRecords);
      },
      error: (err: any) => {
        console.error('Error loading medical records:', err);
        this.medicalRecords = [];
        this.loadingRecords = false;
      }
    });
  }

  toggleRecords(): void {
    this.showRecords = !this.showRecords;
  }

  getRecordDate(record: any): string {
    if (!record?.recordDate) return 'N/A';
    try {
      const d = new Date(record.recordDate);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  }

  // ✅ Download PDF — using browser print (NO npm install needed)
  downloadPDF(record: any): void {
    const patientName = record.patient?.username || 'Patient';
    const doctorName = record.doctor?.username || 'Doctor';
    const specialty = record.doctor?.specialty || 'General';
    const diagnosis = record.diagnosis || 'N/A';
    const treatment = record.treatment || 'N/A';
    const recordDate = this.getRecordDate(record);
    const recordId = record.id || 'N/A';

    const printContent = `
      <html>
      <head>
        <title>Medical Report - ${patientName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; }

          .header {
            text-align: center; padding-bottom: 20px;
            border-bottom: 3px solid #0d6efd; margin-bottom: 30px;
          }
          .header h1 { color: #0d6efd; font-size: 28px; margin-bottom: 4px; }
          .header p { color: #666; font-size: 13px; }
          .header .hospital-icon { font-size: 40px; margin-bottom: 8px; }

          .report-id { text-align: right; color: #888; font-size: 12px; margin-bottom: 20px; }

          .section { margin-bottom: 24px; }
          .section-title {
            font-size: 14px; font-weight: 700; color: #0d6efd;
            text-transform: uppercase; letter-spacing: 1px;
            margin-bottom: 10px; padding-bottom: 6px;
            border-bottom: 1px solid #e0e0e0;
          }

          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .info-item { padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #0d6efd; }
          .info-item label { font-size: 11px; color: #888; text-transform: uppercase; display: block; margin-bottom: 2px; }
          .info-item p { font-size: 15px; font-weight: 600; color: #1a1a2e; }

          .detail-box {
            padding: 16px; background: #f0f7ff; border-radius: 10px;
            border: 1px solid #d0e3ff; margin-bottom: 12px;
          }
          .detail-box label { font-size: 11px; color: #0d6efd; text-transform: uppercase; display: block; margin-bottom: 6px; font-weight: 700; }
          .detail-box p { font-size: 14px; color: #333; line-height: 1.7; white-space: pre-wrap; }

          .footer {
            margin-top: 40px; padding-top: 20px;
            border-top: 2px solid #e0e0e0; text-align: center;
          }
          .footer p { color: #888; font-size: 11px; }
          .footer .disclaimer { font-style: italic; margin-top: 6px; color: #aaa; font-size: 10px; }

          .stamp-area {
            margin-top: 40px; display: flex; justify-content: space-between;
          }
          .stamp-box { text-align: center; min-width: 200px; }
          .stamp-box .line { border-top: 1px solid #333; margin-bottom: 6px; }
          .stamp-box p { font-size: 12px; color: #555; }

          @media print {
            body { padding: 20px; }
            @page { margin: 15mm; }
          }
        </style>
      </head>
      <body>

        <div class="header">
          <div class="hospital-icon">🏥</div>
          <h1>HAM System</h1>
          <p>Healthcare Appointment Management System</p>
          <p>123 Medical Avenue, Suite 500, Mumbai, Maharashtra 400001</p>
          <p>Phone: +91 98765 43210 | Email: info@hamsystem.com</p>
        </div>

        <div class="report-id">Report ID: #MR-${recordId} | Generated: ${new Date().toLocaleDateString('en-IN')}</div>

        <div class="section">
          <div class="section-title">Patient & Doctor Information</div>
          <div class="info-grid">
            <div class="info-item">
              <label>Patient Name</label>
              <p>${patientName}</p>
            </div>
            <div class="info-item">
              <label>Doctor Name</label>
              <p>${doctorName}</p>
            </div>
            <div class="info-item">
              <label>Specialty</label>
              <p>${specialty}</p>
            </div>
            <div class="info-item">
              <label>Report Date</label>
              <p>${recordDate}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Diagnosis</div>
          <div class="detail-box">
            <label>Doctor's Diagnosis</label>
            <p>${diagnosis}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Treatment Plan</div>
          <div class="detail-box">
            <label>Prescribed Treatment</label>
            <p>${treatment}</p>
          </div>
        </div>

        <div class="stamp-area">
          <div class="stamp-box">
            <div class="line"></div>
            <p>Patient Signature</p>
          </div>
          <div class="stamp-box">
            <div class="line"></div>
            <p>Dr. ${doctorName}</p>
            <p style="font-size:10px; color:#888;">${specialty}</p>
          </div>
        </div>

        <div class="footer">
          <p>HAM System - Healthcare Appointment Management</p>
          <p class="disclaimer">This is a computer-generated report. For verification, contact the hospital administration.</p>
        </div>

      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }

  // ============================================================
  // ✅ EXISTING METHODS (unchanged)
  // ============================================================

  generateRescheduleDateCards(): void {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
      theme: { color: '#0d6efd' },
      handler: (response: any) => {
        this.ngZone.run(() => {
          this.onPaymentSuccess(response, appointment);
        });
      },
      modal: {
        ondismiss: () => {
          this.ngZone.run(() => {
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
        this.markAsPaid(appointment, response.razorpay_payment_id);
      },
      error: (err: any) => {
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
        this.responseMessage = err.error?.message || 'Reschedule failed ❌';
        this.isSuccess = false;
        setTimeout(() => { this.responseMessage = ''; }, 3000);
      }
    });
  }
}