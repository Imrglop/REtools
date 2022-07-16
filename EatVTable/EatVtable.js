// By Imrglop

const { readFileSync, writeFileSync } = require("fs");

var targetClass = [];
const inp = "in.txt";
const outp = "out.txt";

var data = {
    "sample": ".rdata:0000000141625C88                 ",
    "nullsub_start": "nullsub_",
    "destructor_start": "destructor_",

    //"start": "virtual __int64 [name]; // 0x[offset]   |   0x[offset8]\r\n"
	"start": "virtual __int64 [name]; // 0x[offset8]\r\n"
}

var inc = {
    "nullsub": 0,
    "destructor": 0
}

var ref = {
    destructor: "`scalar deleting destructor'(uint)"
}

var inf = readFileSync(inp).toString();

var infs = inf.split("\r\n");

if (infs[0].startsWith(".rdata:")) {
	console.log("Please enter the target classes on the top of the file. Seperate with semicolons. Spaces are not trimmed!");
	process.exit(1);
}

targetClass = infs[0].split(";")

var final = "// EatVtable.js (" + `${inp} -> ${outp}` + ")\r\n";

var isStartingAddress = false;
var startAddr = 0;

function nullsub() {
    return data.nullsub_start + inc.nullsub++ + "(void)";
}

function destructor() {
    return data.destructor_start + inc.destructor++ + "(void)";
}

for (sp of infs) {
    if (sp.startsWith(".rdata:")) {
        
        var start = sp.split("                 ")[0];
        var addr = start.split(":")[1];
        var addrNum = parseInt(addr.substr(2), 16)

        if (!isStartingAddress) {
            startAddr = addrNum // remove 14, keep the rest after that
            isStartingAddress = true;
        }


        var restOfTxt = sp.substr(data.sample.length);
		var d = false;
		if (restOfTxt.split(" ; ")[1] != undefined) d = true;
        var txt = "";
		if (d) {
			txt = restOfTxt.split(" ; ")[1];
			var ts = txt.split("::");
			var [className, funcName] = [ts.shift(), ts.join("::")];
		} else {
			funcName = nullsub();
		}
        if (!targetClass.includes(className)) {
            funcName = nullsub();
        }
        if (funcName == ref.destructor) {
            funcName = destructor();
        }
        final += (data.start.replace("[offset8]", ((addrNum - startAddr)/8).toString(16).toUpperCase()).replace("[name]", funcName).replace("[offset]", (addrNum - startAddr).toString(16).toUpperCase() ))
    }
}

writeFileSync(outp, final);

console.log("EatVtable.js finished.");