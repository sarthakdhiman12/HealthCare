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

  getAppointments(): void {
    const userId = localStorage.getItem('userId');

    if (userId) {
      this.httpService.getAppointmentByDoctor(userId).subscribe({
        next: (response: any) => {
          this.appointmentList = response;
        },
        error: (error: any) => {
          console.error('Error fetching doctor appointments:', error);
        }
      });
    } else {
      console.error('User ID not found in localStorage');
    }
  }
}