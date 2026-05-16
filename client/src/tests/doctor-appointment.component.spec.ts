import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { DoctorAppointmentComponent } from '../app/doctor-appointment/doctor-appointment.component';
import { AuthService } from '../services/auth.service';
import { HttpService } from '../services/http.service';
import { of } from 'rxjs';

describe('DoctorAppointmentComponent', () => {
  let component: DoctorAppointmentComponent;
  let fixture: ComponentFixture<DoctorAppointmentComponent>;
  let httpService: jasmine.SpyObj<HttpService>;

  beforeEach(async () => {
    const httpServiceSpy = jasmine.createSpyObj('HttpService', ['getAppointmentByDoctor']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      declarations: [DoctorAppointmentComponent],
      providers: [
        { provide: HttpService, useValue: httpServiceSpy },
        { provide: AuthService, useValue: { getToken: () => 'mockToken' } }
      ]
    }).compileComponents();

    httpService = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
    fixture = TestBed.createComponent(DoctorAppointmentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    httpService.getAppointmentByDoctor.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize appointmentList as empty array', () => {
    httpService.getAppointmentByDoctor.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component.appointmentList).toBeDefined();
  });

  it('should fetch appointments on init', () => {
    const mockAppointments = [
      { id: 1, status: 'Scheduled', doctor: { username: 'doc1', email: 'doc1@test.com' }, patient: { username: 'pat1', email: 'pat1@test.com' } }
    ];
    httpService.getAppointmentByDoctor.and.returnValue(of(mockAppointments));
    spyOn(localStorage, 'getItem').and.returnValue('1');
    fixture.detectChanges();
    expect(httpService.getAppointmentByDoctor).toHaveBeenCalledWith(1);
    expect(component.appointmentList).toEqual(mockAppointments);
  });

  it('should call getAppointmentByDoctor with userId from localStorage', () => {
    httpService.getAppointmentByDoctor.and.returnValue(of([]));
    spyOn(localStorage, 'getItem').and.returnValue('5');
    component.getAppointments();
    expect(httpService.getAppointmentByDoctor).toHaveBeenCalledWith(5);
  });

// doctor-appointment.component.spec.ts — add 1 more
/*it('should set appointmentList from service response', () => {
  const mockData = [{ id: 1 }, { id: 2 }];
  const httpSvc = TestBed.inject(HttpService) as any;
  spyOn(httpSvc, 'getAppointmentByDoctor').and.returnValue(of(mockData));
  spyOn(localStorage, 'getItem').and.returnValue('1');
  component.getAppointments();
  expect(component.appointmentList).toEqual(mockData);
});*/

it('should set appointmentList from service response', () => {

  const mockData = [{ id: 1 }, { id: 2 }];

  httpService.getAppointmentByDoctor.and.returnValue(of(mockData));

  spyOn(localStorage, 'getItem').and.returnValue('1');

  component.getAppointments();

  expect(component.appointmentList).toEqual(mockData);

});
});