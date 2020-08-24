import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root'
})
export class AppStateService {

    constructor() { }

    // Library State
    searchQuery: string;
    orderKey: number;
    pageStartIndex: number = 0;
    seniorId: string;
    isMobile: Boolean;

    libraryHasSavedState(mobile: Boolean) {
        const hasState = this.searchQuery || this.orderKey || this.pageStartIndex;
        const hasMobileChanged = this.isMobile != undefined && this.isMobile != mobile;

        return hasState && !hasMobileChanged;
    }
}