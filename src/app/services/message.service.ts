import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

type SnackBarOptions = {
  durationSeconds?: number;
  panelClass?: string | string[];
};

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  // Constructors

  constructor(private snackBar: MatSnackBar) {}

  // Member Functions

  /**
   * Posts a message to the MatSnackBar
   * @param message
   * @param options
   */
  postMessage(message: string, options?: SnackBarOptions) {
    this.snackBar.open(
      message,
      'Dismiss',
      options
        ? {
            ...options,
            duration: (options?.durationSeconds ?? 3) * 1000,
          }
        : undefined,
    );
  }
}
