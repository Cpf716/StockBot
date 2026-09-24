import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Component, Input } from '@angular/core';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  imports: [AsyncPipe, MatDialogModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  // Member Fields

  @Input() title!: string;

  // Constructors

  constructor(
    public authService: AuthService,
    private dialog: MatDialog,
  ) {}

  // Member Functions

  /**
   * Logs the user out and navigates back to the login page
   * @returns
   */
  logOut = () =>
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Log Out',
        },
        panelClass: 'custom-dialog-container',
      })
      .afterClosed()
      .subscribe((value) => value && this.authService.logOut());
}
