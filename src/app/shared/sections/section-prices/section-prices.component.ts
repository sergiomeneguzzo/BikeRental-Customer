import {AfterViewInit, Component, OnInit} from '@angular/core';
import { gsap } from 'gsap';
import {BikeType} from '../../../interfaces/bike';
import {BookingService} from '../../../services/booking.service';
interface DurationRow {
  label: string;
  multiplier: number;
}

@Component({
  selector: 'app-section-prices',
  standalone: false,
  templateUrl: './section-prices.component.html',
  styleUrl: './section-prices.component.scss'
})
export class SectionPricesComponent implements AfterViewInit, OnInit{
  bikeTypes: BikeType[] = [];
  durations: DurationRow[] = [
    { label: 'Mezza giornata (4h)', multiplier: 1 },
    { label: '1 giorno',            multiplier: 2 },
    { label: '2 giorni',            multiplier: 4 },
    { label: '3 giorni',            multiplier: 6 },
    { label: '4 giorni',            multiplier: 8 },
    { label: '5 giorni',            multiplier: 10 },
  ];

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingService.getBikeTypes()
      .subscribe(types => this.bikeTypes = types);
  }
  ngAfterViewInit(): void {
    document.querySelectorAll('[data-collapse]').forEach(container => {
      const header = container.querySelector('.acc-block');
      const panel = container.nextElementSibling as HTMLElement | null;
      if (!header || !panel) {
        return;
      }
      const items = Array.from(panel.children);
      gsap.set(panel, { height: 0, overflow: 'hidden' });
      gsap.set(items, { autoAlpha: 0, y: 40 });
      const tl = gsap.timeline({ paused: true, reversed: true })
        .to(panel, {
          height: () => panel.scrollHeight,
          duration: 0.8,
          ease: "expo.inOut"
        }, 0)
        .to(items, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "expo.inOut",
          stagger: 0.08
        }, 0.1);
      header.addEventListener('click', () => {
        tl.reversed() ? tl.play() : tl.reverse();
      });
    });
  }
}
