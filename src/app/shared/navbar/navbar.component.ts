import {Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { gsap } from 'gsap';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  menuOpen = false;
  mobileMenuOpen = false;
  @ViewChild('menuMo', { static: true }) menuMo!: ElementRef;

  constructor(
    public auth: AuthService,
    private router: Router,
    private eRef: ElementRef
  ) {}

  goToProfile() {
    this.router.navigate(['/account']);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    const body = document.body;

    if (this.mobileMenuOpen) {
      gsap.set(this.menuMo.nativeElement, { display: 'flex' });
      gsap.fromTo(
        this.menuMo.nativeElement,
        { y: '-100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.5 }
      );
      body.classList.add('no-scroll');
    } else {
      gsap.to(this.menuMo.nativeElement, {
        y: '-100%',
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          gsap.set(this.menuMo.nativeElement, { display: 'none' });
          body.classList.remove('no-scroll');
        }
      });
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (
      this.mobileMenuOpen &&
      !this.eRef.nativeElement.contains(event.target as Node)
    ) {
      this.toggleMobileMenu();
    }
    if (
      this.menuOpen &&
      !this.eRef.nativeElement.contains(event.target as Node)
    ) {
      this.menuOpen = false;
    }
  }
}
