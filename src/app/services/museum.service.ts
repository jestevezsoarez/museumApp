import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MuseumService {

  // The language to search in (and of the results).
  culture: string = 'en';

  // Your API-key, mandatory for every request.
  apiKey: string = 'Vk0rV5g6';

  // The number of results per page
  artWorks: number = 20;


  constructor(private http: HttpClient) {
    // console.log('Museo Service running');    
  }


  //  getCollectionData() {     
  //    return this.http.get(`https://www.rijksmuseum.nl/api/${ this.culture }/collection?key=${ this.apiKey }&ps=${ this.artWorks }`);
  //  }   

  /*   getCollectionData() {
      // The new endpoint is public
      const baseUrl = 'https://data.rijksmuseum.nl/search/collection';
  
      // An API Key is no longer required.
      return this.http.get(baseUrl);
    } */

  getCollectionData() {
    // AGREGAR '?imageAvailable=true' para forzar que el museo solo envíe obras con foto
    const baseUrl = 'https://data.rijksmuseum.nl/search/collection?imageAvailable=true&title=painting';
    return this.http.get(baseUrl);
  }

  // Returns artworks fetched from api based on the search term
  // GET /api/[culture]/collection
  /*   getSearchTerm(termino: string = '') {
      // return this.http.get(`https://www.rijksmuseum.nl/api/${this.culture}/collection?key=${this.apiKey}&q=${termino}&ps=${this.artWorks}`);
      let baseUrl = 'https://rijksmuseum.nl';
  
      if (termino.trim().length > 0) {
        // Si el usuario escribe algo, buscamos por esa palabra clave exacta
        baseUrl += `&title=${encodeURIComponent(termino)}`;
      } else {
        // Si no escribe nada, dejamos el filtro de pinturas por defecto
        baseUrl += '&title=painting';
      }
  
      return this.http.get(baseUrl);
    } */

getSearchTerm(termino: string) {
  // 1. Sanitizamos el término ingresado por el usuario
  const query = termino.trim().length > 0 ? encodeURIComponent(termino) : 'painting';

  // 2. LA URL COMPLETA (Usando el subdominio 'data.' oficial):
  const baseUrl = 'https://data.rijksmuseum.nl/search/collection?title=' + query + '&imageAvailable=true';

  return this.http.get(baseUrl);
}


  // Detailed information about the selected piece
  // GET /api/[culture]/collection/[object-number]
  getPiece(piece: string) {
    return this.http.get(`https://www.rijksmuseum.nl/api/${this.culture}/collection/${piece}?key=${this.apiKey}`);
  }

}
