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
	services: any = ["Doorstep Delivery", "Book an Appointment", "Emergency Service"]
	selectedService: any = ''
	userInput: any = ''
	responseStructure: any[] = [{ heading: "", getmsg: "", options: [], notemsg: "", input: "", emergency: "", patientName: "", doctorName: "", department: "", date: "", timeslot: "" }]
	departments: any[] = []
	selectedDepartment: any;
	doctor: any[] = []
	selectedDoctor: any = ''
	date: any = ''
	selectedDate: any = ''
	timeSlots: any[] = []
	selectedTimeSlot: any = ''
	userInfo: any = 
		{
			firstName: "",
			lastName: "",
			phone: "",
		}
	selectedDoorStepService: any = ''
	selectedfile: File | null = null
	otp: any = ''
	selectedLocationType: any
	latitude: number | undefined;
	longitude: number | undefined;
	address: string | undefined;
	errorMessage: string | undefined;
	locationErrormsg: any;
	otpExpireTime: any = null
	serviceChoosen : string = ''


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
				break;

			//validating otp and sending mail
			case 7:
				this.confirmAppointment()
				break;

			case 8:
				this.sendingAppointmentMail()
				break;

			// get prescription
			case 11:
				this.getNameDoorStep()
				break;

			//get name for Doorstep Delivery
			case 12:
				this.getNameDoorStep()
				break;

			//get location type
			case 13:
				this.chooseLocationType()
				break;

			//confirmLocation
			case 14:
				this.userLocation()
				break;

			case 16:
				this.confirmLocation()
				break;

			case 17:
				this.getPhoneNumManual()
				break;

			case 18:
				this.DoorstepOtp()
				break

			case 19:
				this.getPrescription()
				break

			case 21:
				this.confirmOrder()
				break



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
			heading: "Namaste! Welcome to Rashtrotthana Hospital's Help Desk.",
			getmsg: "How may I assist you today?",
			options: this.services,
			notemsg: "(Note : Please select a service by entering its number)",
			input: "",
			emergency: "",
			patientName: "",
			doctorName: "",
			department: "",
			date: "",
			timeslot: ""
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

			else if (service === "1" || service === "Doorstep Delivery" || service === "I wanna order Medicines") {
				this.selectedService = "Door Step Services"
				this.step = 10
				this.userInput = 'Doorstep Delivery'
				this.getDoorStepService()
			}

			else if (service === "3" || service === "Emergency" || service === "I wanna call Ambulance" || service === "Emergency Service") {
				this.emergencyServices()
			}

			else {
				const newEntry = {
					heading: "Please enter valid input.",
					getmsg: "",
					options: "",
					notemsg: "(Note : Please select a service by entering its number)",
					input: this.userInput,
					emergency: "",
					patientName: "",
					doctorName: "",
					department: "",
					date: "",
					timeslot: ""
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
			this.serviceChoosen = "Appointment servics"
			const data = await this.chatbotService.getDepartments().toPromise();
			this.departments = data

			if (this.selectedService === "Book an appointment") {
				const newEntry = {
					heading: `You have selected to book an appointment`,
					getmsg: "Choose a Department by entering its number",
					options: this.departments.map(dept => dept.name),
					notemsg: "(Note : Please select a service by entering its number)",
					input: this.selectedService,
					emergency: "",
					patientName: "",
					doctorName: "",
					department: "",
					date: "",
					timeslot: ""
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
					input: this.userInput,
					emergency: "",
					patientName: "",
					doctorName: "",
					department: "",
					date: "",
					timeslot: ""

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
				(dept: any, index: any) => index + 1 === +this.userInput || this.userInput.toLowerCase() === dept.name.toLowerCase()
			)

			if (selectedDepartment) {
				this.selectedDepartment = selectedDepartment

				const data = await this.chatbotService.getDoctors().toPromise();
				this.doctor = data.filter(
					(doc: any) => doc.departmentId === this.selectedDepartment.id
				)

				const newEntry = {
					heading: `You have choosen ${this.capitalizeName(this.selectedDepartment.name)}.`,
					getmsg: "Please choose a doctor.",
					options: this.doctor.map(doc => doc.name),
					notemsg: "(Note : Please select a doctor by entering their number)",
					input: this.capitalizeName(this.selectedDepartment.name),
					emergency: "",
					patientName: "",
					doctorName: "",
					department: "",
					date: "",
					timeslot: ""
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
					input: this.userInput,
					emergency: "",
					patientName: "",
					doctorName: "",
					department: "",
					date: "",
					timeslot: ""
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
				heading: `You have selected ${this.selectedDoctor.name}`,
				getmsg: "Now, please enter your preferred appointment date",
				options: "",
				notemsg: "Note : (Select a valid date. No previous dates allowed.)",
				input: this.selectedDoctor.name,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
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
				input: this.userInput,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}

			this.responseStructure.push(newEntry)
		}
	}

	// displaying slots and selecting date
	async loadSlots(doctorId: any, date: string): Promise<void> {
		try {
			const selectedDate = new Date(this.date);
			const currentDate = new Date();

			if (selectedDate > currentDate) {
				this.selectedDate = this.date;

				// Fetch available slots and unavailable slots from the backend
				const availableData = await this.chatbotService.getAvailableSlots(doctorId, date).toPromise();
				const unavailableData = await this.chatbotService.getUnavailableSlots(doctorId, date).toPromise();

				const availableFrom = availableData.availableFrom; // E.g., "10:00-16:00"
				const slotDuration = parseInt(availableData.slotDuration, 10); // E.g., 30 minutes
				const unavailableSlots = unavailableData.map((data: any) => data.time); // Unavailable slots

				// Parse available time range
				const [startTime, endTime] = availableFrom.split('-');
				const [startHour, startMin] = startTime.split(':').map(Number);
				const [endHour, endMin] = endTime.split(':').map(Number);

				const slots: string[] = [];
				const slotTime = new Date(selectedDate);
				slotTime.setHours(startHour, startMin, 0, 0);

				const endSlotTime = new Date(selectedDate);
				endSlotTime.setHours(endHour, endMin, 0, 0);

				// If the selected date is today, skip past slots
				if (selectedDate.toDateString() === currentDate.toDateString()) {
					if (slotTime <= currentDate) {
						slotTime.setHours(currentDate.getHours(), currentDate.getMinutes(), 0, 0);
					}
				}

				// Generate slots
				while (slotTime < endSlotTime) {
					const slotStart = this.formatTimeTo24Hour(slotTime);
					const slotEnd = this.formatTimeTo24Hour(new Date(slotTime.getTime() + slotDuration * 60000));
					const currentSlot = `${slotStart}-${slotEnd}`;

					// Check if the slot overlaps with any unavailable slot
					const isUnavailable = unavailableSlots.some((unavailableSlot: string) => {
						const [unStart, unEnd] = unavailableSlot.split('-').map((time: string) => this.toMinutes(time));
						const [slotStartMinutes, slotEndMinutes] = currentSlot
							.split('-')
							.map((time: string) => this.toMinutes(time));
						return slotStartMinutes < unEnd && slotEndMinutes > unStart; // Overlap condition
					});

					// Add the slot if it's not unavailable
					if (!isUnavailable) {
						slots.push(currentSlot);
					}

					// Move to the next slot
					slotTime.setMinutes(slotTime.getMinutes() + slotDuration);
				}

				this.timeSlots = slots;

				const newEntry = {
					heading: `You entered ${this.selectedDate} as your appointment date.`,
					getmsg: "Now, please select a time slot from the available options.",
					options: this.timeSlots.map((slot) => slot),
					notemsg: "(Note: Please select a time slot by entering its number)",
					input: this.selectedDate,
					emergency: "",
					patientName: "",
					doctorName: "",
					department: "",
					date: "",
					timeslot: ""
				};
				this.responseStructure.push(newEntry);

				this.step = 4;
				this.userInput = '';
			} else {
				// If the selected date is in the past
				const newEntry = {
					heading: "Please choose a valid date",
					getmsg: "",
					options: "",
					notemsg: "(Note: Select a valid date. No previous dates allowed.)",
					input: this.date,
					emergency: "",
					patientName: "",
					doctorName: "",
					department: "",
					date: "",
					timeslot: ""
				};
				this.responseStructure.push(newEntry);
				this.date = '';
			}
		} catch (error) {
			console.error('Error fetching available slots:', error);
			alert('Failed to fetch available slots');
		}
	}

	// Utility function to format time to 24-hour format
	formatTimeTo24Hour(date: Date): string {
		const hours = date.getHours();
		const minutes = date.getMinutes();
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
	}

	// Utility function to convert time to minutes
	toMinutes(time: string): number {
		const [hours, minutes] = time.split(':').map(Number);
		return hours * 60 + minutes;
	}

	// get name and get slots
	async getName(): Promise<void> {
		const selectedTimeSlot = this.timeSlots.find(
			(slot, index) => slot.time === this.userInput || index + 1 === +this.userInput
		)

		if (selectedTimeSlot) {
			this.selectedTimeSlot = selectedTimeSlot

			const newEntry = {
				heading: `You chose ${this.selectedTimeSlot} as your appointment slot`,
				getmsg: "Please enter your full name for the appointment.",
				options: "",
				notemsg: "(Note: Enter your name in the format: Firstname Lastname, e.g., Rajesh Kumar)",
				input: this.selectedTimeSlot,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
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
				input: this.userInput,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
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
				notemsg: "(Note: Enter your phone number in a 10-digit format.)",
				input: `${this.userInfo.firstName} ${this.userInfo.lastName}`,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
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
				input: this.userInput,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
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

			this.generateOtp()

			const newEntry = {
				heading: `You entered ${this.userInfo.phone} as your phone number. We sent an OTP for verification.`,
				getmsg: "Please enter the OTP",
				options: "",
				notemsg: "",
				input: this.userInfo.phone,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
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
				input: this.userInfo.phone,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}
			this.responseStructure.push(newEntry)
		}
	}

	// confirming appointment
	async confirmAppointment(): Promise<void> {
		const usersOtp = this.userInput
		const options = ["Yes, proceed with the booking.", "No, I need to make changes."]
		if (usersOtp === this.otp) {
			const newEntry = {
				heading: `Thanks you for the verification.`,
				getmsg: "Here are your booking details. Kindly confirm,",
				options: options,
				notemsg: "",
				input: this.otp,
				emergency: "",
				patientName: `${this.userInfo.firstName} ${this.userInfo.lastName}`,
				doctorName: this.selectedDoctor.name,
				department: this.capitalizeName(this.selectedDepartment.name),
				date: this.selectedDate,
				timeslot: this.selectedTimeSlot
			}
			this.responseStructure.push(newEntry)
			console.log(newEntry)
			this.step = 8
			this.userInput = ''
		}
		else {
			const newEntry = {
				heading: `Invalid OTP`,
				getmsg: "Try Again",
				options: "",
				notemsg: "",
				input: this.userInput,
				emergency: "",
				patientName: ``,
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}
			this.responseStructure.push(newEntry)
		}

	}

	// verifying OTP and sending appointment details as mail
	async sendingAppointmentMail(): Promise<void> {
		const userconfirm = this.userInput

		if (userconfirm === "1" || userconfirm === "Yes, proceed with the booking." || userconfirm === "yeah" || userconfirm === "yes") {
			console.log("doctor", this.selectedDoctor, "user", this.userInfo)
			const formdata = {
				doctorName: this.selectedDoctor.name,
				doctorDesignation: this.selectedDepartment.name,
				patientName: `${this.userInfo.firstName} ${this.userInfo.lastName}`,
				patientContact: this.userInfo.phone,
				appointmentDate: this.date,
				appointmentTime: this.selectedTimeSlot
			}

			this.chatbotService.appointMail(formdata).subscribe(
				(res) => {
					console.log('Email sent successfully', res);
					this.appointmentThankMsg()
				},
				(err) => {
					console.error('Error sending email', err);
					const newEntry = {
						heading: `Failed to send email`,
						getmsg: "Please try again",
						options: "",
						notemsg: "",
						input: this.userInput,
						emergency: "",
						patientName: "",
						doctorName: "",
						department: "",
						date: "",
						timeslot: ""
					}
					this.responseStructure.push(newEntry)
				}
			);
		}

		else if (userconfirm === "2" || userconfirm === " No, I need to make changes." || userconfirm === "no" || userconfirm === "No") {
			this.initialOptions()
		}
		else {
			const newEntry = {
				heading: `Please enter valid input`,
				getmsg: "",
				options: "",
				notemsg: "",
				input: this.userInput,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}
			this.responseStructure.push(newEntry)
		}
	}

	// appopintment thank you message
	appointmentThankMsg(): void {
		if (this.userInput === "1" || this.userInput === "") {

		}
		else if (this.userInput === "2") {

		}

		else {
			const newEntry = {
				heading: `Please enter valid input`,
				getmsg: "",
				options: "",
				notemsg: "",
				input: this.userInput,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}
			this.responseStructure.push(newEntry)
		}
	}

	// Doorstep Delivery functions

	// Door step services
	async getDoorStepService(): Promise<void> {
		const doorStepServices = ['Pharmacy', 'Blood Sample Collection']
		const newEntry = {
			heading: `You have selected Doorstep delivery service.`,
			getmsg: "Please select the type of service by entering its number:",
			options: doorStepServices,
			notemsg: "( Note : Doorstep services are available from 8:00 AM to 8:00 PM)",
			input: this.userInput,
			emergency: "",
			patientName: "",
			doctorName: "",
			department: "",
			date: "",
			timeslot: ""
		}

		this.responseStructure.push(newEntry)
		this.step = 11
		this.userInput = ''
	}

	// confirming door step services service getting Name for Doorstep Delivery
	async getNameDoorStep(): Promise<void> {
		if (this.userInput === "1" || this.userInput === "Pharmacy" || this.userInput === "pharmacy") {
			this.selectedDoorStepService = "Pharmacy"
			this.serviceChoosen = "Pharmacy Service"
			const newEntry = {
				heading: `You have selected Pharmacy.`,
				getmsg: "Please enter your name.",
				options: '',
				notemsg: "",
				input: this.selectedDoorStepService,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}

			this.responseStructure.push(newEntry)
			this.step = 13
			this.userInput = ''
		}

		else if (this.userInput === "2" || this.userInput === "blood sample collection" || this.userInput === "Blood Sample Collection") {
			this.selectedDoorStepService = "Blood Sample Collection"
			this.serviceChoosen = "Blood Sample Collection Service"
			const newEntry = {
				heading: `You have selected Blood Sample Collection.`,
				getmsg: "Please enter your name.",
				options: '',
				notemsg: "",
				input: this.selectedDoorStepService,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}

			this.responseStructure.push(newEntry)
			this.step = 13
			this.userInput = ''
		}

		else {
			const newEntry = {
				heading: `Please Enter valid input`,
				getmsg: "",
				options: '',
				notemsg: "",
				input: this.userInput,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}

			this.responseStructure.push(newEntry)
		}
	}

	// getting location type and validating name
	chooseLocationType(): void {
		const pattern = /^[A-Za-z\s]+$/
		const isValid = pattern.test(this.userInput)

		if (isValid) {
			const patientname = this.userInput
			const [firstName, lastName] = patientname.split(' ')
			this.userInfo.firstName = firstName
			this.userInfo.lastName = lastName ? lastName : ''
			console.log(this.userInfo.firstName, this.userInfo.lastName)
			
			const addressType = ['Current location', 'Enter Manually']

			const newEntry = {
				heading: `You entered ${this.userInfo.firstName} ${this.userInfo.lastName} as your name. Now  Please enter your delivery address. `,
				getmsg: "How would you like to provide your address? ",
				options: addressType,
				notemsg: "( Note : Pharmacy delivery is free within a 5km radius of Rashtrotthana Hospital. For locations beyond 5 km, delivery charges will apply)",
				input: this.userInput,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}
			this.responseStructure.push(newEntry)
			this.step = 14
			this.userInput = ''
		}
		else {
			const newEntry = {
				heading: `Please Enter valid name`,
				getmsg: "",
				options: '',
				notemsg: "",
				input: this.userInput,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}
			this.responseStructure.push(newEntry)
			this.userInput = ''
		}
	}

	// getting user locations from user
	async userLocation(): Promise<void> {
		if (this.userInput === "1" || this.userInput === "Current Location" || this.userInput === "current location") {
			this.getUserLocation()
		}

		else if (this.userInput === "2" || this.userInput === "Enter Manually" || this.userInput === "enter manually") {
			this.getAddressManually()
		}

		else {
			const newEntry = {
				heading: `Please Enter valid option`,
				getmsg: "",
				options: '',
				notemsg: "",
				input: this.userInput,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}
			this.responseStructure.push(newEntry)
		}
	}


	// function to get current location automatically
	getUserLocation(): void {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					this.latitude = position.coords.latitude;
					this.longitude = position.coords.longitude;
					await this.getCurrentAddress(this.latitude, this.longitude);
				},
				(error) => {
					switch (error.code) {
						case error.PERMISSION_DENIED:
							this.errorMessage = "Location permission denied by user.";
							break;
						case error.POSITION_UNAVAILABLE:
							this.errorMessage = "Location information is unavailable.";
							break;
						case error.TIMEOUT:
							this.errorMessage = "The request to get user location timed out.";
							break;
						default:
							this.errorMessage = "An unknown error occurred.";
							break;
					}
				}
			);
		} else {
			this.errorMessage = "Geolocation is not supported by this browser.";
		}
	}

	// function to convert location into address
	async getCurrentAddress(latitude: any, longitude: any): Promise<void> {
		try {
			const data = await this.chatbotService.getLocation(latitude, longitude).toPromise();
			if (data.status === 'OK' && data.results.length > 0) {
				console.log(data)
				this.address = data.results[0].formatted_address;

				if (this.address) {
					this.selectedLocationType = "auto"
					const confirmAddress = ["Confirm Location", "Enter Manually"]
					const newEntry = {
						heading: 'Please confirm your location',
						getmsg: "",
						options: confirmAddress,
						notemsg: "",
						input: this.address,
						emergency: "",
						patientName: "",
						doctorName: "",
						department: "",
						date: "",
						timeslot: ""
					}
					this.responseStructure.push(newEntry)
					this.step = 16
					this.userInput = ''
				}
				else {
					const newEntry = {
						heading: this.locationErrormsg,
						getmsg: "",
						options: "",
						notemsg: "",
						input: "can't get address",
						emergency: "",
						patientName: "",
						doctorName: "",
						department: "",
						date: "",
						timeslot: ""
					}

					this.responseStructure.push(newEntry)
				}
			} else {
				this.errorMessage = "No address found for the provided location.";
			}
		} catch (err) {
			this.errorMessage = "Unable to retrieve address.";
			console.error('Error fetching address:', err);
		}
	}

	//getting address manually
	getAddressManually(): void {
		this.selectedLocationType = "manual"
		const newEntry = {
			heading: 'Please enter your address',
			getmsg: "",
			options: "",
			notemsg: "( Note : Blood Sample Collection is free within a 5km radius of Rashtrotthana Hospital. For locations beyond 5 km, delivery charges will apply)",
			input: "Enter address manually",
			emergency: "",
			patientName: "",
			doctorName: "",
			department: "",
			date: "",
			timeslot: ""
		}

		this.responseStructure.push(newEntry)
		this.step = 17
		this.userInput = ''
	}

	// confirming address
	async confirmLocation(): Promise<void> {
		if (this.userInput === '1' || this.userInput === "Confirm Location" || this.userInput === "confirm location") {
			const newEntry = {
				heading: 'Confirmed Your address',
				getmsg: "Please enter your Phone number",
				options: "",
				notemsg: "(Note: Enter your phone number in a 10-digit format, e.g., 9876543210)",
				input: "Confirm Location",
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}
			this.responseStructure.push(newEntry)
			this.step = 18
			this.userInput = ''
		}

		else if (this.userInput === '2' || this.userInput === "Enter Manually" || this.userInput === "enter manually") {
			this.getAddressManually()
		}

		else {
			const newEntry = {
				heading: 'Invalid input. Please enter vaild option',
				getmsg: "",
				options: "",
				notemsg: "",
				input: this.userInput,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}
			this.responseStructure.push(newEntry)
		}
	}

	// getting number from user who entered laocation manually and saving their address
	async getPhoneNumManual(): Promise<void> {

		const pattern = /^[0-9]*\s?[a-zA-Z\s,.'-]+$/
		const address = pattern.test(this.userInput)

		if (address) {
			this.address = this.userInput

			const newEntry = {
				heading: 'Confirmed Your address',
				getmsg: "Please enter your Phone number",
				options: "",
				notemsg: "(Note: Enter your phone number in a 10-digit format, e.g., 9876543210)",
				input: this.address,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}

			this.responseStructure.push(newEntry)

			this.step = 18
			this.userInput = ''
		}
	}

	// formatting phone number and sending otp
	async DoorstepOtp(): Promise<void> {
		const pattern = /^[6-9][0-9]{9}$/;
		const isvalid = pattern.test(this.userInput)

		if (isvalid) {
			this.userInfo.phone = `91${this.userInput}`

			this.generateOtp()
			// this.otpSms()

			const newEntry = {
				heading: `You entered ${this.userInfo.phone} as your phone number. We sent an OTP for verification.`,
				getmsg: "Please enter the OTP",
				options: "",
				notemsg: "",
				input: this.userInfo.phone,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}
			this.responseStructure.push(newEntry)

			this.step = 19
			this.userInput = ''

		}
		else {
			const newEntry = {
				heading: `Please enter valid Phone number`,
				getmsg: "",
				options: "",
				notemsg: "",
				input: this.userInfo.phone,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}
			this.responseStructure.push(newEntry)
		}

	}

	// getting prescription
	async getPrescription(): Promise<void> {
		if(this.userInput === this.otp){
			const newEntry = {
				heading: `Thanks you for the verification.`,
				getmsg: " Please upload your prescription to proceed.",
				options: "",
				notemsg: "",
				input: this.otp,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}
			this.responseStructure.push(newEntry)
			this.userInput = ''
			this.step = 20
		}
		else if(this.userInput !== this.otp){
			const newEntry = {
				heading: `Incorrect OTP`,
				getmsg: "Try again",
				options: "",
				notemsg: "",
				input: this.userInput,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}
			this.responseStructure.push(newEntry)
			this.userInput = ''
		}
		else if(this.otp === null){
			const newEntry = {
				heading: `Your OTP expired`,
				getmsg: "",
				options: "",
				notemsg: "",
				input: this.otp,
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}
			this.responseStructure.push(newEntry)
			this.userInput = ''
		}
	}

	//saving Prescription
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
				heading: `Your prescription has been received.`,
				getmsg: "Shall I confirm your order ?",
				options: ['Yes, proceed', 'No, I need to make changes.'],
				notemsg: "",
				input: this.selectedfile.name,
				emergency: "",
				patientName: ``,
				doctorName: '',
				department: "",
				date: "",
				timeslot: ""
			}

			this.responseStructure.push(newEntry)
			this.step = 21

		}
		else {
			alert("Please upload the valid file")
		}
	}

	async confirmOrder() : Promise<void>{
		if(this.userInput === "1" || this.userInput === " Yes, proceed" || this.userInput === "yes"){
			this.whatsappMsg()
			this.sendingDoorStepMail()
		}
		else if(this.userInput === "2" || this.userInput === "No, I need to make changes." || this.userInput === "No, i need to make changes."){
			this.initialOptions()
		}
		else {
			const newEntry = {
				heading: `Please enter valid input`,
				getmsg: "",
				options: "",
				notemsg: "",
				input: '',
				emergency: "",
				patientName: ``,
				doctorName: '',
				department: "",
				date: "",
				timeslot: ""
			}

			this.responseStructure.push(newEntry)
		}
	}

	//verifying otp and sending mail
	async sendingDoorStepMail(): Promise<void> {

			const formdata = new FormData
			formdata.append('name', this.userInfo.firstName);
			formdata.append('contact', this.userInfo.phone);
			formdata.append('address', this.address ? this.address : '');
			formdata.append('file', this.selectedfile ? this.selectedfile : '');

			console.log(formdata)
			console.log("email sent")

			this.chatbotService.doorstepmail(formdata).subscribe(
				(res) => {
					console.log('Email sent successfully', res);
					const newEntry = {
						heading: ``,
						getmsg: "",
						options: "",
						notemsg: "",
						input: this.userInput,
						emergency: "",
						patientName: "",
						doctorName: "",
						department: "",
						date: "",
						timeslot: ""
					}
					this.responseStructure.push(newEntry)
					this.doorStepThankMsg()
				},
				(err) => {
					console.error('Error sending email', err);
					const newEntry = {
						heading: `Failed to send email`,
						getmsg: "Please try again",
						options: "",
						notemsg: "",
						input: this.userInput,
						emergency: "",
						patientName: "",
						doctorName: "",
						department: "",
						date: "",
						timeslot: ""
					}
					this.responseStructure.push(newEntry)
				}
			);
	}

	// doorstep thank msg
	async doorStepThankMsg(): Promise<void> {
			const newEntry = {
				heading: `Thank you, ${this.userInfo.firstName} ${this.userInfo.lastName}! We have received your ${this.selectedDoorStepService} service request.`,
				getmsg: " Our team will get back to you shortly.",
				options: "",
				notemsg: "",
				input: '',
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
			}
			this.responseStructure.push(newEntry)
			this.userInput = ''
	}

	//emergency services
	async emergencyServices(): Promise<void> {
		const newEntry = {
			heading: "In case of any medical emergency, please reach out to our 24/7 helpline:",
			getmsg: "",
			options: "",
			notemsg: "",
			input: "Emergency Services",
			emergency: "8904943666",
			patientName: "",
			doctorName: "",
			department: "",
			date: "",
			timeslot: ""
		}
		this.responseStructure.push(newEntry)
	}

	// sending otp
	async otpSms() : Promise<void>{
		const details = {
			patientName : `${this.userInfo.firstName} ${this.userInfo.lastName}`,
			otp : this.otp,
			service : this.selectedService,
			patientPhoneNumber : this.userInfo.phone
		}

		this.chatbotService.otpSms(details).toPromise()
	}

	//whatapp msg
	async whatsappMsg() : Promise<void>{
		const details = {
			patientName : 	`${this.userInfo.firstName} ${this.userInfo.lastName}`,
			service : this.serviceChoosen,
			patientPhoneNumber : this.userInfo.phone
		}

		try{
			await this.chatbotService.whatsApp(details).toPromise
		}
		catch(err){
			console.log(err)
		}
	}

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
			input: this.userInput,
			emergency: "",
			patientName: "",
			doctorName: "",
			department: "",
			date: "",
			timeslot: ""
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
				input: "refresh",
				emergency: "",
				patientName: "",
				doctorName: "",
				department: "",
				date: "",
				timeslot: ""
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

	// generate otp
	generateOtp(): void {
		// Generate a 6-digit OTP
		this.otp = Math.floor(100000 + Math.random() * 900000).toString();
		console.log('Generated OTP:', this.otp);

		// Clear any existing expiration timer
		if (this.otpExpireTime) {
			console.log('Clearing previous timeout');
			clearTimeout(this.otpExpireTime);
		}

		// Set a new expiration timer for 2 minutes
		this.otpExpireTime = setTimeout(() => {
			this.expireOtp();
		}, 2 * 60 * 1000); // 2 minutes
	}

	expireOtp(): void {
		console.trace('OTP expired called from:');
		// console.log('OTP expired:', this.otp);
		this.otp = null; // Set OTP to null
	}

	//option clickable
	handleOptionClick(option: string, optionIndex: number): void {
		this.userInput = optionIndex.toString();
		this.buttonHandler();
	}
}




