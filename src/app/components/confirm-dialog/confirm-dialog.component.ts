import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  // Constructors

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
    },
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
  ) {}

  // Member Functions

  /**
   * Closes the dialog with value
   * @param value - The confirmation value
   * @returns
   */
  closeDialog = (value?: boolean) => this.dialogRef.close(value);
}
