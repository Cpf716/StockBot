import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RequestCounterService {
  // Member Fields

  private readonly _count = new BehaviorSubject<number>(0);
  readonly count$ = this._count.asObservable();

  // Accessors

  set count(value: number) {
    this._count.next(value);
  }

  get count() {
    return this._count.getValue();
  }
}
