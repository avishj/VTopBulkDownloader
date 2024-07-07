import { Context } from "./enums.js";
import { Course, Output, Semester } from "./types.js";
import utils from "./utils.js";
import fs from "fs-extra";
import path from "node:path";

const logger = utils.log.logger.bind(null, Context.Directory);
let basePath: string;

export const core = {
	getWorkingDirectory(): string {
		logger(`Current working directory: ${process.cwd()}`);
		return process.cwd();
	}
};

export const output = {
	async create() {
		basePath = core.getWorkingDirectory();
		fs.ensureDirSync(path.join(basePath, "output"));
		logger(`Created output folder!`);
	},
	async write(output: Output) {
		await fs.writeFile(path.join(basePath, "output.json"), JSON.stringify(output, null, 4));
		logger(`Wrote output file!`);
	}
};

export const semester = {
	async create(semester: Semester) {
		await fs.ensureDir(path.join(basePath, "output", semester.name));
		logger(`Created semester folder: ${semester.name}!`);
	},
	async write(semester: Semester) {
		await fs.writeFile(path.join(basePath, "output", semester.name, "semester.json"), JSON.stringify(semester, null, 4));
		logger(`Wrote semester file: ${semester.name}!`);
	}
};

export const course = {
	async create(semester: Semester, course: Course) {
		await fs.ensureDir(path.join(basePath, "output", semester.name, course.courseCode + " - " + course.courseTitle));
		logger(`Created course folder: ${course.courseCode}!`);
	},
	async write(semester: Semester, course: Course) {
		await fs.writeFile(path.join(basePath, "output", semester.name, course.courseCode + " - " + course.courseTitle, "course.json"), JSON.stringify(course, null, 4));
		logger(`Wrote course file: ${course.courseCode} - ${course.courseTitle}!`);
	}
};
