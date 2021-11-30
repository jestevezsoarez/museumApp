import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MuseumService {

  // The language to search in (and of the results).
  culture  : string         = 'en';

  // Your API-key, mandatory for every request.
  apiKey   : string         = 'Vk0rV5g6';

  // The number of results per page
  artWorks : number         = 20;


  constructor( private http: HttpClient ) {
    console.log('Museo Service running');    
   }


   getCollectionData() {     
     return this.http.get(`https://www.rijksmuseum.nl/api/${ this.culture }/collection?key=${ this.apiKey }&ps=${ this.artWorks }`);
   }


   // Returns artworks fetched from api based on the search term
   // GET /api/[culture]/collection
   getSearchTerm( termino: string ) {
    return this.http.get(`https://www.rijksmuseum.nl/api/${ this.culture }/collection?key=${ this.apiKey }&q=${ termino }&ps=${ this.artWorks }`);
   }


   // Detailed information about the selected piece
   // GET /api/[culture]/collection/[object-number]
   getPiece( piece: string ) {
    return this.http.get(`https://www.rijksmuseum.nl/api/${ this.culture }/collection/${ piece }?key=${ this.apiKey }`);
   }

}
