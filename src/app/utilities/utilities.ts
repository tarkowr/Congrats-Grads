import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root'
})
export class Utilities {
    constructor() { }

    // Copy array of objects w/o reference to properties
    copyArrayOfObj(arr:any[]){
        return arr.map(obj => ({ ...obj }));
    }

    // Scroll to top of page
    scrollTop(window:Window) {
        window.scrollTo(0, 0);
    }

}