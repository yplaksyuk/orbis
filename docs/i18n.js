
const monthNames = [ 'Январь', 'Фавраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь' ];

const sexNames = { 'M': 'М', 'F': 'Ж' };

const servStatusNames = { 'publisher': 'Возвещатель', 'pioneer': 'Общий пионер', 'special': 'Специальный пионер' };

const congStatusNames = { 'elder': 'Старейшина', 'servant': 'Помощник собрания' };

const datePattern = /(\d{4})-(\d{2})-(\d{2})/;

export const formatMonth = (month) => monthNames[month];

export const formatMonthYear = (month, year) => `${formatMonth(month)}, ${year}`;

export const formatDate = (date) => {
	const m = datePattern.exec(date);
	return m ? `${m[3]}.${m[2]}.${m[1]}` : '';
};

export const formatSex = (sex) => sexNames[sex] || '';

export const formatServStatus = (servStatus) => servStatusNames[servStatus] || '';

export const formatCongStatus = (congStatus) => congStatusNames[congStatus] || '';

export const compareLevenshtein = (a, b) => {

	const cmp = (a, b) => {
		if (a.length > 0 && b.length > 0) {
			if (a.charAt(0) == b.charAt(0))
				return cmp(a.substring(1), b.substring(1));

			return 1 + Math.min(
				cmp(a, b.substring(1)),
				cmp(a.substring(1), b),
				cmp(a.substring(1), b.substring(1)));
		}
		else
			return a.length + b.length;
	};

	return a == b ? 0.0 : cmp(a, b) / Math.max(a.length, b.length);
};

export const findLevenshtein = (names, name, deviation = 0.15) => {
	const data = names.reduce((data, item) => {
		const cmp = compareLevenshtein(item, name);
		if (cmp <= deviation)
			data.push({ item, cmp });
		return data;
	}, []);

	data.sort((a, b) => a.cmp - b.cmp);
	return data.shift()?.name;
};
