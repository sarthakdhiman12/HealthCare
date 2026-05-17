import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-receptionist-appointments',
  templateUrl: './receptionist-appointments.component.html',
  styleUrls: ['./receptionist-appointments.component.scss'],
  providers: [DatePipe]
})
export class ReceptionistAppointmentsComponent implements OnInit {

  appointmentList: any[] = [];

  isLoading: boolean = false;
  emptyMessage: string = '';
  responseMessage: string = '';
  isSuccess: boolean = false;

  itemForm!: FormGroup;
  isAdded: boolean = false;

  constructor(
    private httpService: HttpService,
    private datePipe: DatePipe,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      id: ['', Validators.required],
      time: ['', Validators.required]
    });

    this.getAppointmentsWithNames();
  }

  // ✅ Payment helpers
  getPaymentStatus(appointmentId: any): string {
    return localStorage.getItem('payment_' + appointmentId) || 'NOT PAID';
  }

  getPaymentMode(appointmentId: any): string {
    const mode = localStorage.getItem('paymode_' + appointmentId);
    if (mode === 'ONLINE') return '💻 Online';
    if (mode === 'OFFLINE') return '🏥 At Hospital';
    return '—';
  }

  getAppointmentsWithNames(): void {
    this.isLoading = true;
    this.emptyMessage = '';

    forkJoin({
      appointments: this.httpService.getAllAppointments(),
      patients: this.httpService.getAllPatients(),
      doctors: this.httpService.getAllDoctors()
    }).subscribe({
      next: (res: any) => {
        const appointments = res.appointments?.data || res.appointments || [];
        const patients = res.patients?.data || res.patients || [];
        const doctors = res.doctors?.data || res.doctors || [];

        this.appointmentList = appointments.map((appointment: any) => {

          const appointmentId = appointment.appointmentId || appointment.id || '-';

          const patientId =
            appointment.patientId ||
            appointment.patient?.patientId ||
            appointment.patient?.id ||
            appointment.patient?.userId || '-';

          const doctorId =
            appointment.doctorId ||
            appointment.doctor?.doctorId ||
            appointment.doctor?.id ||
            appointment.doctor?.userId || '-';

          const patient = patients.find((p: any) =>
            p.patientId == patientId || p.id == patientId || p.userId == patientId
          );

          const doctor = doctors.find((d: any) =>
            d.doctorId == doctorId || d.id == doctorId || d.userId == doctorId
          );

          const patientName =
            patient?.patientName || patient?.name || patient?.fullName ||
            patient?.userName || patient?.username || patient?.firstName || '-';

          const doctorName =
            doctor?.doctorName || doctor?.name || doctor?.fullName ||
            doctor?.userName || doctor?.username || doctor?.firstName || '-';

          const rawTime =
            appointment.time || appointment.appointmentTime ||
            appointment.appointmentDateTime || appointment.dateTime || null;

          const parsedTime = this.parseBackendDateTimeToLocal(rawTime);

          const status = appointment.status || appointment.appointmentStatus || 'Scheduled';

          return {
            appointmentId, patientId, patientName,
            doctorId, doctorName,
            appointmentTime: parsedTime,
            rawAppointmentTime: rawTime,
            status
          };
        });

        this.isLoading = false;

        if (this.appointmentList.length === 0) {
          this.emptyMessage = 'No appointments found';
        }
      },
      error: (err: any) => {
        console.error('Error loading appointments:', err);
        this.isLoading = false;
        this.emptyMessage = 'Unable to load appointments';
      }
    });
  }

  isCurrentRow(appointment: any): boolean {
    return Number(this.itemForm.value.id) === Number(appointment.appointmentId);
  }

  editAppointment(appointment: any): void {
    const id = appointment?.appointmentId;
    if (!id || id === '-') return;

    this.isAdded = true;

    const current: Date = appointment?.appointmentTime instanceof Date
      ? appointment.appointmentTime
      : new Date();

    this.itemForm.patchValue({
      id: id,
      time: this.formatDateForInput(current)
    });
  }

  cancelEdit(): void {
    this.isAdded = false;
    this.itemForm.reset();
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const appointmentId = Number(this.itemForm.value.id);
    const selected = new Date(this.itemForm.value.time);
    const now = new Date();

    if (selected <= now) {
      this.responseMessage = 'Please select a future date/time.';
      this.isSuccess = false;
      return;
    }

    const payload = {
      time: this.datePipe.transform(selected, 'yyyy-MM-dd HH:mm:ss')
    };

    this.httpService.reScheduleAppointment(appointmentId, payload).subscribe({
      next: () => {
        this.responseMessage = 'Appointment rescheduled successfully ✅';
        this.isSuccess = true;
        this.isAdded = false;
        this.itemForm.reset();
        this.getAppointmentsWithNames();
        setTimeout(() => { this.responseMessage = ''; }, 2000);
      },
      error: (err: any) => {
        console.error('Reschedule error:', err);
        this.responseMessage = 'Reschedule failed ❌';
        this.isSuccess = false;
        setTimeout(() => { this.responseMessage = ''; }, 2000);
      }
    });
  }

  formatDateTime(dateTime: any): string {
    if (!dateTime) return '-';
    return this.datePipe.transform(dateTime, 'dd MMM yyyy, hh:mm a') || '-';
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