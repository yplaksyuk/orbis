import { open } from './db.js';

const db = await open();

$(function() {

	const memberGrid = $('#memberGrid').grid({ selectionMode: 'single', selectColumnIndex: 0, fixedHeader: false });

	const memberDialog = document.querySelector('#memberDialog');

	$('#memberAddButton').on('click', function() {
		$('.input', memberDialog).val(null);
		memberDialog.showModal();
	});

	$('#memberEditButton').on('click', async function() {
		const s = memberGrid.grid('selection');
		if (s.length) {
			const member = memberGrid.grid('rows', '.selected').data('row');
			$('.input', memberDialog).each(function() { $(this).val(member[this.name] || null); });

			memberDialog.showModal();
		}
	});

	$('#memberRemoveButton').on('click', async function() {
		const s = memberGrid.grid('selection');
		if (s.length) {
			const id = s[0];
			await db.deleteMember(id);
			memberGrid.grid('remove', id);
		}
	});

	$('#memberDialogOK').on('click', async function() {
		const member = $('.input', memberDialog).get().reduce((member, elem) => Object.assign(member, { [elem.name]: $(elem).val() }), {});
		if (member.id) {
			member.id = await db.updateMember(member);
			memberGrid.grid('update', [ member ]);
		}
		else {
			member.id = await db.insertMember(member);
			memberGrid.grid('append', [ member ]);
		}

		memberDialog.close();
	});

	$('#memberDialogCancel').on('click', function() {
		memberDialog.close();
	});

	db.getMembers().then((members) => {
		memberGrid.grid('append', members);
	});

	$('input:not([type=date]),select').input();
});
