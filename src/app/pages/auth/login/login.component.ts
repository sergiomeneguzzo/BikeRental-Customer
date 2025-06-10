import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import {Subject, takeUntil, catchError, throwError, forkJoin, switchMap, of, map} from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import {BookingService} from '../../../services/booking.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: false,
})
export class LoginComponent implements OnInit, OnDestroy {
  hide = true;
  loginForm;
  loginError = '';

  private destroyed$ = new Subject<void>();
  private timeout: any;
  isLoading = false;

  constructor(
    protected fb: FormBuilder,
    private authSrv: AuthService,
    private bookingSrv: BookingService,
    private router: Router,
    private notify: NotificationService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loginForm.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.loginError = '';
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.notify.errorMessage('Compila correttamente tutti i campi.');
      return;
    }

    this.isLoading = true;
    const {username, password} = this.loginForm.value;

    this.authSrv.login(username!, password!)
      .pipe(
        switchMap(user =>
          this.bookingSrv.getPendingReservations()
            .pipe(
              switchMap(resvs => {
                if (resvs.length > 0) {
                  return forkJoin(
                    resvs.map(r => this.bookingSrv.confirmReservation(r))
                  );
                } else {
                  return of(user);
                }
              }),
              map(() => user)
            )
        ),
        catchError(err => {
          this.isLoading = false;
          if (err.error?.message === 'email not confirmed') {
            this.notify.errorMessage(
              'La tua email non è confermata. Controlla la posta!'
            );
          } else {
            this.notify.errorMessage('Credenziali errate o invalide');
          }
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (user) => {
          this.isLoading = false;
          this.notify.successMessage('Accesso effettuato con successo!');
          this.router.navigate(['/home']);
        },
        error: () => {
        },
      });
  }
}
