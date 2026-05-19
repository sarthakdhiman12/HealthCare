import { Component } from '@angular/core';

interface FAQ {
  question: string;
  answer: string;
  open: boolean;
}

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent {

  isChatOpen: boolean = false;
  activeTab: 'chat' | 'faq' = 'faq';
  userInput: string = '';

  chatMessages: ChatMessage[] = [
    { text: 'Hi! 👋 I\'m HAM Assistant. Ask me anything about our hospital, appointments, or services!', sender: 'bot' }
  ];

  faqs: FAQ[] = [
    {
      question: 'What services does HAM System offer?',
      answer: 'HAM System offers multispeciality healthcare services including Cardiology, Neurology, Orthopedics, Pulmonology, ENT, Dermatology, General Medicine, and Pediatrics. We provide outpatient consultations, diagnostics, and appointment management.',
      open: false
    },
    {
      question: 'How can I book an appointment at HAM System?',
      answer: 'You can book an appointment by registering on our platform first. Click "Book Appointment" on the homepage, register as a patient, then log in and select your preferred doctor, date, and time to schedule your appointment.',
      open: false
    },
    {
      question: 'What specialties are available at HAM System?',
      answer: 'We offer 8 specialties: Cardiology, Neurology, Orthopedics, Pulmonology, ENT, Dermatology, General Medicine, and Pediatrics. Each department has expert doctors with years of experience.',
      open: false
    },
    {
      question: 'How much do consultations cost?',
      answer: 'Consultation fees vary by specialty: Cardiology ₹1500, Neurology ₹2000, Orthopedics ₹1200, Dermatology ₹800, Pediatrics ₹700, ENT ₹900, and General Medicine ₹500.',
      open: false
    },
    {
      question: 'Can I reschedule my appointment?',
      answer: 'Yes! You can reschedule your appointment from the Patient Dashboard. Go to "My Appointments", click "Reschedule" on the appointment you want to change, select a new date and time, and confirm.',
      open: false
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept Card payments, UPI, and Net Banking through our online payment system. Receptionists can also book appointments with offline (pay at hospital) payment mode.',
      open: false
    },
    {
      question: 'How do I check doctor availability?',
      answer: 'Doctor availability is shown on the booking page. Only doctors marked as "Available" will appear when you try to schedule an appointment. Doctors can update their availability status from their dashboard.',
      open: false
    },
    {
      question: 'Is HAM System equipped for emergencies?',
      answer: 'HAM System currently focuses on scheduled appointments and consultations. For emergencies, please call our emergency helpline at +91 98765 43211 or visit the nearest emergency room.',
      open: false
    },
    {
      question: 'How does HAM System ensure patient safety?',
      answer: 'We use JWT-based secure authentication, role-based access control, and encrypted data transmission. Patient data is protected and only accessible by authorized personnel.',
      open: false
    },
    {
      question: 'Can a receptionist book appointments for patients?',
      answer: 'Yes! Receptionists can book appointments on behalf of patients. They can select the patient, choose a doctor, pick the date/time, and also choose between online or offline payment mode.',
      open: false
    }
  ];

  // Knowledge base for chatbot
  private knowledgeBase: { keywords: string[]; answer: string }[] = [
    {
      keywords: ['services', 'offer', 'provide', 'what do you'],
      answer: 'HAM System offers multispeciality healthcare services including Cardiology, Neurology, Orthopedics, Pulmonology, ENT, Dermatology, General Medicine, and Pediatrics.'
    },
    {
      keywords: ['book', 'appointment', 'schedule', 'booking'],
      answer: 'To book an appointment: 1) Register on our platform 2) Log in as Patient 3) Go to "Schedule Appointment" 4) Select a doctor 5) Choose date & time 6) Confirm!'
    },
    {
      keywords: ['specialty', 'specialties', 'departments', 'department'],
      answer: 'We have 8 specialties: Cardiology, Neurology, Orthopedics, Pulmonology, ENT, Dermatology, General Medicine, and Pediatrics.'
    },
    {
      keywords: ['cost', 'fee', 'fees', 'price', 'charge', 'much'],
      answer: 'Consultation fees: Cardiology ₹1500, Neurology ₹2000, Orthopedics ₹1200, Dermatology ₹800, Pediatrics ₹700, ENT ₹900, General Medicine ₹500.'
    },
    {
      keywords: ['reschedule', 'change', 'modify', 'update appointment'],
      answer: 'Yes! Go to your Patient Dashboard → My Appointments → Click "Reschedule" → Select new date/time → Confirm. Easy!'
    },
    {
      keywords: ['payment', 'pay', 'card', 'upi', 'online'],
      answer: 'We accept Card, UPI, and Net Banking payments online. Receptionists can also set offline (pay at hospital) mode.'
    },
    {
      keywords: ['doctor', 'available', 'availability'],
      answer: 'Doctor availability is shown on the booking page. Only available doctors appear. Doctors can toggle their availability from their dashboard.'
    },
    {
      keywords: ['emergency', 'urgent', 'critical'],
      answer: 'For emergencies, please call +91 98765 43211 immediately. HAM System focuses on scheduled consultations, but our emergency line is always active.'
    },
    {
      keywords: ['safe', 'safety', 'secure', 'security', 'data'],
      answer: 'We use JWT authentication, role-based access, and encrypted data. Your health data is fully protected and only accessible by authorized staff.'
    },
    {
      keywords: ['receptionist', 'front desk', 'reception'],
      answer: 'Receptionists can view all appointments, book appointments for patients, choose payment modes, and manage the hospital scheduling system.'
    },
    {
      keywords: ['register', 'sign up', 'create account', 'new user'],
      answer: 'Click "Book Appointment" or "Register here" on the login page. Fill in your username, email, password, and select your role (Patient/Doctor/Receptionist).'
    },
    {
      keywords: ['login', 'sign in', 'log in', 'access'],
      answer: 'Go to the login page, enter your username and password, and click Login. You\'ll be redirected to your role-based dashboard.'
    },
    {
      keywords: ['contact', 'phone', 'email', 'call', 'reach'],
      answer: 'Contact us: General: +91 98765 43210 | Emergency: +91 98765 43211 | Email: info@hamsystem.com | Toll Free: 1800-HAM-CARE'
    },
    {
      keywords: ['location', 'address', 'where', 'find'],
      answer: 'HAM Healthcare Tower, 123 Medical Avenue, Suite 500, Mumbai, Maharashtra 400001.'
    },
    {
      keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
      answer: 'Hello! 👋 Welcome to HAM System. How can I help you today? You can ask about appointments, doctors, services, or fees!'
    },
    {
      keywords: ['thank', 'thanks', 'thank you'],
      answer: 'You\'re welcome! 😊 Is there anything else I can help you with?'
    },
    {
      keywords: ['bye', 'goodbye', 'see you'],
      answer: 'Goodbye! 👋 Take care of your health. We\'re always here if you need us!'
    }
  ];

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  switchTab(tab: 'chat' | 'faq'): void {
    this.activeTab = tab;
  }

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    const userMsg = this.userInput.trim();
    this.chatMessages.push({ text: userMsg, sender: 'user' });
    this.userInput = '';

    // Generate bot response
    setTimeout(() => {
      const botReply = this.getBotResponse(userMsg);
      this.chatMessages.push({ text: botReply, sender: 'bot' });
    }, 600);
  }

  private getBotResponse(input: string): string {
    const lowerInput = input.toLowerCase();

    for (const entry of this.knowledgeBase) {
      for (const keyword of entry.keywords) {
        if (lowerInput.includes(keyword)) {
          return entry.answer;
        }
      }
    }

    return 'I\'m not sure about that. 🤔 You can ask me about:\n• Appointments & Booking\n• Doctor Availability\n• Consultation Fees\n• Our Specialties\n• Payment Methods\n• Contact Info';
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }
}