import { HttpClient, HttpParams  } from '@angular/common/http';
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

getSearchTerm(term: string) {
  const params = new HttpParams().set('creator', term.trim());
  
  return this.http.get('https://data.rijksmuseum.nl/search/collection', { params });
}

}
