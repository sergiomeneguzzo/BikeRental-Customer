import { Component } from '@angular/core';
import { NotificationService } from './services/notification.service';
import { AuthService } from './services/auth.service';
import Lenis from 'lenis';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: false,
})
export class AppComponent {
  private lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngAfterViewInit() {
    const raf = (time: number) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        const fragment = this.route.snapshot.fragment;
        if (fragment) {
          setTimeout(() => {
            const el = document.getElementById(fragment);
            if (el) {
              this.lenis.scrollTo(el, { offset: 0 });
            }
          }, 50);
        }
      });
  }
}
