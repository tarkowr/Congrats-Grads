import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/Static/page-not-found/page-not-found.component';
import { CreateComponent } from './components/create/create.component';
import { SnackbarComponent } from './components/Shared/snackbar/snackbar.component';
import { LibraryComponent } from './components/library/library.component';
import { NavbarComponent } from './components/Shared/navbar/navbar.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PrivacyComponent } from './components/Static/privacy/privacy.component';
import { ContactComponent } from './components/contact/contact.component';
import { FooterComponent } from './components/Shared/footer/footer.component';
import { TermsComponent } from './components/Static/terms/terms.component';
import { AboutComponent } from './components/about/about.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PageNotFoundComponent,
    CreateComponent,
    SnackbarComponent,
    LibraryComponent,
    NavbarComponent,
    ProfileComponent,
    PrivacyComponent,
    ContactComponent,
    FooterComponent,
    TermsComponent,
    AboutComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
