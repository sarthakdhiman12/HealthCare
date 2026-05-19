import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { DashbaordComponent } from './dashbaord/dashbaord.component';
import { PatientAppointmentComponent } from './patient-appointment/patient-appointment.component';
import { ScheduleAppointmentComponent } from './schedule-appointment/schedule-appointment.component';
import { DoctorAppointmentComponent } from './doctor-appointment/doctor-appointment.component';
import { DoctorAvailabilityComponent } from './doctor-availability/doctor-availability.component';
import { ReceptionistAppointmentsComponent } from './receptionist-appointments/receptionist-appointments.component';
import { ReceptionistScheduleAppointmentsComponent } from './receptionist-schedule-appointments/receptionist-schedule-appointments.component';
import { PatientRecordsComponent } from './medical-record/patient-records.component';


import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [

  // ================= PUBLIC =================
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },

  // ================= AUTHENTICATED (any role) =================
  {
    path: 'dashboard',
    component: DashbaordComponent,
    canActivate: [AuthGuard]
  },

  // ================= PATIENT ONLY =================
  {
    path: 'patient-appointment',
    component: PatientAppointmentComponent,
    canActivate: [RoleGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'schedule-appointment',
    component: ScheduleAppointmentComponent,
    canActivate: [RoleGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'patient-records',
    component: PatientRecordsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['PATIENT'] }
  },

  // ================= DOCTOR ONLY =================
  {
    path: 'doctor-appointment',
    component: DoctorAppointmentComponent,
    canActivate: [RoleGuard],
    data: { roles: ['DOCTOR'] }
  },
  {
    path: 'doctor-availability',
    component: DoctorAvailabilityComponent,
    canActivate: [RoleGuard],
    data: { roles: ['DOCTOR'] }
  },

  // ================= RECEPTIONIST ONLY =================
  {
    path: 'receptionist-appointments',
    component: ReceptionistAppointmentsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['RECEPTIONIST'] }
  },
  {
    path: 'receptionist-schedule-appointments',
    component: ReceptionistScheduleAppointmentsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['RECEPTIONIST'] }
  },

  // ================= REDIRECTS =================
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}