import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RequestCounterService } from './services/request-counter.service';
import { AsyncPipe } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, MatProgressSpinnerModule, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'StockBot';

  constructor(
    public requestCounterService: RequestCounterService,
    private titleService: Title,
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }
}
