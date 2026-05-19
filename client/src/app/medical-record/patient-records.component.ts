import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-patient-records',
  templateUrl: './patient-records.component.html',
  styleUrls: ['./patient-records.component.scss']
})
export class PatientRecordsComponent implements OnInit {

  medicalRecords: any[] = [];
  loadingRecords: boolean = false;
  errorMessage: string = '';

  constructor(public httpService: HttpService) {}

  ngOnInit(): void {
    this.loadMedicalRecords();
  }

  loadMedicalRecords(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.errorMessage = 'User not found. Please login again.';
      return;
    }

    this.loadingRecords = true;

    this.httpService.getMedicalRecords(Number(userId)).subscribe({
      next: (res: any) => {
        this.medicalRecords = res?.data || res || [];
        this.loadingRecords = false;
      },
      error: (err: any) => {
        console.error('Error loading medical records:', err);
        this.medicalRecords = [];
        this.loadingRecords = false;
        this.errorMessage = 'Failed to load medical records';
      }
    });
  }

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

  // ✅ Download PDF — browser print (NO npm needed)
  downloadPDF(record: any): void {
    const patientName = record.patient?.username || 'Patient';
    const doctorName = record.doctor?.username || 'Doctor';
    const specialty = record.doctor?.specialty || 'General';
    const diagnosis = record.diagnosis || 'N/A';
    const treatment = record.treatment || 'N/A';
    const recordDate = this.getRecordDate(record);
    const recordId = record.id || 'N/A';

    const printContent = `
      <html>
      <head>
        <title>Medical Report - ${patientName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; }

          .header {
            text-align: center; padding-bottom: 20px;
            border-bottom: 3px solid #0d6efd; margin-bottom: 30px;
          }
          .header h1 { color: #0d6efd; font-size: 28px; margin-bottom: 4px; }
          .header p { color: #666; font-size: 13px; }
          .header .hospital-icon { font-size: 40px; margin-bottom: 8px; }

          .report-id { text-align: right; color: #888; font-size: 12px; margin-bottom: 20px; }

          .section { margin-bottom: 24px; }
          .section-title {
            font-size: 14px; font-weight: 700; color: #0d6efd;
            text-transform: uppercase; letter-spacing: 1px;
            margin-bottom: 10px; padding-bottom: 6px;
            border-bottom: 1px solid #e0e0e0;
          }

          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .info-item { padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #0d6efd; }
          .info-item label { font-size: 11px; color: #888; text-transform: uppercase; display: block; margin-bottom: 2px; }
          .info-item p { font-size: 15px; font-weight: 600; color: #1a1a2e; }

          .detail-box {
            padding: 16px; background: #f0f7ff; border-radius: 10px;
            border: 1px solid #d0e3ff; margin-bottom: 12px;
          }
          .detail-box label { font-size: 11px; color: #0d6efd; text-transform: uppercase; display: block; margin-bottom: 6px; font-weight: 700; }
          .detail-box p { font-size: 14px; color: #333; line-height: 1.7; white-space: pre-wrap; }

          .footer {
            margin-top: 40px; padding-top: 20px;
            border-top: 2px solid #e0e0e0; text-align: center;
          }
          .footer p { color: #888; font-size: 11px; }
          .footer .disclaimer { font-style: italic; margin-top: 6px; color: #aaa; font-size: 10px; }

          .stamp-area {
            margin-top: 40px; display: flex; justify-content: space-between;
          }
          .stamp-box { text-align: center; min-width: 200px; }
          .stamp-box .line { border-top: 1px solid #333; margin-bottom: 6px; }
          .stamp-box p { font-size: 12px; color: #555; }

          @media print {
            body { padding: 20px; }
            @page { margin: 15mm; }
          }
        </style>
      </head>
      <body>

        <div class="header">
          <div class="hospital-icon">🏥</div>
          <h1>HAM System</h1>
          <p>Healthcare Appointment Management System</p>
          <p>123 Medical Avenue, Suite 500, Mumbai, Maharashtra 400001</p>
          <p>Phone: +91 98765 43210 | Email: info@hamsystem.com</p>
        </div>

        <div class="report-id">Report ID: #MR-${recordId} | Generated: ${new Date().toLocaleDateString('en-IN')}</div>

        <div class="section">
          <div class="section-title">Patient & Doctor Information</div>
          <div class="info-grid">
            <div class="info-item">
              <label>Patient Name</label>
              <p>${patientName}</p>
            </div>
            <div class="info-item">
              <label>Doctor Name</label>
              <p>${doctorName}</p>
            </div>
            <div class="info-item">
              <label>Specialty</label>
              <p>${specialty}</p>
            </div>
            <div class="info-item">
              <label>Report Date</label>
              <p>${recordDate}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Diagnosis</div>
          <div class="detail-box">
            <label>Doctor's Diagnosis</label>
            <p>${diagnosis}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Treatment Plan</div>
          <div class="detail-box">
            <label>Prescribed Treatment</label>
            <p>${treatment}</p>
          </div>
        </div>

        <div class="stamp-area">
          <div class="stamp-box">
            <div class="line"></div>
            <p>Patient Signature</p>
          </div>
          <div class="stamp-box">
            <div class="line"></div>
            <p>Dr. ${doctorName}</p>
            <p style="font-size:10px; color:#888;">${specialty}</p>
          </div>
        </div>

        <div class="footer">
          <p>HAM System - Healthcare Appointment Management</p>
          <p class="disclaimer">This is a computer-generated report. For verification, contact the hospital administration.</p>
        </div>

      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }
}