var editor;
var machine = ''; //machine code
var lc = 0; //location counter
var locationDictionary = {};
let passNumber = 1;

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
	'OG',
	'VAL',
	'LABEL',
];
const keys_regmem = ['LOAD', 'STORE'];
const keys_nullmem = ['JMPZ', 'JMPN', 'JMPU', 'CALL'];
const keys_regreg = ['ADD', 'MOV', 'AND', 'OR', 'XOR'];
const keys_nullreg = ['NOT', 'INC', 'CILR', 'CILL', 'SHR', 'SHL'];
const keys_registers = ['A', 'B', 'C', 'D'];
const keys_nullnull = ['RET', 'CINT', 'CMIF', 'INPT', 'OUTP', 'CINF', 'COUF'];

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
			if (stream.match('og', true, true)) return 'keyword';
			if (stream.match('label', true, true)) return 'keyword';
			if (stream.match('val', true, true)) return 'keyword';
			if (stream.match(/([0-9]H?|[A-F]H)/, true)) return 'variable';
			if (stream.match(/\s[A-D]/, true, true)) return 'atom';

			stream.next();
			return null;
		},
	};
});

//initialisation of editor window object
$(document).ready(function () {
	const code = $('.codemirror-textarea')[0];
	editor = CodeMirror.fromTextArea(code, {
		lineNumbers: true,
		lineWrapping: true,
		theme: 'dracula',
		autofocus: true,
		mode: 'assembler',
		//lineNumberFormatter: function(line){}
	});
	$('#translate-button').on('click', assemble);
});

//wrapper fn called at assemble, splits assembly code by ';' into array, makes instruction
function cleaner(assemblyArr) {
	machine = '';

	//seperate code into instructions, clean up spaces and stuff
	for (var i = 0; i < assemblyArr.length - 1; i++) {
		assemblyArr[i] = assemblyArr[i].replace('\n', '');
		assemblyArr[i] = assemblyArr[i].replace(',', ' ');
		while (assemblyArr[i].includes('  ')) {
			assemblyArr[i] = assemblyArr[i].replace('  ', ' ');
		}
		assemblyArr[i] = assemblyArr[i].toUpperCase();
	}
	//remove last empty element: blank space
	assemblyArr.pop();

	return assemblyArr;
}

function assemble() {
	lc = 0;
	let assembly = editor.getValue();
	let assemblyArr = assembly.split(';');
	assemblyArr.forEach((token) => token.trim());
	assemblyArr = cleaner(assemblyArr);
	passNumber = 1;
	while (passNumber <= 2) {
		let error = validator(assemblyArr);

		if (error) {
			$('.machine textarea').html(error);
			const scrollDestination = document.getElementById('machine-container');
			scrollDestination.scrollIntoView({
				behavior: 'smooth',
			});
			return;
		}

		//seperate instruction into tokens and call appropriate function
		for (var i = 0; i < assemblyArr.length; i++) {
			var instruction = assemblyArr[i].split(' ');
			let j = 0;
			while (instruction[0][j] === '\n') {
				++j;
			}

			instruction[0] = instruction[0].slice(j);
			//cleans individual instruction from tailing whitespaces
			if (instruction[0] === '') {
				instruction.shift();
			}
			if (instruction[instruction.length - 1] === '') {
				instruction.pop();
			}
			//changing location counter value depending on control transfer commands
			//replaces h of hexadecimal with blank space
			if (passNumber === 1) {
				if (instruction[0] === 'OG') {
					instruction[1] = instruction[1].replace('H', '');
					lc = parseInt(instruction[1], 16);
					continue;
					//console.log(lc);
				} else if (instruction[0] === 'LABEL' || instruction[0] === 'VAL') {
					locationDictionary[instruction[1]] = lc++;
					continue;
				}
			}
			if (passNumber === 2) {
				if (instruction[0] === 'VAL') {
					let number = numToBinary(
						parseInt(instruction[2], 16).toString(),
						1
					);
					machine += number + '\n';
				} else if (
					instruction[0] === 'ADD' ||
					instruction[0] === 'MOV' ||
					instruction[0] === 'AND' ||
					instruction[0] === 'OR' ||
					instruction[0] === 'XOR'
				) {
					regreg(instruction);
					//console.log(lc);
					continue;
				} else if (
					instruction[0] === 'NOT' ||
					instruction[0] === 'INC' ||
					instruction[0] === 'CILR' ||
					instruction[0] === 'CILL' ||
					instruction[0] === 'SHR' ||
					instruction[0] === 'SHL'
				) {
					nullreg(instruction);
					//console.log(lc);
					continue;
				} else if (
					instruction[0] === 'RET' ||
					instruction[0] === 'CINT' ||
					instruction[0] === 'CMIF' ||
					instruction[0] === 'INPT' ||
					instruction[0] === 'OUTP' ||
					instruction[0] === 'CINF' ||
					instruction[0] === 'COUF'
				) {
					nullnull(instruction);
					//console.log(lc);
					continue;
				} else if (
					instruction[0] === 'LOAD' ||
					instruction[0] === 'STORE'
				) {
					regmem(instruction);
					//console.log(lc);
					continue;
				} else if (
					instruction[0] === 'JMPZ' ||
					instruction[0] === 'JMPN' ||
					instruction[0] === 'JMPU' ||
					instruction[0] === 'CALL'
				) {
					nullmem(instruction);
					//console.log(lc);
					continue;
				}
			}
			lc += 1;
		}
		++passNumber;
	}
	passNumber = 1;
	$('.machine textarea').html(machine);
	const scrollDestination = document.getElementById('machine-container');
	scrollDestination.scrollIntoView({
		behavior: 'smooth',
	});
}

