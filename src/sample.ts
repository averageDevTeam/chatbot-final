// import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
// import { DataService } from '../chatbot.service';

// // @Component({
// //   selector: 'app-chatbot',
// // //   templateUrl: './chatbot.component.html',
// //   styleUrl: './chatbot.component.css'
// // })
// export class ChatbotComponent {

//   @ViewChild('bodyWrapper') bodyWrapper!: ElementRef;

//   // Variables
//   isProcessing: boolean = false;
//   step: number = 0;
//   services: string[] = ['Door step delivery', 'Book an Appointment', 'Emergency'];
//   userInput: string = '';
//   responseStructure: any[] = [];
//   departments: any[] = [];
//   doctors: any[] = [];
//   selectedDepartment: any;
//   selectedDoctor: any;
//   timeSlots: string[] = [];
//   selectedTimeSlot: string = '';
//   userInfo: any = { name: '', phone: '' };
//   selectedFile: File | null = null;
//   doorServices: string[] = ['Pharmacy', 'Blood sample collection'];
//   selectedDoorService: string = '';
//   address: string = '';

// //   constructor(private chatbotService: DataService) {}

//   ngOnInit(): void {
//     this.showInitialOptions();
//   }

//   ngAfterViewChecked(): void {
//     this.scrollToBottom();
//   }

//   // Show initial options to user
//   showInitialOptions(): void {
//     const newEntry = {
//       heading: "Namaste! Welcome to Rashtrotthana Hospital's appointment booking service. How may we assist you today? Please select a service by entering its number:",
//       option: [...this.services],
//     };
//     this.responseStructure.push(newEntry);
//   }

//   // Handle button click or Enter key press
//   async buttonHandler(): Promise<void> {
//     if (this.isProcessing || !this.userInput.trim()) {
//       return;
//     }
//     this.isProcessing = true;

//     try {
//       switch (this.step) {
//         case 0:
//           await this.handleServiceSelection();
//           break;
//         case 1:
//           await this.handleDepartmentSelection();
//           break;
//         case 2:
//           await this.handleDoctorSelection();
//           break;
//         case 3:
//           this.handleDateSelection();
//           break;
//         case 4:
//           await this.handleTimeSlotSelection();
//           break;
//         case 5:
//           this.handleUserNameInput();
//           break;
//         case 6:
//           this.handlePhoneNumberInput();
//           break;
//         case 7:
//           await this.verifyPhoneNumber();
//           break;
//         case 12:
//           await this.handleDoorStepServiceSelection();
//           break;
//         case 13:
//           await this.handleFileUpload();
//           break;
//         case 14:
//           this.handleNameForDoorStep();
//           break;
//         case 15:
//           this.handleAddressInput();
//           break;
//         case 16:
//           this.handlePhoneNumberForDoorStep();
//           break;
//         default:
//           alert('Please enter a valid input');
//       }
//     } catch (error) {
//       console.error('Error in buttonHandler:', error);
//     } finally {
//       this.isProcessing = false;
//       this.userInput = '';
//     }
//   }

//   // Handle service selection
//   async handleServiceSelection(): Promise<void> {
//     const serviceIndex = parseInt(this.userInput);
//     if (serviceIndex > 0 && serviceIndex <= this.services.length) {
//       const selectedService = this.services[serviceIndex - 1];
//       this.addResponse(`You selected: ${selectedService}`);

//       if (selectedService === 'Book an Appointment') {
//         await this.loadDepartments();
//       } else if (selectedService === 'Door step delivery') {
//         this.step = 12;
//         this.addResponse('You have selected doorstep delivery service. Please select the type of service by entering its number:', this.doorServices);
//       }
//     } else {
//       alert('Invalid selection. Please try again.');
//     }
//   }

//   // Load departments
//   async loadDepartments(): Promise<void> {
//     try {
//       this.departments = await this.chatbotService.getDepartments().toPromise();
//       this.addResponse('Please choose a Department by entering its number:', this.departments.map((dept: any) => dept.name));
//       this.step = 1;
//     } catch (error) {
//       console.error('Error loading departments:', error);
//       alert('Failed to load departments. Please try again later.');
//     }
//   }

//   // Handle department selection
//   async handleDepartmentSelection(): Promise<void> {
//     const departmentIndex = parseInt(this.userInput);
//     if (departmentIndex > 0 && departmentIndex <= this.departments.length) {
//       this.selectedDepartment = this.departments[departmentIndex - 1];
//       this.addResponse(`You selected: ${this.selectedDepartment.name}`);
//       await this.loadDoctors(this.selectedDepartment.id);
//     } else {
//       alert('Invalid department selection. Please try again.');
//     }
//   }

