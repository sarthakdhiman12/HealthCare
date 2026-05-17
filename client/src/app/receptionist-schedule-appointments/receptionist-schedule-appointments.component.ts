import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-receptionist-schedule-appointments',
  templateUrl: './receptionist-schedule-appointments.component.html',
  styleUrls: ['./receptionist-schedule-appointments.component.scss'],
  providers: [DatePipe]
})
export class ReceptionistScheduleAppointmentsComponent implements OnInit {

  itemForm: FormGroup;
  responseMessage: any;
  isAdded: boolean = false;
  submitting: boolean = false;
  showSuccess: boolean = false;

  patientList: any[] = [];
  doctorList: any[] = [];

  selectedDoctor: any = null;
  paymentMode: string = 'OFFLINE';

  constructor(
    public httpService: HttpService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private router: Router
  ) {
    this.itemForm = this.formBuilder.group({
      patientId: ['', [Validators.required]],
      doctorId: ['', [Validators.required]],
      time: ['', [Validators.required, this.futureDateValidator]]
    });
  }

  ngOnInit(): void {
    this.getPatients();
    this.getDoctors();
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
      next: (data: any) => {
        this.patientList = data.data || data;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
      }
    });
  }

  getDoctors() {
    this.httpService.getAllDoctors().subscribe({
      next: (data: any) => {
        const doctors = data.data || data;
        this.doctorList = doctors.filter((doc: any) =>
          doc.availability?.toLowerCase() === 'yes'
        );
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
      }
    });
  }

  onDoctorChange(): void {
    const doctorId = this.itemForm.get('doctorId')?.value;
    this.selectedDoctor = this.doctorList.find(
      (d: any) => (d.doctorId || d.id) == doctorId
    ) || null;
  }

  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const currentDate = new Date();
    if (selectedDate <= currentDate) return { pastTime: true };
    return null;
  }

  onSubmit() {
    this.responseMessage = '';

    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      if (this.itemForm.controls['time'].hasError('pastTime')) {
        this.responseMessage = 'Appointment time should be greater than current time';
      } else {
        this.responseMessage = 'Please select patient, doctor and appointment time';
      }
      this.isAdded = false;
      return;
    }

    this.submitting = true;

    const formattedTime = this.datePipe.transform(
      this.itemForm.controls['time'].value,
      'yyyy-MM-dd HH:mm:ss'
    );

    const appointmentData = {
      patientId: this.itemForm.value.patientId,
      doctorId: this.itemForm.value.doctorId,
      time: formattedTime
    };

    // ✅ Save payment info to localStorage
    const appointmentKey = `recept_pay_${appointmentData.patientId}_${appointmentData.doctorId}_${formattedTime}`;

    this.httpService.ScheduleAppointmentByReceptionist(appointmentData)
      .subscribe({
        next: (data: any) => {
          // ✅ Save payment mode
          const appointmentId = data?.id || data?.appointmentId || Date.now();
          localStorage.setItem('payment_' + appointmentId, this.paymentMode === 'ONLINE' ? 'PAID' : 'NOT PAID');
          localStorage.setItem('paymode_' + appointmentId, this.paymentMode);

          this.itemForm.reset();
          this.submitting = false;
          this.isAdded = true;
          this.showSuccess = true;
          this.responseMessage = 'Appointment Saved Successfully';

          setTimeout(() => {
            this.showSuccess = false;
            this.responseMessage = '';
            this.router.navigate(['/dashboard']);
          }, 3000);
        },
        error: (error) => {
          console.error('Error scheduling appointment:', error);
          this.submitting = false;
          this.isAdded = false;

          if (error.status === 404) {
            this.responseMessage = 'Invalid Patient or Doctor selected';
          } else if (error.status === 400) {
            this.responseMessage = error.error?.message || 'Invalid appointment details';
          } else {
            this.responseMessage = 'Appointment not saved';
          }
        }
      });
  }
}