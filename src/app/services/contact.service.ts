import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class ContactService {
    constructor(private http: HttpClient) { }

    // Send message to congratsgrads email 
    sendMessage(sender:string, message:string){ 
        return this.http.post(`${environment.apiUrl}/contact/send`, { sender:sender, message:message }).toPromise();
    }
}