import {Component, OnDestroy, OnInit} from '@angular/core';
import {catchError, filter, forkJoin, of, Subject, switchMap, takeUntil} from 'rxjs';
import {User} from '../../interfaces/user';
import {Booking} from '../../interfaces/booking';
import {AuthService} from '../../services/auth.service';
import {BookingService} from '../../services/booking.service';
import {NotificationService} from '../../services/notification.service';

@Component({
  selector: 'app-user',
  standalone: false,
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit, OnDestroy{
  currentUser: User | null = null;
  userBookings: Booking[] = [];
  isLoading = true;
  private destroyed$ = new Subject<void>();

  constructor(
    private authSrv: AuthService,
    private bookingSrv: BookingService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.authSrv.currentUser$
      .pipe(
        takeUntil(this.destroyed$),
        filter(user => user !== null),
        switchMap(user => {
          this.currentUser = user;
          this.isLoading = true;
          return this.bookingSrv.getUserReservation();
        }),
        catchError(err => {
          this.isLoading = false;
          this.notify.errorMessage('Errore durante il recupero delle prenotazioni.');
          console.error('Errore nel recupero prenotazioni:', err);
          return of([]);
        })
      )
      .subscribe({
        next: (bookings) => {
          this.userBookings = bookings;
          this.isLoading = false;
          console.log('User info:', this.currentUser);
          console.log('User bookings:', this.userBookings);
        }
      });
    this.authSrv.fetchUser();
    this.isLoading = true;
  }
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getBookingStatus(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'In Attesa';
      case 'CONFIRMED':
        return 'Confermata';
      case 'CANCELLED':
        return 'Cancellata';
      case 'COMPLETED':
        return 'Completata';
      default:
        return status;
    }
  }
}
