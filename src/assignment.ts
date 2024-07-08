import { Page } from "puppeteer";
import log from "./utils/log.js";
import { Context } from "./utils/enums.js";
import { Assignment, Course, Semester } from "./utils/types.js";
import directory from "./directory.js";

const logger = log.logger.bind(null, Context.Assignment);

const internal = {
	async getDownloadLink(vtop: Page, urlText: string): Promise<string | null> {
		logger(`Getting download link for ${urlText}!`);
		const evalLink = await vtop.evaluate((urlText: string) => {
			urlText = urlText.replace("javascript:vtopDownload('", "").replace("')", "");
			// @ts-ignore: Property 'vtopDownload' does not exist on type 'Window & typeof globalThis'.
			return window.vtopDownload(urlText);
		}, urlText);
		if (evalLink) {
			return "https://vtop.vit.ac.in/vtop/" + evalLink;
		} else {
			return null;
		}
	}
};

export default {
	async main(vtop: Page, semester: Semester, course: Course, assignment: Assignment) {
		logger("Starting!");
		if (assignment.questionPaper) {
			logger(`Downloading question paper for ${course.courseCode} - ${course.courseTitle} - ${assignment.title}!`);
			assignment.questionPaper = (await internal.getDownloadLink(vtop, assignment.questionPaper)) ?? undefined;
		}
		if (assignment.solutionPaper) {
			logger(`Downloading solution paper for ${course.courseCode} - ${course.courseTitle} - ${assignment.title}!`);
			assignment.solutionPaper = (await internal.getDownloadLink(vtop, assignment.solutionPaper)) ?? undefined;
		}
		await directory.assignment.download(semester, course, assignment);
		logger("Done!");
		return assignment;
	}
};
