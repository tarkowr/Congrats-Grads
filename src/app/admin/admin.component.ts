import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  seniors: any[];
  backup: any[];
  loading: Boolean = false;
  searchForm: FormGroup;
  showSnackbar: Boolean = false;
  message: string;

  constructor(
    private adminService: AdminService,
    private formBuilder: FormBuilder,) { }

  get f() { return this.searchForm.controls }

  // UI: Determine whether profile is new
  isNew(uploaded) {
    let threshold = 60 * 60 * 1000;
    let uploadedMilli = uploaded._seconds * 1000;
    let nowMilli = new Date().getTime();
    return uploadedMilli + threshold > nowMilli;
  }

  // UI: Generate profile URL for senior
  getProfileUrl(id) {
    return `https://congratsgrads.web.app/library?profile=${id}`;
  }

  // Initialize the search form
  buildSearchForm() {
    this.searchForm = this.formBuilder.group({
      search: ['',  Validators.compose([
        Validators.required, Validators.pattern(/^[a-zA-Z0-9 \-]{1,50}$/)
      ])]
    })
  }

  // Restore seniors array from backup
  restoreBackup() {
    this.seniors = this.copyArrayOfObj(this.backup);
  }

  // Copy arrow of objects w/o reference to properties
  copyArrayOfObj(arr:any[]){
    return arr.map(obj => ({ ...obj }));
  }
  
  // Sort Seniors by Newest Date Uploaded
  sortByDateNew(obj:any[]) {
    return obj.sort((a, b) => {
      let aDate = a.uploaded._seconds;
      let bDate = b.uploaded._seconds;

      if(aDate < bDate) { return 1; }
      if(aDate > bDate) { return -1; }
      return 0;
    });
  }

  // Determine whether a search matches a senior
  matchSearch(fname: string, lname: string, query: string) {
    let length = query.length;
    query = query.toLowerCase();
    fname = fname.substring(0, length).toLowerCase();
    lname = lname.substring(0, length).toLowerCase();
    let name = (fname + ' ' + lname).substring(0, length);

    if (fname === query || lname === query || query === name){
      return true;
    }
    return false;
  }

  // Handle profile search
  onSearch() {
    let query:string = this.f.search.value.toLowerCase();

    if (this.searchForm.invalid || !this.backup) {
      this.restoreBackup();
      return;
    }

    this.seniors = this.copyArrayOfObj(this.backup.filter(s => this.matchSearch(s.fname, s.lname, query)));
  }

  // Convert timestamp to date
  getDate(timestamp:number) {
    let d = new Date(timestamp * 1000);
    return (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear() + ' ' + this.formatStandardTime(d.getHours(), this.addZero(d.getMinutes()));
  }

  // Adds zero to minute value if single digit
  addZero(minutes) {
    if (minutes < 10) {
      minutes = '0' + minutes;
    }

    return minutes;
  }

  // Formats the date in standard time
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

  // Retrieve all seniors from firebase
  getSeniors() {
    return this.adminService.getAll()
      .then((data:[]) => {
        return data.length > 0 ? data : null;
      })
      .catch(err => {
        console.log(err)
        return null;
      });
  }

  async ngOnInit() {
    this.buildSearchForm();
    this.seniors = await this.getSeniors();

    if (this.seniors) {
      this.seniors = this.sortByDateNew(this.seniors);
      this.backup = this.copyArrayOfObj(this.seniors);
    }
    else {
      setTimeout(() => {
        this.showSnackbar = true;
        this.message = 'Unable to Retrieve Data';
        setTimeout(() => this.showSnackbar = false, 3000);
      }, 1000);
    }

  }

}
