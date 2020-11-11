import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/static/page-not-found/page-not-found.component';
import { CreateComponent } from './components/create/create.component';
import { LibraryComponent } from './components/library/library.component';
import { PrivacyComponent } from './components/static/privacy/privacy.component';
import { ContactComponent } from './components/contact/contact.component';
import { TermsComponent } from './components/static/terms/terms.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AboutComponent } from './components/about/about.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'create', component: CreateComponent },
    { path: 'library', component: LibraryComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'profile/:id', component: ProfileComponent },
    { path: 'privacy', component: PrivacyComponent },
    { path: 'contact',  component: ContactComponent },
    { path: 'terms', component: TermsComponent },
    { path: '**', component: PageNotFoundComponent }
];