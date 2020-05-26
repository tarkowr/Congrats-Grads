import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
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

    // Sort Seniors by Full Name
    sortByName(obj:any[]){
        return obj.sort((a, b) => {
        let aFullName = (a.lname + ' ' + a.fname).trim().toLowerCase().replace('  ', ' ');
        let bFullName = (b.lname + ' ' + b.fname).trim().toLowerCase().replace('  ', ' ');

        if(aFullName < bFullName) { return -1; }
        if(aFullName > bFullName) { return 1; }
        return 0;
        });
    }

    // Sort Seniors by Newest Date Uploaded
    sortByDateNew(obj:any[]) {
        return obj.sort((a, b) => {
        let aDate = a.uploaded._seconds;
        let bDate = b.uploaded._seconds;

        if(aDate < bDate) { return 1; }
        if(aDate > bDate) { return -1; }
        return 0;
        });
    }

    // Sort Seniors by Oldest Date Uploaded
    sortByDateOld(obj:any[]) {
        return obj.sort((a, b) => {
        let aDate = a.uploaded._seconds;
        let bDate = b.uploaded._seconds;

        if(aDate < bDate) { return -1; }
        if(aDate > bDate) { return 1; }
        return 0;
        });
    }

    // Determine whether a search matches a senior
    matchSearch(fname: string, lname: string, query: string) {
        let length = query.length;
        query = query.toLowerCase();
        fname = fname.substring(0, length).toLowerCase();
        lname = lname.substring(0, length).toLowerCase();
        let name = (fname + ' ' + lname).substring(0, length);

        if (fname === query || lname === query || query === name){
        return true;
        }
        return false;
    }
}