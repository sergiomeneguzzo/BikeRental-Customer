import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtService } from '../services/jwt.service';
import { catchError, throwError } from 'rxjs';
import { apiUrl } from '../../../secrets';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { SessionService } from '../services/session.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private jwtSrv: JwtService,
    private notificationService: NotificationService,
    private authEventService: SessionService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.jwtSrv.getToken();
    const router = new Router();
    const authReq = authToken
      ? req.clone({
          headers: req.headers.set('Authorization', `Bearer ${authToken}`),
        })
      : req;
    //return next.handle(authReq);
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (
          error.status === 401 &&
          req.url.includes(apiUrl) &&
          !req.url.endsWith('/me') &&
          !req.url.endsWith('/login')
        ) {
          this.authEventService.emitLogout();
          this.notificationService.errorMessage('Sessione scaduta');
        }
        return throwError(error);
      })
    );
  }
}
