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

import { Context } from "../utils/enums.js";
import log from "../utils/log.js";
import { Assignment, Course, Output, Semester } from "../utils/types.js";
import fs from "fs-extra";
import path from "node:path";
import fetch from "node-fetch";
import { Page } from "puppeteer";

const logger = log.logger.bind(null, Context.Directory);

let basePath: string;
const internal = {
	async getBlobFromUrl(vtop: Page, url: string) {
		const base64String = await vtop.evaluate(async (url: string) => {
			const response = await fetch(url).catch((reason) => console.log("Error fetching blob from url", reason));
			await new Promise((resolve) => setTimeout(resolve, 30000));
			if (response) {
				const blob = await response.blob();
				const arrayBuffer = await blob.arrayBuffer();
				const uint8Array = new Uint8Array(arrayBuffer);
				return btoa(uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), ""));
			}
			return "";
		}, url);
		return Buffer.from(base64String, "base64");
	}
};

export default {
	init() {
		logger("Initializing directory module!");
		basePath = process.cwd();
		logger(`Current working directory: ${basePath}!`);
	},
	output: {
		create() {
			fs.ensureDirSync(path.join(basePath, "output"));
			logger(`Created output folder!`);
		},
		async write(output: Output) {
			await fs.writeFile(path.join(basePath, "output", "output.json"), JSON.stringify(output, null, 4));
			logger(`Wrote output file!`);
		}
	},
	semester: {
		create(semester: Semester) {
			fs.ensureDirSync(path.join(basePath, "output", semester.name));
			logger(`Created semester folder: ${semester.name}!`);
		},
		async write(semester: Semester) {
			await fs.writeFile(path.join(basePath, "output", semester.name, "semester.json"), JSON.stringify(semester, null, 4));
			logger(`Wrote semester file: ${semester.name}!`);
		}
	},
	course: {
		create(semester: Semester, course: Course) {
			fs.ensureDirSync(path.join(basePath, "output", semester.name, course.courseCode + " - " + course.courseTitle));
			logger(`Created course folder: ${course.courseCode}!`);
		},
		async write(semester: Semester, course: Course) {
			await fs.writeFile(path.join(basePath, "output", semester.name, course.courseCode + " - " + course.courseTitle, "course.json"), JSON.stringify(course, null, 4));
			logger(`Wrote course file: ${course.courseCode} - ${course.courseTitle}!`);
		}
	},
	assignment: {
		async download(vtop: Page, semester: Semester, course: Course, assignment: Assignment) {
			if (assignment.questionPaper) {
				const buffer = await internal.getBlobFromUrl(vtop, assignment.questionPaper);
				if (buffer.length > 0) {
					const file = path.join(basePath, "output", semester.name, course.courseCode + " - " + course.courseTitle, `${assignment.serialNumber} - ${assignment.title} - Question` + ".pdf");
					assignment.questionPaper = file;
					await fs.writeFile(file, buffer);
					logger(`Wrote question paper: ${assignment.serialNumber} - ${assignment.title}!`);
				} else {
					assignment.questionPaper = undefined;
					logger(`No question paper found for ${assignment.serialNumber} - ${assignment.title}!`);
				}
			}
			if (assignment.solutionPaper) {
				const buffer = await internal.getBlobFromUrl(vtop, assignment.solutionPaper);
				if (buffer.length > 0) {
					const file = path.join(basePath, "output", semester.name, course.courseCode + " - " + course.courseTitle, `${assignment.serialNumber} - ${assignment.title} - Solution` + ".pdf");
					assignment.solutionPaper = file;
					await fs.writeFile(file, buffer);
					logger(`Wrote solution paper: ${assignment.serialNumber} - ${assignment.title}!`);
				} else {
					assignment.solutionPaper = undefined;
					logger(`No solution paper found for ${assignment.serialNumber} - ${assignment.title}!`);
				}
			}
		}
	}
};
