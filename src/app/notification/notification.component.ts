import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-notification',
  template: `
    <div *ngIf="message" 
         class="notification"
         [@slideIn]>
      {{ message }}
    </div>
  `,
  styles: [`
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: var(--secondary-color);
      color: white;
      padding: 1rem;
      border-radius: var(--radius);
      z-index: 1000;
      box-shadow: var(--shadow);
    }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  message: string | null = null;
  private subscription: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscription = this.notificationService.notifications$
      .pipe(
        tap(message => {
          this.message = message;
          setTimeout(() => this.message = null, 3000);
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
