import { Context } from "./enums";
import fs from "fs-extra";
import nodePath from "node:path";

let logPath: string;

export default {
	async sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	},
	log: {
		async logger(context: Context, message: string) {
			console.log(`[${new Date().toISOString()}] - [${context}] - ${message}`);
			if (logPath) {
				await fs.appendFile(logPath, `[${new Date().toISOString()}] - [${context}] - ${message}\n`); // Not added in directory as causes circular dependency.
			}
		},
		async init() {
			logPath = nodePath.join(process.cwd(), "output", new Date().toISOString().replace(/:/g, "-") + ".log"); // Not using directory as causes circular dependency.
		}
	}
};
