import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-booking-confirmed',
  standalone: false,
  templateUrl: './booking-confirmed.component.html',
  styleUrl: './booking-confirmed.component.scss'
})
export class BookingConfirmedComponent implements OnInit{
  reservationId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reservationId = this.route.snapshot.queryParamMap.get('id');
  }

  goToMyBookings(): void {
    this.router.navigate(['/account']);
  }
}
