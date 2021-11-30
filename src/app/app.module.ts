import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { SearchComponent } from './components/search/search.component';
import { PieceComponent } from './components/piece/piece.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { AboutComponent } from './components/about/about.component';

// Importar rutas
import { ROUTES } from './app.routes';

// Importar servicios
import { MuseumService } from './services/museum.service';

// Pipes
import { NoimagePipe } from './pipes/noimage.pipe';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchComponent,
    PieceComponent,
    NavbarComponent,
    NoimagePipe,
    FooterComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES, { useHash: true })
  ],
  providers: [
    MuseumService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
