import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { ReplaySubject } from 'rxjs'
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private _library: ReplaySubject<any>;

    constructor(private http: HttpClient) { 
        this._library = new ReplaySubject<any>(1);
    }

    get library() {
        return this._library.asObservable();
    }

    set library(lib: any) {
        this._library.next(lib);
    }

    // Retrieve all senior profiles
    async fetchLibrary() {
        let seniors = await this.http.get(`${environment.apiUrl}/seniors/get/all`).toPromise()
            .catch(e => {
                console.error('Unable to fetch senior library!', e);
                return;
            });

        if (seniors) {
            this._library.next(seniors);
        }
    }

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

    // Sort Seniors by Full Name
    sortByName(obj:any[]){
        return obj.sort((a, b) => {
            let aFullName = (a.lname + ' ' + a.fname).trim().toLowerCase().replace('  ', ' ');
            let bFullName = (b.lname + ' ' + b.fname).trim().toLowerCase().replace('  ', ' ');

            if (aFullName < bFullName) { return -1; }
            else if (aFullName > bFullName) { return 1; }

            return 0;
        });
    }

    // Sort Seniors by Latest Date Uploaded
    sortByDateNew(obj:any[]) {
        return obj.sort((a, b) => {
            if (!a.uploaded || !b.uploaded) { return 0; }
            
            let aDate = a.uploaded._seconds;
            let bDate = b.uploaded._seconds;

            if (aDate < bDate) { return 1; }
            else if (aDate > bDate) { return -1; }

            return 0;
        });
    }

    // Sort Seniors by Oldest Date Uploaded
    sortByDateOld(obj:any[]) {
        return obj.sort((a, b) => {
            if (!a.uploaded || !b.uploaded) { return 0; }

            let aDate = a.uploaded._seconds;
            let bDate = b.uploaded._seconds;

            if (aDate < bDate) { return -1; }
            else if (aDate > bDate) { return 1; }
            
            return 0;
        });
    }

    // Determine whether a search query matches a senior
    matchSearch(fname: string, lname: string, query: string) {
        let length = query.length;
        query = query.toLowerCase();
        fname = fname.substring(0, length).toLowerCase();
        lname = lname.substring(0, length).toLowerCase();
        let name = (fname + ' ' + lname).substring(0, length);

        return (fname === query || lname === query || query === name);
    }
}