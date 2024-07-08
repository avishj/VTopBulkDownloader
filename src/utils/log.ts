/**
 *
 * @author Avish Jha <avish.j@protonmail.com>
 * @copyright Copyright (c) 2024 Avish Jha <avish.j@protonmail.com>
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { Context } from "./enums.js";
import fs from "fs-extra";
import path from "node:path";

let logPath: string;

export default {
	init(timestamp: string) {
		fs.ensureDirSync(path.join(process.cwd(), "output"));
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
