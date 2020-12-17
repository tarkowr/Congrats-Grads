import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LibraryService } from '../../services/library.service';
import { LibraryState } from '../../models/state/library.state';
import { Senior } from '../../models/senior';
import { StorageService } from '../../services/storage.service';
import { WindowService } from '../../services/window.service';
import { AnalyticsService } from '../../services/analytics.service';
import { app, regex, storage } from '../../app.constants';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  mobile: Boolean = true;

  windowSubscription: Subscription;

  createForm: FormGroup;
  submitted: Boolean = false;
  loading: Boolean = false;

  image: any;
  fileMessage: string = "No file chosen";
  
  btnWait: Boolean = false;

  showSnackbar: Boolean = false;
  message: string;
  
  error: Boolean = false;
  maxUpload: Boolean = false;
  missingImage: Boolean = true;
  wrongType: Boolean = false;
  sizeLimit: Boolean = false;
  otherErr: Boolean = false;

  hadSizeError: Boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private windowService: WindowService,
    private libraryService: LibraryService,
    private libraryState: LibraryState,
    private storageService: StorageService,
    private analytics: AnalyticsService,
    private router: Router) { }

  get f() { return this.createForm.controls }

  get uploads() : any[] {
    return this.storageService.get(storage.uploads) || [];
  }

  // UI: Handle selected image
  selectImage(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.image = file;
      this.fileMessage = file.name;
      this.missingImage = false;
      this.sizeLimit = false;
      this.wrongType = false;
    }
  }

  // Client-side validation of uploaded image
  private validateImage() {
    const maxSize = 3 * 1024 * 1024;

    if (this.image) {
      if (this.image.size > maxSize) {
        this.sizeLimit = true;
        this.hadSizeError = true;

        const user = this.storageService.get(storage.userId);
        this.analytics.trackError('max_image_size', { user: user, name: this.image.name, size: this.image.size });
      }
    }
  }

  // Add new upload to local storage
  private setUploaded(id: string) {
    let uploaded: string[] = this.uploads;

    uploaded.push(id);
    this.storageService.set(storage.uploads, uploaded);
  }

  // Display server errors based on type
  private handleError(err) {
    if (!err) return;

    switch(err.error) {
      case 1001:
        this.missingImage = true;
        break;
      case 1002: 
        this.wrongType = true;
        break;
      case 1003:
        this.otherErr = true;
        break;
      default:
        this.sizeLimit = true;
        break;
    }
  }

  // Successful profile upload
  private onSuccess(senior: Senior) {
    this.submitted = false;
    this.createForm.reset();
    this.message = 'Successfully Uploaded!';
    this.showSnackbar = true;
    this.error = false;
    this.setUploaded(senior.id);
  }

  // Error on profile upload
  private onError(err) {
    this.message = 'Unable to Create Profile';
    this.showSnackbar = true;
    this.error = true;
    this.handleError(err);
    this.btnWait = true;
  }

  // After handling profile upload response
  private onComplete() {
    this.loading = false;

    setTimeout(() => {
      this.showSnackbar = false;
      this.btnWait = false;
      if (!this.error) {
        this.router.navigate(['library']);
      }
    }, (this.error) ? 3000 : 2000);
  }

  // Reset all client-side error indicators
  private resetErrors() {
    this.maxUpload = false;
    this.wrongType = false;
    this.sizeLimit = false;
    this.otherErr = false;
  }

  // UI: Handle upload form on submission
  onSubmit() {
    this.submitted = true;

    this.resetErrors();

    if (this.createForm.invalid) {
      return;
    }

    this.validateImage();

    if (this.missingImage || this.wrongType || this.sizeLimit) {
      return;
    }

    this.hadSizeError = false;

    if (this.uploads.length >= app.maxUploads) {
      this.maxUpload = true;
      return;
    }

    this.loading = true;

    this.libraryService.create(this.f.firstname.value, this.f.lastname.value, this.f.school.value, this.f.comments.value, this.image)
      .then(async (senior: Senior) => {
        await this.libraryService.fetchLibrary();
        this.libraryState.reset();
        this.onSuccess(senior);
      })
      .catch(err => {
        this.onError(err);
      })
      .finally(() => {
        this.onComplete();
      });
  }

  ngOnInit() {
    this.buildUserForm();
    this.handleScreenResize();
  }

  ngOnDestroy() {
    this.windowSubscription.unsubscribe();

    if (this.hadSizeError) {
      const user = this.storageService.get(storage.userId);
      this.analytics.trackEvent('abandon_ship', { user: user, hadSizeError: true });
    }
  }

  // OnInit: Initialize the create user form
  private buildUserForm() {
    this.createForm = this.formBuilder.group({
      firstname: ['',  Validators.compose([
        Validators.required, Validators.pattern(regex.name)
      ])],
      lastname: ['',  Validators.compose([
        Validators.required, Validators.pattern(regex.name)
      ])],
      school: ['',  Validators.compose([
        Validators.required, Validators.pattern(regex.school)
      ])],
      profileImg: [''],
      comments: ['',  Validators.compose([
        Validators.required, Validators.pattern(regex.comments)
      ])]
    });
  }

  // OnInit: Handle a change in the user's viewport
  private handleScreenResize() {
    this.windowSubscription = this.windowService.large.subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }
}
