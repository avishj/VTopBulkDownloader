import { Context } from "./utils/enums.js";
import log from "./utils/log.js";
import { Course, Output, Semester } from "./utils/types.js";
import fs from "fs-extra";
import path from "node:path";

const logger = log.logger.bind(null, Context.Directory);
let basePath: string;

export function init() {
	logger("Initializing directory module!");
	basePath = process.cwd();
	logger(`Current working directory: ${basePath}!`);
}

export const output = {
	create() {
		fs.ensureDirSync(path.join(basePath, "output"));
		logger(`Created output folder!`);
	},
	async write(output: Output) {
		await fs.writeFile(path.join(basePath, "output.json"), JSON.stringify(output, null, 4));
		logger(`Wrote output file!`);
	}
};

export const semester = {
	create(semester: Semester) {
		fs.ensureDirSync(path.join(basePath, "output", semester.name));
		logger(`Created semester folder: ${semester.name}!`);
	},
	async write(semester: Semester) {
		await fs.writeFile(path.join(basePath, "output", semester.name, "semester.json"), JSON.stringify(semester, null, 4));
		logger(`Wrote semester file: ${semester.name}!`);
	}
};

export const course = {
	create(semester: Semester, course: Course) {
		fs.ensureDirSync(path.join(basePath, "output", semester.name, course.courseCode + " - " + course.courseTitle));
		logger(`Created course folder: ${course.courseCode}!`);
	},
	async write(semester: Semester, course: Course) {
		await fs.writeFile(path.join(basePath, "output", semester.name, course.courseCode + " - " + course.courseTitle, "course.json"), JSON.stringify(course, null, 4));
		logger(`Wrote course file: ${course.courseCode} - ${course.courseTitle}!`);
	}
};
