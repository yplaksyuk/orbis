
const monthNames = [ 'Январь', 'Фавраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь' ];

export const formatMonth = (month) => monthNames[month];

export const formatMonthYear = (month, year) => `${formatMonth(month)}, ${year}`;


