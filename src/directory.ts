import { Context } from "./utils/enums.js";
import log from "./utils/log.js";
import { Assignment, Course, Output, Semester } from "./utils/types.js";
import fs from "fs-extra";
import path from "node:path";
import fetch from "node-fetch";

const logger = log.logger.bind(null, Context.Directory);

let basePath: string;
const internal = {
	async getBlobFromUrl(url: string) {
		return Buffer.from(await (await fetch(url)).arrayBuffer());
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
			await fs.writeFile(path.join(basePath, "output.json"), JSON.stringify(output, null, 4));
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
		async download(semester: Semester, course: Course, assignment: Assignment) {
			if (assignment.questionPaper) {
				const buffer = await internal.getBlobFromUrl(assignment.questionPaper);
				await fs.writeFile(path.join(basePath, "output", semester.name, course.courseCode + " - " + course.courseTitle, `${assignment.serialNumber} - ${assignment.title} - Question` + ".pdf"), buffer);
				logger(`Wrote question paper: ${assignment.serialNumber} - ${assignment.title}!`);
			}
			if (assignment.solutionPaper) {
				const buffer = await internal.getBlobFromUrl(assignment.solutionPaper);
				await fs.writeFile(path.join(basePath, "output", semester.name, course.courseCode + " - " + course.courseTitle, `${assignment.serialNumber} - ${assignment.title} - Solution` + ".pdf"), buffer);
				logger(`Wrote solution paper: ${assignment.serialNumber} - ${assignment.title}!`);
			}
		}
	}
};
