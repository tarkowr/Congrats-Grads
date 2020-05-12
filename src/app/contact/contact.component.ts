import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ContactService } from '../services/contact.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  submitted: Boolean = false;
  loading: Boolean = false;
  showSnackbar:Boolean = false;
  message:String;

  constructor(
    private formBuilder: FormBuilder,
    private contactService: ContactService) { }

  get f() { return this.contactForm.controls }

  // Initialize the contact form
  buildContactForm() {
    this.contactForm = this.formBuilder.group({
      sender: ['',  Validators.compose([
        Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/)
      ])],
      message: ['',  Validators.compose([
        Validators.required, Validators.pattern(/^.{1,1000}$/)
      ])]
    })
  }

  // Handle successful sent email
  onSuccess() {
    this.contactForm.reset();
    this.submitted = false;
    this.message = 'Message Sent!'
    this.showSnackbar = true;
  }

  // Handle email error
  onError(err) {
    this.message = 'Unable to Send Message!'
    this.showSnackbar = true;
  }

  // On complete
  onComplete() {
    this.loading = false;
    setTimeout(() => this.showSnackbar = false, 3000);
  }

  // Contact form on submit
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

}
