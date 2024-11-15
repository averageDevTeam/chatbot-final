import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '../chatbot.service';


@Component({
	selector: 'app-chatbot',
	templateUrl: './chatbot.component.html',
	styleUrl: './chatbot.component.css'
})

export class ChatbotComponent implements OnInit {

	@ViewChild('bodyWrapper') bodyWrapper!: ElementRef;

	isProcessing: boolean = false
	step: any
	services: any = ["Door Step Delivery", "Book an Appointment", "Emergency"]
	selectedService: any = ''
	userInput: any = ''
	responseStructure: any[] = [{ heading: "", getmsg: "", options: [], notemsg: "", input: "" }]
	departments: any[] = []
	selectedDepartment: any;
	doctor: any[] = []
	selectedDoctor: any = ''
	date: any = ''
	selectedDate: any = ''
	timeSlots: any[] = []
	selectedTimeSlot: any = ''
	userInfo: any = [
		{
			firstName: "",
			lastName: "",
			phone: ""
		}
	]
	selectedDoorStepService: any = ''
	selectedfile: File | null = null
	otp: any = ''


	constructor(private chatbotService: DataService) { }

	ngOnInit(): void {
		this.initialOptions()
		console.log("step is :", this.step)
	}

	ngAfterViewChecked(): void {
		this.scrollToBottom();
	}

	buttonHandler(): void {
		// if (this.isProcessing || this.userInput.trim()) {
		// 	return;
		// }
		this.isProcessing = true

		switch (this.step) {
			case 0:
				this.handleServiceSelection()
				break;

			//getting department
			case 1:
				this.loadDoctors()
				break;

			//getting doctors and selecting department
			case 2:
				this.showDate()
				break;

			// getting date and selecting doctor
			case 3:
				this.loadSlots(this.selectedDoctor.id, this.date)
				break;

			// getting name and saving selected date
			case 4:
				this.getName()
				break;

			//getting phonenumber and formating and saving user name
			case 5:
				this.getNumber()
				break;

			// validation number and sending OTP
			case 6:
				this.sendOtp()
				break

			case 7:
				this.sendingAppointmentMail()
				break

			// get prescription
			case 11:
				this.getPrescription()
				break;

			//get name for door step delivery
			case 13:
				this.getNameDoorStep()
				break;

			case 14:


			case 15:



			//default
			default:
				this.defaultMsg()

		}

		this.isProcessing = false
	}


	// functions

	//initial options
	initialOptions(): void {
		const newEntry = {
			heading: "Namaste! Welcome to Rashtrotthana Hospital's appointment booking service.",
			getmsg: "How may we assist you today?",
			options: this.services,
			notemsg: "(Note : Please select a service by entering its number)",
			input: ""
		}
		this.responseStructure.push(newEntry)
		this.step = 0
	}

	//choose service
	async handleServiceSelection(): Promise<void> {

		try {
			const service = this.userInput
			if (service === "2" || service === "Book an appointment" || service === "I wanna Book an appointment" || service === "appointment") {
				this.selectedService = "Book an appointment"
				this.step = 1
				this.userInput = ''
				this.loadDepartments()
			}

			else if (service === "1" || service === "Door Step Delivery" || service === "I wanna order Medicines") {
				this.selectedService = "Door Step Services"
				this.step = 10
				this.userInput = ''
				this.getDoorStepService()
			}

			else if (service === "3" || service === "Emergency" || service === "I wanna call Ambulance") {
				this.selectedService = "Door Step Services"
				this.userInput = ''
			}

			else {
				const newEntry = {
					heading: "Please enter valid input.",
					getmsg: "",
					options: "",
					notemsg: "(Note : Please select a service by entering its number)",
					input: this.userInput
				}
				this.responseStructure.push(newEntry)
				this.userInput = ''
			}
		} catch (err) {
			console.log("the error is : ", err)
		}


	}

	//get deartments
	async loadDepartments(): Promise<void> {
		try {
			const data = await this.chatbotService.getDepartments().toPromise();
			this.departments = data

			if (this.selectedService === "Book an appointment") {
				const newEntry = {
					heading: `You have selected to book an appointment`,
					getmsg: "Choose a Department by entering its number",
					options: this.departments.map(dept => dept.name),
					notemsg: "(Note : Please select a service by entering its number)",
					input: this.selectedService
				}

				this.responseStructure.push(newEntry)
				this.userInput = ''
			}
			else {
				const newEntry = {
					heading: `Please choose valid service`,
					getmsg: "",
					options: "",
					notemsg: "(Note : Please select a department by entering its number)",
					input: this.userInput
				}
				this.responseStructure.push(newEntry)
			}

		} catch (error) {
			console.error('Error loading departments:', error);
			alert('Failed to load departments. Please try again later.');
		}
	}