//   // Load doctors based on department
//   async loadDoctors(departmentId: number): Promise<void> {
//     try {
//       const allDoctors = await this.chatbotService.getDoctors().toPromise();
//       this.doctors = allDoctors.filter((doctor: any) => doctor.departmentId === departmentId);
//       this.addResponse('Please choose a Doctor by entering their number:', this.doctors.map((doc: any) => doc.name));
//       this.step = 2;
//     } catch (error) {
//       console.error('Error loading doctors:', error);
//       alert('Failed to load doctors. Please try again later.');
//     }
//   }

//   // Handle doctor selection
//   async handleDoctorSelection(): Promise<void> {
//     const doctorIndex = parseInt(this.userInput);
//     if (doctorIndex > 0 && doctorIndex <= this.doctors.length) {
//       this.selectedDoctor = this.doctors[doctorIndex - 1];
//       this.addResponse(`You selected: Dr. ${this.selectedDoctor.name}`);
//       this.step = 3;
//     } else {
//       alert('Invalid doctor selection. Please try again.');
//     }
//   }

//   // Handle date selection
//   handleDateSelection(): void {
//     if (this.isValidDate(this.userInput)) {
//       this.addResponse(`You selected: ${this.userInput}`);
//       this.step = 4;
//     } else {
//       alert('Invalid date format. Please use YYYY-MM-DD.');
//     }
//   }

//   // Handle time slot selection
//   async handleTimeSlotSelection(): Promise<void> {
//     const timeSlotIndex = parseInt(this.userInput);
//     if (timeSlotIndex > 0 && timeSlotIndex <= this.timeSlots.length) {
//       this.selectedTimeSlot = this.timeSlots[timeSlotIndex - 1];
//       this.addResponse(`You selected: ${this.selectedTimeSlot}`);
//       this.step = 5;
//     } else {
//       alert('Invalid time slot selection. Please try again.');
//     }
//   }

//   // Handle user name input
//   handleUserNameInput(): void {
//     if (/^[a-zA-Z\s]+$/.test(this.userInput)) {
//       this.userInfo.name = this.userInput;
//       this.addResponse(`You entered: ${this.userInfo.name}`);
//       this.step = 6;
//     } else {
//       alert('Invalid name. Please enter alphabets only.');
//     }
//   }

//   // Handle phone number input
//   handlePhoneNumberInput(): void {
//     if (/^[6-9][0-9]{9}$/.test(this.userInput)) {
//       this.userInfo.phone = `91${this.userInput}`;
//       this.addResponse(`You entered: ${this.userInfo.phone}`);
//       this.step = 7;
//     } else {
//       alert('Invalid phone number. Please enter a valid 10-digit number.');
//     }
//   }

//   // Verify phone number (e.g., OTP verification)
//   async verifyPhoneNumber(): Promise<void> {
//     try {
//       // Assume OTP verification happens here
//       this.addResponse('Phone number verified successfully.');
//       this.step = 8; // Proceed to next step if needed
//     } catch (error) {
//       console.error('Error verifying phone number:', error);
//       alert('Failed to verify phone number. Please try again.');
//     }
//   }

//   // Handle doorstep service selection
//   async handleDoorStepServiceSelection(): Promise<void> {
//     const serviceIndex = parseInt(this.userInput);
//     if (serviceIndex > 0 && serviceIndex <= this.doorServices.length) {
//       this.selectedDoorService = this.doorServices[serviceIndex - 1];
//       this.addResponse(`You selected: ${this.selectedDoorService}. Please upload your prescription to proceed.`);
//       this.step = 13;
//     } else {
//       alert('Invalid selection. Please try again.');
//     }
//   }

//   // Handle file upload for doorstep service
//   async handleFileUpload(): Promise<void> {
//     if (this.selectedFile) {
//       try {
//         await this.chatbotService.postImage(this.selectedFile).toPromise();
//         this.addResponse('Prescription uploaded successfully. Please enter your full name.');
//         this.step = 14;
//       } catch (error) {
//         console.error('Error uploading prescription:', error);
//         alert('Failed to upload prescription. Please try again.');
//       }
//     } else {
//       alert('Please select a file to upload.');
//     }
//   }

//   // Handle name input for doorstep service
//   handleNameForDoorStep(): void {
//     if (/^[a-zA-Z\s]+$/.test(this.userInput)) {
//       this.userInfo.name = this.userInput;
//       this.addResponse(`You entered: ${this.userInfo.name}. Please enter your delivery address.`);
//       this.step = 15;
//     } else {
//       alert('Invalid name. Please enter alphabets only.');
//     }
//   }

