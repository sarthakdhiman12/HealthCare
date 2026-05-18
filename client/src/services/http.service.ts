import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  public serverName = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getJsonHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ================= AUTH =================

  registerPatient(details: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/patient/register`,
      details,
      { headers: this.getJsonHeaders() }
    );
  }

  registerDoctors(details: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/doctors/register`,
      details,
      { headers: this.getJsonHeaders() }
    );
  }

  registerReceptionist(details: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/receptionist/register`,
      details,
      { headers: this.getJsonHeaders() }
    );
  }

  Login(details: any): Observable<any> {
    return this.http.post(
      `${this.serverName}/api/user/login`,
      details,
      { headers: this.getJsonHeaders() }
    );
  }

  // ================= PATIENT =================

  getDoctors(): Observable<any> {
    return this.http.get(
      `${this.serverName}/api/patient/doctors`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ UPDATED: Slot-based booking
  ScheduleAppointment(details: any): Observable<any> {
    const params = new HttpParams()
      .set('patientId', details.patientId)
      .set('doctorId', details.doctorId)
      .set('date', details.date)
      .set('slot', details.slot);

    return this.http.post(
      `${this.serverName}/api/patient/appointment`,
      {},
      { headers: this.getAuthHeaders(), params }
    );
  }

  // ✅ NEW: Get available slots (patient)
  getAvailableSlots(doctorId: any, date: string): Observable<any> {
    const params = new HttpParams()
      .set('doctorId', doctorId)
      .set('date', date);

    return this.http.get(
      `${this.serverName}/api/patient/available-slots`,
      { headers: this.getAuthHeaders(), params }
    );
  }

  getAppointmentByPatient(patientId: any): Observable<any> {
    const params = new HttpParams().set('patientId', patientId);
    return this.http.get(
      `${this.serverName}/api/patient/appointments`,
      { headers: this.getAuthHeaders(), params }
    );
  }

  getMedicalRecords(patientId: any): Observable<any> {
    const params = new HttpParams().set('patientId', patientId);
    return this.http.get(
      `${this.serverName}/api/patient/medicalrecords`,
      { headers: this.getAuthHeaders(), params }
    );
  }

  updatePatientById(patientId: any, payload: any): Observable<any> {
    return this.http.put(
      `${this.serverName}/api/patient/${patientId}`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  deletePatientById(patientId: any): Observable<any> {
    return this.http.delete(
      `${this.serverName}/api/patient/${patientId}`,
      { headers: this.getAuthHeaders(), responseType: 'text' }
    );
  }

  // ================= DOCTOR =================

  getAppointmentByDoctor(doctorId: any): Observable<any> {
    const params = new HttpParams().set('doctorId', doctorId);
    return this.http.get(
      `${this.serverName}/api/doctor/appointments`,
      { headers: this.getAuthHeaders(), params }
    );
  }

  updateDoctorAvailability(doctorId: any, availability: any): Observable<any> {
    const params = new HttpParams()
      .set('doctorId', doctorId)
      .set('availability', availability);
    return this.http.put(
      `${this.serverName}/api/doctor/availability`,
      {},
      { headers: this.getAuthHeaders(), params }
    );
  }

  // ✅ GET doctor by userId (FIXED URL)
  getDoctorByUserId(userId: any): Observable<any> {
    return this.http.get(
      `${this.serverName}/api/doctor/user/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ GET doctor by doctorId (FIXED URL)
  getDoctorByDoctorId(doctorId: any): Observable<any> {
    return this.http.get(
      `${this.serverName}/api/doctor/${doctorId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateDoctorById(doctorId: any, payload: any): Observable<any> {
    return this.http.put(
      `${this.serverName}/api/doctors/${doctorId}`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteDoctorById(doctorId: any): Observable<any> {
    return this.http.delete(
      `${this.serverName}/api/doctors/${doctorId}`,
      { headers: this.getAuthHeaders(), responseType: 'text' }
    );
  }

  // ================= RECEPTIONIST =================

  getAllPatients(): Observable<any> {
    return this.http.get(
      `${this.serverName}/api/receptionist/patients`,
      { headers: this.getAuthHeaders() }
    );
  }

  getAllDoctors(): Observable<any> {
    return this.http.get(
      `${this.serverName}/api/receptionist/doctors`,
      { headers: this.getAuthHeaders() }
    );
  }

  getAllAppointments(): Observable<any> {
    return this.http.get(
      `${this.serverName}/api/receptionist/appointments`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✅ UPDATED: Slot-based booking (receptionist)
  ScheduleAppointmentByReceptionist(details: any): Observable<any> {
    const params = new HttpParams()
      .set('patientId', details.patientId)
      .set('doctorId', details.doctorId)
      .set('date', details.date)
      .set('slot', details.slot);

    return this.http.post(
      `${this.serverName}/api/receptionist/appointment`,
      {},
      { headers: this.getAuthHeaders(), params }
    );
  }

  // ✅ UPDATED: Slot-based reschedule
  reScheduleAppointment(appointmentId: any, formValue: any): Observable<any> {
    const params = new HttpParams()
      .set('date', formValue.date)
      .set('slot', formValue.slot);

    return this.http.put(
      `${this.serverName}/api/receptionist/appointment-reschedule/${appointmentId}`,
      {},
      { headers: this.getAuthHeaders(), params }
    );
  }

  // ✅ NEW: Get available slots (receptionist)
  getAvailableSlotsForReceptionist(doctorId: any, date: string): Observable<any> {
    const params = new HttpParams()
      .set('doctorId', doctorId)
      .set('date', date);

    return this.http.get(
      `${this.serverName}/api/receptionist/available-slots`,
      { headers: this.getAuthHeaders(), params }
    );
  }

  updateReceptionistById(receptionistId: any, payload: any): Observable<any> {
    return this.http.put(
      `${this.serverName}/api/receptionist/${receptionistId}`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteReceptionistById(receptionistId: any): Observable<any> {
    return this.http.delete(
      `${this.serverName}/api/receptionist/${receptionistId}`,
      { headers: this.getAuthHeaders(), responseType: 'text' }
    );
  }

  deleteUserById(userId: any): Observable<any> {
    return this.http.delete(
      `${this.serverName}/api/user/${userId}`,
      { headers: this.getAuthHeaders(), responseType: 'text' }
    );
  }
}