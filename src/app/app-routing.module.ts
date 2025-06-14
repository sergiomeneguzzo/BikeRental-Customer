import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { BookingComponent } from './pages/booking/booking.component';
import { HomeComponent } from './pages/home/home.component';
import {BookingConfirmedComponent} from './pages/booking/booking-confirmed/booking-confirmed.component';
import {CheckEmailComponent} from './pages/auth/check-email/check-email.component';
import {EmailConfirmedComponent} from './pages/auth/email-confirmed/email-confirmed.component';
import {homeGuard} from './guards/home.guard';
import {UserComponent} from './pages/user/user.component';
import {authGuard} from './guards/auth.guard';
import {EditBookingComponent} from './pages/booking/edit-booking/edit-booking.component';

const routes: Routes = [
  // Redirect dalla root a /home
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // Rotta "home"
  { path: 'home', component: HomeComponent },
  { path: 'login',  component: LoginComponent, canActivate: [homeGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [homeGuard] },
  { path: 'check-email', component: CheckEmailComponent },
  { path: 'email-confirmed', component: EmailConfirmedComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'booking-confirmed', component: BookingConfirmedComponent },
  { path: 'account', component: UserComponent, canActivate: [authGuard]  },
  { path: 'edit-booking/:id', component: EditBookingComponent, canActivate: [authGuard] },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'disabled',
    })
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
