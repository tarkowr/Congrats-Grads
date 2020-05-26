import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root'
})
export class DateUtilities {
    constructor() { }

    // Formats a date in standard time
    formatStandardTime(hour, minute) {
        let period = 'AM'
        
        if (hour > 12) {
        hour = (hour - 12);
        period = 'PM';
        } 
        else if (hour == 12) {
        period = 'PM';
        }
        else if (hour == 0) {
        hour = 12;
        }

        return `${hour}:${minute}${period}`;
    }

    // Adds zero to value if single digit
    addZeroToSingleDigit(value:number) {
        return value < 10 ? '0' + value : value;
    }

    // Convert timestamp (seconds) to date
    timestampToDate(timestamp:number) {
        return new Date(timestamp * 1000);
    }

    // Format a date time
    formatDate(date:Date) {
        let minutes = this.addZeroToSingleDigit(date.getMinutes());
        return (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + this.formatStandardTime(date.getHours(), minutes);
    }

    // Determine whether a timestamp (seconds) occured within the limit
    isDatePastLimit(timestamp:number, hours:number) {
        let threshold = 60 * 60 * 1000 * hours;
        let uploadedMilli = timestamp * 1000;
        let nowMilli = new Date().getTime();
        return uploadedMilli + threshold > nowMilli;
      }
}