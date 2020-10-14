var machine = "";
document.querySelector("#translate-button").addEventListener("click",assemble);

function assemble() {
    machine = "";
    const assembly = document.querySelector(".editor").getValue();
    document.querySelector(".machine textarea").innerHTML;
    const assemblyArr = assembly.split(";");

    for(var i = 0; i < assemblyArr.length; i++) {
        assemblyArr[i] = assemblyArr[i].replace("\n", "");
        var instruction = assemblyArr[i].split(" ");
        console.log(instruction);
        if (instruction[0].includes("LOAD") || instruction[0].includes("STORE")) {
            regmem(instruction); continue;
        }
        else if (instruction[0].includes("JMPZ") || instruction[0].includes("JMPN") || instruction[0].includes("JMPU") || instruction[0].includes("CALL")) {
            nullmem(instruction); continue;
        }
        else if (instruction[0].includes("ADD") || instruction[0].includes("INC") || instruction[0].includes("MOV") || instruction[0].includes("AND") || instruction[0].includes("OR") || instruction[0].includes("NOT") || instruction[0].includes("XOR")) {
            regreg(instruction);continue;
        }
        else if (instruction[0].includes("CILR") || instruction[0].includes("CILL") || instruction[0].includes("SHR") || instruction[0].includes("SHL")) {
            nullreg(instruction); continue;
        }
        else if (instruction[0].includes("RET") || instruction[0].includes("CINT") || instruction[0].includes("CMIF") || instruction[0].includes("INPT") || instruction[0].includes("OUTP") || instruction[0].includes("CINF") || instruction[0].includes("COUF")){
            nullnull(instruction);continue;
        }
    }

    document.querySelector(".machine textarea").innerHTML = machine;
}

function regmem(instruction) {
    switch(instruction[0]) {
        case "LOAD": machine += "XX 0000  "; break;
        case "STORE": machine += "XX 0001  "; break;
    }

    switch(instruction[1]) {
        case "A": machine += "00  "; break;
        case "B": machine += "01  "; break;
        case "C": machine += "10  "; break;
        case "D": machine += "11  "; break;
    }

    machine += parseInt(instruction[2]).toString(2);

    machine += "\n";
}

function nullmem(instruction) {
    switch(instruction[0]) {
        case "JMPZ": machine += "XX 0010  "; break;
        case "JMPN": machine += "XX 0011  "; break;
        case "JMPU": machine += "XX 0100  "; break;
        case "CALL": machine += "XX 0101  "; break;
    }

    machine += "00  ";

    machine += parseInt(instruction[1]).toString(2);

    machine += "\n";
}

function regreg(instruction) {
    switch(instruction[0]) {
        case "ADD": machine += "0000 0000 0001  "; break;
        case "INC": machine += "0000 0000 0010  "; break;
        case "MOV": machine += "0000 0000 0011  "; break;
        case "AND": machine += "0000 0000 0100  "; break;
        case "OR": machine += "0000 0000 0101  "; break;
        case "NOT": machine += "0000 0000 0110  "; break;
        case "XOR": machine += "0000 0000 0111  "; break;
    }
    switch(instruction[1]) {
        case "A": machine += "00  "; break;
        case "B": machine += "01  "; break;
        case "C": machine += "10  "; break;
        case "D": machine += "11  "; break;
    }
    switch(instruction[2]) {
        case "A": machine += "00"; break;
        case "B": machine += "01"; break;
        case "C": machine += "10"; break;
        case "D": machine += "11"; break;
    }

    machine += "\n";
}

function nullreg(instruction) {
    switch(instruction[0]) {
        case "CILR": machine += "0000 0000 1000  "; break;
        case "CILL": machine += "0000 0000 1001  "; break;
        case "SHR": machine += "0000 0000 1010  "; break;
        case "SHL": machine += "0000 0000 1011  "; break;
    }

    machine += "00  ";

    switch(instruction[1]) {
        case "A": machine += "00"; break;
        case "B": machine += "01"; break;
        case "C": machine += "10"; break;
        case "D": machine += "11"; break;
    }

    machine += "\n";
}

function nullnull(instruction) {
    switch(instruction[0]) {
        case "RET": machine += "0000 0000 1100  "; break;
        case "CINT": machine += "0000 0000 1101  "; break;
        case "CMIF": machine += "0000 0000 1110  "; break;
        case "INPT": machine += "0000 0000 1111  "; break;
        case "OUTP": machine += "0000 0001 0000  "; break;
        case "CINF": machine += "0000 0010 0000  "; break;
        case "COUF": machine += "0000 0011 0000  "; break;
    }

    machine += "00  ";

    machine += "00";
    
    machine += "\n";
}