import { Component } from '@angular/core';
import { PracticeComponent } from './practice/practice.component';

@Component({
  selector: 'app-root',
  imports: [PracticeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
