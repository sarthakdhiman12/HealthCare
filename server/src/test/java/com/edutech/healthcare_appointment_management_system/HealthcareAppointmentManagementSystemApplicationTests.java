package com.edutech.healthcare_appointment_management_system;

import com.edutech.healthcare_appointment_management_system.dto.LoginRequest;
import com.edutech.healthcare_appointment_management_system.dto.TimeDto;
import com.edutech.healthcare_appointment_management_system.entity.*;
import com.edutech.healthcare_appointment_management_system.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;


import javax.transaction.Transactional;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Transactional
class HealthcareAppointmentManagementSystemApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private AppointmentRepository appointmentRepository;

	@Autowired
	private DoctorRepository doctorRepository;

	@Autowired
	private PatientRepository patientRepository;

	@Autowired
	private ReceptionistRepository receptionistRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private MedicalRecordRepository medicalRecordRepository;

	@BeforeEach
	public void setUp() {
		// Clear the database before each test
		appointmentRepository.deleteAll();
		medicalRecordRepository.deleteAll();
		doctorRepository.deleteAll();
		patientRepository.deleteAll();
		receptionistRepository.deleteAll();
		userRepository.deleteAll();
	}

	@Test
	public void testRegisterPatient() throws Exception {
		Patient patient = new Patient();
		patient.setUsername("patientUser");
		patient.setPassword("password");
		patient.setEmail("patient@example.com");
		patient.setRole("PATIENT");

		mockMvc.perform(MockMvcRequestBuilders.post("/api/patient/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(patient)))
				.andExpect(MockMvcResultMatchers.jsonPath("$.username").value("patientUser"))
				.andExpect(MockMvcResultMatchers.jsonPath("$.email").value("patient@example.com"));

		Patient savedPatient = patientRepository.findAll().get(0);
		assert savedPatient.getUsername().equals("patientUser");
		assert savedPatient.getEmail().equals("patient@example.com");
		assert savedPatient.getRole().equals("PATIENT");
	}

	@Test
	public void testRegisterDoctor() throws Exception {
		Doctor doctor = new Doctor();
		doctor.setUsername("doctorUser");
		doctor.setPassword("password");
		doctor.setEmail("doctor@example.com");
		doctor.setRole("DOCTOR");
		doctor.setSpecialty("General Physician");

		mockMvc.perform(MockMvcRequestBuilders.post("/api/doctors/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(doctor)))
				.andExpect(MockMvcResultMatchers.jsonPath("$.username").value("doctorUser"))
				.andExpect(MockMvcResultMatchers.jsonPath("$.email").value("doctor@example.com"))
				.andExpect(MockMvcResultMatchers.jsonPath("$.specialty").value("General Physician"));

		Doctor savedDoctor = doctorRepository.findAll().get(0);
		assert savedDoctor.getUsername().equals("doctorUser");
		assert savedDoctor.getEmail().equals(doctor.getEmail());
		assert savedDoctor.getRole().equals("DOCTOR");
		assert savedDoctor.getSpecialty().equals("General Physician");
	}

	@Test
	public void testRegisterReceptionist() throws Exception {
		Receptionist receptionist = new Receptionist();
		receptionist.setUsername("receptionistUser");
		receptionist.setPassword("password");
		receptionist.setEmail("receptionist@example.com");
		receptionist.setRole("RECEPTIONIST");

		mockMvc.perform(MockMvcRequestBuilders.post("/api/receptionist/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(receptionist)))
				.andExpect(MockMvcResultMatchers.jsonPath("$.username").value("receptionistUser"))
				.andExpect(MockMvcResultMatchers.jsonPath("$.email").value("receptionist@example.com"));

		Receptionist savedReceptionist = receptionistRepository.findAll().get(0);
		assert savedReceptionist.getUsername().equals("receptionistUser");
		assert savedReceptionist.getEmail().equals(receptionist.getEmail());
		assert savedReceptionist.getRole().equals("RECEPTIONIST");
	}

	@Test
	public void testLoginUser() throws Exception {
		Receptionist receptionist = new Receptionist();
		receptionist.setUsername("receptionistUser");
		receptionist.setPassword("password");
		receptionist.setEmail("receptionist@example.com");
		receptionist.setRole("RECEPTIONIST");

		mockMvc.perform(MockMvcRequestBuilders.post("/api/receptionist/register")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(receptionist)))
				.andExpect(MockMvcResultMatchers.jsonPath("$.username").value("receptionistUser"))
				.andExpect(MockMvcResultMatchers.jsonPath("$.email").value("receptionist@example.com"));

		// Login with the registered user
		LoginRequest loginRequest = new LoginRequest("receptionistUser", "password");

		mockMvc.perform(post("/api/user/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(loginRequest)))
				.andExpect(jsonPath("$.token").exists());
	}

	@Test
	public void testLoginWithWrongUsernameOrPassword() throws Exception {
		// Create a login request with a wrong username
		LoginRequest loginRequest = new LoginRequest("wronguser", "password");

		mockMvc.perform(post("/api/user/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(loginRequest)))
				.andExpect(status().isUnauthorized()); // Expect a 401 Unauthorized response
	}

	@Test
	@WithMockUser(username = "testPatient", authorities = {"PATIENT"})
	public void testPatientCanGetDoctors() throws Exception {
		// Arrange: Prepare test data
		Doctor doctor1 = new Doctor();
		doctor1.setUsername("doctorUser1");
		doctor1.setPassword("password");
		doctor1.setEmail("doctor1@example.com");
		doctor1.setSpecialty("Radiology");
		doctorRepository.save(doctor1);

		Doctor doctor2 = new Doctor();
		doctor2.setUsername("doctorUser2");
		doctor2.setPassword("password");
		doctor2.setEmail("doctor2@example.com");
		doctor2.setSpecialty("Neurology");
		doctorRepository.save(doctor2);

		// Act: Perform the GET request
		mockMvc.perform(MockMvcRequestBuilders.get("/api/patient/doctors")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andExpect(MockMvcResultMatchers.jsonPath("$[0].username").value("doctorUser1"))
				.andExpect(MockMvcResultMatchers.jsonPath("$[0].email").value("doctor1@example.com"))
				.andExpect(MockMvcResultMatchers.jsonPath("$[1].username").value("doctorUser2"))
				.andExpect(MockMvcResultMatchers.jsonPath("$[1].email").value("doctor2@example.com"));

		// Optional: Verify saved data (if necessary)
		List<Doctor> doctors = doctorRepository.findAll();
		assertEquals(2, doctors.size());
		assertEquals("doctorUser1", doctors.get(0).getUsername());
		assertEquals("doctor1@example.com", doctors.get(0).getEmail());
		assertEquals("doctorUser2", doctors.get(1).getUsername());
		assertEquals("doctor2@example.com", doctors.get(1).getEmail());
	}

	@Test
	@WithMockUser(username = "testPatient", authorities = {"PATIENT"})
	public void testPatientCanScheduleAppointment() throws Exception {
		// Arrange: Prepare test data
		Patient patient = new Patient();
		patient.setUsername("patientUser");
		patient.setPassword("password");
		patient.setEmail("patient@example.com");
		patientRepository.save(patient);

		Doctor doctor = new Doctor();
		doctor.setUsername("doctorUser");
		doctor.setPassword("password");
		doctor.setEmail("doctor@example.com");
		doctor.setSpecialty("Cardiology");
		doctorRepository.save(doctor);

		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date appointmentTime = formatter.parse("2021-08-01 09:00:00");
		// Act: Perform the POST request to schedule an appointment
		mockMvc.perform(MockMvcRequestBuilders.post("/api/patient/appointment")
						.param("patientId", String.valueOf(patient.getId()))
						.param("doctorId", String.valueOf(doctor.getId()))
						.content(objectMapper.writeValueAsString(new TimeDto(appointmentTime)))
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(MockMvcResultMatchers.jsonPath("$.patient.id").value(patient.getId()))
				.andExpect(MockMvcResultMatchers.jsonPath("$.doctor.id").value(doctor.getId()));
		// Optional: Verify saved data (if necessary)
		List<Appointment> appointments = appointmentRepository.findAll();
		assertEquals(1, appointments.size());
		Appointment savedAppointment = appointments.get(0);
		assertEquals(patient.getId(), savedAppointment.getPatient().getId());
		assertEquals(doctor.getId(), savedAppointment.getDoctor().getId());
		assertEquals(appointmentTime, savedAppointment.getAppointmentTime());
	}

	@Test
	@WithMockUser(username = "testPatient", authorities = {"PATIENT"})
	public void testGetAppointmentsByPatientId() throws Exception {
		// Arrange: Prepare test data
		Patient patient = new Patient();
		patient.setUsername("patientUser");
		patient.setPassword("password");
		patient.setEmail("patient@example.com");
		patientRepository.save(patient);

		Doctor doctor = new Doctor();
		doctor.setUsername("doctorUser");
		doctor.setPassword("password");
		doctor.setEmail("doctor@example.com");
		doctor.setSpecialty("Cardiology");
		doctorRepository.save(doctor);

		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date appointmentTime = formatter.parse("2021-08-01 09:00:00");
		Date appointmentTime2 = formatter.parse("2021-08-02 09:00:00");
		Appointment appointment1 = new Appointment();
		appointment1.setPatient(patient);
		appointment1.setDoctor(doctor);
		appointment1.setAppointmentTime(appointmentTime);
		appointmentRepository.save(appointment1);

		Appointment appointment2 = new Appointment();
		appointment2.setPatient(patient);
		appointment2.setDoctor(doctor);
		appointment2.setAppointmentTime(appointmentTime2);
		appointmentRepository.save(appointment2);

		// Act: Perform the GET request to retrieve appointments by patient ID
		mockMvc.perform(MockMvcRequestBuilders.get("/api/patient/appointments")
						.param("patientId", String.valueOf(patient.getId()))
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(MockMvcResultMatchers.status().isOk())
				.andExpect(MockMvcResultMatchers.jsonPath("$[0].patient.id").value(patient.getId()))
				.andExpect(MockMvcResultMatchers.jsonPath("$[0].doctor.id").value(doctor.getId()))
				.andExpect(MockMvcResultMatchers.jsonPath("$[1].patient.id").value(patient.getId()))
				.andExpect(MockMvcResultMatchers.jsonPath("$[1].doctor.id").value(doctor.getId()));
	}

	@Test
	@WithMockUser(username = "testDoctor", authorities = {"DOCTOR"})
	public void testGetAppointmentsByDoctorId() throws Exception {
		// Arrange: Prepare test data
		Patient patient = new Patient();
		patient.setUsername("patientUser");
		patient.setPassword("password");
		patient.setEmail("patient@example.com");
		patientRepository.save(patient);

		Doctor doctor = new Doctor();
		doctor.setUsername("doctorUser");
		doctor.setPassword("password");
		doctor.setEmail("doctor@example.com");
		doctor.setSpecialty("Cardiology");
		doctorRepository.save(doctor);

		Doctor doctor2 = new Doctor();
		doctor2.setUsername("doctorUser2");
		doctor2.setPassword("password");
		doctor2.setEmail("doctor2@example.com");
		doctor2.setSpecialty("Cardiology");
		doctorRepository.save(doctor2);

		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date appointmentTime = formatter.parse("2021-08-01 09:00:00");
		Date appointmentTime2 = formatter.parse("2021-08-02 09:00:00");

		Appointment appointment1 = new Appointment();
		appointment1.setPatient(patient);
		appointment1.setDoctor(doctor);
		appointment1.setAppointmentTime(appointmentTime);
		appointmentRepository.save(appointment1);

		Appointment appointment2 = new Appointment();
		appointment2.setPatient(patient);
		appointment2.setDoctor(doctor2);
		appointment2.setAppointmentTime(appointmentTime2);
		appointmentRepository.save(appointment2);

		// Act: Perform the GET request to retrieve appointments by doctor ID
		mockMvc.perform(MockMvcRequestBuilders.get("/api/doctor/appointments")
						.param("doctorId", String.valueOf(doctor.getId()))
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(MockMvcResultMatchers.jsonPath("$[0].patient.id").value(patient.getId()))
				.andExpect(MockMvcResultMatchers.jsonPath("$[0].doctor.id").value(doctor.getId()));
	}

	@Test
	@WithMockUser(username = "testDoctor", authorities = {"DOCTOR"})
	public void testManageDoctorAvailability() throws Exception {
		// Arrange: Prepare test data
		Doctor doctor = new Doctor();
		doctor.setUsername("doctorUser");
		doctor.setPassword("password");
		doctor.setEmail("doctor@example.com");
		doctor.setSpecialty("Cardiology");
		doctor.setAvailability("Monday to Friday, 9 AM - 4 PM");
		doctorRepository.save(doctor);

		String newAvailability = "Monday to Friday, 9 AM - 5 PM";

		// Act: Perform the POST request to update doctor availability
		mockMvc.perform(MockMvcRequestBuilders.post("/api/doctor/availability")
						.param("doctorId", String.valueOf(doctor.getId()))
						.param("availability", newAvailability)
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(MockMvcResultMatchers.jsonPath("$.id").value(doctor.getId()))
				.andExpect(MockMvcResultMatchers.jsonPath("$.availability").value(newAvailability));

		// Optional: Verify saved data (if necessary)
		Doctor updatedDoctor = doctorRepository.findById(doctor.getId()).orElse(null);
		assertEquals(newAvailability, updatedDoctor.getAvailability());
	}

	@Test
	@WithMockUser(username = "testReceptionaist", authorities = {"RECEPTIONIST"})
	public void testReceptionistCanGetAllAppointments() throws Exception {
		// Arrange: Prepare test data
		Patient patient = new Patient();
		patient.setUsername("patientUser");
		patient.setPassword("password");
		patient.setEmail("patient@example.com");
		patientRepository.save(patient);

		Doctor doctor = new Doctor();
		doctor.setUsername("doctorUser");
		doctor.setPassword("password");
		doctor.setEmail("doctor@example.com");
		doctor.setSpecialty("Cardiology");
		doctorRepository.save(doctor);

		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date appointmentTime = formatter.parse("2021-08-01 09:00:00");
		Date appointmentTime2 = formatter.parse("2021-08-02 09:00:00");

		Appointment appointment1 = new Appointment();
		appointment1.setPatient(patient);
		appointment1.setDoctor(doctor);
		appointment1.setAppointmentTime(appointmentTime);
		appointmentRepository.save(appointment1);

		Appointment appointment2 = new Appointment();
		appointment2.setPatient(patient);
		appointment2.setDoctor(doctor);
		appointment2.setAppointmentTime(appointmentTime2);
		appointmentRepository.save(appointment2);

		// Act: Perform the GET request to retrieve all appointments
		mockMvc.perform(MockMvcRequestBuilders.get("/api/receptionist/appointments")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(MockMvcResultMatchers.jsonPath("$[0].patient.id").value(patient.getId()))
				.andExpect(MockMvcResultMatchers.jsonPath("$[0].doctor.id").value(doctor.getId()))
				.andExpect(MockMvcResultMatchers.jsonPath("$[1].patient.id").value(patient.getId()))
				.andExpect(MockMvcResultMatchers.jsonPath("$[1].doctor.id").value(doctor.getId()));
	}

	@Test
	@WithMockUser(username = "testReceptionaist", authorities = {"RECEPTIONIST"})
	public void testScheduleAppointmentByReceptionist() throws Exception {
		// Arrange: Prepare test data
		Patient patient = new Patient();
		patient.setUsername("patientUser");
		patient.setPassword("password");
		patient.setEmail("patient@example.com");
		patientRepository.save(patient);

		Doctor doctor = new Doctor();
		doctor.setUsername("doctorUser");
		doctor.setPassword("password");
		doctor.setEmail("doctor@example.com");
		doctor.setSpecialty("Cardiology");
		doctorRepository.save(doctor);

		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date appointmentTime = formatter.parse("2021-08-01 09:00:00");

		// Act: Perform the POST request to schedule an appointment
		mockMvc.perform(MockMvcRequestBuilders.post("/api/receptionist/appointment")
						.param("patientId", String.valueOf(patient.getId()))
						.param("doctorId", String.valueOf(doctor.getId()))
						.content(objectMapper.writeValueAsString(new TimeDto(appointmentTime)))
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(MockMvcResultMatchers.jsonPath("$.patient.id").value(patient.getId()))
				.andExpect(MockMvcResultMatchers.jsonPath("$.doctor.id").value(doctor.getId()));
		// Optional: Verify saved data (if necessary)
		List<Appointment> savedAppointment = appointmentRepository.findAll();
		assertNotNull(savedAppointment);
		assertEquals(1, savedAppointment.size());
	}


	@Test
	@WithMockUser(username = "testReceptionaist", authorities = {"RECEPTIONIST"})
	public void testRescheduleAppointment() throws Exception {
		// Arrange: Prepare test data
		Patient patient = new Patient();
		patient.setUsername("patientUser");
		patient.setPassword("password");
		patient.setEmail("patient@example.com");
		patientRepository.save(patient);

		Doctor doctor = new Doctor();
		doctor.setUsername("doctorUser");
		doctor.setPassword("password");
		doctor.setEmail("doctor@example.com");
		doctor.setSpecialty("Cardiology");
		doctorRepository.save(doctor);

		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date originalAppointmentTime = formatter.parse("2021-08-01 09:00:00");
		Date newAppointmentTime = formatter.parse("2021-08-02 09:00:00");

		Appointment appointment = new Appointment();
		appointment.setPatient(patient);
		appointment.setDoctor(doctor);
		appointment.setAppointmentTime(originalAppointmentTime);
		appointmentRepository.save(appointment);

		// Act: Perform the PUT request to reschedule the appointment
		mockMvc.perform(MockMvcRequestBuilders.put("/api/receptionist/appointment-reschedule/{appointmentId}", appointment.getId())
						.content(objectMapper.writeValueAsString(new TimeDto(newAppointmentTime)))
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(MockMvcResultMatchers.jsonPath("$.id").value(appointment.getId()))
				.andExpect(MockMvcResultMatchers.jsonPath("$.patient.id").value(patient.getId()))
				.andExpect(MockMvcResultMatchers.jsonPath("$.doctor.id").value(doctor.getId()));
		// Optional: Verify saved data (if necessary)
		Appointment updatedAppointment = appointmentRepository.findById(appointment.getId()).orElse(null);
		assertNotNull(updatedAppointment);
		assertEquals(newAppointmentTime, updatedAppointment.getAppointmentTime());
	}

	@Test
	@WithMockUser(authorities = {"RECEPTIONIST", "DOCTOR"})
	public void testReceptionistAndDoctorShouldNotAccessPatientApi() throws Exception {
// Act: Perform the GET request to retrieve all patients
		mockMvc.perform(MockMvcRequestBuilders.get("/api/patient/doctors")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(MockMvcResultMatchers.status().isForbidden());

		mockMvc.perform(MockMvcRequestBuilders.get("/api/patient/appointments")
						.param("patientId", "1")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(MockMvcResultMatchers.status().isForbidden());

		mockMvc.perform(MockMvcRequestBuilders.post("/api/patient/appointment")
						.param("patientId", "1")
						.param("doctorId", "1")
						.param("appointmentTime", "2021-08-01T09:00:00")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(MockMvcResultMatchers.status().isForbidden());
	}

	@Test
	@WithMockUser(authorities = {"RECEPTIONIST", "PATIENT"})
	public void testReceptionistAndPatientShouldNotAccessDoctorApi() throws Exception {
		mockMvc.perform(MockMvcRequestBuilders.get("/api/doctor/appointments")
						.param("doctorId", "1")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(MockMvcResultMatchers.status().isForbidden());

		mockMvc.perform(MockMvcRequestBuilders.post("/api/doctor/availability")
						.param("doctorId", "1")
						.param("availability", "Monday to Friday, 9 AM - 4 PM")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(MockMvcResultMatchers.status().isForbidden());
	}

	@Test
	@WithMockUser(authorities = {"DOCTOR", "PATIENT"})
	public void testPatientAndDoctorShouldNotAccessReceptionistApi() throws Exception {
		mockMvc.perform(MockMvcRequestBuilders.get("/api/receptionist/appointments")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(MockMvcResultMatchers.status().isForbidden());

		mockMvc.perform(MockMvcRequestBuilders.post("/api/receptionist/appointment")
						.param("patientId", "1")
						.param("doctorId", "1")
						.param("appointmentTime", "2021-08-01T09:00:00")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(MockMvcResultMatchers.status().isForbidden());

		mockMvc.perform(MockMvcRequestBuilders.put("/api/receptionist/appointment-reschedule/1")
						.param("newAppointmentTime", "2021-08-01T09:00:00")
						.contentType(MediaType.APPLICATION_JSON))
				.andExpect(MockMvcResultMatchers.status().isForbidden());
	}
	// ═══════════════════════════════════════════
// NEW BACKEND TEST CASES
// ═══════════════════════════════════════════

@Test

public void testRegisterPatientWithMissingFields() throws Exception {
    Patient patient = new Patient();
    patient.setUsername("incompletePatient");

    mockMvc.perform(MockMvcRequestBuilders.post("/api/patient/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(patient)))
            .andExpect(MockMvcResultMatchers.status().isCreated());
}
/* 
@Test
public void testRegisterPatientWithMissingFields() throws Exception {
    Patient patient = new Patient();
    patient.setUsername("incompletePatient");
    // Missing password, email, role

    mockMvc.perform(MockMvcRequestBuilders.post("/api/patient/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(patient)))
            .andExpect(MockMvcResultMatchers.status().isOk()); // saves with nulls
}
*/
@Test
public void testRegisterDoctorWithSpecialty() throws Exception {
    Doctor doctor = new Doctor();
    doctor.setUsername("specialistDoctor");
    doctor.setPassword("password");
    doctor.setEmail("specialist@example.com");
    doctor.setRole("DOCTOR");
    doctor.setSpecialty("Neurology");
    doctor.setAvailability("Yes");

    mockMvc.perform(MockMvcRequestBuilders.post("/api/doctors/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(doctor)))
            .andExpect(MockMvcResultMatchers.status().isCreated())
            .andExpect(MockMvcResultMatchers.jsonPath("$.specialty").value("Neurology"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.availability").value("Yes"));
}

@Test
@WithMockUser(username = "testPatient", authorities = {"PATIENT"})
public void testPatientCanViewMedicalRecords() throws Exception {
    Patient patient = new Patient();
    patient.setUsername("patientUser");
    patient.setPassword("password");
    patient.setEmail("patient@example.com");
    patientRepository.save(patient);

    Doctor doctor = new Doctor();
    doctor.setUsername("doctorUser");
    doctor.setPassword("password");
    doctor.setEmail("doctor@example.com");
    doctor.setSpecialty("Cardiology");
    doctorRepository.save(doctor);

    MedicalRecord record = new MedicalRecord();
    record.setPatient(patient);
    record.setDoctor(doctor);
    record.setDiagnosis("Fever");
    record.setTreatment("Rest and fluids");
    record.setRecordDate(java.time.LocalDateTime.now());
    medicalRecordRepository.save(record);

    mockMvc.perform(MockMvcRequestBuilders.get("/api/patient/medicalrecords")
            .param("patientId", String.valueOf(patient.getId()))
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].diagnosis").value("Fever"))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].treatment").value("Rest and fluids"));
}

@Test
@WithMockUser(username = "testPatient", authorities = {"PATIENT"})
public void testPatientMedicalRecordsEmpty() throws Exception {
    Patient patient = new Patient();
    patient.setUsername("newPatient");
    patient.setPassword("password");
    patient.setEmail("newpatient@example.com");
    patientRepository.save(patient);

    mockMvc.perform(MockMvcRequestBuilders.get("/api/patient/medicalrecords")
            .param("patientId", String.valueOf(patient.getId()))
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("$", hasSize(0)));
}

@Test
@WithMockUser(username = "testDoctor", authorities = {"DOCTOR"})
public void testDoctorAvailabilityUpdatedCorrectly() throws Exception {
    Doctor doctor = new Doctor();
    doctor.setUsername("availableDoctor");
    doctor.setPassword("password");
    doctor.setEmail("available@example.com");
    doctor.setSpecialty("Dermatology");
    doctor.setAvailability("No");
    doctorRepository.save(doctor);

    mockMvc.perform(MockMvcRequestBuilders.post("/api/doctor/availability")
            .param("doctorId", String.valueOf(doctor.getId()))
            .param("availability", "Yes")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("$.availability").value("Yes"));

    Doctor updated = doctorRepository.findById(doctor.getId()).orElse(null);
    assertNotNull(updated);
    assertEquals("Yes", updated.getAvailability());
}

@Test
@WithMockUser(username = "testReceptionist", authorities = {"RECEPTIONIST"})
public void testRescheduleAppointmentUpdatesTime() throws Exception {
    Patient patient = new Patient();
    patient.setUsername("p1");
    patient.setPassword("pass");
    patient.setEmail("p1@test.com");
    patientRepository.save(patient);

    Doctor doctor = new Doctor();
    doctor.setUsername("d1");
    doctor.setPassword("pass");
    doctor.setEmail("d1@test.com");
    doctor.setSpecialty("ENT");
    doctorRepository.save(doctor);

    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    Date original = formatter.parse("2024-01-01 10:00:00");
    Date newTime = formatter.parse("2024-01-02 11:00:00");

    Appointment appointment = new Appointment();
    appointment.setPatient(patient);
    appointment.setDoctor(doctor);
    appointment.setAppointmentTime(original);
    appointment.setStatus("Scheduled");
    appointmentRepository.save(appointment);

    mockMvc.perform(MockMvcRequestBuilders.put("/api/receptionist/appointment-reschedule/{id}", appointment.getId())
            .content(objectMapper.writeValueAsString(new TimeDto(newTime)))
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(appointment.getId()));

    Appointment updated = appointmentRepository.findById(appointment.getId()).orElse(null);
    assertNotNull(updated);
    assertEquals(newTime, updated.getAppointmentTime());
}

@Test
public void testLoginWithEmptyUsername() throws Exception {
    LoginRequest loginRequest = new LoginRequest("", "password");

    mockMvc.perform(MockMvcRequestBuilders.post("/api/user/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(MockMvcResultMatchers.status().isUnauthorized());
}

@Test
public void testLoginWithEmptyPassword() throws Exception {
    LoginRequest loginRequest = new LoginRequest("someuser", "");

    mockMvc.perform(MockMvcRequestBuilders.post("/api/user/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(MockMvcResultMatchers.status().isUnauthorized());
}

@Test
@WithMockUser(username = "testPatient", authorities = {"PATIENT"})
public void testAppointmentStatusIsScheduledAfterCreation() throws Exception {
    Patient patient = new Patient();
    patient.setUsername("statusPatient");
    patient.setPassword("password");
    patient.setEmail("status@example.com");
    patientRepository.save(patient);

    Doctor doctor = new Doctor();
    doctor.setUsername("statusDoctor");
    doctor.setPassword("password");
    doctor.setEmail("statusdoc@example.com");
    doctor.setSpecialty("Orthopedics");
    doctorRepository.save(doctor);

    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    Date appointmentTime = formatter.parse("2024-06-01 09:00:00");

    mockMvc.perform(MockMvcRequestBuilders.post("/api/patient/appointment")
            .param("patientId", String.valueOf(patient.getId()))
            .param("doctorId", String.valueOf(doctor.getId()))
            .content(objectMapper.writeValueAsString(new TimeDto(appointmentTime)))
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("$.status").value("Scheduled"));
}

@Test
@WithMockUser(username = "testReceptionist", authorities = {"RECEPTIONIST"})
public void testReceptionistScheduleAppointmentStatusIsScheduled() throws Exception {
    Patient patient = new Patient();
    patient.setUsername("recPatient");
    patient.setPassword("password");
    patient.setEmail("recpatient@example.com");
    patientRepository.save(patient);

    Doctor doctor = new Doctor();
    doctor.setUsername("recDoctor");
    doctor.setPassword("password");
    doctor.setEmail("recdoctor@example.com");
    doctor.setSpecialty("Pediatrics");
    doctorRepository.save(doctor);

    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    Date appointmentTime = formatter.parse("2024-07-01 10:00:00");

    mockMvc.perform(MockMvcRequestBuilders.post("/api/receptionist/appointment")
            .param("patientId", String.valueOf(patient.getId()))
            .param("doctorId", String.valueOf(doctor.getId()))
            .content(objectMapper.writeValueAsString(new TimeDto(appointmentTime)))
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("$.status").value("Scheduled"));
}

@Test
@WithMockUser(username = "testDoctor", authorities = {"DOCTOR"})
public void testDoctorCannotAccessReceptionistScheduleEndpoint() throws Exception {
    mockMvc.perform(MockMvcRequestBuilders.post("/api/receptionist/appointment")
            .param("patientId", "1")
            .param("doctorId", "1")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{}"))
            .andExpect(MockMvcResultMatchers.status().isForbidden());
}

@Test
@WithMockUser(username = "testPatient", authorities = {"PATIENT"})
public void testPatientCannotAccessReceptionistRescheduleEndpoint() throws Exception {
    mockMvc.perform(MockMvcRequestBuilders.put("/api/receptionist/appointment-reschedule/1")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{}"))
            .andExpect(MockMvcResultMatchers.status().isForbidden());
}

@Test
@WithMockUser(username = "testPatient", authorities = {"PATIENT"})
public void testPatientCannotUpdateDoctorAvailability() throws Exception {
    mockMvc.perform(MockMvcRequestBuilders.post("/api/doctor/availability")
            .param("doctorId", "1")
            .param("availability", "Yes")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.status().isForbidden());
}

@Test
@WithMockUser(username = "testReceptionist", authorities = {"RECEPTIONIST"})
public void testReceptionistCannotUpdateDoctorAvailability() throws Exception {
    mockMvc.perform(MockMvcRequestBuilders.post("/api/doctor/availability")
            .param("doctorId", "1")
            .param("availability", "Yes")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.status().isForbidden());
}

@Test
@WithMockUser(username = "testDoctor", authorities = {"DOCTOR"})
public void testDoctorGetAppointmentsReturnsEmptyWhenNone() throws Exception {
    Doctor doctor = new Doctor();
    doctor.setUsername("emptyDoctor");
    doctor.setPassword("password");
    doctor.setEmail("empty@example.com");
    doctor.setSpecialty("Ophthalmology");
    doctorRepository.save(doctor);

    mockMvc.perform(MockMvcRequestBuilders.get("/api/doctor/appointments")
            .param("doctorId", String.valueOf(doctor.getId()))
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("$", hasSize(0)));
}

@Test
@WithMockUser(username = "testPatient", authorities = {"PATIENT"})
public void testPatientGetAppointmentsReturnsEmptyWhenNone() throws Exception {
    Patient patient = new Patient();
    patient.setUsername("emptyPatient");
    patient.setPassword("password");
    patient.setEmail("empty@example.com");
    patientRepository.save(patient);

    mockMvc.perform(MockMvcRequestBuilders.get("/api/patient/appointments")
            .param("patientId", String.valueOf(patient.getId()))
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("$", hasSize(0)));
}

@Test
@WithMockUser(username = "testReceptionist", authorities = {"RECEPTIONIST"})
public void testReceptionistGetAllAppointmentsReturnsEmptyWhenNone() throws Exception {
    mockMvc.perform(MockMvcRequestBuilders.get("/api/receptionist/appointments")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andExpect(MockMvcResultMatchers.jsonPath("$", hasSize(0)));
}

@Test
public void testRegisterPatientReturnsCreatedStatus() throws Exception {
    Patient patient = new Patient();
    patient.setUsername("createdPatient");
    patient.setPassword("password");
    patient.setEmail("created@example.com");
    patient.setRole("PATIENT");

    mockMvc.perform(MockMvcRequestBuilders.post("/api/patient/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(patient)))
            .andExpect(MockMvcResultMatchers.status().isCreated());
}

@Test
public void testRegisterDoctorReturnsCreatedStatus() throws Exception {
    Doctor doctor = new Doctor();
    doctor.setUsername("createdDoctor");
    doctor.setPassword("password");
    doctor.setEmail("createddoctor@example.com");
    doctor.setRole("DOCTOR");
    doctor.setSpecialty("Surgery");

    mockMvc.perform(MockMvcRequestBuilders.post("/api/doctors/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(doctor)))
            .andExpect(MockMvcResultMatchers.status().isCreated());
}

@Test
public void testRegisterReceptionistReturnsCreatedStatus() throws Exception {
    Receptionist receptionist = new Receptionist();
    receptionist.setUsername("createdReceptionist");
    receptionist.setPassword("password");
    receptionist.setEmail("createdrec@example.com");
    receptionist.setRole("RECEPTIONIST");

    mockMvc.perform(MockMvcRequestBuilders.post("/api/receptionist/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(receptionist)))
            .andExpect(MockMvcResultMatchers.status().isCreated());
}

}
