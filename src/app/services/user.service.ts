import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private http: HttpClient) { }

    // Create new senior profile
    create(fname:String, lname:String, highSchool:String, comments:String) {
        return this.http.post(`${environment.apiUrl}/create`, { fname:fname, lname:lname, highSchool:highSchool, comments:comments}).toPromise();
    }

    // Retrieve all senior profiles
    getAll(){
        return this.http.get(`${environment.apiUrl}/seniors/get/all`).toPromise();
    }
}