import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {BookingService} from '../../services/booking.service';

interface ReservationStep {
  label: string;
}

@Component({
  selector: 'app-booking',
  standalone: false,
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit{
  steps: ReservationStep[] = [
    { label: 'Step 1' },
    { label: 'Step 2' },
    { label: 'Step 3' },
  ];
  activeIndex = 0;

  locations: Location[] = [];
  bookingForm: FormGroup;

  constructor(private fb: FormBuilder,
              private http: HttpClient,
              private bookingSrv: BookingService) {
    this.bookingForm = this.fb.group({
      pickupLocation: [null, Validators.required],
      dropoffLocation: [null, Validators.required],
      pickupDate: [null, Validators.required],
      dropoffDate: [null, Validators.required],
      extraLocationFee: [false],
      items: [[]],
      accessories: [[]],
      insurances: [[]],
      totalPrice: [0],
      paymentMethod: [''],
    });
  }

  ngOnInit() {
    this.bookingSrv.getLocations().subscribe(locs => (this.locations = locs));

    this.bookingForm.get('pickupLocation')!.valueChanges.subscribe(() => this.updateExtraFee());
    this.bookingForm.get('dropoffLocation')!.valueChanges.subscribe(() => this.updateExtraFee());
  }

  updateExtraFee() {
    const pu = this.bookingForm.value.pickupLocation;
    const doff = this.bookingForm.value.dropoffLocation;
    const extra = pu && doff && pu !== doff;
    this.bookingForm.patchValue({ extraLocationFee: extra });
  }

  next() {
    if (this.activeIndex < this.steps.length - 1) {
      this.activeIndex++;
    }
  }

  prev() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  submit() {
    if (this.bookingForm.valid) {
      console.log('Payload booking:', this.bookingForm.value);
    }
  }
}
