import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html', // Nome corrigido
  styleUrl: './app.component.css'      // Nome corrigido
})
export class AppComponent { // Classe renomeada para o padrão
  protected readonly title = signal('frontend');
}