// async loadSlots(doctorId: any, date: string): Promise<void> {
// 	try {
// 		const selectedDate = new Date(this.date);
// 		const currentDate = new Date();

// 		// Check if selected date is in the future
// 		if (selectedDate > currentDate) {
// 			this.selectedDate = this.date;

// 			// Fetch available slots from the backend
// 			const data = await this.chatbotService.getAvailableSlots(doctorId, date).toPromise();
// 			const availableFrom = data.availableFrom;
// 			const slotDuration = parseInt(data.slotDuration, 10);

// 			//Fetch unavailable slots from the backend
// 			// const unavailableData = await this.chatbotService.getUnavailableSlots(doctorId, date).toPromise();
// 			// const unavailableSlots = unavailableData.map((data:any)=> data.time)

// 			// parse start time and end time
// 			// const [unAvailStartTime, unAvailEndTime] = unavailableSlots.split('-')


// 			// Parse start and end times
// 			const [startTime, endTime] = availableFrom.split('-');
// 			const [startHour, startMin] = startTime.split(':').map(Number);
// 			const [endHour, endMin] = endTime.split(':').map(Number);

// 			const slots: string[] = [];
// 			const slotTime = new Date(selectedDate);
// 			slotTime.setHours(startHour, startMin, 0, 0);

