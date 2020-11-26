export interface Senior {
    fname: string;
    lname: string;
    school: string;
    comments: string;
    id: string;
    uploaded: TimeStamp;
    url: string;
    year: Number;
 }

 interface TimeStamp {
     _nanoseconds: Number;
     _seconds: Number;
 }