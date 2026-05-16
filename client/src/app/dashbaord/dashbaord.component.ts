import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-dashbaord',
  templateUrl: './dashbaord.component.html',
  styleUrls: ['./dashbaord.component.scss']
})
export class DashbaordComponent implements OnInit {

  roleName: string | null = '';
  userData: any;

  doctorId: any = 'Not Available';
  doctorSpecialty: any = 'Not Available';
  doctorAvailability: any = 'Not Available';

  deleting: boolean = false;

  // ✅ UPDATE FORM
  showEditForm: boolean = false;
  updating: boolean = false;

  // ✅ PATIENT FORM
  patientForm: any = {
    username: '',
    email: '',
    password: ''
  };

  // ✅ DOCTOR FORM
  doctorForm: any = {
    username: '',
    email: '',
    password: '',
    specialty: '',

  };

  // ✅ RECEPTIONIST FORM
  receptionistForm: any = {
    username: '',
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private httpService: HttpService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserData();

    if (this.roleName === 'DOCTOR') {
      this.loadDoctorDetails();
    }
  }

  loadUserData(): void {
    this.userData = this.authService.getUserData();

    this.roleName =
      this.authService.getRole() ||
      this.userData?.role ||
      localStorage.getItem('role') ||
      null;

    if (this.roleName) {
      this.roleName = this.roleName.toUpperCase();
    }

    console.log('Role:', this.roleName);
    console.log('User Data:', this.userData);
  }

  loadDoctorDetails(): void {
    const doctorId =
      this.userData?.doctorId ||
      this.userData?.doctor?.doctorId ||
      this.userData?.doctor?.id ||
      localStorage.getItem('doctorId');

    if (!doctorId) {
      this.doctorId = 'Not Available';
      this.doctorSpecialty = 'Not Available';
      this.doctorAvailability = 'Not Available';
      return;
    }

    this.httpService.getDoctorByDoctorId(doctorId).subscribe({
      next: (doctor: any) => {
        console.log("API Response:", doctor);
        this.doctorId = doctor.doctorId || doctor.id || doctorId;
        this.doctorSpecialty = doctor.specialty || 'Not Available';
        this.doctorAvailability = doctor.availability || 'Not Available';
      },
      error: () => {
        console.log("API Response: not found");
        this.doctorId = doctorId;
        this.doctorSpecialty = 'Not Available';
        this.doctorAvailability = 'Not Available';
      }
    });
  }

  private getCurrentUserId(): any {
    return (
      this.userData?.id ||
      this.userData?.userId ||
      localStorage.getItem('userId')
    );
  }

  // ✅ TOGGLE EDIT FORM + PRE-FILL DATA
  toggleEditForm(): void {
    this.showEditForm = !this.showEditForm;

    if (this.showEditForm) {
      // Pre-fill forms with existing data
      if (this.roleName === 'PATIENT') {
        this.patientForm = {
          username: this.userData?.username || '',
          email: this.userData?.email || '',
          password: ''
        };
      }

      if (this.roleName === 'DOCTOR') {
        this.doctorForm = {
          username: this.userData?.username || '',
          email: this.userData?.email || '',
          password: '',
          specialty: this.doctorSpecialty !== 'Not Available' ? this.doctorSpecialty : '',
          availability: this.doctorAvailability !== 'Not Available' ? this.doctorAvailability : ''
        };
      }

      if (this.roleName === 'RECEPTIONIST') {
        this.receptionistForm = {
          username: this.userData?.username || '',
          email: this.userData?.email || '',
          password: ''
        };
      }
    }
  }

  // ✅ UPDATE ACCOUNT
  updateMyAccount(): void {
    const userId = this.getCurrentUserId();

    if (!userId) {
      alert('User ID not found. Please login again.');
      return;
    }

    this.updating = true;

    let apiCall;
    let payload: any;

    if (this.roleName === 'PATIENT') {
      payload = { ...this.patientForm };
      if (!payload.password) delete payload.password;
      apiCall = this.httpService.updatePatientById(userId, payload);
    }
    else if (this.roleName === 'DOCTOR') {
      payload = { ...this.doctorForm };
      if (!payload.password) delete payload.password;
      apiCall = this.httpService.updateDoctorById(userId, payload);
    }
    else if (this.roleName === 'RECEPTIONIST') {
      payload = { ...this.receptionistForm };
      if (!payload.password) delete payload.password;
      apiCall = this.httpService.updateReceptionistById(userId, payload);
    }
    else {
      alert('Invalid role');
      this.updating = false;
      return;
    }

    apiCall.subscribe({
      next: (res: any) => {
        console.log('Update response:', res);
        alert('Profile updated successfully ✅');

        // ✅ Update local storage with new data
        const updatedData = {
          ...this.userData,
          username: payload.username || this.userData.username,
          email: payload.email || this.userData.email
        };
        this.authService.saveUserData(updatedData);

        // ✅ Refresh dashboard
        this.userData = updatedData;
        this.showEditForm = false;
        this.updating = false;

        // Reload doctor details if doctor
        if (this.roleName === 'DOCTOR') {
          this.loadDoctorDetails();
        }
      },
      error: (err: any) => {
        console.error('Update error:', err);
        alert('Update failed ❌');
        this.updating = false;
      }
    });
  }

  // ✅ DELETE ACCOUNT
  deleteMyAccount(): void {
    if (!this.roleName) {
      alert('Role not found. Please login again.');
      return;
    }

    const userId = this.getCurrentUserId();

    if (!userId) {
      alert('User ID not found. Please login again.');
      return;
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete this ${this.roleName} account?`
    );

    if (!confirmDelete) return;

    this.deleting = true;

    this.httpService.deleteUserById(userId).subscribe({
      next: () => {
        alert('Account deleted successfully');
        localStorage.clear();
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('Delete error:', err);
        alert('Delete failed');
        this.deleting = false;
      }
    });
  }
}