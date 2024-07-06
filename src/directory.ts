import { Context } from "./enums.js";
import utils from "./utils.js";
import fs from "fs-extra";
import nodePath from "node:path";

const logger = utils.log.bind(null, Context.Directory);
let basePath: string;

export default {
	async createFolderAt(path: string, name: string) {
		await fs.ensureDir(nodePath.join(path, name));
		logger(`Created folder: ${name}`);
		await process.chdir(path);
	},
	async createFoldersAt(path: string, folders: string[]) {
		for (const folder of folders) {
			await this.createFolderAt(path, folder);
		}
	},
	async getWorkingDirectory(): Promise<string> {
		logger(`Current working directory: ${process.cwd()}`);
		return process.cwd();
	},
	async setWorkingDirectory(path: string) {
		logger(`Set working directory to: ${path} from ${process.cwd()}!`);
		process.chdir(path);
	},
	async init() {
		logger("Initializing the output directory!");
		basePath = await this.getWorkingDirectory();
		await this.createFolderAt(basePath, "output");
		basePath = nodePath.join(basePath, "output");
		await this.setWorkingDirectory(basePath);
	},
	async getBasePath() {
		return basePath;
	},
	async writeFile(path: string, name: string, content: string) {
		await fs.writeFile(nodePath.join(path, name), content);
		logger(`Wrote file: ${nodePath.join(path, name)}!`);
	}
};
