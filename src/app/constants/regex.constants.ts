import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root'
})
export class RegexConstants {
    NAME = /^[.a-zA-Z0-9 \-]{1,20}$/;
    SCHOOL = /^[.a-zA-Z0-9 \-]{1,40}$/;
    COMMENTS = /^.{1,500}$/;
    EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/;
    EMAIL_MESSAGE = /^.{1,1000}$/;
    SEARCH = /^[a-zA-Z0-9 \-]{1,50}$/;
}