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
import { Page } from "puppeteer";
import mime from "mime-types";

const logger = log.logger.bind(null, Context.Directory);

let basePath: string;
const internal = {
	async getBlobFromUrl(vtop: Page, url: string) {
		const obj = await vtop.evaluate(async (url: string) => {
			const response = await fetch(url).catch((reason) => console.log("Error fetching blob from url", reason));
			if (response) {
				const contentType = response.headers.get("content-type") ?? "application/pdf";
				const blob = await response.blob();
				const arrayBuffer = await blob.arrayBuffer();
				const uint8Array = new Uint8Array(arrayBuffer);
				return { buffer: btoa(uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), "")), contentType: contentType };
			} else {
				await new Promise((resolve) => setTimeout(resolve, 30000));
			}
			return { buffer: "", contentType: "" };
		}, url);
		return { buffer: Buffer.from(obj.buffer, "base64"), fileType: mime.extension(obj.contentType) };
	},
	async setCustomDates(filePath: string, date: string) {
		const lastModified = new Date(date);
		await fs.utimes(filePath, lastModified, lastModified);
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
			fs.ensureDirSync(path.join(basePath, "output", semester.name, course.courseCode + " - " + course.courseTitle + " - " + course.courseType));
			logger(`Created course folder: ${course.courseCode}!`);
		},
		async write(semester: Semester, course: Course) {
			await fs.writeFile(path.join(basePath, "output", semester.name, course.courseCode + " - " + course.courseTitle + " - " + course.courseType, "course.json"), JSON.stringify(course, null, 4));
			logger(`Wrote course file: ${course.courseCode} - ${course.courseTitle}!`);
		}
	},
	assignment: {
		async download(vtop: Page, semester: Semester, course: Course, assignment: Assignment) {
			await vtop.waitForNetworkIdle();
			if (assignment.questionPaper) {
				const obj = await internal.getBlobFromUrl(vtop, assignment.questionPaper);
				if (obj.buffer.length > 0) {
					const file = path.join("output", semester.name, course.courseCode + " - " + course.courseTitle + " - " + course.courseType, `${assignment.serialNumber} - Question - ${assignment.title}` + "." + obj.fileType);
					assignment.questionPaper = file;
					await fs.writeFile(file, obj.buffer);
					if (assignment.lastUpdatedOn) {
						await internal.setCustomDates(file, assignment.lastUpdatedOn);
					}
					logger(`Wrote question paper: ${assignment.serialNumber} - ${assignment.title}!`);
				} else {
					assignment.questionPaper = undefined;
					logger(`No question paper found for ${assignment.serialNumber} - ${assignment.title}!`);
				}
			}
			// Commented to allow for faster downloads.
			// await vtop.waitForNetworkIdle();
			if (assignment.solutionPaper) {
				const obj = await internal.getBlobFromUrl(vtop, assignment.solutionPaper);
				if (obj.buffer.length > 0) {
					const file = path.join("output", semester.name, course.courseCode + " - " + course.courseTitle + " - " + course.courseType, `${assignment.serialNumber} - Solution - ${assignment.title}` + "." + obj.fileType);
					assignment.solutionPaper = file;
					await fs.writeFile(file, obj.buffer);
					if (assignment.lastUpdatedOn) {
						await internal.setCustomDates(file, assignment.lastUpdatedOn);
					}
					logger(`Wrote solution paper: ${assignment.serialNumber} - ${assignment.title}!`);
				} else {
					assignment.solutionPaper = undefined;
					logger(`No solution paper found for ${assignment.serialNumber} - ${assignment.title}!`);
				}
			}
			await vtop.waitForNetworkIdle();
		}
	}
};
