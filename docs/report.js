import { open } from './db.js';
import * as i18n from './i18n.js';

const db = await open();

const { lastYear, lastMonth } = (function() {
	const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() - 1);
	return { lastYear: date.getFullYear(), lastMonth: date.getMonth() };
})();

const monthDistance = ({ year, month }) => (lastYear * 12 + lastMonth) - (year * 12 + month);

$(async function() {
	const reportTemplate = $('#reportTemplate').contents();

	const gridRowTemplate = $('#gridRowTemplate').contents();
	for (let shift = 0; shift < 12; ++shift) {
		let year = lastYear;
		let month = lastMonth - shift;

		if (month < 0) {
			month += 12;
			year -= 1;
		}

		const row = gridRowTemplate.clone();
		row.find('td:first-child').text(i18n.formatMonthYear(month, year));
		reportTemplate.find('tbody').prepend(row);
	}

	const memberReports = new Map();

	const reports = await db.getAllReports();
	reports.forEach((report) => {
		const dist = monthDistance(report);
		if (dist < 12) {
			memberReports.has(report.memberId) || memberReports.set(report.memberId, []);
			memberReports.get(report.memberId)[11 - dist] = report;
		}
	});
	
	const members = await db.getMembers();

	members.sort((a, b) => (a.name < b.name) ? -1 : 1);
	members.forEach((member) => {
		const reportSection = reportTemplate.clone().appendTo('main');
		reportSection.find('[name=name]').attr('value', member.name);
		reportSection.find('[name=birthDate]').attr('value', member.birthDate);
		reportSection.find('[name=baptiseDate]').attr('value', member.baptiseDate);

		if (member.sex == 'M')
			reportSection.find('[name=male]').prop('checked', true);

		if (member.sex == 'F')
			reportSection.find('[name=female]').prop('checked', true);

		if (member.congStatus == 'elder')
			reportSection.find('[name=elder]').prop('checked', true);

		if (member.congStatus == 'servant')
			reportSection.find('[name=servant]').prop('checked', true);

		if (member.servStatus == 'pioneer')
			reportSection.find('[name=pioneer]').prop('checked', true);

		if (member.servStatus == 'special')
			reportSection.find('[name=special]').prop('checked', true);

		const data = memberReports.get(member.id);
		if (data) {
			const rows = reportSection.find('tbody tr');
			rows.each((index, row) => {
				const report = data[index];
				if (report) {
					const cells = $(row).find('td');
					cells[1].innerText = '+';
					cells[2].innerText = report.studies || '';
					cells[3].innerText = report.auxiliary ? '+' : '';
					cells[4].innerText = report.hours || '';
					cells[5].innerText = report.remarks || '';
				}
			});
		}
	});
});
