import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-doctor-appointment',
  templateUrl: './doctor-appointment.component.html',
  styleUrls: ['./doctor-appointment.component.scss']
})
export class DoctorAppointmentComponent implements OnInit {

  allAppointments: any[] = [];
  upcomingAppointments: any[] = [];
  pastAppointments: any[] = [];

  showHistory: boolean = false;
  responseMessage: string = '';

  // ✅ Slot labels
  slotLabels: any = {
    '10:00-11:00': '10:00 AM - 11:00 AM',
    '11:00-12:00': '11:00 AM - 12:00 PM',
    '12:00-13:00': '12:00 PM - 1:00 PM',
    '13:00-14:00': '1:00 PM - 2:00 PM',
    '14:00-15:00': '2:00 PM - 3:00 PM',
    '15:00-16:00': '3:00 PM - 4:00 PM',
    '16:00-17:00': '4:00 PM - 5:00 PM'
  };

  constructor(public httpService: HttpService) {}

  ngOnInit(): void {
    this.getAppointments();
  }

  getAppointments(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.responseMessage = 'Doctor not found. Please login again.';
      return;
    }

    this.httpService.getAppointmentByDoctor(Number(userId)).subscribe({
      next: (data: any) => {
        const list = data?.data || data || [];

        this.allAppointments = list.map((a: any) => {
          const appointmentId = a.id || a.appointmentId;
          const paymentKey = 'payment_' + appointmentId;
          const savedPayment = localStorage.getItem(paymentKey);

          return {
            ...a,
            paymentStatus: savedPayment || a.paymentStatus || 'NOT PAID'
          };
        });

        // ✅ Sort by date (newest first)
        this.allAppointments.sort((a, b) => {
          const dateA = new Date(a.appointmentDate + 'T00:00:00').getTime();
          const dateB = new Date(b.appointmentDate + 'T00:00:00').getTime();
          return dateB - dateA;
        });

        // ✅ Split into upcoming & past
        this.splitAppointments();
      },
      error: (err: any) => {
        console.error('Error loading appointments:', err);
        this.allAppointments = [];
        this.upcomingAppointments = [];
        this.pastAppointments = [];
        this.responseMessage = 'Failed to load appointments';
      }
    });
  }

  // ✅ Split appointments into upcoming (today + future) and past
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

    // ✅ Upcoming: ASCENDING (date + slot)
    this.upcomingAppointments.sort((a, b) => {
      const dateA = this.parseDate(a.appointmentDate)?.getTime() || 0;
      const dateB = this.parseDate(b.appointmentDate)?.getTime() || 0;

      if (dateA !== dateB) return dateA - dateB;

      // ✅ Same date → sort by slot time
      const slotA = this.getSlotStartHour(a.slot);
      const slotB = this.getSlotStartHour(b.slot);
      return slotA - slotB;
    });

    // ✅ Past: ASCENDING (date + slot)
    this.pastAppointments.sort((a, b) => {
      const dateA = this.parseDate(a.appointmentDate)?.getTime() || 0;
      const dateB = this.parseDate(b.appointmentDate)?.getTime() || 0;

      if (dateA !== dateB) return dateA - dateB;

      const slotA = this.getSlotStartHour(a.slot);
      const slotB = this.getSlotStartHour(b.slot);
      return slotA - slotB;
    });

    console.log('UPCOMING:', this.upcomingAppointments.length);
    console.log('PAST:', this.pastAppointments.length);
  }
  // ✅ Extract start hour from slot like "10:00-11:00" → 10
  getSlotStartHour(slot: string): number {
    if (!slot) return 0;
    const hour = parseInt(slot.split(':')[0]);
    return isNaN(hour) ? 0 : hour;
  }
  // ✅ Toggle history
  toggleHistory(): void {
    this.showHistory = !this.showHistory;
  }

  getSlotLabel(slot: string): string {
    if (!slot) return 'N/A';
    return this.slotLabels[slot] || slot;
  }

  getReadableDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) return dateStr;
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      };
      return d.toLocaleDateString('en-IN', options);
    } catch (e) {
      return dateStr;
    }
  }

  getDoctorFees(specialty: string): number {
    const feesMap: any = {
      'cardiology': 1500, 'cardio': 1500, 'cardiac': 1500, 'cardic': 1500,
      'neurology': 2000, 'neuro': 2000, 'orthopedics': 1200,
      'dermatology': 800, 'pediatrics': 700, 'general': 500,
      'webing': 600, 'ent': 900
    };
    return feesMap[(specialty || 'general').toLowerCase()] || 500;
  }

  getPaymentStatus(appointmentId: any): string {
    if (!appointmentId) return 'NOT PAID';
    return localStorage.getItem('payment_' + appointmentId) || 'NOT PAID';
  }

  getPaymentMode(appointmentId: any): string {
    if (!appointmentId) return '—';
    const mode = localStorage.getItem('paymode_' + appointmentId);
    if (mode === 'ONLINE') return '💻 Online';
    if (mode === 'OFFLINE') return '🏥 Cash/Hospital';
    return '—';
  }

  // ✅ Check if date is today
  isToday(dateStr: string): boolean {
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    return d.toDateString() === today.toDateString();
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
}