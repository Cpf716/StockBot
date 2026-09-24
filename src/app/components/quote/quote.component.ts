import { Component, ElementRef, ViewChild } from '@angular/core';
import { MessageService } from '../../services/message.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Quote } from '../../interfaces/stocks.interface';
import { StocksService } from '../../services/stocks.service';

enum MessageType {
  Request,
  Response,
}

type Message = { type: MessageType; message: string };
@Component({
  selector: 'app-quote',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './quote.component.html',
  styleUrl: './quote.component.scss',
})
export class QuoteComponent {
  // Typedef

  RequestMessage = MessageType.Request;

  // Member fields

  date!: string;
  messages: Message[] = [];
  symbolForm!: FormGroup;

  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  // Constructors

  constructor(
    private messageService: MessageService,
    private stocksService: StocksService,
  ) {
    this.symbolForm = new FormGroup({
      symbol: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[A-Za-z]+$/),
      ]),
    });
  }

  ngOnInit() {
    const date = new Date();

    this.date = [
      [date.getMonth() + 1, date.getDate(), date.getFullYear()].join('/'),
      [date.getHours() % 12, date.getMinutes()]
        .map((v) => String(v).padStart(2, '0'))
        .join(':'),
      date.getHours() >= 12 ? 'PM' : 'AM',
    ].join(' ');
  }

  // Member Functions

  /**
   * Fetches the quote for a given symbol and appends it to the "chat"
   * @returns
   */
  getQuote() {
    // Symbol is empty or non-alphabetical; stop immediately
    if (this.symbolForm.invalid) {
      return this.messageService.postMessage('Please enter a valid symbol', {
        panelClass: 'snackbar-error',
      });
    }

    const symbol = this.symbolForm.get('symbol')!.value!.toUpperCase();

    // Append request message
    this.messages.push({ type: MessageType.Request, message: symbol });

    this.stocksService.getQuote(symbol).subscribe({
      next: (result: Quote) => {
        this.symbolForm.reset();

        // Append response message
        this.messages.push({
          type: MessageType.Response,
          message:
            result.t === 0
              ? `I could not find the opening price for ${symbol}.`
              : `The opening price for ${symbol} is $${result.o.toFixed(2)}.`,
        });

        // Scroll to the bottom
        setTimeout(
          () =>
            this.messageContainer.nativeElement.scrollTo({
              top: this.messageContainer.nativeElement.scrollHeight,
              behavior: 'smooth',
            }),
          10,
        );
      },
      error: () => {},
    });
  }
}
