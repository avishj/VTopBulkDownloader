import directory from "./directory.js";
import { Context } from "./enums";
import fs from "fs-extra";
import nodePath from "node:path";

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
				await fs.appendFile(nodePath.join(basePath, logFile), `[${new Date().toISOString()}] - [${context}] - ${message}\n`); // Not added in directory as causes circular dependency.
			}
		},
		async init(path: string) {
			basePath = path;
			logFile = new Date().toISOString().replace(/:/g, "-") + ".log";
		}
	}
};
