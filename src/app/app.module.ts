import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from './components/loader/loader.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './utils/auth.interceptor';
import { ThemeBlack } from './theme';
import { providePrimeNG } from 'primeng/config';
import { BookingComponent } from './pages/booking/booking.component';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { StepsModule } from 'primeng/steps';
import { MessageService } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { PopoverModule } from 'primeng/popover';
import { HomeComponent } from './pages/home/home.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { MultiSelect } from 'primeng/multiselect';
import { Image } from 'primeng/image';
import { BookingConfirmedComponent } from './pages/booking/booking-confirmed/booking-confirmed.component';
import { CheckEmailComponent } from './pages/auth/check-email/check-email.component';
import { EmailConfirmedComponent } from './pages/auth/email-confirmed/email-confirmed.component';
import { UserComponent } from './pages/user/user.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import {BackgroundComponent} from './shared/background/background.component';
import { EditBookingComponent } from './pages/booking/edit-booking/edit-booking.component';
import {InputNumber} from "primeng/inputnumber";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    LoaderComponent,
    BookingComponent,
    HomeComponent,
    NavbarComponent,
    FooterComponent,
    BookingConfirmedComponent,
    CheckEmailComponent,
    EmailConfirmedComponent,
    UserComponent,
    ConfirmationModalComponent,
    BackgroundComponent,
    EditBookingComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,

    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    PopoverModule,

    DropdownModule,
    CalendarModule,
    CheckboxModule,
    ToastModule,
    StepsModule,
    MultiSelect,
    Image,
    InputNumber
  ],
  providers: [
    provideAnimationsAsync(),
    MessageService,
    providePrimeNG({
      theme: {
        preset: ThemeBlack,
        options: {
          darkModeSelector: false
        }
      }
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
