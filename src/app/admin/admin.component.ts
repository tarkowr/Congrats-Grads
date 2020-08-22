import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { DateUtilities } from '../utilities/date.utilities';
import { Utilities } from '../utilities/utilities';
import { RegexUtilities } from '../utilities/regex.utilities';
import { AppStateService } from '../services/app-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  seniors: any[];
  backup: any[];

  searchForm: FormGroup;

  seniorsTab = { name: 'pills-seniors-tab', current: true }
  metricsTab = { name: 'pills-metrics-tab', current: false }
  tabs = [this.seniorsTab, this.metricsTab];

  constructor(
    private userService: UserService,
    private appStateService: AppStateService,
    private formBuilder: FormBuilder,
    private router: Router,
    private utilities: Utilities,
    private dateUtilities: DateUtilities,
    private regexUtilities: RegexUtilities) { }

  get f() { return this.searchForm.controls }

  // UI: Switch between nav pills
  setActivePill(event) {
    let tabId = event.target.id;
    let selectedTab = this.tabs.find(t => t.name == tabId);

    if (!selectedTab.current) {
      this.tabs.forEach(t => t.current = false);
      selectedTab.current = true;
    }
  }

  // UI: Determine whether profile is new
  isNew(uploaded) {
    return this.dateUtilities.isDatePastLimit(uploaded._seconds, 1);
  }

  // UI: Get formatted date by timestamp
  getDate(timestamp:number) {
    const date = this.dateUtilities.timestampToDate(timestamp);
    return this.dateUtilities.formatDate(date);
  }

  // UI: Navigate to senior profile
  getProfile(senior: any) {
    this.appStateService.seniorProfile = senior;
    this.router.navigate(['profile']);
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

  ngOnInit() {
    this.buildSearchForm();

    this.userService.library.subscribe((library: any[]) => {
      this.seniors = library;

      this.seniors = this.userService.sortByDateNew(this.seniors);
      this.backup = this.utilities.copyArrayOfObj(this.seniors);
    });
  }

}