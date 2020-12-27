import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class WindowService {
    private _small: ReplaySubject<boolean>;
    private _medium: ReplaySubject<boolean>;
    private _large: ReplaySubject<boolean>;

    // IMPORTANT: Default to mobile view (width < 500)
    private _isSmall: boolean = true;
    private _isMedium: boolean = true;
    private _isLarge: boolean = true;

    smallBreakpoint = 576;
    mediumBreakpoint = 768;
    largeBreakpoint = 992;

    constructor() { 
        this._small = new ReplaySubject<boolean>(1);
        this._medium = new ReplaySubject<boolean>(1);
        this._large = new ReplaySubject<boolean>(1);
    }

    get small() : Observable<boolean> {
        return this._small.asObservable();
    }

    get medium() : Observable<boolean> {
        return this._medium.asObservable();
    }

    get large() : Observable<boolean> {
        return this._large.asObservable();
    }

    // Determine whether window size has passed any breakpoints and notify subscribers if so
    checkBreakpoints() {
        const width = window.innerWidth;

        const isSmallCopy = this._isSmall;
        const isMediumCopy = this._isMedium;
        const isLargeCopy = this._isLarge;

        this._isSmall = width < this.smallBreakpoint;
        this._isMedium = width < this.mediumBreakpoint;
        this._isLarge = width < this.largeBreakpoint;

        if (this._isSmall != isSmallCopy) {
            this._small.next(this._isSmall);
        }

        if (this._isMedium != isMediumCopy) {
            this._medium.next(this._isMedium);
        }

        if (this._isLarge != isLargeCopy) {
            this._large.next(this._isLarge);
        }
    }
}