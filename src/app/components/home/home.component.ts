import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MuseumService } from '../../services/museum.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  collections: any[] = [];

  constructor( private servicio: MuseumService ) {   
    
      this.servicio.getCollectionData()
        .subscribe( (data: any ) => {
            console.log(data.artObjects);
            this.collections = data.artObjects;
        })

   }

  ngOnInit(): void {
  }

}
