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

  patientList: any[] = [];
  doctorList: any[] = [];

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

  getPatients() {
  this.httpService.getAllPatients().subscribe({
    next: (data: any) => {
      console.log('Patients API Response:', data);
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
      console.log('Doctors API Response:', data);

      const doctors = data.data || data;

      // ✅ Only doctors with availability = YES
      this.doctorList = doctors.filter((doc: any) =>
        doc.availability?.toLowerCase() === 'yes'
      );
    },
    error: (error) => {
      console.error('Error loading doctors:', error);
    }
  });
}

  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const currentDate = new Date();

    if (selectedDate <= currentDate) {
      return { pastTime: true };
    }

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

    const formattedTime = this.datePipe.transform(
      this.itemForm.controls['time'].value,
      'yyyy-MM-dd HH:mm:ss'
    );

    const appointmentData = {
      patientId: this.itemForm.value.patientId,
      doctorId: this.itemForm.value.doctorId,
      time: formattedTime
    };

    this.httpService.ScheduleAppointmentByReceptionist(appointmentData)
      .subscribe({
        next: (data) => {
          this.itemForm.reset();
          this.responseMessage = 'Appointment Saved Successfully';
          this.isAdded = true;

          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error scheduling appointment:', error);

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