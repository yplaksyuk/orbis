
import { open } from './db.js';

const db = await open();

db.transaction('groups', 'readwrite', (tx) => {
	const groups = tx.objectStore('groups');

	groups.add({ no: 2, supervisors: [ 'me' ] }).then((key) => {
		console.log(`key = ${key}`);
	});
});
