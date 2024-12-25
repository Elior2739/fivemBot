import fs from "fs";


if(!fs.existsSync("./logs/")) {
    fs.mkdirSync("logs")
}

const date = new Date();
const dateFormmated = date.getDay() + "-" + date.getMonth() + "-" + date.getFullYear() + "_" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();

const logStream = fs.createWriteStream("./logs/" + dateFormmated + ".txt");
const debugStream = fs.createWriteStream("./logs/" + dateFormmated + "_debug.txt");

const Log = (type: "info" | "warning" | "error", message: string) => {
    const text = "[" + type.toUpperCase() + "]: " + message;

    console.log(text);
    // logStream.write(text + "\n");
};

const Debug = (severity: "info" | "warn" | "error", source: string, func: string, message: string) => {
    if(process.env.DEBUG == "1") {
        console.log("---Start Of Debug---");
        console.log("Severity: " + severity);
        console.log("Source: " + source);
        console.log("Function: " + func);
        console.log("Message: " + message);
        console.log("---End Of Debug---");
    };

    // debugStream.write("---New Debug Log---\nSeverity: " + severity + "\nSource: "+ source + " (" + func + ")\n" + message + "\n---End Of Debug Log---\n\n");
};

export {
    Log,
    Debug
}