//instruction has one register and one memory operand [memory reference]
function regmem(instruction) {
	//Immediate addressing
	var mode = '01';
	//Direct addressing
	if (
		instruction[2][0] === '[' &&
		instruction[2][instruction[2].length - 1] === ']'
	) {
		mode = '10';
		instruction[2] = instruction[2].replace('[', '');
		instruction[2] = instruction[2].replace(']', '');
	}
	//Indirect addressing
	else if (instruction[2][0] === '$') {
		mode = '11';
		instruction[2] = instruction[2].replace('$', '');
	}

	switch (instruction[0]) {
		case 'LOAD':
			machine += mode + '00 00';
			break;
		case 'STORE':
			machine += mode + '00 01';
			break;
	}

	switch (instruction[1]) {
		case 'A':
			machine += '01 ';
			break;
		case 'B':
			machine += '10 ';
			break;
		case 'C':
			machine += '11 ';
			break;
	}

	if (locationDictionary[instruction[2]] !== undefined) {
		machine += numToBinary(locationDictionary[instruction[2]]);
	} else {
		instruction[2].replace('H', '');
		machine += numToBinary(instruction[2]);
	}
	machine += '\n';
}

//instruction has one memory(label) operand [control transfer]
function nullmem(instruction) {
	switch (instruction[0]) {
		case 'JMPZ':
			machine += '0100 10';
			break;
		case 'JMPN':
			machine += '0100 11';
			break;
		case 'JMPU':
			machine += '0101 00';
			break;
		case 'CALL':
			machine += '0101 01';
			break;
	}
	let location = locationDictionary[instruction[1]];

	machine += '00 ';
	//converts memory address into binary
	machine += numToBinary(location);
	machine += '\n';
}

//instruction has two register operands [arithmetic and logical]
function regreg(instruction) {
	switch (instruction[0]) {
		case 'ADD':
			machine += '0000 0000 0001 ';
			break;
		case 'MOV':
			machine += '0000 0000 0010 ';
			break;
		case 'AND':
			machine += '0000 0000 0011 ';
			break;
		case 'OR':
			machine += '0000 0000 0100 ';
			break;
		case 'XOR':
			machine += '0000 0000 0101 ';
			break;
	}
	switch (instruction[1]) {
		case 'A':
			machine += '00';
			break;
		case 'B':
			machine += '01';
			break;
		case 'C':
			machine += '10';
			break;
		case 'D':
			machine += '11';
			break;
	}
	switch (instruction[2]) {
		case 'A':
			machine += '00';
			break;
		case 'B':
			machine += '01';
			break;
		case 'C':
			machine += '10';
			break;
		case 'D':
			machine += '11';
			break;
	}
	machine += '\n';
}

//instruction has one register operand
function nullreg(instruction) {
	switch (instruction[0]) {
		case 'NOT':
			machine += '0000 0000 0110 ';
			break;
		case 'INC':
			machine += '0000 0000 0111 ';
			break;
		case 'CILR':
			machine += '0000 0000 1000 ';
			break;
		case 'CILL':
			machine += '0000 0000 1001 ';
			break;
		case 'SHR':
			machine += '0000 0000 1010 ';
			break;
		case 'SHL':
			machine += '0000 0000 1011 ';
			break;
	}
	machine += '00';

	switch (instruction[1]) {
		case 'A':
			machine += '01';
			break;
		case 'B':
			machine += '10';
			break;
		case 'C':
			machine += '11';
			break;
	}
	machine += '\n';
}

