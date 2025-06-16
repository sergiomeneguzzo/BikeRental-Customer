import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Validators,
  FormBuilder,
  AbstractControl,
  FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { urlValidator } from '../../../validators/url-validator';
import { customEmailValidator } from '../../../validators/email-validator';
import { strongPasswordValidator } from '../../../validators/strongpassword-validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  standalone: false,
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  hide = true;
  isLoading = false;

  private destroyed$ = new Subject<void>();

  constructor(
    protected fb: FormBuilder,
    private authSrv: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      picture: ['', [urlValidator()]],
      username: [
        '',
        [Validators.required, Validators.email, customEmailValidator()],
      ],
      password: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: [
        '',
        [Validators.required, this.matchPasswordValidator('password')],
      ],
    });
  }

  ngOnInit(): void {
    this.registerForm.valueChanges.pipe(takeUntil(this.destroyed$));
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  register() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      let {
        firstName,
        lastName,
        username,
        picture,
        password,
        confirmPassword,
      } = this.registerForm.value;

      if (!picture) {
        picture =
          'https://static.vecteezy.com/ti/vettori-gratis/p1/2318271-icona-profilo-utente-vettoriale.jpg';
      }

      this.authSrv
        .register(
          firstName!,
          lastName!,
          username!,
          picture!,
          password!,
          confirmPassword!
        )
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            this.notification.successMessage('Registrazione riuscita');
            this.router.navigate([`/check-email`]);
          },
          error: (err) => {
            this.isLoading = false;
            if (err.error && err.error.message) {
              if (err.error.error === 'UserExistsError') {
                this.notification.errorMessage(
                  "Email già in uso. Prova con un'altra."
                );
              } else if (err.error.error === 'PasswordMismatch') {
                this.notification.errorMessage(
                  'Le password non corrispondono. Riprova.'
                );
              } else {
                this.notification.errorMessage(
                  'Registrazione fallita. Riprova più tardi.'
                );
              }
            } else {
              this.notification.errorMessage(
                'Registrazione fallita. Riprova più tardi.'
              );
            }
          },
        });
    } else {
      this.isLoading = false;
      this.notification.errorMessage(
        'Per favore, compila tutti i campi correttamente.'
      );
    }
  }

  matchPasswordValidator(passwordField: string) {
    return (control: any) => {
      const form = control.parent;
      if (form) {
        const password = form.get(passwordField)?.value;
        return password === control.value ? null : { passwordMismatch: true };
      }
      return null;
    };
  }
}
