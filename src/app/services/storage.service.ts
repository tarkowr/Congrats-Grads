import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    
    constructor() {}

    // Try to fetch value from local storage
    get(key: string) : any {
        try {
            return JSON.parse(localStorage.getItem(key));
        }
        catch (e) {
            return null;
        }
    }

    // Try to set value in local storage and return success
    set(key: string, value: any) : boolean {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        }
        catch (e) {
            return false;
        }
    }
}
