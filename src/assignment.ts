import { Page } from "puppeteer";
import log from "./utils/log.js";
import { Context } from "./utils/enums.js";
import { Assignment, Course, Semester } from "./utils/types.js";
import { assignment as directory } from "./directory.js";

const logger = log.logger.bind(null, Context.Assignment);

const internal = {
	async getDownloadLink(vtop: Page, urlText: string): Promise<string> {
		logger(`Getting download link for ${urlText}!`);
		return (
			"https://vtop.vit.ac.in/vtop/" +
			(await vtop.evaluate((urlText: string) => {
				urlText = urlText.replace("javascript:vtopDownload('", "").replace("')", "");
				// @ts-ignore: Property 'vtopDownload' does not exist on type 'Window & typeof globalThis'.
				return window.vtopDownload(urlText);
			}, urlText))
		);
	}
};

export default {
	async main(vtop: Page, semester: Semester, course: Course, assignment: Assignment) {
		logger("Starting!");
		if (assignment.questionPaper) {
			logger(`Downloading question paper for ${course.courseCode} - ${course.courseTitle} - ${assignment.title}!`);
			assignment.questionPaper = await internal.getDownloadLink(vtop, assignment.questionPaper);
		}
		if (assignment.solutionPaper) {
			logger(`Downloading solution paper for ${course.courseCode} - ${course.courseTitle} - ${assignment.title}!`);
			assignment.solutionPaper = await internal.getDownloadLink(vtop, assignment.solutionPaper);
		}
		await directory.download(semester, course, assignment);
		logger("Done!");
		return assignment;
	}
};
