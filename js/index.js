var activeNav = true;
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

const opcode_regmem = { LOAD: '00 00', STORE: '00 01' };
const opcode_nullmem = {
	JMPZ: '0100 10',
	JMPN: '0100 11',
	JMPU: '0101 00',
	CALL: '0101 01',
};
const opcode_regreg = {
	ADD: '0000 0000 0001 ',
	MOV: '0000 0000 0010 ',
	AND: '0000 0000 0011 ',
	OR: '0000 0000 0100 ',
	XOR: '0000 0000 0101 ',
};
const opcode_nullreg = {
	NOT: '0000 0000 0110 ',
	INC: '0000 0000 0111 ',
	CILR: '0000 0000 1000 ',
	CILL: '0000 0000 1001 ',
	SHR: '0000 0000 1010 ',
	SHL: '0000 0000 1011 ',
};
const opcode_nullnull = {
	RET: '0000 0000 1100 ',
	CINT: '0000 0000 1101 ',
	CMIF: '0000 0000 1110 ',
	INPT: '0000 0000 1111 ',
	OUTP: '0000 0001 0000 ',
	CINF: '0000 0010 0000 ',
	COUF: '0000 0011 0000 ',
};

const code_registers = { A: '01', B: '10', C: '11' };

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
			// if (stream.match(/([0-9]H?|[A-F]H)/, true)) return 'variable';
			// if (stream.match(/\s[A-D]/, true, true)) return 'atom';

			stream.next();
			return null;
		},
	};
});

//initialisation of editor window object
$(document).ready(function () {
	$('#hamburger').on('click', toggleActive);
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

//toggleActive is used for responsive navbar
function toggleActive() {
	activeNav = !activeNav;
	if (activeNav) {
		$('#nav-ul').removeClass('active');
	} else {
		$('#nav-ul').addClass('active');
	}
}

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
	locationDictionary = {};
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
			//spliting the line into tokens.
			var instruction = assemblyArr[i].split(' ');
			let j = 0;

			//ignoring blank lines
			//cleans individual instruction from trailing whitespaces
			while (instruction[0][j] === '\n') {
				++j;
			}
			instruction[0] = instruction[0].slice(j);

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
				} else if (instruction[0] === 'LABEL') {
					locationDictionary[instruction[1]] = lc;
				} else if (instruction[0] === 'VAL') {
					locationDictionary[instruction[1]] = lc++;
					continue;
				} else {
					lc += 1;
				}
			}
			if (passNumber === 2) {
				if (instruction[0] === 'VAL') {
					let number = numToBinary(
						parseInt(instruction[2], 16).toString(),
						1
					);
					machine += number + '\n';
				} else if (keys_regreg.includes(instruction[0])) {
					regreg(instruction);
					continue;
				} else if (keys_nullreg.includes(instruction[0])) {
					nullreg(instruction);
					continue;
				} else if (keys_nullnull.includes(instruction[0])) {
					nullnull(instruction);
					continue;
				} else if (keys_regmem.includes(instruction[0])) {
					regmem(instruction);
					continue;
				} else if (keys_nullmem.includes(instruction[0])) {
					nullmem(instruction);
					continue;
				}
			}
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

	machine += mode + opcode_regmem[instruction[0]];
	machine += code_registers[instruction[1]] + ' ';

	if (locationDictionary[instruction[2]] !== undefined) {
		machine += numToBinary(locationDictionary[instruction[2]]);
	} else {
		instruction[2] = instruction[2].replace('H', '');
		instruction[2] = parseInt(instruction[2], 16).toString();
		machine += numToBinary(instruction[2]);
	}
	machine += '\n';
}

//instruction has one memory(label) operand [control transfer]
function nullmem(instruction) {
	machine += opcode_nullmem[instruction[0]];
	let location = locationDictionary[instruction[1]];

	machine += '00 ';
	//converts memory address into binary
	machine += numToBinary(location);
	machine += '\n';
}

//instruction has two register operands [arithmetic and logical]
function regreg(instruction) {
	machine += opcode_regreg[instruction[0]];
	machine += code_registers[instruction[1]];
	machine += code_registers[instruction[2]];
	machine += '\n';
}

//instruction has one register operand
function nullreg(instruction) {
	machine += opcode_nullreg[instruction[0]];
	machine += '00';
	machine += code_registers[instruction[1]];
	machine += '\n';
}

//instruction has no operands [flag control/io]
function nullnull(instruction) {
	machine += opcode_nullnull[instruction[0]];
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
		if (operation ==='VAL' && isNaN(parseInt(instruction[2]))){
			error += `${i+1}: Value expected`;
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
			let directIndirect = false;
			//direct addressing
			if (
				instruction[2][0] === '[' &&
				instruction[2][instruction[2].length - 1] === ']'
			) {
				directIndirect = true;
				instruction[2] = instruction[2].replace('[', '');
				instruction[2] = instruction[2].replace(']', '');
			}

			//Indirect addressing
			else if (instruction[2][0] === '$') {
				directIndirect = true;
				instruction[2] = instruction[2].replace('$', '');
			}
			let num = parseInt(instruction[2], 16);

			if (
				num.toString(16) ===
				instruction[2].slice(0, instruction[2].length - 1).toLowerCase()
			) {
				if (directIndirect && (num < 0 || num > 255)) {
					error += `${i + 1}: Memory reference out of bound.`;
					break;
				}
				if (!directIndirect && (num < 0 || num > 65535)) {
					error += `${i + 1}: Immediate value out of bound.`;
					break;
				}
			}

			if (
				!(
					num.toString(16) ===
					instruction[2].slice(0, instruction[2].length - 1).toLowerCase()
				) &&
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
