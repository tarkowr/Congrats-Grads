import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { LibraryState } from '../models/state/library.state';
import { Senior } from '../models/senior';

@Injectable({
    providedIn: 'root'
})
export class LibraryService {
    private _library: ReplaySubject<Senior[]>;
    public state: LibraryState;

    constructor(private http: HttpClient) { 
        this._library = new ReplaySubject<Senior[]>(1);
        this.state = new LibraryState();
    }

    get library() : Observable<Senior[]> {
        return this._library.asObservable();
    }

    // Reset the library state to its default values
    resetState() {
        this.state = new LibraryState();
    }

    // Retrieve all senior profiles
    fetchLibrary() : Promise<void> {
        return this.http.get(`${environment.apiUrl}/seniors/get/all`)
            .toPromise()
            .then((seniors: Senior[]) => this._library.next(seniors))
            .catch((err) => this._library.error(err));
    }

    // Upload a new senior profile
    upload(fname: string, lname: string, highSchool: string, comments: string, profile: any) : Promise<any> {
        let formData = new FormData();
        formData.append('fname', fname);
        formData.append('lname', lname);
        formData.append('highSchool', highSchool);
        formData.append('comments', comments);
        formData.append('profile', profile);

        return this.http.post(`${environment.apiUrl}/create`, formData).toPromise();
    }
}