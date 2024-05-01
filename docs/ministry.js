import { open } from './db.js';

const db = await open();

const monthFormatter = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long' });

let { year, month } = (function() {
	const date = new Date(); date.setMonth(date.getMonth() - 1);
	return { year: date.getFullYear(), month: date.getMonth() };
})();

const updateMonthDisplay = async (delta = 0) => {
	const date = new Date(year, month + delta);
	year = date.getFullYear();
	month = date.getMonth();

	$('#monthDisplay').val(monthFormatter.format(date));

	$('.group input:not([name=name])').val(null, false);
	const v = $('.group input.report').prop('disabled', true);
	console.log(v);

	const reports = await db.getReports(year, month);
	reports.forEach((report) => {
		const row = $(`#${report.memberId}`);
		row.find('input.report')
		   .prop('disabled', false)
		   .each(function() { $(this).val(report[this.name] || null); });

		row.find('[name=shared]').val(true, false);
	});
};

$(function() {
	db.getMembers().then((members) => {
		const groups = new Map();

		members.forEach((member) => {
			const list = groups.get(member.groupNo) || groups.set(member.groupNo, []).get(member.groupNo);
			list.push(member);
		});

		const keys = [...groups.keys()];
		keys.sort();

		keys.forEach((groupNo) => {
			const groupSection = $('#groupTemplate').contents().clone().appendTo('main');
			const groupBody = groupSection.find('tbody');
			groupSection.find('.group-no').text(groupNo);

			const list = groups.get(groupNo);
			list.sort((a, b) => (a.name < b.name) ? -1 : 1);

			list.forEach((member) => {
				const gridRow = $('#gridRowTemplate').contents().clone().appendTo(groupBody);
				gridRow.attr('id', member.id);
				gridRow.find('[name=name]').val(member.name);
			});
		});

		$('.group input').input();

		updateMonthDisplay();
	});

	$('main').on('change', 'input[name=shared]', function() {
		const row = $(this).closest('tr');
		row.find('.report').prop('disabled', !this.checked);
		console.log(row);

		if (this.checked)
			db.updateReport({ year, month, memberId: row.attr('id') });
		else
			db.deleteReport({ year, month, memberId: row.attr('id') });
	});

	$('main').on('change', 'input.report', function() {
		const row = $(this).closest('tr');
		const report = row.find('.report').get().reduce((report, elem) => Object.assign(report, { [elem.name]: $(elem).val() }), { year, month, memberId: row.attr('id') });

		db.updateReport(report);
	});

	$('#monthPrevButton').on('click', function() {
		updateMonthDisplay(-1);
	});

	$('#monthNextButton').on('click', function() {
		updateMonthDisplay(1);
	});
});
