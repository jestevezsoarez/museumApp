import { Component, OnInit } from '@angular/core';
import { MuseumService } from '../../services/museum.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  works      : any[]   = [];
  searchEmpty: boolean = false;

  constructor( private service: MuseumService) { }


  search( termino: string ) {
    console.log(termino);
    this.service.getSearchTerm( termino )
        .subscribe( (data: any) => {            
            this.works = data.artObjects;
            //console.log(this.works);
            if (this.works.length == 0) {
                this.searchEmpty = true;
            } else {
              this.searchEmpty = false;
            }            
        })    
  }

  ngOnInit(): void {
  }

}
