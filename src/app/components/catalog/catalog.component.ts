import { CollectionViewer, SelectionChange, DataSource } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable } from '@angular/core';
import { BehaviorSubject, merge, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @title Tree with dynamic data
 */
@Component({
	selector: 'app-catalog',
	templateUrl: './catalog.component.html',
	styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent {

	constructor(database: DynamicDatabase) {
		this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
		this.dataSource = new DynamicDataSource(this.treeControl, database);

		this.dataSource.data = database.initialData();
	}

	treeControl: FlatTreeControl<DynamicFlatNode>;

	dataSource: DynamicDataSource;

	cars$ = [];

	memoryCars = {}

	getLevel = (node: DynamicFlatNode) => node.level;

	isExpandable = (node: DynamicFlatNode) => node.expandable;

	hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;

	public selectNode = (node: string) => {
		if (!this.memoryCars[node]) {
			this.memoryCars[node] = DynamicDatabase.generateChildData(node)
		}
		this.cars$ = this.memoryCars[node]
	}

	public addShopingCart = (car) => {
		console.log(car)
	}

}

/** Flat node with expandable and level information */
export class DynamicFlatNode {
	constructor(public item: string, public level = 1, public expandable = false,
		public isLoading = false) { }
}

/** Child node with expandable and level information */
export class DynamicChildNode {
	constructor(public name: string, public icon: string, public price: number,
		public discount: number = 0) { }
}

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable({ providedIn: 'root' })
export class DynamicDatabase {
	dataMap = new Map<string, string[]>([
		['Top popular', ['Audi', 'BMW', 'Mersedes-Bens']],
		['Sport & Lux', ['Aston Martin', 'Bugatti', 'bentley', 'Ferrari', 'Koenigsegg', 'Lamborghini', 'Maserati', 'Maybach', 'Marussia', 'Porsche']],
		['Popular', ['Ford', 'Honda', 'Lexus', 'Mazda', 'Toyota', 'Volvo']],
		['Others', ['Acura', 'Alfa Romeo', 'Cadillac', 'Chery', 'Chevrolet', 'Chrysler', 'Citroen', 'Daewoo', 'Dodge', 'Fiat', 'GMC', 'Hummer', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Land Rover', 'Lincoln', 'Mini', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 'Renault', 'Rover', 'Saab', 'Seat', 'Skoda', 'SsangYong', 'Subaru', 'Suzuki' ]]
	]);

	rootLevelNodes: string[] = ['Top popular', 'Sport & Lux', 'Popular', 'Others'];

	/** Initial data from database */
	initialData(): DynamicFlatNode[] {
		return this.rootLevelNodes.map(name => new DynamicFlatNode(name, 0, true));
	}

	getChildren(node: string): string[] | undefined {
		return this.dataMap.get(node);
	}

	isExpandable(node: string): boolean {
		return this.dataMap.has(node);
	}

	private static dataModelArr = [
		'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Allroad', 'Q5', 'Q7', 'R8', 'RS4', 'RS6', 'S3', 'S4', 'S5', 'S6', 'S8', 'TT'
	]

	private static dataChildArr = [
		'commute', 'agriculture', 'bike_scooter', 'bus_alert', 'car_rental', 'flutter_dash', 'bluetooth_drive', 'toys', 'delivery_dining', 'departure_board',
		'directions_bus', 'directions_bus_filled', 'directions_car', 'directions_car_filled', 'directions_railway', 'electric_scooter', 'local_car_wash'
	]

	private static dataPriceArr = [
		1100, 2200, 1840, 3400, 2700
	]

	public static generateChildData(node: string) {
		const arr = Array(20).fill(null)

		for (let i = 0; i < arr.length; i++) {
			const name = node + ' ' + DynamicDatabase.dataModelArr[Math.floor(Math.random() * DynamicDatabase.dataModelArr.length)]
			const icon = DynamicDatabase.dataChildArr[Math.floor(Math.random() * DynamicDatabase.dataChildArr.length)];
			const price = DynamicDatabase.dataPriceArr[Math.floor(Math.random() * DynamicDatabase.dataPriceArr.length)];
			const discount = 0; 
			arr[i] = new DynamicChildNode(name, icon, price, discount)
		}
		return arr;
	}
}
/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
export class DynamicDataSource implements DataSource<DynamicFlatNode> {

	dataChange = new BehaviorSubject<DynamicFlatNode[]>([]);

	get data(): DynamicFlatNode[] { return this.dataChange.value; }
	set data(value: DynamicFlatNode[]) {
		this._treeControl.dataNodes = value;
		this.dataChange.next(value);
	}

	constructor(private _treeControl: FlatTreeControl<DynamicFlatNode>,
		private _database: DynamicDatabase) { }

	connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNode[]> {
		this._treeControl.expansionModel.changed.subscribe(change => {
			if ((change as SelectionChange<DynamicFlatNode>).added ||
				(change as SelectionChange<DynamicFlatNode>).removed) {
				this.handleTreeControl(change as SelectionChange<DynamicFlatNode>);
			}
		});

		return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
	}

	disconnect(collectionViewer: CollectionViewer): void { }

	/** Handle expand/collapse behaviors */
	handleTreeControl(change: SelectionChange<DynamicFlatNode>) {
		if (change.added) {
			change.added.forEach(node => this.toggleNode(node, true));
		}
		if (change.removed) {
			change.removed.slice().reverse().forEach(node => this.toggleNode(node, false));
		}
	}

	/**
	 * Toggle the node, remove from display list
	 */
	toggleNode(node: DynamicFlatNode, expand: boolean) {
		const children = this._database.getChildren(node.item);
		const index = this.data.indexOf(node);
		if (!children || index < 0) { // If no children, or cannot find the node, no op
			return;
		}

		node.isLoading = true;

		setTimeout(() => {
			if (expand) {
				const nodes = children.map(name =>
					new DynamicFlatNode(name, node.level + 1, this._database.isExpandable(name)));
				this.data.splice(index + 1, 0, ...nodes);
			} else {
				let count = 0;
				for (let i = index + 1; i < this.data.length
					&& this.data[i].level > node.level; i++, count++) { }
				this.data.splice(index + 1, count);
			}

			// notify the change
			this.dataChange.next(this.data);
			node.isLoading = false;
		}, 1000);
	}
}
