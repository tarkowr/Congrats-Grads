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
    private _library: ReplaySubject<any>;
    public state: LibraryState;

    constructor(private http: HttpClient) { 
        this._library = new ReplaySubject<any>(1);
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
        let seniors = await this.http.get(`${environment.apiUrl}/seniors/get/all`).toPromise()
            .catch(err => {
                console.error('Unable to fetch senior library!');
                return null;
            });

        if (seniors) {
            this.library = seniors;
        }
    }

    // Create new senior profile
    create(fname: string, lname: string, highSchool: string, comments: string, profile: any) {
        let formData = new FormData();
        formData.append('fname', fname);
        formData.append('lname', lname);
        formData.append('highSchool', highSchool);
        formData.append('comments', comments);
        formData.append('profile', profile);

        return this.http.post(`${environment.apiUrl}/create`, formData).toPromise();
    }

    // Determine whether a search query matches a name
    matchesSearch(senior: Senior, query: string) : boolean {
        let length = query.length;
        query = query.toLowerCase();
        let fname = senior.fname.substring(0, length).toLowerCase();
        let lname = senior.lname.substring(0, length).toLowerCase();
        let name = (fname + ' ' + lname).substring(0, length);

        return (fname === query || lname === query || query === name);
    }
}