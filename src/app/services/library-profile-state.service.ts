import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root'
})
export class LibraryProfileStateService {
    _seniorProfile: any;

    constructor() { }

    getSenior() {
        return this._seniorProfile;
    }

    setSenior(senior: any) {
        this._seniorProfile = senior;
    }

    resetSenior() {
        this._seniorProfile = undefined;
    }
}