// 			// If today, skip past slots
// 			if (selectedDate.toDateString() === currentDate.toDateString()) {
// 				if (slotTime <= currentDate) {
// 					slotTime.setHours(currentDate.getHours(), currentDate.getMinutes(), 0, 0);
// 				}
// 			}

// 			// Generate slots
// 			while (
// 				slotTime.getHours() < endHour ||
// 				(slotTime.getHours() === endHour && slotTime.getMinutes() < endMin)
// 			) {
// 				slots.push(this.formatTimeTo12Hour(slotTime));
// 				slotTime.setMinutes(slotTime.getMinutes() + slotDuration);
// 			}

// 			this.timeSlots = slots;

// 			const newEntry = {
// 				heading: `You entered ${this.selectedDate} as your appointment date.`,
// 				getmsg: "Now, please select a time slot from the available options.",
// 				options: this.timeSlots.map((slot) => slot),
// 				notemsg: "(Note: Please select a time slot by entering its number)",
// 				input: this.selectedDate
// 			};
// 			this.responseStructure.push(newEntry);

// 			this.step = 4;
// 			this.userInput = '';
// 		} else {
// 			// If date is in the past, show an error message
// 			const newEntry = {
// 				heading: "Please choose a valid date",
// 				getmsg: "",
// 				options: "",
// 				notemsg: "(Note: Select a valid date. No previous dates allowed.)",
// 				input: this.date
// 			};
// 			this.responseStructure.push(newEntry);
// 			this.date = '';
// 		}
// 	} catch (error) {
// 		console.error('Error fetching available slots:', error);
// 		alert('Failed to fetch available slots');
// 	}
// }


