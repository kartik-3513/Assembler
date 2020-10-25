var editor;
var machine = ""; //machine code
var lc = 0; //location counter

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
];
const keys_regmem = ["LOAD","STORE"];
const keys_nullmem = ["JMPZ","JMPN","JMPU","CALL"];
const keys_regreg = ["ADD","INC","MOV","AND","OR","NOT","XOR"];
const keys_nullreg = ["CILR","CILL","SHR","SHL"];
const keys_registers = ["A","B","C","D"];
const keys_nullnull = ["RET","CINT","CMIF","INPT","OUTP","CINF","COUF"];

CodeMirror.defineMode('assembler', function () {
	return {
		token: function (stream, state) {
			if (stream.match('load',  true, true)) return 'keyword';
			if (stream.match('store', true, true)) return 'keyword';
			if (stream.match('add',   true, true)) return 'keyword';
			if (stream.match('inc',   true, true)) return 'keyword';
			if (stream.match('and',   true, true)) return 'keyword';
			if (stream.match('mov',   true, true)) return 'keyword';
			if (stream.match('or',    true, true)) return 'keyword';
			if (stream.match('not',   true, true)) return 'keyword';
			if (stream.match('xor',   true, true)) return 'keyword';
			if (stream.match('cilr',  true, true)) return 'keyword';
			if (stream.match('cill',  true, true)) return 'keyword';
			if (stream.match('shr',   true, true)) return 'keyword';
			if (stream.match('shl',   true, true)) return 'keyword';
			if (stream.match('jmpz',  true, true)) return 'keyword';
			if (stream.match('jmpn',  true, true)) return 'keyword';
			if (stream.match('jmpu',  true, true)) return 'keyword';
			if (stream.match('call',  true, true)) return 'keyword';
			if (stream.match('ret',   true, true)) return 'keyword';
			if (stream.match('cint',  true, true)) return 'keyword';
			if (stream.match('cmif',  true, true)) return 'keyword';
			if (stream.match('inpt',  true, true)) return 'keyword';
			if (stream.match('outp',  true, true)) return 'keyword';
			if (stream.match('cinf',  true, true)) return 'keyword';
            if (stream.match('couf',  true, true)) return 'keyword';
            if (stream.match('og',   true, true)) return 'keyword';
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
	$("#translate-button").on("click",assemble);
});

//wrapper fn called at assemble, splits assembly code by ';' into array, makes instruction 
function cleaner(assemblyArr) {
    machine = "";

    //seperate code into instructions, clean up spaces and stuff
    for(var i = 0; i < assemblyArr.length - 1; i++) {
        assemblyArr[i] = assemblyArr[i].replace("\n", "");
        assemblyArr[i] = assemblyArr[i].replace(",", " ");
        while(assemblyArr[i].includes("  ")) {
            assemblyArr[i] = assemblyArr[i].replace("  ", " ");
        }
        assemblyArr[i] = assemblyArr[i].toUpperCase();    
    }
    //remove last empty element: blank space
    assemblyArr.pop();
    console.log(assemblyArr);
    return assemblyArr;
}

function assemble() {
    let assembly = editor.getValue();
    let assemblyArr = assembly.split(";");
    assemblyArr=cleaner(assemblyArr);
    let error=validator(assemblyArr);
    if(error) {
        $(".machine textarea").html(error);
        return;
    }

    //seperate instruction into tokens and call appropriate function
    for(var i = 0; i < assemblyArr.length; i++) {
        
        var instruction = assemblyArr[i].split(" ");
        //cleans individual instruction from tailing whitespaces
        if(instruction[0] === "") {
            instruction.shift();
        }
        if(instruction[instruction.length - 1] === "") {
            instruction.pop();
        }
        //changing location counter value depending on control transfer commands
        //replaces h of hexadecimal with blank space
        if (instruction[0].includes("OG")) {
            instruction[1] = instruction[1].replace("H", "");
            lc = parseInt(instruction[1], 16);
            console.log(lc);
        }
        else if (instruction[0].includes("LOAD") || instruction[0].includes("STORE")) {
            regmem(instruction); lc += 1; continue;
        }
        else if (instruction[0].includes("JMPZ") || instruction[0].includes("JMPN") || instruction[0].includes("JMPU") || instruction[0].includes("CALL")) {
            nullmem(instruction); lc += 1; continue;
        }
        else if (instruction[0].includes("ADD") || instruction[0].includes("INC") || instruction[0].includes("MOV") || instruction[0].includes("AND") || instruction[0].includes("OR") || instruction[0].includes("NOT") || instruction[0].includes("XOR")) {
            regreg(instruction); lc += 1; continue;
        }
        else if (instruction[0].includes("CILR") || instruction[0].includes("CILL") || instruction[0].includes("SHR") || instruction[0].includes("SHL")) {
            nullreg(instruction); lc += 1; continue;
        }
        else if (instruction[0].includes("RET") || instruction[0].includes("CINT") || instruction[0].includes("CMIF") || instruction[0].includes("INPT") || instruction[0].includes("OUTP") || instruction[0].includes("CINF") || instruction[0].includes("COUF")){
            nullnull(instruction); lc += 1; continue;
        }
    }
    $(".machine textarea").html(machine);
}

//instruction has one register and one memory operand [memory reference]
function regmem(instruction) {
    var mode = "01";
    if (instruction[2][0] === "[" && instruction[2][instruction[2].length - 1] === "]") {
        mode = "10";
        instruction[2] = instruction[2].replace("[", "");
        instruction[2] = instruction[2].replace("]", "");
    }
    else if (instruction[2][0] === "$") {
        mode = "11";
        instruction[2] = instruction[2].replace("$", "");
    }

    switch(instruction[0]) {
        case "LOAD": machine += mode + "00 00"; break;
        case "STORE": machine += mode + "00 01"; break;
    }

    switch(instruction[1]) {
        case "A": machine += "00 "; break;
        case "B": machine += "01 "; break;
        case "C": machine += "10 "; break;
        case "D": machine += "11 "; break;
    }
    instruction[2].replace("H", "");
	 //converts memory address into binary
     machine += numToBinary(instruction[2]);
     machine += "\n";
}

//instruction has one memory(label) operand [control transfer]
function nullmem(instruction) {
    switch(instruction[0]) {
        case "JMPZ": machine += "0100 10"; break;
        case "JMPN": machine += "0100 11"; break;
        case "JMPU": machine += "0101 00"; break;
        case "CALL": machine += "0101 01"; break;
    }
    instruction[1].replace("H", "");
    
    machine += "00 ";
    //converts memory address into binary
    machine += numToBinary(instruction[1]);
    machine += "\n";
}

//instruction has two register operands [arithmetic and logical]
function regreg(instruction) {
    switch(instruction[0]) {
        case "ADD": machine += "0000 0000 0001 "; break;
        case "INC": machine += "0000 0000 0010 "; break;
        case "MOV": machine += "0000 0000 0011 "; break;
        case "AND": machine += "0000 0000 0100 "; break;
        case "OR":  machine += "0000 0000 0101 "; break;
        case "NOT": machine += "0000 0000 0110 "; break;
        case "XOR": machine += "0000 0000 0111 "; break;
    }
    switch(instruction[1]) {
        case "A": machine += "00"; break;
        case "B": machine += "01"; break;
        case "C": machine += "10"; break;
        case "D": machine += "11"; break;
    }
    switch(instruction[2]) {
        case "A": machine += "00"; break;
        case "B": machine += "01"; break;
        case "C": machine += "10"; break;
        case "D": machine += "11"; break;
    }
    machine += "\n";
}

//instruction has one register operand [shift instructions]
function nullreg(instruction) {
    switch(instruction[0]) {
        case "CILR": machine += "0000 0000 1000 "; break;
        case "CILL": machine += "0000 0000 1001 "; break;
        case "SHR" : machine += "0000 0000 1010 "; break;
        case "SHL" : machine += "0000 0000 1011 "; break;
    }
    machine += "00";

    switch(instruction[1]) {
        case "A": machine += "00"; break;
        case "B": machine += "01"; break;
        case "C": machine += "10"; break;
        case "D": machine += "11"; break;
    }
    machine += "\n";
}

//instruction has no operands [flag control/io]
function nullnull(instruction) {
    switch(instruction[0]) {
        case "RET" : machine += "0000 0000 1100 "; break;
        case "CINT": machine += "0000 0000 1101 "; break;
        case "CMIF": machine += "0000 0000 1110 "; break;
        case "INPT": machine += "0000 0000 1111 "; break;
        case "OUTP": machine += "0000 0001 0000 "; break;
        case "CINF": machine += "0000 0010 0000 "; break;
        case "COUF": machine += "0000 0011 0000 "; break;
    }
    machine += "0000\n";
}

function validator(assemblyArr) {
    let error=`Error at line `;
    for(let i=0; i<assemblyArr.length; i++) {

        let instruction=assemblyArr[i].split(" ");
        console.log(instruction);
        operation=instruction[0];
        //general operation check
        if(!keywords.includes(operation)) {
            error+=`${i+1}: Undefined instruction`; break;
        }
        //origin
        if(operation=="OG" && (instruction[1]==undefined || instruction[1]=="")) {
            error+=`${i+1}: Unexpected Location of origin.`; break;
        }
        //register memory
        if(keys_regmem.includes(operation)) {
            if(!keys_registers.includes(instruction[1])) {
                error+=`${i+1}: Missing register reference.`; break;
            }
            if(instruction[2]==undefined || instruction[2]=='') {
                error+=`${i+1}: Memory reference expected.`; break;
            }
            if(instruction[2]<0 || instruction[2]>255) {
                error+=`${i+1}: Memory reference out of bound.`; break;
            }
        }
        //null memory
        if(keys_nullmem.includes(operation)) {
            if(instruction[2]==undefined || instruction[2]=='') {
                error+=`${i+1}: Memory reference expected.`; break;
            }
            if(instruction[2]<0 || instruction[2]>255) {
                error+=`${i+1}: Memory reference out of bound.`; break;
            }
        }
        //register register
        if(keys_regreg.includes(operation)) {
            if(!keys_registers.includes(instruction[1])) {
                error+=`${i+1}: Missing register reference.`; break;
            }
            if(!keys_registers.includes(instruction[2])) {
                error+=`${i+1}: Missing register reference.`; break;
            }
        }
        //null register
        if(keys_nullreg.includes(operation)) {
            if(!keys_registers.includes(instruction[1])) {
                error+=`${i+1}: Missing register reference.`; break;
            }
        }
        //no validation check needed for nullnull kind
    }
    console.log(error);
    if(!error.localeCompare("Error at line ")) error=undefined;
    return error;
}

//converts memory address into binary
function numToBinary(num) {
    let result="";
    let bin=parseInt(num).toString(2);
    let size=bin.length;
    while(size<8) {
        result+='0';
        size++;
    }
    result+=bin;
    result=result.slice(0,4)+" "+result.slice(4,8);
    return result;
}