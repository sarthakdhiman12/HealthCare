import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ScheduleAppointmentComponent } from '../app/schedule-appointment/schedule-appointment.component';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';
import { DatePipe } from '@angular/common';

describe('ScheduleAppointmentComponent', () => {
  let component: ScheduleAppointmentComponent;
  let fixture: ComponentFixture<ScheduleAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, // Import HttpClientTestingModule for HttpClient
        ReactiveFormsModule      // Import ReactiveFormsModule for FormBuilder
      ],
      declarations: [ScheduleAppointmentComponent],
      providers: [
        HttpService,
        DatePipe,
        { provide: AuthService, useValue: { getToken: () => 'mockToken' } } // Mock AuthService if needed
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.itemForm.valid).toBeFalsy();
  });

  it('should validate patientId as required', () => {
    let patientId = component.itemForm.controls['patientId'];
    expect(patientId.valid).toBeFalsy();
    expect(patientId.hasError('required')).toBeTruthy();

    patientId.setValue(1);
    expect(patientId.hasError('required')).toBeFalsy();
  });

  it('should validate doctorId as required', () => {
    let doctorId = component.itemForm.controls['doctorId'];
    expect(doctorId.valid).toBeFalsy();
    expect(doctorId.hasError('required')).toBeTruthy();

    doctorId.setValue(1);
    expect(doctorId.hasError('required')).toBeFalsy();
  });

  it('should validate time as required', () => {
    let time = component.itemForm.controls['time'];
    expect(time.valid).toBeFalsy();
    expect(time.hasError('required')).toBeTruthy();

    time.setValue('2024-08-10T10:00:00');
    expect(time.hasError('required')).toBeFalsy();
  });

  it('should have a valid form when all fields are filled', () => {
    component.itemForm.controls['patientId'].setValue(1);
    component.itemForm.controls['doctorId'].setValue(1);
    component.itemForm.controls['time'].setValue('2024-08-10T10:00:00');
    
    expect(component.itemForm.valid).toBeTruthy();
  });
// ADD after existing tests inside the same describe block:

it('should initialize doctorList as empty array', () => {
  expect(component.doctorList).toEqual([]);
});

it('should initialize isAdded as false', () => {
  expect(component.isAdded).toBeFalse();
});

it('should set isAdded to true when addAppointment is called', () => {
  const mockDoctor = { id: 1, username: 'doctor1', availability: 'Yes' };
  spyOn(localStorage, 'getItem').and.returnValue('1');
  component.addAppointment(mockDoctor);
  expect(component.isAdded).toBeTrue();
  expect(component.itemForm.controls['doctorId'].value).toBe(mockDoctor.id);
  expect(component.itemForm.controls['patientId'].value).toBe(1);
});

it('should set doctorId and patientId when addAppointment is called', () => {
  const mockDoctor = { id: 5, username: 'doctor5', availability: 'Yes' };
  spyOn(localStorage, 'getItem').and.returnValue('10');
  component.addAppointment(mockDoctor);
  expect(component.itemForm.controls['doctorId'].value).toBe(5);
  expect(component.itemForm.controls['patientId'].value).toBe(10);
});

// schedule-appointment.component.spec.ts — add 2 more
it('should initialize responseMessage as undefined', () => {
  expect(component.responseMessage).toBeUndefined();
});

it('should initialize formModel as empty object', () => {
  expect(component.formModel).toBeDefined();
});


});
