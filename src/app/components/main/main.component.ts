import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

	public slides = [
		{ image:  "assets/img/cars/alan-king-1R63taCoSnM-unsplash.jpg" },
		{ image: "assets/img/cars/arteum-ro-TVFx7iFAAdQ-unsplash.jpg" },
		{ image: "assets/img/cars/josh-rinard-H9mp1P1VUj4-unsplash.jpg" },
		{ image: "assets/img/cars/koke-mayayo-thevisualkiller-uG8RGApPGWk-unsplash.jpg" },
		{ image: "assets/img/cars/yuvraj-singh-tmAynVA_ihE-unsplash.jpg" }
	]

	constructor() { }

	ngOnInit(): void {
	}

}
