import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MuseumService {

  // The language to search
  culture: string = 'en';

  constructor(private http: HttpClient) {    
  }  

  getCollectionData() {
    const baseUrl = 'https://data.rijksmuseum.nl/search/collection?type=painting';
    return this.http.get(baseUrl);
  }
      
getSearchTerm(termino: string) {
  // Sanitize the term entered by the user
  const query = termino.trim().length > 0 ? encodeURIComponent(termino) : 'painting';

  const baseUrl = `https://data.rijksmuseum.nl/search/collection?creator=${termino}`;

  return this.http.get(baseUrl);
}

}
