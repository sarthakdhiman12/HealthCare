import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-schedule-appointment',
  templateUrl: './schedule-appointment.component.html',
  styleUrls: ['./schedule-appointment.component.scss']
})
export class ScheduleAppointmentComponent implements OnInit {

  doctorList: any[] = [];
  selectedDoctor: any = null;

  itemForm!: FormGroup;

  responseMessage: string = '';
  isAdded: boolean = false;
  submitting: boolean = false;
  showSuccess: boolean = false;

  // ✅ Slot system
  allSlots = [
    { value: '10:00-11:00', label: '10:00 AM - 11:00 AM' },
    { value: '11:00-12:00', label: '11:00 AM - 12:00 PM' },
    { value: '12:00-13:00', label: '12:00 PM - 1:00 PM' },
    { value: '13:00-14:00', label: '1:00 PM - 2:00 PM' },
    { value: '14:00-15:00', label: '2:00 PM - 3:00 PM' },
    { value: '15:00-16:00', label: '3:00 PM - 4:00 PM' },
    { value: '16:00-17:00', label: '4:00 PM - 5:00 PM' }
  ];
  availableSlots: string[] = [];
  selectedSlot: string = '';
  loadingSlots: boolean = false;

  // ✅ Date cards (next 7 days)
  dateCards: any[] = [];
  selectedDate: string = '';

  constructor(
    private httpService: HttpService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getDoctors();

    this.itemForm = this.fb.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      date: ['', Validators.required],
      slot: ['', Validators.required]
    });

    // ✅ Generate next 7 days
    this.generateDateCards();
  }

  // ✅ Generate 7 date cards
  generateDateCards(): void {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    this.dateCards = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);

      this.dateCards.push({
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

  getDoctorFees(specialty: string): number {
    const feesMap: any = {
      'cardiology': 1500, 'cardio': 1500, 'cardiac': 1500, 'cardic': 1500,
      'neurology': 2000, 'orthopedics': 1200, 'dermatology': 800,
      'pediatrics': 700, 'general': 500, 'webing': 600, 'ent': 900
    };
    return feesMap[(specialty || 'general').toLowerCase()] || 500;
  }

  getDoctors(): void {
    this.httpService.getDoctors().subscribe({
      next: (res: any) => { this.doctorList = res; },
      error: (err: any) => { console.error(err); }
    });
  }

  addAppointment(doc: any): void {
    const userId = Number(localStorage.getItem('userId'));
    this.selectedDoctor = doc;

    this.itemForm.patchValue({
      doctorId: doc.id,
      patientId: userId
    });

    // ✅ Reset
    this.selectedSlot = '';
    this.selectedDate = '';
    this.availableSlots = [];
    this.itemForm.patchValue({ date: '', slot: '' });
    this.responseMessage = '';

    this.isAdded = true;
  }

  cancelBooking(): void {
    this.isAdded = false;
    this.selectedDoctor = null;
    this.selectedSlot = '';
    this.selectedDate = '';
    this.availableSlots = [];
    this.responseMessage = '';
  }

  // ✅ Select a date card
  selectDate(dateValue: string): void {
    this.selectedDate = dateValue;
    this.selectedSlot = '';
    this.availableSlots = [];
    this.itemForm.patchValue({ date: dateValue, slot: '' });

    const doctorId = this.itemForm.get('doctorId')?.value;

    if (doctorId) {
      this.loadingSlots = true;
      this.responseMessage = '';

      this.httpService.getAvailableSlots(doctorId, dateValue).subscribe({
        next: (slots: string[]) => {
          this.availableSlots = slots;
          this.loadingSlots = false;
        },
        error: (err) => {
          console.error('Error loading slots:', err);
          this.availableSlots = [];
          this.loadingSlots = false;
        }
      });
    }
  }

  // ✅ Select a slot
  selectSlot(slotValue: string): void {
    if (!this.isSlotAvailable(slotValue)) return;

    this.selectedSlot = slotValue;
    this.itemForm.patchValue({ slot: slotValue });
  }

  isSlotAvailable(slotValue: string): boolean {
    if (!this.availableSlots.includes(slotValue)) return false;
    if (this.isSlotPast(slotValue)) return false;
    return true;
  }

  isSlotBooked(slotValue: string): boolean {
    return !this.availableSlots.includes(slotValue);
  }

  isSlotPast(slotValue: string): boolean {
    if (!this.selectedDate) return false;

    const today = new Date();
    const selected = new Date(this.selectedDate + 'T00:00:00');

    if (selected.toDateString() === today.toDateString()) {
      const slotStartHour = parseInt(slotValue.split(':')[0]);
      return today.getHours() >= slotStartHour;
    }
    return false;
  }

  getAvailableCount(): number {
    return this.allSlots.filter(s => this.isSlotAvailable(s.value)).length;
  }

  getSlotLabel(value: string): string {
    const slot = this.allSlots.find(s => s.value === value);
    return slot ? slot.label : value;
  }

  // ✅ Get display date for summary
  getDateLabel(dateValue: string): string {
    const card = this.dateCards.find(d => d.value === dateValue);
    return card ? `${card.dayName}, ${card.dayNum} ${card.month}` : dateValue;
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.responseMessage = '';

    this.httpService.ScheduleAppointment(this.itemForm.value).subscribe({
      next: () => {
        this.isAdded = false;
        this.submitting = false;
        this.showSuccess = true;
        this.responseMessage = 'Appointment Scheduled Successfully';
        this.itemForm.reset();
        this.selectedSlot = '';
        this.selectedDate = '';
        this.availableSlots = [];

        setTimeout(() => {
          this.showSuccess = false;
          this.responseMessage = '';
          this.router.navigate(['/dashboard']);
        }, 3000);
      },
      error: (err: any) => {
        console.error(err);
        this.submitting = false;
        this.responseMessage = err.error?.message || 'Failed to schedule appointment. Slot may already be booked.';
      }
    });
  }
}