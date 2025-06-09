import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {BookingService} from '../../services/booking.service';
import {Location} from '../../interfaces/location';
import {Bike, BikeStatus, BikeType} from '../../interfaces/bike';

interface ReservationStep {
  label: string;
}

@Component({
  selector: 'app-booking',
  standalone: false,
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit{
  steps: ReservationStep[] = [
    { label: 'Step 1' },
    { label: 'Step 2' },
    { label: 'Step 3' },
  ];
  activeIndex = 0;

  locations: Location[] = [];
  bikeTypes: BikeType[] = [];
  filteredBikes: Bike[] = [];
  bookingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private bookingSrv: BookingService
  ) {
    this.bookingForm = this.fb.group({
      // STEP 1
      pickupLocation: [null, Validators.required],
      dropoffLocation: [null, Validators.required],
      pickupDate: [null, Validators.required],
      dropoffDate: [null, Validators.required],
      extraLocationFee: [false],
      // STEP 2
      bikeType: [null, Validators.required],
      bikeId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.bookingSrv.getLocations().subscribe(locs => this.locations = locs);
    this.bookingSrv.getBikeTypes().subscribe(types => this.bikeTypes = types);

    this.bookingForm.get('pickupLocation')!.valueChanges.subscribe(() => this.updateExtraFee());
    this.bookingForm.get('dropoffLocation')!.valueChanges.subscribe(() => this.updateExtraFee());
  }

  get halfDays(): number {
    const pu: Date = this.bookingForm.get('pickupDate')!.value;
    const doff: Date = this.bookingForm.get('dropoffDate')!.value;
    if (!pu || !doff) {
      return 0;
    }
    const msDiff = doff.getTime() - pu.getTime();
    const hours = msDiff / (1000 * 60 * 60);
    return hours > 0 ? Math.ceil(hours / 12) : 0;
  }

  getTotalPrice(bike: Bike): number {
    if (this.halfDays === 0) {
      return 0;
    }
    const priceHalf = (bike.bikeType as BikeType).PriceHalfDay;
    return priceHalf * this.halfDays;
  }

  updateExtraFee(): void {
    const pu = this.bookingForm.get('pickupLocation')!.value;
    const doff = this.bookingForm.get('dropoffLocation')!.value;
    const extra = pu && doff && pu !== doff;
    this.bookingForm.patchValue({ extraLocationFee: extra }, { emitEvent: false });
  }

  selectBikeType(typeId: string): void {
    this.bookingForm.patchValue({ bikeType: typeId, bikeId: null });
    this.bookingSrv.getBikes().subscribe(all => {
      this.filteredBikes = all.filter(b => {
        const bt = typeof b.bikeType === 'string' ? b.bikeType : (b.bikeType as any)._id;
        return bt === typeId && b.status === BikeStatus.AVAILABLE;
      });
    });
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

  submit(): void {
    if (this.bookingForm.valid) {
      console.log('Booking payload:', this.bookingForm.value);
    }
  }

  public isStepValid(index: number): boolean {
    if (index === 0) {
      return this.bookingForm.get('pickupLocation')!.valid
        && this.bookingForm.get('dropoffLocation')!.valid
        && this.bookingForm.get('pickupDate')!.valid
        && this.bookingForm.get('dropoffDate')!.valid;
    }
    if (index === 1) {
      return this.bookingForm.get('bikeType')!.valid
        && this.bookingForm.get('bikeId')!.valid;
    }
    return true;
  }

  selectBike(bikeId: string) {
    this.bookingForm.patchValue({ bikeId });
  }

  deselectBike() {
    this.bookingForm.patchValue({ bikeId: null });
  }

  protected readonly Object = Object;
}
