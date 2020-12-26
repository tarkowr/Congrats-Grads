import { Senior } from './senior';

export class Library {
    master: Record<string, Senior[]>;

    year: YearOption;
    order: OrderOption = OrderOption.Newest;

    constructor() {}

    // Master list of seniors by year
    get yearMaster(): Senior[] {
        return this.master[this.year.value];
    }

    // Total senior count by year
    get totalSeniors(): number {
        return this.yearMaster.length;
    }

    // Sort library by the selected order
    sort() {
        switch (parseInt(this.order.toString())) {
            case OrderOption.Alphabetical:
                this.sortByName();
                break;
            case OrderOption.Oldest:
                this.sortByOldest();
                break;
            default:
                this.sortByNewest();
                break;
        }
    }

    // Sort seniors by first, last, or full name
    private sortByName() {
        this.yearMaster.sort((a, b) => {
            let aFullName = (a.lname + ' ' + a.fname).trim().toLowerCase().replace('  ', ' ');
            let bFullName = (b.lname + ' ' + b.fname).trim().toLowerCase().replace('  ', ' ');

            if (aFullName < bFullName) { return -1; }
            else if (aFullName > bFullName) { return 1; }

            return 0;
        });
    }

    // Sort seniors by latest date uploaded
    private sortByNewest() {
        this.yearMaster.sort((a, b) => {
            if (!a.uploaded || !b.uploaded) { return 0; }
            
            let aDate = a.uploaded._seconds;
            let bDate = b.uploaded._seconds;

            if (aDate < bDate) { return 1; }
            else if (aDate > bDate) { return -1; }

            return 0;
        });
    }

    // Sort seniors by oldest date uploaded
    private sortByOldest() {
        this.yearMaster.sort((a, b) => {
            if (!a.uploaded || !b.uploaded) { return 0; }

            let aDate = a.uploaded._seconds;
            let bDate = b.uploaded._seconds;

            if (aDate < bDate) { return -1; }
            else if (aDate > bDate) { return 1; }
            
            return 0;
        });
    }
}

// Options for sorting the library
export enum OrderOption {
    Alphabetical, 
    Newest, 
    Oldest,
}

// Each supported year in the library
export interface YearOption {
    key: number;
    value: string;
}