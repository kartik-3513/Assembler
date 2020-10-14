const keywords = [
	'LOAD',
	'STORE',
	'JMPZ',
	'JMPN',
	'JMPU',
	'CALL',
	'ADD',
	'INC',
	'MOV',
	'AND',
	'OR',
	'NOT',
	'XOR',
	'CILR',
	'CILL',
	'SHR',
	'SHL',
	'RET',
	'CINT',
	'CMIF',
	'INPT',
	'OUTP',
	'CINF',
	'COUF',
];

CodeMirror.defineMode('assembler', function () {
	return {
		token: function (stream, state) {
			if (stream.match('load', true, true)) return 'keyword';
			if (stream.match('store', true, true)) return 'keyword';
			if (stream.match('add', true, true)) return 'keyword';
			if (stream.match('inc', true, true)) return 'keyword';
			if (stream.match('and', true, true)) return 'keyword';
			if (stream.match('mov', true, true)) return 'keyword';
			if (stream.match('or', true, true)) return 'keyword';
			if (stream.match('not', true, true)) return 'keyword';
			if (stream.match('xor', true, true)) return 'keyword';
			if (stream.match('cilr', true, true)) return 'keyword';
			if (stream.match('cill', true, true)) return 'keyword';
			if (stream.match('shr', true, true)) return 'keyword';
			if (stream.match('shl', true, true)) return 'keyword';
			if (stream.match('jmpz', true, true)) return 'keyword';
			if (stream.match('jmpn', true, true)) return 'keyword';
			if (stream.match('jmpu', true, true)) return 'keyword';
			if (stream.match('call', true, true)) return 'keyword';
			if (stream.match('ret', true, true)) return 'keyword';
			if (stream.match('cint', true, true)) return 'keyword';
			if (stream.match('cmif', true, true)) return 'keyword';
			if (stream.match('inpt', true, true)) return 'keyword';
			if (stream.match('outp', true, true)) return 'keyword';
			if (stream.match('cinf', true, true)) return 'keyword';
			if (stream.match('couf', true, true)) return 'keyword';
			if (stream.match(/([0-9]H?|[A-F]H)/, true)) return 'variable';
			if (stream.match(/\s[A-D]/, true, true)) return 'atom';

			stream.next();
			return null;
		},
	};
});

$(document).ready(function () {
	const code = $('.codemirror-textarea')[0];
	const editor = CodeMirror.fromTextArea(code, {
		lineNumbers: true,
		lineWrapping: true,
		theme: 'dracula',
		autofocus: true,
		mode: 'assembler',
		//lineNumberFormatter: function(line){}
	});
});