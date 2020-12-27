import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReplaySubject } from 'rxjs';
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

    get library() : any {
        return this._library.asObservable();
    }

    set library(lib: any) {
        this._library.next(lib);
    }

    // Reset the library state to its default values
    resetState() {
        this.state = new LibraryState();
    }

    // Retrieve all senior profiles
    async fetchLibrary() {
        let seniors: Senior[] = await this.http.get(`${environment.apiUrl}/seniors/get/all`).toPromise()
            .catch(() => {
                console.error('Unable to fetch senior library!');
                return null;
            });

        if (seniors) {
            this.library = seniors;
        }
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