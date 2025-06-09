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
import {ThemeBlue} from './theme';
import {providePrimeNG} from 'primeng/config';
import { BookingComponent } from './pages/booking/booking.component';
import {DropdownModule} from 'primeng/dropdown';
import {Calendar} from 'primeng/calendar';
import {Checkbox} from 'primeng/checkbox';
import {ButtonDirective} from 'primeng/button';
import {ToastModule} from 'primeng/toast';
import {Steps} from 'primeng/steps';
import {MessageService} from 'primeng/api';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    LoaderComponent,
    BookingComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    DropdownModule,
    Calendar,
    Checkbox,
    ButtonDirective,
    ToastModule,
    Steps
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
export class AppModule {}
