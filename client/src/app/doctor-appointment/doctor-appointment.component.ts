import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-doctor-appointment',
  templateUrl: './doctor-appointment.component.html',
  styleUrls: ['./doctor-appointment.component.scss']
})
export class DoctorAppointmentComponent implements OnInit {

  appointmentList: any[] = [];

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.getAppointments();
  }

  // ✅ Doctor fees by specialty
  getDoctorFees(specialty: string): number {
    const feesMap: any = {
      'cardiology': 1500, 'cardio': 1500, 'cardiac': 1500, 'cardic': 1500,
      'neurology': 2000, 'orthopedics': 1200, 'dermatology': 800,
      'pediatrics': 700, 'general': 500, 'webing': 600, 'ent': 900
    };
    return feesMap[(specialty || 'general').toLowerCase()] || 500;
  }

  // ✅ Payment status from localStorage
  getPaymentStatus(appointmentId: any): string {
    return localStorage.getItem('payment_' + appointmentId) || 'NOT PAID';
  }

  // ✅ Payment mode from localStorage
  getPaymentMode(appointmentId: any): string {
    const mode = localStorage.getItem('paymode_' + appointmentId);
    if (mode === 'ONLINE') return '💻 Paid Online';
    if (mode === 'OFFLINE') return '🏥 Pay at Hospital';
    const status = this.getPaymentStatus(appointmentId);
    if (status === 'PAID') return '💻 Paid Online';
    return '⏳ Awaiting Payment';
  }

  getAppointments(): void {
    const userId = localStorage.getItem('userId');

    if (userId) {
      this.httpService.getAppointmentByDoctor(userId).subscribe({
        next: (response: any) => {
          const list = response?.data || response || [];

          this.appointmentList = list.map((a: any) => {
            const rawTime =
              a.time || a.appointmentTime || a.appointmentDateTime || a.dateTime || null;

            return {
              ...a,
              appointmentTime: this.parseBackendDateTimeToLocal(rawTime),
              rawAppointmentTime: rawTime
            };
          });

          console.log('Doctor appointments:', this.appointmentList);
        },
        error: (error: any) => {
          console.error('Error fetching doctor appointments:', error);
        }
      });
    } else {
      console.error('User ID not found in localStorage');
    }
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