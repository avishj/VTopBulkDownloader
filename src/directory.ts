import { Context } from "./enums.js";
import utils from "./utils.js";
import fs from "fs-extra";

const logger = utils.log.bind(null, Context.Directory);

export default {
	async createFolder(folderPath: string) {
		await fs.ensureDir(folderPath);
		logger(`Created folder: ${folderPath}`);
	}
};
