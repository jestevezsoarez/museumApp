import { Component, OnInit } from '@angular/core';
import { MuseumService } from '../../services/museum.service';
import { forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  collections: any[] = [];

  constructor(private servicio: MuseumService, private http: HttpClient) { }

  ngOnInit(): void {
    this.servicio.getCollectionData()
      .pipe(
        switchMap((data: any) => {
          const items = data.orderedItems || [];
          // Tomamos un margen amplio de elementos (ej. 24) ya que algunos se descartarán por no tener foto
          const limitedItems = items.slice(0, 24);
          const detailRequests = limitedItems.map((item: any) => this.http.get(item.id));
          return forkJoin(detailRequests);
        }),
        map((artObjectsDetailed: any[]) => {
          return artObjectsDetailed.map(obra => {
            
            // 1. Extraer el Título
            const todosLosNombres = obra.identified_by?.filter((id: any) => id.type === 'Name' || id.type === 'Identifier') || [];
            const nombreIngles = todosLosNombres.find((n: any) => n.language?.some((l: any) => l.id?.includes('300388277')));
            let title = nombreIngles ? nombreIngles.content : (todosLosNombres[0] ? todosLosNombres[0].content : 'Untitled Artpiece');
            
            if (title.includes('Portret van')) {
              title = title.replace('Portret van', 'Portrait of').replace('Koningin der Nederlanden', 'Queen of the Netherlands');
            }

            // 2. Extraer la Descripción Larga
            const descripciones = obra.referred_to_by?.filter((ref: any) => ref.content) || [];
            const descIngles = descripciones.find((d: any) => d.language?.some((l: any) => l.id?.includes('300388277')));
            const longTitle = descIngles ? descIngles.content : `${title}. Official exhibition item from the Rijksmuseum repository`;

            // 3. Extraer el Autor
            let author = 'Unknown Artist';
            const production = obra.produced_by;
            if (production) {
              const anotacionesAutor = production.referred_to_by || (production.part?.flatMap((p: any) => p.referred_to_by || [])) || [];
              const autorIngles = anotacionesAutor.find((ref: any) => ref.language?.some((l: any) => l.id?.includes('300388277')));
              if (autorIngles) {
                author = autorIngles.content;
              } else if (anotacionesAutor[0]) {
                author = anotacionesAutor[0].content.replace('vermeld op object', 'mentioned on object').replace('prentmaker:', 'Printmaker:');
              }
            }

            // 4. Extraer la Imagen Digital Real
            const puntosAcceso = obra.subject_of?.flatMap((s: any) => s.digitally_carried_by || [])
                                                 ?.flatMap((d: any) => d.access_point || []) || [];
            
            const imagenValida = puntosAcceso.find((a: any) => a.id && a.id.includes('iiif'));
            let imageUrl = null;
            if (imagenValida) {
              imageUrl = imagenValida.id.replace('/manifest', '/full/max/0/default.jpg');
            }

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
          // Filtramos de forma estricta para quedarnos únicamente con lo que SÍ tiene imagen
          this.collections = processedCollection.filter(item => item.headerImage !== null && item.headerImage.url !== null);
        },
        error: (err) => console.error('Error cargando datos:', err)
      });
  }
}