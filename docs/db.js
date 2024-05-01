const VERSION = 4;

const exec = (db, storeName, mode, method, ...args) => {
	return new Promise((response, reject) => {
		const tx = db.transaction(storeName,mode);
		tx.onerror = (event) => reject(event.target.error);

		const store = tx.objectStore(storeName);
		const rs = store[method].call(store, ...args);
		rs.onerror = (event) => reject(event.target.error);
		rs.onsuccess = (event) => response(event.target.result);
	});
};

const getKey = (year, month, memberId = '') => `${String(year).padStart(4, '0')}-${String(1 + month).padStart(2, '0')}/${memberId}`;

const getReportKey = (report) => getKey(report.year, report.month, report.memberId);

const getQuery = (year, month) => {
	const lower = getKey(year, month);
	const upper = month < 11 ? getKey(year, month + 1) : getKey(year + 1, 0);

	return IDBKeyRange.bound(lower, upper, false, true);
};

class Database {
	constructor(db) {
		this.db = db;
	}

	getMembers() {
		return exec(this.db, 'members', 'readonly', 'getAll');
	}

	insertMember(member) {
		member.updated = new Date();
		delete member.id;

		return exec(this.db, 'members', 'readwrite', 'add', member);
	}

	updateMember(member) {
		member.updated = new Date();
		member.id = parseInt(member.id);

		return exec(this.db, 'members', 'readwrite', 'put', member);
	}

	deleteMember(id) {
		return exec(this.db, 'members', 'readwrite', 'delete', parseInt(id));
	}


	getReports(year, month) {
		return exec(this.db, 'reports', 'readonly', 'getAll', getQuery(year, month));
	}

	updateReport(report) {
		report.updated = new Date();
		return exec(this.db, 'reports', 'readwrite', 'put', report, getReportKey(report));
	}

	deleteReport(report) {
		return exec(this.db, 'reports', 'readwrite', 'delete', getReportKey(report));
	}
}

export const open = () => new Promise((response, reject) => {
	const r = window.indexedDB.open("orbis", VERSION);

	r.onupgradeneeded = (event) => {
		const db = event.target.result;

		db.objectStoreNames.contains('members') || db.createObjectStore('members', { keyPath: 'id', autoIncrement: true });
		db.objectStoreNames.contains('reports') || db.createObjectStore('reports');
	};

	r.onerror = (event) => reject(event.target.error);
	r.onsuccess = (event) => response(new Database(event.target.result));
});
