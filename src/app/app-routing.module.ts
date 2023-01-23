import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/shared/home/home.component';

const APP_ROUTES: Routes = [ 
  {path:'Home',component:HomeComponent},
  {path:'**',pathMatch:'full',redirectTo: 'Home'}
];


@NgModule({
  imports: [RouterModule.forRoot(APP_ROUTES)],
  exports: [RouterModule]
})
export class AppRoutingModule { }