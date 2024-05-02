import { open } from './db.js';
import * as i18n from './i18n.js';

const db = await open();

const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d*([\+-]\d{2}\:\d{2}|Z)?$/;

const exportData = async () => {
	const members = await db.getMembers();
	const reports = await db.getAllReports();

	return { members, reports };
};

const importData = async (data) => {
	const ids = new Map();

	if (data.members) {
		const members = await db.getMembers();
		const membersMap = members.reduce((map, member) => map.set(member.name, member), new Map());

		// returns a local member that corresponds to specified one or null
		const findLocalMember = (member) => membersMap.get(member.name) || membersMap.get(i18n.findLevenshtein([...membersMap.keys()], member.name));

		// update all members
		await Promise.all(data.members.map(async (member) => {
			let local = findLocalMember(member);
			if (local) {
				ids.set(member.id, local.id);
				if (member.updated > local.updated) {
					Object.assign(local, member, { id: local.id });
					await db.updateMember(local);
				}
			}
			else {
				local = Object.assign({}, member);
				local.id = await db.insertMember(local);
				
				ids.set(member.id, local.id);
			}
		}));
	}

	if (data.reports) {
		await Promise.all(data.reports.map(async (report) => {
			report.memberId = String(ids.get(report.memberId) || report.memberId);

			let local = await db.findReport(report);
			if (!local || report.updated > local.updated)
				await db.updateReport(report);
		}));
	}
};

$(function() {
	$('#syncExportButton').on('click', async function() {
		const data = await exportData();
		const json = JSON.stringify(data);
		const blob = new Blob([ json ], { type: 'application/json' });

		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = 'orbis.json';
		link.click();
		link.remove();

		URL.revokeObjectURL(link.href);
	});

	$('#syncImportButton').on('click', async function() {
		const link = document.createElement('input');
		link.type = 'file';
		link.onchange = (event) => {
			const file = event.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.readAsText(file);
				reader.onload = (event) => {
					const json = event.target.result;
					const data = JSON.parse(json, (key, value) => {
						if (key == 'updated' && typeof value === 'string' && datePattern.test(value))
							return new Date(value);
						else
							return value;
					});

					importData(data);
				};
			}
		};
		link.click();
		link.remove();
	});
});