// 12 hour format

// async loadSlots(doctorId: any, date: string): Promise<void> {
//     try {
//         const selectedDate = new Date(this.date);
//         const currentDate = new Date();

//         if (selectedDate > currentDate) {
//             this.selectedDate = this.date;

//             // Fetch available slots and unavailable slots from the backend
//             const availableData = await this.chatbotService.getAvailableSlots(doctorId, date).toPromise();
//             const unavailableData = await this.chatbotService.getUnavailableSlots(doctorId, date).toPromise();

//             const availableFrom = availableData.availableFrom; // E.g., "10:00-16:00"
//             const slotDuration = parseInt(availableData.slotDuration, 10); // E.g., 30 minutes
//             const unavailableSlots = unavailableData.map((data: any) => data.time); // Unavailable slots

//             // Parse available time range
//             const [startTime, endTime] = availableFrom.split('-');
//             const [startHour, startMin] = startTime.split(':').map(Number);
//             const [endHour, endMin] = endTime.split(':').map(Number);

//             const slots: string[] = [];
//             const slotTime = new Date(selectedDate);
//             slotTime.setHours(startHour, startMin, 0, 0);

//             const endSlotTime = new Date(selectedDate);
//             endSlotTime.setHours(endHour, endMin, 0, 0);

//             // If the selected date is today, skip past slots
//             if (selectedDate.toDateString() === currentDate.toDateString()) {
//                 if (slotTime <= currentDate) {
//                     slotTime.setHours(currentDate.getHours(), currentDate.getMinutes(), 0, 0);
//                 }
//             }