//instruction has no operands [flag control/io]
function nullnull(instruction) {
	switch (instruction[0]) {
		case 'RET':
			machine += '0000 0000 1100 ';
			break;
		case 'CINT':
			machine += '0000 0000 1101 ';
			break;
		case 'CMIF':
			machine += '0000 0000 1110 ';
			break;
		case 'INPT':
			machine += '0000 0000 1111 ';
			break;
		case 'OUTP':
			machine += '0000 0001 0000 ';
			break;
		case 'CINF':
			machine += '0000 0010 0000 ';
			break;
		case 'COUF':
			machine += '0000 0011 0000 ';
			break;
	}
	machine += '0000\n';
}

function validator(assemblyArr) {
	let error = `Error at line `;
	let i = 0;
	let line;
	for (line of assemblyArr) {
		let instruction = line.split(' ');

		operation = instruction[0];
		let j = 0;
		while (operation[j] === '\n') {
			++i;
			++j;
		}
		//console.log('IN THE BEGINGIN', i, instruction);
		operation = operation.slice(j);
		//general operation check
		if (!keywords.includes(operation)) {
			error += `${i + 1}: Undefined instruction`;
			break;
		}

		if (
			operation === 'OG' &&
			(instruction[1] === undefined || instruction[1] === '')
		) {
			error += `${i + 1}: Expected Location of origin.`;
			break;
		}
		if (
			(operation === 'VAL' || operation === 'LABEL') &&
			(instruction[1] === undefined || instruction[1] === '')
		) {
			error += `${i + 1}: Name expected`;
			break;
		}

		//register memory
		if (keys_regmem.includes(operation) && passNumber === 2) {
			if (!keys_registers.includes(instruction[1])) {
				error += `${i + 1}: Register name expected.`;
				break;
			}
			if (instruction[2] == undefined || instruction[2] == '') {
				error += `${i + 1}: Memory location or variable name expected.`;
				break;
			}
			//instruction[2] = instruction[2].replace('H', '');
			if (
				instruction[2][0] === '[' &&
				instruction[2][instruction[2].length - 1] === ']'
			) {
				instruction[2] = instruction[2].replace('[', '');
				instruction[2] = instruction[2].replace(']', '');
			}
			//Indirect addressing
			else if (instruction[2][0] === '$') {
				instruction[2] = instruction[2].replace('$', '');
			}
			let num = parseInt(instruction[2], 16);

			if (
				num.toString(16) === instruction[2].toLowerCase() &&
				(num < 0 || num > 255)
			) {
				error += `${i + 1}: Memory reference out of bound.`;
				break;
			}
			// console.log(
			// 	parseInt(instruction[2], 16),
			// 	locationDictionary[instruction[2]]
			// );
			if (
				!(num.toString(16) === instruction[2].toLowerCase()) &&
				locationDictionary[instruction[2]] === undefined
			) {
				error += `${i + 1}: Unrecognized variable ${instruction[2]}`;
				break;
			}
		}
		//null memory
		if (keys_nullmem.includes(operation) && passNumber === 2) {
			if (instruction[1] == undefined || instruction[1] == '') {
				error += `${i + 1}: Label expected.`;
				break;
			}
			if (locationDictionary[instruction[1]] === undefined) {
				error += `${i + 1}: Unrecognized Label ${instruction[1]}`;
				break;
			}
		}
		//register register
		if (keys_regreg.includes(operation)) {
			if (!keys_registers.includes(instruction[1])) {
				error += `${i + 1}: Register name expected`;
				break;
			}
			if (!keys_registers.includes(instruction[2])) {
				error += `${i + 1}: Register name expected.`;
				break;
			}
		}
		//null register
		if (keys_nullreg.includes(operation)) {
			if (!keys_registers.includes(instruction[1])) {
				error += `${i + 1}: Missing register reference.`;
				break;
			}
		}
		++i;
		//no validation check needed for nullnull kind
	}
	if (!error.localeCompare('Error at line ')) error = undefined;
	return error;
}

//converts memory address into binary
function numToBinary(num, longBitField = 0) {
	let result = '';
	let bin = parseInt(num).toString(2);
	let size = bin.length;
	let bitLength = 8 + 8 * longBitField;
	while (size < bitLength) {
		result += '0';
		size++;
	}
	result += bin;
	if (bitLength == 16) {
		result =
			result.slice(0, 4) +
			' ' +
			result.slice(4, 8) +
			' ' +
			result.slice(8, 12) +
			' ' +
			result.slice(12, 16);
	} else {
		result = result.slice(0, 4) + ' ' + result.slice(4, 8);
	}
	return result;
}