	//load doctors and selecting department
	async loadDoctors(): Promise<void> {
		try {
			const selectedDepartment = this.departments.find(
				(dept: any, index: any) => index + 1 === +this.userInput || this.userInput === dept.name
			)

			if (selectedDepartment) {
				this.selectedDepartment = selectedDepartment

				const data = await this.chatbotService.getDoctors().toPromise();
				this.doctor = data.filter(
					(doc: any) => doc.departmentId === this.selectedDepartment.id
				)

				const newEntry = {
					heading: `You have choosen ${this.capitalizeName(this.selectedDepartment.name)}.`,
					getmsg: "Please choose a department.",
					options: this.doctor.map(doc => doc.name),
					notemsg: "(Note : Please select a doctor by entering their number)",
					input: this.capitalizeName(this.selectedDepartment.name)
				}

				this.responseStructure.push(newEntry)
				this.step = 2
				this.userInput = ''
			}

			else {
				const newEntry = {
					heading: `Please choose valid department`,
					getmsg: "",
					options: "",
					notemsg: "",
					input: this.userInput
				}

				this.responseStructure.push(newEntry)
			}
		}
		catch (err) {

		}
	}

	//load date and selecting doctor
	async showDate(): Promise<void> {
		const selectedDoctor = this.doctor.find(
			(doc, index) => index + 1 === +this.userInput || this.userInput.toLowerCase() === doc.name.toLowerCase()
		)

		if (selectedDoctor) {
			this.selectedDoctor = selectedDoctor

			const newEntry = {
				heading: `You selected ${this.selectedDoctor.name}`,
				getmsg: "Now, please enter your preferred appointment date",
				options: "",
				notemsg: "Note : (Select a valid date. No previous dates allowed.)",
				input: this.selectedDoctor.name
			}

			this.responseStructure.push(newEntry)
			this.step = 3
			this.userInput = ''
		}

		else {
			const newEntry = {
				heading: `Please choose valid doctors`,
				getmsg: "",
				options: "",
				notemsg: "",
				input: this.userInput
			}

			this.responseStructure.push(newEntry)
		}
	}

	// displaying slots and selecting date
	async loadSlots(doctorId: any, date: string): Promise<void> {
		try {
			const selectedDate = new Date(this.date);
			const currentDate = new Date();

			// Check if selected date is in the future
			if (selectedDate > currentDate) {
				this.selectedDate = this.date;

				// Fetch available slots from the backend
				const data = await this.chatbotService.getAvailableSlots(doctorId, date).toPromise();
				const availableFrom = data.availableFrom;
				const slotDuration = parseInt(data.slotDuration, 10);

				//Fetch unavailable slots from the backend
				// const unavailableData = await this.chatbotService.getUnavailableSlots(doctorId, date).toPromise();
				// const unavailableSlots = unavailableData.map((data:any)=> data.time)

				// parse start time and end time
				// const [unAvailStartTime, unAvailEndTime] = unavailableSlots.split('-')


				// Parse start and end times
				const [startTime, endTime] = availableFrom.split('-');
				const [startHour, startMin] = startTime.split(':').map(Number);
				const [endHour, endMin] = endTime.split(':').map(Number);

				const slots: string[] = [];
				const slotTime = new Date(selectedDate);
				slotTime.setHours(startHour, startMin, 0, 0);

				// If today, skip past slots
				if (selectedDate.toDateString() === currentDate.toDateString()) {
					if (slotTime <= currentDate) {
						slotTime.setHours(currentDate.getHours(), currentDate.getMinutes(), 0, 0);
					}
				}

				// Generate slots
				while (
					slotTime.getHours() < endHour ||
					(slotTime.getHours() === endHour && slotTime.getMinutes() < endMin)
				) {
					slots.push(this.formatTimeTo12Hour(slotTime));
					slotTime.setMinutes(slotTime.getMinutes() + slotDuration);
				}

				this.timeSlots = slots;

				const newEntry = {
					heading: `You entered ${this.selectedDate} as your appointment date.`,
					getmsg: "Now, please select a time slot from the available options.",
					options: this.timeSlots.map((slot) => slot),
					notemsg: "(Note: Please select a time slot by entering its number)",
					input: this.selectedDate
				};
				this.responseStructure.push(newEntry);

				this.step = 4;
				this.userInput = '';
			} else {
				// If date is in the past, show an error message
				const newEntry = {
					heading: "Please choose a valid date",
					getmsg: "",
					options: "",
					notemsg: "(Note: Select a valid date. No previous dates allowed.)",
					input: this.date
				};
				this.responseStructure.push(newEntry);
				this.date = '';
			}
		} catch (error) {
			console.error('Error fetching available slots:', error);
			alert('Failed to fetch available slots');
		}
	}

