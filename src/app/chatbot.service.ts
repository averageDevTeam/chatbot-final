import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { environment } from '../environment'
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = environment.apiurl
  private mapApi = environment.mapapiUrl
  private mapApiKey = environment.googleMapsApiKey

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/departments`);
  }

  getDoctors(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/doctors`);
  }

  getAvailableSlots(docId: number, date: string): Observable<any> {
    const availabilityUrl = `${this.apiUrl}/avail/doctors/availability/${docId}/${date}`;
    return this.http.get<any>(availabilityUrl);
  }

  postImage(imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile, imageFile.name); // 'image' is the key expected by the backend
  
    return this.http.post<any>(`${this.apiUrl}/api/storage/upload`, formData);
  }

  appointMail(formdata : any) : Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/mail/appointment`, formdata , {
      headers : new HttpHeaders({
        'enctype': 'multipart/form-data'
      })
    })
  }

  doorstepmail(formData : FormData) : Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/api/email/send-email-lab`, formData)
  }

  createAppointment(appointmentData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/create-appointment`, appointmentData);
  }

  getUnavailableSlots(docId:any, date:any) : Observable<any>{
    const unavailSoltsUrl = `${this.apiUrl}/avail/doctors/unavailable/${docId}/${date}`
    return this.http.get<any>(unavailSoltsUrl)
  }

  getLocation(latitude: any, longitude: any): Observable<any> {
    const locationUrl = `${this.mapApi}?latlng=${latitude},${longitude}&key=${this.mapApiKey}`;
    return this.http.get<any>(locationUrl);
  }

  otpSms(details:any) : Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/api/sms/sms-chatbot`,details)
  }

  whatsApp(details : any) : Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/api/whatsapp/send-receive-message`, details)
  }
}