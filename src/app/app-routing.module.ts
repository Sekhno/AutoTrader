import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './components/main/main.component'
import { CatalogComponent } from './components/catalog/catalog.component'

const routes: Routes = [
	{ path: '', component: MainComponent },
	{ path: 'catalog', component: CatalogComponent }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