//   // Handle address input for doorstep service
//   handleAddressInput(): void {
//     if (/^[a-zA-Z0-9\s,.'-]{3,100}$/.test(this.userInput)) {
//       this.address = this.userInput;
//       this.addResponse(`You entered: ${this.address}. Please enter your phone number.`);
//       this.step = 16;
//     } else {
//       alert('Invalid address. Please enter a valid address.');
//     }
//   }

//   // Handle phone number input for doorstep service
//   handlePhoneNumberForDoorStep(): void {
//     if (/^[6-9][0-9]{9}$/.test(this.userInput)) {
//       this.userInfo.phone = `91${this.userInput}`;
//       this.addResponse(`You entered: ${this.userInfo.phone}. We will now send an OTP for verification.`);
//       this.step = 17;
//     } else {
//       alert('Invalid phone number. Please enter a valid 10-digit number.');
//     }
//   }

//   // Add a response to the chat structure
//   addResponse(heading: string, options: string[] = []): void {
//     this.responseStructure.push({
//       heading,
//       option: options,
//       input: this.userInput,
//     });
//   }

//   // Utility to scroll to bottom of chat
//   scrollToBottom(): void {
//     if (this.bodyWrapper) {
//       this.bodyWrapper.nativeElement.scrollTop = this.bodyWrapper.nativeElement.scrollHeight;
//     }
//   }

//   // Utility to validate date format
//   isValidDate(dateString: string): boolean {
//     return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
//   }
// }



// async loadSlots(doctorId: any, date: string): Promise<void> {
//     try {
//       const selectedDate = new Date(this.date);
//       const currentDate = new Date();
  
//       // Check if selected date is in the future
//       if (selectedDate > currentDate) {
//         this.selectedDate = this.date;
  
//         // Fetch available slots from the backend
//         const data = await this.chatbotService.getAvailableSlots(doctorId, date).toPromise();
//         const availableFrom = data.availableFrom;
//         const slotDuration = parseInt(data.slotDuration, 10);
  
//         // Fetch unavailable slots from the backend
//         const unavailableData = await this.chatbotService.getUnavailableSlots(doctorId, date).toPromise();
//         const unavailableSlots = unavailableData.map((data: any) => data.time);
  
//         // Parse start and end times
//         const [startTime, endTime] = availableFrom.split('-');
//         const [startHour, startMin] = startTime.split(':').map(Number);
//         const [endHour, endMin] = endTime.split(':').map(Number);
  
//         const slots: string[] = [];
//         const slotTime = new Date(selectedDate);
//         slotTime.setHours(startHour, startMin, 0, 0);
  
//         // If today, skip past slots
//         if (selectedDate.toDateString() === currentDate.toDateString()) {
//           if (slotTime <= currentDate) {
//             slotTime.setHours(currentDate.getHours(), currentDate.getMinutes(), 0, 0);
//           }
//         }
  
//         // Generate all possible slots and filter out unavailable slots
//         while (
//           slotTime.getHours() < endHour ||
//           (slotTime.getHours() === endHour && slotTime.getMinutes() < endMin)
//         ) {
//           const formattedSlot = this.formatTimeTo12Hour(slotTime);
          
//           // Only add the slot if it's not in the list of unavailable slots
//           if (!unavailableSlots.includes(formattedSlot)) {
//             slots.push(formattedSlot);
//           }
  
//           slotTime.setMinutes(slotTime.getMinutes() + slotDuration);
//         }
  
//         this.timeSlots = slots;
  
//         const newEntry = {
//           heading: `You entered ${this.selectedDate} as your appointment date.`,
//           getmsg: "Now, please select a time slot from the available options.",
//           options: this.timeSlots.map((slot) => slot),
//           notemsg: "(Note: Please select a time slot by entering its number)",
//           input: this.selectedDate
//         };
//         this.responseStructure.push(newEntry);
  
//         this.step = 4;
//         this.userInput = '';
//       } else {
//         // If date is in the past, show an error message
//         const newEntry = {
//           heading: "Please choose a valid date",
//           getmsg: "",
//           options: "",
//           notemsg: "(Note: Select a valid date. No previous dates allowed.)",
//           input: this.date
//         };
//         this.responseStructure.push(newEntry);
//         this.date = '';
//       }
//     } catch (error) {
//       console.error('Error fetching available slots:', error);
//       alert('Failed to fetch available slots');
//     }
//   }
  
//   // Helper function to format time in 12-hour format with AM/PM suffix
//   formatTimeTo12Hour(date: Date): string {
//     const hours = date.getHours();
//     const minutes = date.getMinutes();
//     const suffix = hours >= 12 ? 'PM' : 'AM';
//     const formattedHour = hours % 12 || 12; // Convert hour to 12-hour format
//     const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
//     return `${formattedHour}:${formattedMinutes} ${suffix}`;
//   }
  