//             // Generate slots
//             while (slotTime < endSlotTime) {
//                 const slotStart = this.formatTimeTo12Hour(slotTime);
//                 const slotEnd = this.formatTimeTo12Hour(new Date(slotTime.getTime() + slotDuration * 60000));
//                 const currentSlot = `${slotStart}-${slotEnd}`;

//                 // Check if the slot overlaps with any unavailable slot
//                 const isUnavailable = unavailableSlots.some((unavailableSlot: string) => {
//                     const [unStart, unEnd] = unavailableSlot.split('-').map((time: string) => this.toMinutes(time));
//                     const [slotStartMinutes, slotEndMinutes] = currentSlot
//                         .split('-')
//                         .map((time: string) => this.toMinutes(time));
//                     return slotStartMinutes < unEnd && slotEndMinutes > unStart; // Overlap condition
//                 });

//                 // Add the slot if it's not unavailable
//                 if (!isUnavailable) {
//                     slots.push(currentSlot);
//                 }

//                 // Move to the next slot
//                 slotTime.setMinutes(slotTime.getMinutes() + slotDuration);
//             }

//             this.timeSlots = slots;

//             const newEntry = {
//                 heading: `You entered ${this.selectedDate} as your appointment date.`,
//                 getmsg: "Now, please select a time slot from the available options.",
//                 options: this.timeSlots.map((slot) => slot),
//                 notemsg: "(Note: Please select a time slot by entering its number)",
//                 input: this.selectedDate
//             };
//             this.responseStructure.push(newEntry);

//             this.step = 4;
//             this.userInput = '';
//         } else {
//             // If the selected date is in the past
//             const newEntry = {
//                 heading: "Please choose a valid date",
//                 getmsg: "",
//                 options: "",
//                 notemsg: "(Note: Select a valid date. No previous dates allowed.)",
//                 input: this.date
//             };
//             this.responseStructure.push(newEntry);
//             this.date = '';
//         }
//     } catch (error) {
//         console.error('Error fetching available slots:', error);
//         alert('Failed to fetch available slots');
//     }
// }

// // Utility function to format time to 12-hour format
// formatTimeTo12Hour(date: Date): string {
//     const hours = date.getHours();
//     const minutes = date.getMinutes();
//     const period = hours >= 12 ? 'PM' : 'AM';
//     const formattedHours = hours % 12 || 12;
//     return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
// }

// // Utility function to convert time to minutes
// toMinutes(time: string): number {
//     const [hours, minutes] = time.split(':').map(Number);
//     return hours * 60 + minutes;
// }
