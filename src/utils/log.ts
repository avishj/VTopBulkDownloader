import { Context } from "./enums.js";
import fs from "fs-extra";
import path from "node:path";

let logPath: string;

export default {
	async logger(context: Context, message: string) {
		if (!logPath) {
			throw new Error("Log path not initialized!");
		}
		console.log(`[${new Date().toISOString()}] - [${context}] - ${message}`);
		await fs.appendFile(logPath, `[${new Date().toISOString()}] - [${context}] - ${message}\n`); // Not added in directory as causes circular dependency.
	},
	async init(timestamp: string) {
		logPath = path.join(process.cwd(), "output", timestamp.replace(/:/g, "-") + ".log"); // Not using directory as causes circular dependency.
	}
};
