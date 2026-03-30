import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Animal {
  groupNumber: number;
  name: string;
  imagePath: string;
  tens: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);
  
  // Usando Signals para reatividade moderna
  animals = signal<Animal[]>([]);

  ngOnInit(): void {
    this.http.get<Animal[]>('http://localhost:8080/api/animals').subscribe({
      next: (data) => this.animals.set(data),
      error: (err) => console.error('Erro ao carregar animais', err)
    });
  }
}