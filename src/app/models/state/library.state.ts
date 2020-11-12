import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root'
})
export class LibraryState {
    constructor() { }

    searchQuery: string;
    orderKey: number;
    yearKey: number;
    pageStartIndex: number = 0;
    seniorId: string;
    isMobile: Boolean;

    // Returns whether the library has a state other than default
    hasState(mobile: Boolean) : Boolean {
        const hasState = this.searchQuery || this.orderKey || this.yearKey || this.pageStartIndex;
        const hasMobileChanged = this.isMobile != undefined && this.isMobile != mobile;

        return hasState && !hasMobileChanged;
    }

    // Reset the library state to default
    reset() {
        this.searchQuery = undefined;
        this.orderKey = undefined;
        this.yearKey = undefined;
        this.pageStartIndex = 0;
        this.seniorId = undefined;
    }
}