import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { DateUtilities } from '../utilities/date.utilities';
import { Utilities } from '../utilities/utilities';
import { environment } from 'src/environments/environment';
import { RegexUtilities } from '../utilities/regex.utilities';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  seniors: any[];
  backup: any[];

  searchForm: FormGroup;

  showSnackbar: Boolean = false;
  message: string;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private utilities: Utilities,
    private dateUtilities: DateUtilities,
    private regexUtilities: RegexUtilities) { }

  get f() { return this.searchForm.controls }

  // UI: Determine whether profile is new
  isNew(uploaded) {
    return this.dateUtilities.isDatePastLimit(uploaded._seconds, 1);
  }

  // UI: Get formatted date by timestamp
  getDate(timestamp:number) {
    const date = this.dateUtilities.timestampToDate(timestamp);
    return this.dateUtilities.formatDate(date);
  }

  // UI: Generate profile URL for senior
  getProfileUrl(id) {
    return `${environment.url}/library?profile=${id}`;
  }

  // Initialize the search form
  buildSearchForm() {
    this.searchForm = this.formBuilder.group({
      search: ['',  Validators.compose([
        Validators.required, Validators.pattern(this.regexUtilities.search)
      ])]
    })
  }

  // Restore seniors array from backup
  restoreBackup() {
    this.seniors = this.utilities.copyArrayOfObj(this.backup);
  }

  // Handle profile search
  onSearch() {
    let query:string = this.f.search.value.toLowerCase();

    if (this.searchForm.invalid || !this.backup) {
      this.restoreBackup();
      return;
    }

    this.seniors = this.utilities.copyArrayOfObj(this.backup.filter(s => this.userService.matchSearch(s.fname, s.lname, query)));
  }

  // Retrieve all seniors from firebase
  getSeniors() {
    return this.userService.getAll()
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
      this.seniors = this.userService.sortByDateNew(this.seniors);
      this.backup = this.utilities.copyArrayOfObj(this.seniors);
      return;
    }

    setTimeout(() => {
      this.showSnackbar = true;
      this.message = 'Unable to Retrieve Data';
      setTimeout(() => this.showSnackbar = false, 3000);
    }, 1000);
  }

}