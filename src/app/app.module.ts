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
import { ThemeBlue } from './theme';
import { providePrimeNG } from 'primeng/config';
import { BookingComponent } from './pages/booking/booking.component';
import { DropdownModule } from 'primeng/dropdown';
import { Calendar, CalendarModule } from 'primeng/calendar';
import { Checkbox, CheckboxModule } from 'primeng/checkbox';
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { Steps, StepsModule } from 'primeng/steps';
import { MessageService } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { HomeComponent } from './pages/home/home.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';

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
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    RouterModule,              // ← assicura la registrazione di <router-outlet>
    ReactiveFormsModule,       // ← per [formGroup]
    FormsModule,
    HttpClientModule,

    // PrimeNG per login / register
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,

    // altri PrimeNG
    DropdownModule,
    CalendarModule,
    CheckboxModule,
    ToastModule,
    StepsModule
  ],
  providers: [
    provideAnimationsAsync(),
    MessageService,
    providePrimeNG({
      theme: {
        preset: ThemeBlue,
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