	// get name and get slots
	async getName(): Promise<void> {
		const selectedTimeSlot = this.timeSlots.find(
			(slot, index) => slot.time === this.userInput || index + 1 === +this.userInput
		)

		if (selectedTimeSlot) {
			this.selectedTimeSlot = selectedTimeSlot

			const newEntry = {
				heading: `You chose ${this.selectedTimeSlot} AM as your appointment slot`,
				getmsg: "Please enter your full name for the appointment.",
				options: "",
				notemsg: "(Note: Enter your name in the format: Firstname Lastname, e.g., Rajesh Kumar)",
				input: this.selectedTimeSlot
			}

			this.responseStructure.push(newEntry)
			this.step = 5
			this.userInput = ''

		}
		else {
			const newEntry = {
				heading: "Please choose a valid slot",
				getmsg: "",
				options: "",
				notemsg: "",
				input: this.userInput
			};
			this.responseStructure.push(newEntry);
		}
	}

	// get phone number and formating name and saving
	async getNumber(): Promise<void> {
		const pattern = /^[a-zA-Z\s]+$/;
		const name = this.userInput
		const isvalid = pattern.test(name)

		if (isvalid) {
			const [firstName, lastName] = name.split(' ')
			this.userInfo.firstName = firstName
			this.userInfo.lastName = lastName ? lastName : ''

			const newEntry = {
				heading: `You entered ${this.userInfo.firstName} ${this.userInfo.lastName} as your name.`,
				getmsg: "Next, please enter your phone number.",
				options: "",
				notemsg: "(Note: Enter your phone number in a 10-digit format, e.g., 9876543210)",
				input: `${this.userInfo.firstName} ${this.userInfo.lastName}`
			}
			this.responseStructure.push(newEntry)
			this.step = 6
			this.userInput = ''
		}
		else {
			const newEntry = {
				heading: `Please Enter valid name`,
				getmsg: "",
				options: "",
				notemsg: "",
				input: this.userInput
			}
			this.responseStructure.push(newEntry)
		}
	}

	// validating phone number and sending otp
	async sendOtp(): Promise<void> {
		const pattern = /^[6-9][0-9]{9}$/;
		const isvalid = pattern.test(this.userInput)

		if (isvalid) {
			this.userInfo.phone = `91${this.userInput}`

			this.otp = '123456'

			const newEntry = {
				heading: `You entered ${this.userInfo.phone} as your phone number. We will now send an OTP for verification.`,
				getmsg: "Please enter the OTP",
				options: "",
				notemsg: "",
				input: this.userInfo.phone
			}
			this.responseStructure.push(newEntry)

			this.step = 7
			this.userInput = ''

		}
		else {
			const newEntry = {
				heading: `Please enter valid Phone number`,
				getmsg: "",
				options: "",
				notemsg: "",
				input: this.userInfo.phone
			}
			this.responseStructure.push(newEntry)
		}
	}

	// verifying OTP and sending appointment details as mail
	async sendingAppointmentMail(): Promise<void> {
		const usersOtp = this.userInput

		if (usersOtp === this.otp) {
			console.log("doctor", this.selectedDoctor, "user", this.userInfo)
			const formdata = {
				doctorName: this.selectedDoctor.name,
				doctorDesignation: this.selectedDepartment.name,
				patientName: `${this.userInfo.firstName} ${this.userInfo.lastName}`,
				patientContact: this.userInfo.phone,
				appointmentDate: this.date,
				appointmentTime: this.selectedTimeSlot
			}

			console.log(formdata)
			console.log("email sent")

			this.chatbotService.appointMail(formdata).subscribe(
				(res) => {
					console.log('Email sent successfully', res);
					alert('Email sent successfully');
				},
				(err) => {
					console.error('Error sending email', err);
					alert('Failed to send email');
				}
			);
		}
	}

	// door step delivery functions

	// Door step services
	async getDoorStepService(): Promise<void> {
		const doorStepServices = ['Pharmacy', 'Blood Sample Collection']
		const newEntry = {
			heading: `You have selected doorstep delivery service.`,
			getmsg: "Please select the type of service by entering its number:",
			options: doorStepServices,
			notemsg: "",
			input: this.userInput
		}

		this.responseStructure.push(newEntry)
		this.step = 11
		this.userInput = ''
	}

