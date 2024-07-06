import directory from "./directory.js";
import { Context } from "./enums";

let basePath: string;
let logFile: string;

export default {
	async sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	},
	log: {
		async logger(context: Context, message: string) {
			console.log(`[${new Date().toISOString()}] - [${context}] - ${message}`);
			if (logFile) {
				await directory.appendFile(basePath, logFile, `[${new Date().toISOString()}] - [${context}] - ${message}\n`);
			}
		},
		async init(path: string) {
			basePath = path;
			logFile = new Date().toISOString().replace(/:/g, "-") + ".log";
		}
	}
};
