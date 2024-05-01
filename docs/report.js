import { open } from './db.js';
import * as i18n from './i18n.js';

const db = await open();

let { year, month } = (function() {
	const date = new Date(); date.setMonth(date.getMonth() - 1);
	return { year: date.getFullYear(), month: date.getMonth() };
})();

$(function() {
	const reportTemplate = $('#reportTemplate').contents();

	const gridRowTemplate = $('#gridRowTemplate').contents();
	for (let month = 0; month < 12; ++month)
		reportTemplate.find('tbody').append(gridRowTemplate.clone());

	db.getMembers().then((members) => {
		members.sort((a, b) => (a.name < b.name) ? -1 : 1);

		members.forEach((member) => {
			const reportSection = reportTemplate.clone().appendTo('main');
			reportSection.find('[name=name]').val(member.name);
			reportSection.find('[name=birthDate]').val(member.birthDate);
			reportSection.find('[name=baptiseDate]').val(member.baptiseDate);

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
		});

	});
});
