import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuoteComponent } from './quote.component';
import { testProviders } from '../../test-providers';
import { HttpTestingController } from '@angular/common/http/testing';

describe('QuoteComponent', () => {
  let component: QuoteComponent;
  let fixture: ComponentFixture<QuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteComponent],
      providers: [...testProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch quote', async () => {
    const component = fixture.componentInstance;

    component.symbolForm.patchValue({
      symbol: 'AMZN',
    });

    fixture.detectChanges();

    // Fetch quote
    const submit = fixture.nativeElement.querySelector(
      '#submit-btn',
    ) as HTMLElement;

    submit.click();

    // Mock response
    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne(
      (r) => r.url.includes('/stocks') && r.method === 'GET',
    );

    req.flush({
      c: 249.38,
      d: 0.11,
      dp: 0.0441,
      h: 250.43,
      l: 245.6,
      o: 246.02,
      pc: 249.27,
      t: 1790280000,
    });

    // Refresh the DOM
    fixture.detectChanges();

    // Check that the request/response messages are displayed
    const messages = fixture.nativeElement.querySelectorAll('[id^="message-"]');

    expect(messages.length).toBe(2);
  });
});
