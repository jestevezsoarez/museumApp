import { Component, OnInit } from '@angular/core';
import { MuseumService } from '../../services/museum.service';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  works      : any[]   = [];
  searchEmpty: boolean = false;

  // Inyectamos HttpClient junto con MuseumService
  constructor( private service: MuseumService, private http: HttpClient ) { }

  search( termino: string ) {
    console.log('Buscando:', termino);
    
    // Si el usuario borra el texto por completo, podemos limpiar los resultados anteriores
    if (termino.trim().length === 0) {
      this.works = [];
      this.searchEmpty = false;
      return;
    }

    this.service.getSearchTerm( termino )
      .pipe(
        switchMap((data: any) => {
          const items = data.orderedItems || [];
          
          // Tomamos un lote de hasta 40 elementos para procesar
          const limitedItems = items.slice(0, 40);
          
          if (limitedItems.length === 0) {
            // Si no hay ningún ítem, devolvemos un arreglo vacío inmediatamente
            return forkJoin([]);
          }
          
          const detailRequests = limitedItems.map((item: any) => this.http.get(item.id));
          return forkJoin(detailRequests);
        }),
        map((artObjectsDetailed: any[]) => {
          return artObjectsDetailed.map(obra => {
            
            // 1. Extraer Título (Intentando forzar que sea el texto internacional)
            const todosLosNombres = obra.identified_by?.filter((id: any) => id.type === 'Name' || id.type === 'Identifier') || [];
            const nombreIngles = todosLosNombres.find((n: any) => n.language?.some((l: any) => l.id?.includes('300388277')));
            let title = nombreIngles ? nombreIngles.content : (todosLosNombres.length > 0 ? todosLosNombres[0].content : 'Untitled Artpiece');
            
            if (title.includes('Portret van')) {
              title = title.replace('Portret van', 'Portrait of').replace('Koningin der Nederlanden', 'Queen of the Netherlands');
            }

            // 2. Extraer Descripción Larga
            const descripciones = obra.referred_to_by?.filter((ref: any) => ref.content) || [];
            const descIngles = descripciones.find((d: any) => d.language?.some((l: any) => l.id?.includes('300388277')));
            const longTitle = descIngles ? descIngles.content : `${title}. Official exhibition item from the Rijksmuseum repository`;

            // 3. Extraer Autor
            let author = 'Unknown Artist';
            const production = obra.produced_by;
            if (production) {
              const anotacionesAutor = production.referred_to_by || (production.part?.flatMap((p: any) => p.referred_to_by || [])) || [];
              const autorIngles = anotacionesAutor.find((ref: any) => ref.language?.some((l: any) => l.id?.includes('300388277')));
              if (autorIngles) {
                author = autorIngles.content;
              } else if (anotacionesAutor.length > 0) {
                author = anotacionesAutor[0].content.replace('vermeld op object', 'mentioned on object').replace('prentmaker:', 'Printmaker:');
              }
            }

            // 4. Extraer Imagen IIIF
            const puntosAcceso = obra.subject_of?.flatMap((s: any) => s.digitally_carried_by || [])
                                                 ?.flatMap((d: any) => d.access_point || []) || [];
            
            const imagenValida = puntosAcceso.find((a: any) => a.id && a.id.includes('iiif'));
            let imageUrl = null;
            if (imagenValida) {
              imageUrl = imagenValida.id.replace('/manifest', '/full/max/0/default.jpg');
            }

            // Creamos exactamente el mismo objeto plano simulando la estructura vieja
            return {
              title: title,
              longTitle: longTitle,
              principalOrFirstMaker: author,
              webImage: imageUrl ? { url: imageUrl } : null,
              headerImage: imageUrl ? { url: imageUrl } : null
            };
          });
        })
      )
      .subscribe({
        next: (processedCollection: any[]) => {
          // Filtramos para conservar únicamente elementos que SÍ contengan imágenes directas válidas
          this.works = processedCollection.filter(item => item.headerImage !== null && item.headerImage.url !== null);
          
          // Evaluamos si el arreglo final quedó vacío tras el filtro para lanzar la alerta
          this.searchEmpty = this.works.length === 0;
          console.log('Resultados de búsqueda filtrados:', this.works);
        },
        error: (err) => {
          console.error('Error en el buscador del Rijksmuseum:', err);
          this.searchEmpty = true;
        }
      });
  }

  ngOnInit(): void {
  }

}