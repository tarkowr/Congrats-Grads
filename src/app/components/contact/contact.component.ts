import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { AnalyticsService } from '../../services/analytics.service';
import { regex, analytics } from '../../app.constants';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  submitted: Boolean = false;
  loading: Boolean = false;
  contactFormWorks: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private contactService: ContactService,
    private analytics: AnalyticsService,
    private snackbar: SnackbarService,
  ) { }

  get f() { return this.contactForm.controls }

  onInstaClick() {
    this.analytics.trackEvent(analytics.insta);
  }

  onFbClick() {
    this.analytics.trackEvent(analytics.facebook);
  }

  // Handle successful sent email
  private onSuccess() {
    this.contactForm.reset();
    this.submitted = false;
    this.snackbar.show('Message Sent!');
  }

  // Handle email error
  private onError(err) {
    this.snackbar.show('Unable to Send Message');
    this.contactFormWorks = false;

    if (!this.contactForm.invalid) {
      const errorName = err ? err.name : 'Unknown Error';
      this.analytics.trackError('send_message', { sender: this.f.sender.value, message: this.f.message.value, error: errorName });
    }
  }

  // UI: Contact form on submit
  async onSubmit() {
    this.submitted = true;

    if (this.contactForm.invalid) return;

    this.loading = true;

    let message: string = this.f.message.value;
    message = message.replace(/\s\s+/g, ' ');

    await this.contactService.sendMessage(this.f.sender.value, message)
      .then(() => this.onSuccess())
      .catch((err) => this.onError(err));

    this.loading = false;
  }

  ngOnInit() {
    this.buildContactForm();
  }

  // OnInit: Initialize the contact form
  private buildContactForm() {
    this.contactForm = this.formBuilder.group({
      sender: ['',  Validators.compose([
        Validators.required, Validators.pattern(regex.email)
      ])],
      message: ['',  Validators.compose([
        Validators.required, Validators.maxLength(1000)
      ])]
    });
  }

}
