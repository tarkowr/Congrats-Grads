export interface Senior {
    fname: string;
    lname: string;
    school: string;
    comments: string;
    id: string;
    uploaded: TimeStamp;
    url: string;
    year: number;
 }

 interface TimeStamp {
     _nanoseconds: number;
     _seconds: number;
 }