import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

export const testProviders = [provideHttpClient(), provideHttpClientTesting()];
