import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-receptionist-appointments',
  templateUrl: './receptionist-appointments.component.html',
  styleUrls: ['./receptionist-appointments.component.scss'],
  providers: [DatePipe]
})
export class ReceptionistAppointmentsComponent implements OnInit {

  appointmentList: any[] = [];
  upcomingAppointments: any[] = [];
  pastAppointments: any[] = [];

  isLoading: boolean = false;
  emptyMessage: string = '';
  responseMessage: string = '';
  isSuccess: boolean = false;

  itemForm!: FormGroup;
  isAdded: boolean = false;
  showSuccess: boolean = false;
  showHistory: boolean = false;

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

  allSlots = [
    { value: '10:00-11:00', label: '10:00 AM - 11:00 AM' },
    { value: '11:00-12:00', label: '11:00 AM - 12:00 PM' },
    { value: '12:00-13:00', label: '12:00 PM - 1:00 PM' },
    { value: '13:00-14:00', label: '1:00 PM - 2:00 PM' },
    { value: '14:00-15:00', label: '2:00 PM - 3:00 PM' },
    { value: '15:00-16:00', label: '3:00 PM - 4:00 PM' },
    { value: '16:00-17:00', label: '4:00 PM - 5:00 PM' }
  ];

  // ✅ Reschedule
  rescheduleDateCards: any[] = [];
  rescheduleSelectedDate: string = '';
  rescheduleSelectedSlot: string = '';
  rescheduleAvailableSlots: string[] = [];
  rescheduleLoadingSlots: boolean = false;
  rescheduleDoctorId: number | null = null;

  constructor(
    private httpService: HttpService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.fb.group({
      id: ['', Validators.required],
      date: ['', Validators.required],
      slot: ['', Validators.required]
    });

    this.generateRescheduleDateCards();
    this.getAppointmentsWithNames();
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

          const patientId = appointment.patientId ||
            appointment.patient?.patientId ||
            appointment.patient?.id ||
            appointment.patient?.userId || '-';

          const doctorId = appointment.doctorId ||
            appointment.doctor?.doctorId ||
            appointment.doctor?.id ||
            appointment.doctor?.userId || '-';

          const patient = patients.find((p: any) =>
            p.patientId == patientId || p.id == patientId || p.userId == patientId
          );

          const doctor = doctors.find((d: any) =>
            d.doctorId == doctorId || d.id == doctorId || d.userId == doctorId
          );

          const patientName = patient?.patientName || patient?.name ||
            patient?.fullName || patient?.userName || patient?.username || '-';

          const doctorName = doctor?.doctorName || doctor?.name ||
            doctor?.fullName || doctor?.userName || doctor?.username || '-';

          const status = appointment.status || appointment.appointmentStatus || 'Scheduled';

          return {
            appointmentId,
            patientId,
            patientName,
            doctorId,
            doctorName,
            appointmentDate: appointment.appointmentDate || null,
            slot: appointment.slot || null,
            status
          };
        });

        // ✅ Split + Sort
        this.splitAppointments();

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

  // ✅ Split + Sort (ascending date + slot)
  splitAppointments(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.upcomingAppointments = this.appointmentList.filter(a => {
      const d = this.parseDate(a.appointmentDate);
      return d !== null && d >= today;
    });

    this.pastAppointments = this.appointmentList.filter(a => {
      const d = this.parseDate(a.appointmentDate);
      return d !== null && d < today;
    });

    // ✅ Upcoming: ASCENDING (date + slot)
    this.upcomingAppointments.sort((a, b) => {
      const dateA = this.parseDate(a.appointmentDate)?.getTime() || 0;
      const dateB = this.parseDate(b.appointmentDate)?.getTime() || 0;
      if (dateA !== dateB) return dateA - dateB;
      return this.getSlotStartHour(a.slot) - this.getSlotStartHour(b.slot);
    });

    // ✅ Past: ASCENDING (date + slot)
    this.pastAppointments.sort((a, b) => {
      const dateA = this.parseDate(a.appointmentDate)?.getTime() || 0;
      const dateB = this.parseDate(b.appointmentDate)?.getTime() || 0;
      if (dateA !== dateB) return dateA - dateB;
      return this.getSlotStartHour(a.slot) - this.getSlotStartHour(b.slot);
    });

    console.log('UPCOMING:', this.upcomingAppointments.length);
    console.log('PAST:', this.pastAppointments.length);
  }

  // ✅ Safe date parser
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

  // ✅ Slot start hour extract
  getSlotStartHour(slot: string): number {
    if (!slot) return 0;
    const hour = parseInt(slot.split(':')[0]);
    return isNaN(hour) ? 0 : hour;
  }

  // ✅ Toggle history
  toggleHistory(): void {
    this.showHistory = !this.showHistory;
  }

  // ✅ Check if today
  isToday(dateStr: string): boolean {
    if (!dateStr) return false;
    const d = this.parseDate(dateStr);
    if (!d) return false;
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }

  isCurrentRow(appointment: any): boolean {
    return Number(this.itemForm.value.id) === Number(appointment.appointmentId);
  }

  editAppointment(appointment: any): void {
    const id = appointment?.appointmentId;
    if (!id || id === '-') return;

    this.isAdded = true;
    this.rescheduleDoctorId = Number(appointment.doctorId) || null;
    this.rescheduleSelectedDate = '';
    this.rescheduleSelectedSlot = '';
    this.rescheduleAvailableSlots = [];
    this.responseMessage = '';

    this.itemForm.patchValue({ id: id, date: '', slot: '' });
  }

  cancelEdit(): void {
    this.isAdded = false;
    this.rescheduleSelectedDate = '';
    this.rescheduleSelectedSlot = '';
    this.rescheduleAvailableSlots = [];
    this.itemForm.reset();
  }

  selectRescheduleDate(dateValue: string): void {
    this.rescheduleSelectedDate = dateValue;
    this.rescheduleSelectedSlot = '';
    this.rescheduleAvailableSlots = [];
    this.itemForm.patchValue({ date: dateValue, slot: '' });

    if (this.rescheduleDoctorId) {
      this.rescheduleLoadingSlots = true;

      this.httpService.getAvailableSlotsForReceptionist(
        this.rescheduleDoctorId, dateValue
      ).subscribe({
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
    this.itemForm.patchValue({ slot: slotValue });
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
    return this.allSlots.filter(
      s => this.isRescheduleSlotAvailable(s.value)
    ).length;
  }

  onSubmit(): void {
    if (!this.rescheduleSelectedDate || !this.rescheduleSelectedSlot) {
      this.responseMessage = 'Please select date and slot';
      this.isSuccess = false;
      return;
    }

    const appointmentId = Number(this.itemForm.value.id);

    const payload = {
      date: this.rescheduleSelectedDate,
      slot: this.rescheduleSelectedSlot
    };

    this.httpService.reScheduleAppointment(appointmentId, payload).subscribe({
      next: () => {
        this.isAdded = false;
        this.rescheduleSelectedDate = '';
        this.rescheduleSelectedSlot = '';
        this.rescheduleAvailableSlots = [];
        this.itemForm.reset();

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
        console.error('Reschedule error:', err);
        this.responseMessage = err.error?.message || 'Reschedule failed ❌';
        this.isSuccess = false;
        setTimeout(() => { this.responseMessage = ''; }, 3000);
      }
    });
  }
}