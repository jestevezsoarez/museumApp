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

  constructor( private service: MuseumService, private http: HttpClient ) { }

  search( term: string ) {
    this.searchEmpty = false;
    this.works = [];
    
    // If the user deletes the text entirely, then clear the previous results.
    if (term.trim().length === 0) {
      this.works = [];
      this.searchEmpty = false;
      return;
    }

    this.service.getSearchTerm( term )
      .pipe(
        switchMap((data: any) => {
          
          const items = data.orderedItems || [];
          if (items.length === 0) {
            this.searchEmpty = true;
          }
          
          // Take up to 40 items for processing
          const limitedItems = items.slice(0, 40);
          
          if (limitedItems.length === 0) {
            // If there are no items, return an empty array 
            return forkJoin([]);
          }
          
          const detailRequests = limitedItems.map((item: any) => this.http.get(item.id));
          return forkJoin(detailRequests);
        }),
        map((artObjectsDetailed: any[]) => {
          return artObjectsDetailed.map(work => {
            
            // Extract Title using international language
            const allNames = work.identified_by?.filter((id: any) => id.type === 'Name' || id.type === 'Identifier') || [];
            const englishName = allNames.find((n: any) => n.language?.some((l: any) => l.id?.includes('300388277')));
            let title = englishName ? englishName.content : (allNames.length > 0 ? allNames[0].content : 'Untitled Artpiece');
            
            if (title.includes('Portret van')) {
              title = title.replace('Portret van', 'Portrait of').replace('Koningin der Nederlanden', 'Queen of the Netherlands');
            }

            // Extract long description
            const descriptions = work.referred_to_by?.filter((ref: any) => ref.content) || [];
            const descEnglish = descriptions.find((d: any) => d.language?.some((l: any) => l.id?.includes('300388277')));
            const longTitle = descEnglish ? descEnglish.content : `${title}. Official exhibition item from the Rijksmuseum repository`;

            // Extract author
            let author = 'Unknown Artist';
            const production = work.produced_by;
            if (production) {
              const authorNotes = production.referred_to_by || (production.part?.flatMap((p: any) => p.referred_to_by || [])) || [];
              const englishAuthor = authorNotes.find((ref: any) => ref.language?.some((l: any) => l.id?.includes('300388277')));
              if (englishAuthor) {
                author = englishAuthor.content;
              } else if (authorNotes.length > 0) {
                author = authorNotes[0].content.replace('vermeld op object', 'mentioned on object').replace('prentmaker:', 'Printmaker:');
              }
            }

            // Extract image IIIF
            const accessPoint = work.subject_of?.flatMap((s: any) => s.digitally_carried_by || [])
                                                 ?.flatMap((d: any) => d.access_point || []) || [];
            
            const validImage = accessPoint.find((a: any) => a.id && a.id.includes('iiif'));
            let imageUrl = null;
            if (validImage) {
              imageUrl = validImage.id.replace('/manifest', '/full/max/0/default.jpg');
            }

            // Create object simulating the old structure
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
          // Filter artworks that contain valid images
          this.works = processedCollection.filter(item => item.headerImage !== null && item.headerImage.url !== null);
          
          this.searchEmpty = this.works.length === 0;
          console.log('Filtered search results:', this.works);
        },
        error: (err) => {
          console.error('Error in the Rijksmuseum search engine:', err);
          this.searchEmpty = true;
        }
      });
  }

  ngOnInit(): void {
  }

}