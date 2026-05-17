import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-receptionist-schedule-appointments',
  templateUrl: './receptionist-schedule-appointments.component.html',
  styleUrls: ['./receptionist-schedule-appointments.component.scss']
})
export class ReceptionistScheduleAppointmentsComponent implements OnInit {

  itemForm!: FormGroup;
  responseMessage: string = '';
  isAdded: boolean = false;
  submitting: boolean = false;
  showSuccess: boolean = false;

  patientList: any[] = [];
  doctorList: any[] = [];

  selectedDoctor: any = null;
  paymentMode: string = 'OFFLINE';

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

  // ✅ Date cards
  dateCards: any[] = [];
  selectedDate: string = '';

  constructor(
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemForm = this.formBuilder.group({
      patientId: ['', Validators.required],
      doctorId: ['', Validators.required],
      date: ['', Validators.required],
      slot: ['', Validators.required]
    });

    this.getPatients();
    this.getDoctors();
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

  getPatients() {
    this.httpService.getAllPatients().subscribe({
      next: (data: any) => { this.patientList = data.data || data; },
      error: (error) => { console.error('Error loading patients:', error); }
    });
  }

  getDoctors() {
    this.httpService.getAllDoctors().subscribe({
      next: (data: any) => {
        const doctors = data.data || data;
        this.doctorList = doctors.filter((doc: any) => doc.availability?.toLowerCase() === 'yes');
      },
      error: (error) => { console.error('Error loading doctors:', error); }
    });
  }

  onDoctorChange(): void {
    const doctorId = this.itemForm.get('doctorId')?.value;
    this.selectedDoctor = this.doctorList.find((d: any) => (d.doctorId || d.id) == doctorId) || null;

    this.selectedSlot = '';
    this.availableSlots = [];
    this.itemForm.patchValue({ slot: '' });
    this.loadSlots();
  }

  // ✅ Select date card
  selectDate(dateValue: string): void {
    this.selectedDate = dateValue;
    this.selectedSlot = '';
    this.availableSlots = [];
    this.itemForm.patchValue({ date: dateValue, slot: '' });
    this.loadSlots();
  }

  // ✅ Load slots
  loadSlots(): void {
    const date = this.itemForm.get('date')?.value;
    const doctorId = this.itemForm.get('doctorId')?.value;

    if (date && doctorId) {
      this.loadingSlots = true;
      this.selectedSlot = '';
      this.itemForm.patchValue({ slot: '' });

      this.httpService.getAvailableSlotsForReceptionist(doctorId, date).subscribe({
        next: (slots: string[]) => { this.availableSlots = slots; this.loadingSlots = false; },
        error: (err) => { console.error(err); this.availableSlots = []; this.loadingSlots = false; }
      });
    }
  }

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
    const selectedDate = this.itemForm.get('date')?.value;
    if (!selectedDate) return false;
    const today = new Date();
    const selected = new Date(selectedDate + 'T00:00:00');
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

  getDateLabel(dateValue: string): string {
    const card = this.dateCards.find(d => d.value === dateValue);
    return card ? `${card.dayName}, ${card.dayNum} ${card.month}` : dateValue;
  }

  onSubmit() {
    this.responseMessage = '';

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      this.responseMessage = 'Please fill all fields and select a slot';
      this.isAdded = false;
      return;
    }

    this.submitting = true;

    const appointmentData = {
      patientId: this.itemForm.value.patientId,
      doctorId: this.itemForm.value.doctorId,
      date: this.itemForm.value.date,
      slot: this.itemForm.value.slot
    };

    this.httpService.ScheduleAppointmentByReceptionist(appointmentData).subscribe({
      next: (data: any) => {
        const appointmentId = data?.id || data?.appointmentId || Date.now();
        localStorage.setItem('payment_' + appointmentId, this.paymentMode === 'ONLINE' ? 'PAID' : 'NOT PAID');
        localStorage.setItem('paymode_' + appointmentId, this.paymentMode);

        this.itemForm.reset();
        this.submitting = false;
        this.isAdded = true;
        this.showSuccess = true;
        this.selectedSlot = '';
        this.selectedDate = '';
        this.availableSlots = [];
        this.selectedDoctor = null;
        this.responseMessage = 'Appointment Saved Successfully';

        setTimeout(() => {
          this.showSuccess = false;
          this.responseMessage = '';
          this.router.navigate(['/dashboard']);
        }, 3000);
      },
      error: (error) => {
        console.error(error);
        this.submitting = false;
        this.isAdded = false;

        if (error.status === 400) {
          this.responseMessage = error.error?.message || 'Slot already booked!';
        } else if (error.status === 404) {
          this.responseMessage = 'Invalid Patient or Doctor';
        } else {
          this.responseMessage = 'Appointment not saved';
        }
      }
    });
  }
}