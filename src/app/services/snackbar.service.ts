import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { app } from '../app.constants';

@Injectable({
    providedIn: 'root'
})
export class SnackbarService {
    private _message: ReplaySubject<string>;
    private _timeout: number;

    constructor() {
        this._message = new ReplaySubject<string>(1);
        this._timeout = 0;
    }

    get message() : Observable<string> {
        return this._message.asObservable();
    }

    get timeout() : number {
        return this._timeout || app.snackbarTimeout;
    }

    // Triggers the snackbar to display on the screen
    show(msg: string, timeout: number = 0) {
        this._timeout = timeout;
        if (msg) this._message.next(msg);
    }
}