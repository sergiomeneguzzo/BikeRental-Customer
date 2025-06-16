import {Component, OnDestroy, OnInit} from '@angular/core';
import {catchError, filter, forkJoin, of, Subject, switchMap, takeUntil} from 'rxjs';
import {User} from '../../interfaces/user';
import {Booking} from '../../interfaces/booking';
import {AuthService} from '../../services/auth.service';
import {BookingService} from '../../services/booking.service';
import {NotificationService} from '../../services/notification.service';
import {Router} from '@angular/router';

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
  showPastBookings = false;

  get filteredBookings(): Booking[] {
    const today = new Date();
    return this.userBookings.filter(b => {
      const dropoff = new Date(b.dropoffDate);
      return this.showPastBookings
        ? dropoff <= today
        : dropoff > today;
    });
  }

  private destroyed$ = new Subject<void>();

  showCancelModal = false;
  selectedBookingIdForCancel: string | null = null;

  constructor(
    private authSrv: AuthService,
    private bookingSrv: BookingService,
    private notify: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserBookings();
    this.authSrv.fetchUser();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  loadUserBookings(): void {
    this.isLoading = true;
    this.authSrv.currentUser$
      .pipe(
        takeUntil(this.destroyed$),
        filter(user => user !== null),
        switchMap(user => {
          this.currentUser = user;
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
        }
      });
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

  canShowActions(status: string): boolean {
    return status !== 'cancelled';
  }

  isActionDisabledDueToTime(pickupDate: Date | string): boolean {
    const today = new Date();
    const pickup = new Date(pickupDate);
    const diffTime = pickup.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  }

  showNotModifiableAlert(): void {
    this.notify.warningMessage('Non è più possibile modificare o cancellare la prenotazione entro 2 giorni dalla data di ritiro.');
  }

  onModifyBooking(bookingId: string): void {
    this.router.navigate(['/edit-booking', bookingId]);
  }

  openCancelModal(bookingId: string): void {
    this.selectedBookingIdForCancel = bookingId;
    this.showCancelModal = true;
  }

  onConfirmCancel(): void {
    if (this.selectedBookingIdForCancel) {
      this.bookingSrv.cancelReservation(this.selectedBookingIdForCancel).subscribe({
        next: () => {
          this.notify.successMessage('Prenotazione cancellata con successo!');
          this.loadUserBookings();
          this.selectedBookingIdForCancel = null;
        },
        error: (err) => {
          this.notify.errorMessage('Errore durante la cancellazione della prenotazione.');
          console.error('Errore cancellazione:', err);
        }
      });
    }
    this.showCancelModal = false;
  }

  onCancelModalClose(): void {
    this.showCancelModal = false;
    this.selectedBookingIdForCancel = null;
  }
}
