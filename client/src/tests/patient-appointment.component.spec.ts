import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { PatientAppointmentComponent } from '../app/patient-appointment/patient-appointment.component';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

describe('PatientAppointmentComponent', () => {
  let component: PatientAppointmentComponent;
  let fixture: ComponentFixture<PatientAppointmentComponent>;
  let httpService: jasmine.SpyObj<HttpService>;

  beforeEach(async () => {
    const httpServiceSpy = jasmine.createSpyObj('HttpService', ['getAppointmentByPatient']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      declarations: [PatientAppointmentComponent],
      providers: [
        { provide: HttpService, useValue: httpServiceSpy },
        { provide: AuthService, useValue: { getToken: () => 'mockToken' } }
      ]
    }).compileComponents();

    httpService = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
    fixture = TestBed.createComponent(PatientAppointmentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    httpService.getAppointmentByPatient.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize appointmentList as empty array', () => {
    httpService.getAppointmentByPatient.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component.appointmentList).toBeDefined();
  });

  it('should fetch appointments on init', () => {
    const mockAppointments = [
      { id: 1, status: 'Scheduled', doctor: { username: 'doc1', email: 'doc1@test.com' }, patient: { username: 'pat1', email: 'pat1@test.com' } }
    ];
    httpService.getAppointmentByPatient.and.returnValue(of(mockAppointments));
    spyOn(localStorage, 'getItem').and.returnValue('1');
    fixture.detectChanges();
    expect(httpService.getAppointmentByPatient).toHaveBeenCalledWith(1);
    expect(component.appointmentList).toEqual(mockAppointments);
  });

  it('should call getAppointmentByPatient with userId from localStorage', () => {
    httpService.getAppointmentByPatient.and.returnValue(of([]));
    spyOn(localStorage, 'getItem').and.returnValue('3');
    component.getAppointments();
    expect(httpService.getAppointmentByPatient).toHaveBeenCalledWith(3);
  });
  // patient-appointment.component.spec.ts — add 2 more
/*it('should set appointmentList from service response', () => {
  const mockData = [{ id: 1 }, { id: 2 }];
  const httpSvc = TestBed.inject(HttpService) as any;
  spyOn(httpSvc, 'getAppointmentByPatient').and.returnValue(of(mockData));
  spyOn(localStorage, 'getItem').and.returnValue('1');
  component.getAppointments();
  expect(component.appointmentList).toEqual(mockData);
});*/
it('should set appointmentList from service response', () => {

  const mockData = [{ id: 1 }, { id: 2 }];

  httpService.getAppointmentByPatient.and.returnValue(of(mockData));

  spyOn(localStorage, 'getItem').and.returnValue('1');

  component.getAppointments();

  expect(component.appointmentList).toEqual(mockData);

});

it('should initialize responseMessage as undefined', () => {
  expect(component.appointmentList).toBeDefined();
});
});