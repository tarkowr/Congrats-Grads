import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private http: HttpClient) { }

    // Create new senior profile
    create(fname:string, lname:string, highSchool:string, comments:string, profile:any) {
        let formData = new FormData();
        formData.append('fname', fname);
        formData.append('lname', lname);
        formData.append('highSchool', highSchool);
        formData.append('comments', comments);
        formData.append('profile', profile);

        return this.http.post(`${environment.apiUrl}/create`, formData).toPromise();
    }

    // Retrieve all senior profiles
    getAll(){
        return this.http.get(`${environment.apiUrl}/seniors/get/all`).toPromise();
    }
}