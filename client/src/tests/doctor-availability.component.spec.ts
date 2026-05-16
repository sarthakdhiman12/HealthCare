import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { DoctorAvailabilityComponent } from '../app/doctor-availability/doctor-availability.component';
import { AuthService } from '../services/auth.service';
import { HttpService } from '../services/http.service';
import { of } from 'rxjs';

describe('DoctorAvailabilityComponent', () => {
  let component: DoctorAvailabilityComponent;
  let fixture: ComponentFixture<DoctorAvailabilityComponent>;
  let httpService: jasmine.SpyObj<HttpService>;

  beforeEach(async () => {
    const httpServiceSpy = jasmine.createSpyObj('HttpService', ['updateDoctorAvailability']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      declarations: [DoctorAvailabilityComponent],
      providers: [
        { provide: HttpService, useValue: httpServiceSpy },
        { provide: AuthService, useValue: { getToken: () => 'mockToken' } }
      ]
    }).compileComponents();

    httpService = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
    fixture = TestBed.createComponent(DoctorAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.itemForm.valid).toBeFalsy();
    expect(component.itemForm.controls['availability'].hasError('required')).toBeTruthy();
  });

  it('should have valid form when availability is selected', () => {
    component.itemForm.controls['doctorId'].setValue(1);
    component.itemForm.controls['availability'].setValue('Yes');
    expect(component.itemForm.valid).toBeTruthy();
  });

  it('should call updateDoctorAvailability on submit', () => {
    httpService.updateDoctorAvailability.and.returnValue(of({}));
    spyOn(localStorage, 'getItem').and.returnValue('1');
    component.itemForm.controls['doctorId'].setValue(1);
    component.itemForm.controls['availability'].setValue('Yes');
    component.onSubmit();
    expect(httpService.updateDoctorAvailability).toHaveBeenCalled();
  });

  it('should reset form after successful submit', () => {
    httpService.updateDoctorAvailability.and.returnValue(of({}));
    spyOn(localStorage, 'getItem').and.returnValue('1');
    component.itemForm.controls['doctorId'].setValue(1);
    component.itemForm.controls['availability'].setValue('Yes');
    component.onSubmit();
    expect(component.itemForm.controls['availability'].value).toBeNull();
  });

  // doctor-availability.component.spec.ts — add 2 more
it('should initialize isAdded as false', () => {
  expect(component.isAdded).toBeFalse();
});

it('should have doctorId as required field', () => {
  expect(component.itemForm.controls['doctorId'].hasError('required')).toBeTruthy();
});
});