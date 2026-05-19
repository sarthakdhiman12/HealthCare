import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-doctor-appointment',
  templateUrl: './doctor-appointment.component.html',
  styleUrls: ['./doctor-appointment.component.scss']
})
export class DoctorAppointmentComponent implements OnInit {

  allAppointments: any[] = [];
  upcomingAppointments: any[] = [];
  pastAppointments: any[] = [];

  showHistory: boolean = false;
  responseMessage: string = '';

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

  // ✅ Medical Report
  reportAppointmentId: any = null;
  reportMode: string = '';  // 'add' | 'edit' | 'view' | ''
  reportDiagnosis: string = '';
  reportTreatment: string = '';
  reportSaving: boolean = false;
  reportError: string = '';
  reportSuccess: string = '';
  editingRecordId: number | null = null;

  // ✅ Store medical records mapped by appointmentId
  medicalRecordsMap: any = {};
  doctorId: number = 0;

  constructor(public httpService: HttpService) {}

  ngOnInit(): void {
    this.doctorId = Number(localStorage.getItem('userId')) || 0;
    this.getAppointments();
  }

  getAppointments(): void {
    if (!this.doctorId) {
      this.responseMessage = 'Doctor not found. Please login again.';
      return;
    }

    this.httpService.getAppointmentByDoctor(this.doctorId).subscribe({
      next: (data: any) => {
        const list = data?.data || data || [];

        this.allAppointments = list.map((a: any) => {
          const appointmentId = a.id || a.appointmentId;
          const paymentKey = 'payment_' + appointmentId;
          const savedPayment = localStorage.getItem(paymentKey);

          return {
            ...a,
            paymentStatus: savedPayment || a.paymentStatus || 'NOT PAID'
          };
        });

        this.allAppointments.sort((a, b) => {
          const dateA = new Date(a.appointmentDate + 'T00:00:00').getTime();
          const dateB = new Date(b.appointmentDate + 'T00:00:00').getTime();
          return dateB - dateA;
        });

        this.splitAppointments();
        this.loadMedicalRecords();
      },
      error: (err: any) => {
        console.error('Error loading appointments:', err);
        this.allAppointments = [];
        this.upcomingAppointments = [];
        this.pastAppointments = [];
        this.responseMessage = 'Failed to load appointments';
      }
    });
  }

  splitAppointments(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.upcomingAppointments = this.allAppointments.filter(a => {
      const d = this.parseDate(a.appointmentDate);
      return d !== null && d >= today;
    });

    this.pastAppointments = this.allAppointments.filter(a => {
      const d = this.parseDate(a.appointmentDate);
      return d !== null && d < today;
    });

    this.upcomingAppointments.sort((a, b) => {
      const dateA = this.parseDate(a.appointmentDate)?.getTime() || 0;
      const dateB = this.parseDate(b.appointmentDate)?.getTime() || 0;
      if (dateA !== dateB) return dateA - dateB;
      return this.getSlotStartHour(a.slot) - this.getSlotStartHour(b.slot);
    });

    this.pastAppointments.sort((a, b) => {
      const dateA = this.parseDate(a.appointmentDate)?.getTime() || 0;
      const dateB = this.parseDate(b.appointmentDate)?.getTime() || 0;
      if (dateA !== dateB) return dateA - dateB;
      return this.getSlotStartHour(a.slot) - this.getSlotStartHour(b.slot);
    });
  }

  // ============================================================
  // ✅ MEDICAL REPORT METHODS
  // ============================================================

  // ✅ Load all medical records for this doctor
  loadMedicalRecords(): void {
    this.httpService.getMedicalRecordsByDoctor(this.doctorId).subscribe({
      next: (res: any) => {
        const records = res?.data || res || [];
        this.medicalRecordsMap = {};

        records.forEach((record: any) => {
          const patientId = record.patient?.id;
          const doctorId = record.doctor?.id;

          // ✅ Match record to appointment
          this.allAppointments.forEach(apt => {
            const aptPatientId = apt.patient?.id;
            const aptDoctorId = apt.doctor?.id;
            const aptId = apt.id || apt.appointmentId;

            if (aptPatientId === patientId && aptDoctorId === doctorId) {
              if (!this.medicalRecordsMap[aptId]) {
                this.medicalRecordsMap[aptId] = record;
              }
            }
          });
        });

        console.log('Medical Records Map:', this.medicalRecordsMap);
      },
      error: (err: any) => {
        console.error('Error loading medical records:', err);
      }
    });
  }

  // ✅ Check if appointment has a report
  hasReport(appointmentId: any): boolean {
    return !!this.medicalRecordsMap[appointmentId];
  }

  // ✅ Get report for appointment
  getReport(appointmentId: any): any {
    return this.medicalRecordsMap[appointmentId] || null;
  }

  // ✅ Open Add Report form
  openAddReport(appointment: any): void {
    const aptId = appointment.id || appointment.appointmentId;
    this.reportAppointmentId = aptId;
    this.reportMode = 'add';
    this.reportDiagnosis = '';
    this.reportTreatment = '';
    this.reportError = '';
    this.reportSuccess = '';
    this.editingRecordId = null;
  }

  // ✅ Open View Report
  openViewReport(appointment: any): void {
    const aptId = appointment.id || appointment.appointmentId;
    this.reportAppointmentId = aptId;
    this.reportMode = 'view';
    this.reportError = '';
    this.reportSuccess = '';
  }