	// getting prescription
	async getPrescription(): Promise<void> {
		if (this.userInput === "1" || this.userInput === "Pharmacy" || this.userInput === "pharmacy") {
			this.selectedDoorStepService = "Pharmacy"

			const newEntry = {
				heading: `You selected Pharmacy.`,
				getmsg: "Please upload your prescription to proceed.",
				options: '',
				notemsg: "",
				input: this.selectedDoorStepService
			}

			this.responseStructure.push(newEntry)
			this.step = 12
			this.userInput = ''
		}

		else if (this.userInput === "2" || this.userInput === "blood sample collection" || this.userInput === "Blood Sample Collection") {
			this.selectedDoorStepService = "Blood Sample Collection"

			const newEntry = {
				heading: `You selected Blood Sample Collection.`,
				getmsg: "Please upload your prescription to proceed.",
				options: '',
				notemsg: "",
				input: this.selectedDoorStepService
			}

			this.responseStructure.push(newEntry)
			this.step = 12
			this.userInput = ''
		}

		else {
			const newEntry = {
				heading: `Please Enter valid input`,
				getmsg: "",
				options: '',
				notemsg: "",
				input: this.userInput
			}

			this.responseStructure.push(newEntry)
		}
	}

	async savaPrescription(event: Event): Promise<void> {
		const fileInput = event.target as HTMLInputElement;
		if (fileInput.files && fileInput.files.length > 0) {
			this.selectedfile = fileInput.files[0];
		}

		if (this.selectedfile) {
			this.chatbotService.postImage(this.selectedfile).subscribe(
				(response) => {
					console.log("image uploaded successfully", response)
					console.log(this.selectedfile)
				},
				(error) => {
					console.log("falied to upload image", error)
				}
			)

			this.userInput = ''
			const newEntry = {
				heading: `Thank you! Your prescription has been received. Now, please provide the following details to complete the service request`,
				getmsg: "Enter your full name.",
				options: '',
				notemsg: "(Note: Enter your name in the format: Firstname Lastname, e.g., Rajesh Kumar)",
				input: this.selectedfile.name
			}

			this.responseStructure.push(newEntry)

			this.step = 13
		}
		else {
			alert("Please upload the valid file")
		}
	}

	// getting Name for door step delivery
	async getNameDoorStep(): Promise<void> {
		const pattern = /^[a-zA-Z\s]+$/;
		const name = this.userInput
		const isvalid = pattern.test(name)

		if (isvalid) {
			const [firstName, lastName] = name.split(' ')
			this.userInfo.firstName = firstName
			this.userInfo.lastName = lastName ? lastName : ''
			const newEntry = {
				heading: `You entered ${this.userInfo.firstName} ${this.userInfo.lastName} as your name.`,
				getmsg: "Next, please enter your address.",
				options: "",
				notemsg: "(Note: Enter your phone number in a 10-digit format, e.g., 9876543210)",
				input: `${this.userInfo.firstName} ${this.userInfo.lastName}`
			}
			this.responseStructure.push(newEntry)
			this.step = 15
			this.userInput = ''
		}
		else {
			const newEntry = {
				heading: `Please Enter valid name`,
				getmsg: "",
				options: "",
				notemsg: "",
				input: this.userInput
			}
			this.responseStructure.push(newEntry)
		}
	}

	// getting address 


	//capitalize
	capitalizeName(name: string): string {
		return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
	}

	//default if user give any invalid input
	defaultMsg(): void {
		const newEntry = {
			heading: `Please enter valid input`,
			getmsg: "",
			options: "",
			notemsg: "",
			input: this.userInput
		}

		this.responseStructure.push(newEntry)
	}

	//12 hour time formater
	formatTimeTo12Hour(date: Date): string {
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const suffix = hours >= 12 ? 'PM' : 'AM';
		const formattedHour = hours % 12 || 12; // Convert hour to 12-hour format
		const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
		return `${formattedHour}:${formattedMinutes} ${suffix}`;
	}

	//refresh
	refresh(): void {
		try {
			this.isProcessing = false;
			this.step = 0;
			this.selectedService = '';
			this.userInput = '';
			this.selectedDepartment = null;
			this.doctor = [];
			this.responseStructure = [];

			const newEntry = {
				heading: '',
				getmsg: "",
				options: "",
				notemsg: "",
				input: "refresh"
			}
			this.responseStructure.push(newEntry)
			this.initialOptions()
		}
		catch (err) {
			console.log("the errot is : ", err)
		}
	}

	//auto scroll down
	scrollToBottom(): void {
		if (this.bodyWrapper) {
			this.bodyWrapper.nativeElement.scrollTop = this.bodyWrapper.nativeElement.scrollHeight;
		}
	}
}
