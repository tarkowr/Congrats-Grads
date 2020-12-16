import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { regex } from '../../app.constants';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  submitted: Boolean = false;
  loading: Boolean = false;
  showSnackbar: Boolean = false;
  message: string;

  constructor(
    private formBuilder: FormBuilder,
    private contactService: ContactService) { }

  get f() { return this.contactForm.controls }

  // Handle successful sent email
  private onSuccess() {
    this.contactForm.reset();
    this.submitted = false;
    this.message = 'Message Sent!'
    this.showSnackbar = true;
  }

  // Handle email error
  private onError(err) {
    console.error('Unable to send email!', err);
    this.message = 'Unable to Send Message!'
    this.showSnackbar = true;
  }

  // On complete
  private onComplete() {
    this.loading = false;
    setTimeout(() => this.showSnackbar = false, 3000);
  }

  // UI: Contact form on submit
  onSubmit() {
    this.submitted = true;

    if (this.contactForm.invalid) {
      return;
    }

    this.loading = true;

    this.contactService.sendMessage(this.f.sender.value, this.f.message.value)
      .then(() => {
        this.onSuccess();
      })
      .catch(err => {
        this.onError(err);
      })
      .finally(() => {
        this.onComplete();
      });
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
        Validators.required, Validators.pattern(regex.email_message)
      ])]
    });
  }

}
