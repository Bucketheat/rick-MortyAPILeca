import { Component, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { RickyMorty } from 'src/app/model/rickMorty.model';
import { RickMortyService } from 'src/app/services/rick-morty.service';
import { NgbdSortableHeader, SortEvent } from 'src/app/util/directives/sorteable.directive';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  characters$: Observable<RickyMorty[]>;
	total$: Observable<number>;
  
	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

	constructor(public service: RickMortyService) {
		this.characters$ = service.countries$;
		this.total$ = service.total$;
	}

  onSort({ column, direction }: SortEvent) {
		// resetting other headers
		this.headers.forEach((header) => {
			if (header.sortable !== column) {
				header.direction = '';
			}
		});
    this.service.sortColumn = column;
		this.service.sortDirection = direction;
  }

  onPageChange(page:number){
	this.service.getCharacters(page);   
  }

  showMoreInfo(character:RickyMorty){
	Swal.fire({
		title: character.name,
		text: 'Modal with a custom image.',
		imageUrl:  character.image,
		imageWidth: 400,
		imageHeight: 300,
		imageAlt: 'Custom image',
		html: 
		'<div class="card" style="width: 18rem; margin-left: 100px !important;">'+ 
' <div class="card-body">'+
    '<h5 class="card-title">Información Completa</h5>'+ 
	'<p class="card-text"> Especie: '+ character.species+'</p>'+
	'<p class="card-text"> Género: '+ character.gender+'</p>'+
	'<p class="card-text"> Estatus: '+ character.status+'</p>'+
	'<p class="card-text"> Origen: '+ character.origin.name+'</p>'+  
  '</div>'+
'</div>'
	  })
  }


}
