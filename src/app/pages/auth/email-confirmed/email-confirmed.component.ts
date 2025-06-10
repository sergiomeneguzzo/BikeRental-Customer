import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-email-confirmed',
  standalone: false,
  templateUrl: './email-confirmed.component.html',
  styleUrl: './email-confirmed.component.scss'
})
export class EmailConfirmedComponent implements OnInit{
  token: string | null = null;
  loading = true;
  confirmationStatus: 'success' | 'error' | 'invalid' | null = null;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authSrv: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (this.token) {
      this.authSrv.confirmEmail(this.token).subscribe({
        next: () => {
          this.loading = false;
          this.confirmationStatus = 'success';
          this.message = 'La tua email è stata confermata con successo! Ora puoi accedere al tuo account.';
        },
        error: (error) => {
          this.loading = false;
          this.confirmationStatus = 'error';
          this.message = 'Si è verificato un errore durante la conferma della tua email. Riprova più tardi o contatta il supporto.';
          console.error('Errore nella conferma della email:', error);

          if (error.error && error.error.message) {
            this.message = error.error.message;
          } else if (typeof error.error === 'string') {
            this.message = error.error;
          } else if (error.message) {
            this.message = `Errore: ${error.message}`;
          }
        }
      });
    } else {
      this.loading = false;
      this.confirmationStatus = 'invalid';
      this.message = 'Impossibile confermare la email. Il token non è presente o non è valido.';
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
