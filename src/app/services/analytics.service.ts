import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { app } from '../app.constants';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {

    private failedAttempts: number;

    constructor(private http: HttpClient) { 
        this.failedAttempts = 0;
    }

    private track(path: string, body: any) : Promise<any> {
        if (this.failedAttempts >= app.maxFailedAnalytics) {
            return new Promise((res, rej) => res(false));
        }

        return this.http.post(`${environment.analyticsUrl}/track/${path}`, body).toPromise();
    }

    private onError() {
        this.failedAttempts += 1;
    }

    // Track page visits
    trackView(view: string, data: any = {}) : Promise<any> {
        return this.track('view', { view: view, data: data })
            .catch(() => this.onError());
    }

    // Track various events in the app
    trackEvent(name: string, data: any = {}) : Promise<any> {
        return this.track('event', { name: name, data: data })
            .catch(() => this.onError());
    }

    // Track errors in the app
    trackError(description: string, data: any = {}) : Promise<any> {
        return this.track('error', { description: description, data: data })
            .catch(() => this.onError());
    }
}