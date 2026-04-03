import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

// Define o bloco de testes para o componente principal (AppComponent)
describe('AppComponent', () => {
  
  // Configuração executada antes de cada teste individual
  beforeEach(async () => {
    // Prepara o ambiente de teste do Angular importando o componente
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  // Teste para verificar se a aplicação consegue ser instanciada corretamente
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    // Verifica se o objeto do componente existe
    expect(app).toBeTruthy();
  });

  // Teste para validar se a propriedade 'title' possui o valor inicial esperado
  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    
    // Verifica se o sinal (signal) 'title' retorna o valor 'frontend'
    expect(app['title']()).toEqual('frontend'); 
  });
});