  // ✅ Open Edit Report
  openEditReport(appointment: any): void {
    const aptId = appointment.id || appointment.appointmentId;
    const record = this.medicalRecordsMap[aptId];

    if (!record) return;

    this.reportAppointmentId = aptId;
    this.reportMode = 'edit';
    this.reportDiagnosis = record.diagnosis || '';
    this.reportTreatment = record.treatment || '';
    this.editingRecordId = record.id;
    this.reportError = '';
    this.reportSuccess = '';
  }

  // ✅ Close report form/view
  closeReport(): void {
    this.reportAppointmentId = null;
    this.reportMode = '';
    this.reportDiagnosis = '';
    this.reportTreatment = '';
    this.reportError = '';
    this.reportSuccess = '';
    this.editingRecordId = null;
  }

  // ✅ Save new report
  saveReport(appointment: any): void {
    if (!this.reportDiagnosis.trim() || !this.reportTreatment.trim()) {
      this.reportError = 'Please fill both Diagnosis and Treatment';
      return;
    }

    const patientId = appointment.patient?.id;

    if (!patientId || !this.doctorId) {
      this.reportError = 'Patient or Doctor info missing';
      return;
    }

    this.reportSaving = true;
    this.reportError = '';

    this.httpService.createMedicalRecord(
      patientId,
      this.doctorId,
      this.reportDiagnosis.trim(),
      this.reportTreatment.trim()
    ).subscribe({
      next: (res: any) => {
        console.log('✅ Report saved:', res);
        this.reportSaving = false;
        this.reportSuccess = 'Report saved successfully ✅';
        this.reportMode = 'view';

        // ✅ Store in map
        const aptId = appointment.id || appointment.appointmentId;
        this.medicalRecordsMap[aptId] = res?.data || res;

        setTimeout(() => { this.reportSuccess = ''; }, 3000);
      },
      error: (err: any) => {
        console.error('❌ Report save failed:', err);
        this.reportSaving = false;
        this.reportError = err.error?.message || 'Failed to save report';
      }
    });
  }

  // ✅ Update existing report
  updateReport(): void {
    if (!this.reportDiagnosis.trim() || !this.reportTreatment.trim()) {
      this.reportError = 'Please fill both Diagnosis and Treatment';
      return;
    }

    if (!this.editingRecordId) {
      this.reportError = 'Record ID missing';
      return;
    }

    this.reportSaving = true;
    this.reportError = '';

    this.httpService.updateMedicalRecord(
      this.editingRecordId,
      this.reportDiagnosis.trim(),
      this.reportTreatment.trim()
    ).subscribe({
      next: (res: any) => {
        console.log('✅ Report updated:', res);
        this.reportSaving = false;
        this.reportSuccess = 'Report updated successfully ✅';
        this.reportMode = 'view';

        // ✅ Update in map
        this.medicalRecordsMap[this.reportAppointmentId] = res?.data || res;

        setTimeout(() => { this.reportSuccess = ''; }, 3000);
      },
      error: (err: any) => {
        console.error('❌ Report update failed:', err);
        this.reportSaving = false;
        this.reportError = err.error?.message || 'Failed to update report';
      }
    });
  }

  // ✅ Delete report
  deleteReport(appointment: any): void {
    const aptId = appointment.id || appointment.appointmentId;
    const record = this.medicalRecordsMap[aptId];

    if (!record || !record.id) return;

    if (!confirm('Are you sure you want to delete this medical report?')) return;

    this.httpService.deleteMedicalRecord(record.id).subscribe({
      next: () => {
        console.log('✅ Report deleted');
        delete this.medicalRecordsMap[aptId];
        this.closeReport();
        this.reportSuccess = 'Report deleted ✅';
        setTimeout(() => { this.reportSuccess = ''; }, 3000);
      },
      error: (err: any) => {
        console.error('❌ Delete failed:', err);
        this.reportError = err.error?.message || 'Failed to delete report';
      }
    });
  }

  // ✅ Get readable date for record
  getRecordDate(record: any): string {
    if (!record?.recordDate) return 'N/A';
    try {
      const d = new Date(record.recordDate);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  }

  // ============================================================
  // ✅ EXISTING HELPER METHODS
  // ============================================================

  getSlotStartHour(slot: string): number {
    if (!slot) return 0;
    const hour = parseInt(slot.split(':')[0]);
    return isNaN(hour) ? 0 : hour;
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
  }

  getSlotLabel(slot: string): string {
    if (!slot) return 'N/A';
    return this.slotLabels[slot] || slot;
  }

  getReadableDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) return dateStr;
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit', month: 'short', year: 'numeric'
      };
      return d.toLocaleDateString('en-IN', options);
    } catch (e) {
      return dateStr;
    }
  }

  getDoctorFees(specialty: string): number {
    const feesMap: any = {
      'cardiology': 1500, 'cardio': 1500, 'cardiac': 1500, 'cardic': 1500,
      'neurology': 2000, 'neuro': 2000, 'orthopedics': 1200,
      'dermatology': 800, 'pediatrics': 700, 'general': 500,
      'webing': 600, 'ent': 900
    };
    return feesMap[(specialty || 'general').toLowerCase()] || 500;
  }

  getPaymentStatus(appointmentId: any): string {
    if (!appointmentId) return 'NOT PAID';
    return localStorage.getItem('payment_' + appointmentId) || 'NOT PAID';
  }

  getPaymentMode(appointmentId: any): string {
    if (!appointmentId) return '—';
    const mode = localStorage.getItem('paymode_' + appointmentId);
    if (mode === 'ONLINE') return '💻 Online';
    if (mode === 'OFFLINE') return '🏥 Cash/Hospital';
    return '—';
  }

  isToday(dateStr: string): boolean {
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }

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
}