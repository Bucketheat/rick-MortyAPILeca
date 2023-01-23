import { DecimalPipe } from '@angular/common';
import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, debounceTime, delay, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { RickyMorty } from '../model/rickMorty.model';
import { SortColumn, SortDirection } from '../util/directives/sorteable.directive';
import { HttpClient } from '@angular/common/http';




interface SearchResult {
	characters: RickyMorty[];
	total: number;
}

interface State {
	page: number;
	pageSize: number;
	searchTerm: string;
	sortColumn: SortColumn;
	sortDirection: SortDirection;
}


const compare = (v1: string | number | any, v2: string | number | any) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

function sort(rickyMorty: RickyMorty[], column: SortColumn, direction: string): RickyMorty[] {
	if (direction === '' || column === '') {
		return rickyMorty;
	} else {
		return [...rickyMorty].sort((a, b) => {
			const res = compare(a[column], b[column]);
			return direction === 'asc' ? res : -res;
		});
	}
}

function matches(rickyMorty: RickyMorty, term: string, pipe: PipeTransform) {
	return (
		rickyMorty.name.toLowerCase().includes(term.toLowerCase()) ||
		 rickyMorty.species.toLowerCase().includes(term.toLowerCase()) ||
		pipe.transform(rickyMorty.id).includes(term) ||
		rickyMorty.name.toLowerCase().includes(term.toLowerCase()) 
	);
}



@Injectable({
  providedIn: 'root'
})
export class RickMortyService {

  private _loading$ = new BehaviorSubject<boolean>(true);
	private _search$ = new Subject<void>();
	private _characters$ = new BehaviorSubject<RickyMorty[]>([]);
	private _total$ = new BehaviorSubject<number>(0);

  dataList:any;

  private _state: State = {
		page: 1,
		pageSize: 20,
		searchTerm: '',
		sortColumn: '',
		sortDirection: '',
	};

  constructor(private pipe: DecimalPipe, private http:HttpClient) { 
    this.getCharacters(1);
   
  }

  get countries$() {
		return this._characters$.asObservable();
	}
	get total$() {
		return this._total$.asObservable();
	}
	get loading$() {
		return this._loading$.asObservable();
	}
	get page() {
		return this._state.page;
	}
	get pageSize() {
		return this._state.pageSize;
	}
	get searchTerm() {
		return this._state.searchTerm;
	}

	set page(page: number) {
		this._set({ page });
	}
	set pageSize(pageSize: number) {
		this._set({ pageSize });
	}
	set searchTerm(searchTerm: string) {
		this._set({ searchTerm });
	}
	set sortColumn(sortColumn: SortColumn) {
		this._set({ sortColumn });
	}
	set sortDirection(sortDirection: SortDirection) {
		this._set({ sortDirection });
	}

	private _set(patch: Partial<State>) {
		Object.assign(this._state, patch);
		this._search$.next();
	}

	private _search(dataList:any): Observable<SearchResult> {
		const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;

		// 1. sort
		let characters = sort(dataList.results, sortColumn, sortDirection);

		// 2. filter
		characters = characters.filter((country) => matches(country, searchTerm, this.pipe));
		const total = dataList.info.count;

		// 3. paginate
		//characters = characters.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
		return of({ characters, total });
	}


  getCharacterForPage(page:number): Observable<any>{
    return this.http.get<any>('https://rickandmortyapi.com/api/character/?page='+page);
  }

  getCharacters(page:number){  
    this.getCharacterForPage(page).subscribe(data =>{ 
	  this._search$
	  .pipe(
		  tap(() => this._loading$.next(true)),
		  debounceTime(200),
		  switchMap(() => this._search(data)),
		  delay(200),
		  tap(() => this._loading$.next(false)),
	  )
	  .subscribe((result) => {
		console.log(result)
		  this._characters$.next(result.characters);
		  this._total$.next(result.total);
	  }); 
  		this._search$.next();
    });
  }



}
