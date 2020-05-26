import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root'
})
export class RegexUtilities {
    name = /^[.a-zA-Z0-9 \-]{1,20}$/;
    school = /^[.a-zA-Z0-9 \-]{1,40}$/;
    about = /^.{1,500}$/;
    email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/;
    emailMessage = /^.{1,1000}$/;
    search = /^[a-zA-Z0-9 \-]{1,50}$/;

    constructor() { }
}