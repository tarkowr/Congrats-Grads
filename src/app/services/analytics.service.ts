import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    constructor(private http: HttpClient) { }

    // Send app data to analytics server
    private track(path: string, body: any) : Promise<any> {
        return this.http.post(`${environment.analyticsUrl}/track/${path}`, body).toPromise();
    }

    // Track page visits
    trackView(view: string, data: any = {}) : Promise<any> {
        return this.track('view', { view: view, data: data }).catch(() => {});
    }

    // Track various events in the app
    trackEvent(name: string, data: any = {}) : Promise<any> {
        return this.track('event', { name: name, data: data }).catch(() => {});
    }

    // Track errors in the app
    trackError(description: string, data: any = {}) : Promise<any> {
        return this.track('error', { description: description, data: data }).catch(() => {});
    }
}