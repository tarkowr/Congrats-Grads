import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    constructor(private http: HttpClient) { }

    // Fetch all seniors
    getAll() {
        return this.http.get(`${environment.apiUrl}/admin/seniors/get/all`).toPromise();
    }
}