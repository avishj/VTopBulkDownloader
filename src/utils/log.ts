import { Context } from "./enums.js";
import fs from "fs-extra";
import path from "node:path";

let logPath: string;

export default {
	async init(timestamp: string) {
		logPath = path.join(process.cwd(), "output", timestamp.replace(/:/g, "-") + ".log"); // Not using directory as causes circular dependency.
	},
	async logger(context: Context, message: string) {
		if (!logPath) {
			throw new Error("Log path not initialized!");
		}
		const formattedLog = `[${new Date().toISOString()}] - [${context}] - ${message}`;
		console.log(formattedLog);
		await fs.appendFile(logPath, formattedLog + "\n"); // Not using directory as causes circular dependency.
	}
};
