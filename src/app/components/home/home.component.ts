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
          // I took a wide range of items (e.g., 24) since some will be discarded for not having a photo
          const limitedItems = items.slice(0, 24);
          const detailRequests = limitedItems.map((item: any) => this.http.get(item.id));
          return forkJoin(detailRequests);
        }),
        map((artObjectsDetailed: any[]) => {
          return artObjectsDetailed.map(work => {
            // Title
            const allNames = work.identified_by?.filter((id: any) => id.type === 'Name' || id.type === 'Identifier') || [];
            const englishName = allNames.find((n: any) => n.language?.some((l: any) => l.id?.includes('300388277')));
            let title = englishName ? englishName.content : (allNames[0] ? allNames[0].content : 'Untitled Artpiece');
            
            if (title.includes('Portret van')) {
              title = title.replace('Portret van', 'Portrait of').replace('Koningin der Nederlanden', 'Queen of the Netherlands');
            }

            // Long description
            const descriptions = work.referred_to_by?.filter((ref: any) => ref.content) || [];
            const descEnglish = descriptions.find((d: any) => d.language?.some((l: any) => l.id?.includes('300388277')));
            const longTitle = descEnglish ? descEnglish.content : `${title}. Official exhibition item from the Rijksmuseum repository`;

            // Author
            let author = 'Unknown Artist';
            const production = work.produced_by;
            if (production) {
              const authorNotes = production.referred_to_by || (production.part?.flatMap((p: any) => p.referred_to_by || [])) || [];
              const englishAuthor = authorNotes.find((ref: any) => ref.language?.some((l: any) => l.id?.includes('300388277')));
              if (englishAuthor) {
                author = englishAuthor.content;
              } else if (authorNotes[0]) {
                author = authorNotes[0].content.replace('vermeld op object', 'mentioned on object').replace('prentmaker:', 'Printmaker:');
              }
            }

            // 4. Extraer la Imagen Digital Real
            const accessPoint = work.subject_of?.flatMap((s: any) => s.digitally_carried_by || [])
                                                 ?.flatMap((d: any) => d.access_point || []) || [];
            
            const validImage = accessPoint.find((a: any) => a.id && a.id.includes('iiif'));
            let imageUrl = null;
            if (validImage) {
              imageUrl = validImage.id.replace('/manifest', '/full/max/0/default.jpg');
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
          // Keep items only if they have an image
          this.collections = processedCollection.filter(item => item.headerImage !== null && item.headerImage.url !== null);
        },
        error: (err) => console.error('Error loading data:', err)
      });
  }
}