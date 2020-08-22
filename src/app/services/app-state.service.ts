import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root'
})
export class AppStateService {

    constructor() { }

    private _seniorProfile: any;

    get seniorProfile() {
        return this._seniorProfile;
    }

    set seniorProfile(senior: any) {
        this._seniorProfile = senior;
    }
}