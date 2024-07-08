import { Page } from "puppeteer";
import { Assignment, Course, Semester } from "./utils/types.js";
import { Context } from "./utils/enums.js";
import log from "./utils/log.js";
import directory from "./directory.js";
import assignment from "./assignment.js";

const logger = log.logger.bind(null, Context.Course);

const internal = {
	async navigateTo(vtop: Page, course: Course): Promise<void> {
		logger(`Navigating to ${course.courseCode} - ${course.courseTitle}!`);
		await vtop.waitForNetworkIdle();
		await vtop.evaluate(`myFunction('${course.classNumber}');`);
	},
	async extractAssignments(vtop: Page, course: Course): Promise<Assignment[]> {
		logger(`Downloading assignments for ${course.courseCode} - ${course.courseTitle}!`);
		await vtop.waitForNetworkIdle();
		return await vtop.evaluate(() => {
			const assignments: Assignment[] = [];
			Array.from(document.querySelectorAll(".fixedTableContainer tr.tableContent"))
				.slice(1)
				.forEach((row) => {
					const tds = row.querySelectorAll("td");
					assignments.push({
						serialNumber: Number(tds[0].innerText.trim()),
						title: tds[1].innerText.trim(),
						maxMark: Number(tds[2].innerText.trim()),
						weightage: Number(tds[3].innerText.trim()),
						questionPaper: tds[5]?.querySelector("a")?.href,
						dueDate: tds[4]?.querySelector("span")?.innerText.trim(),
						lastUpdatedOn: tds[6]?.querySelector("span")?.innerText.trim(),
						solutionPaper: tds[8]?.querySelector("a")?.href
					});
				});
			return assignments;
		});
	},
	async goBack(vtop: Page, semester: Semester): Promise<void> {
		logger(`Going back to ${semester.name}!`);
		await vtop.waitForNetworkIdle();
		await vtop.evaluate(`reload('${semester.value}');`);
	},
	async modifyVtopDownload(vtop: Page) {
		logger("Overriding vtopDownload function!");
		await vtop.evaluate(`eval(eval(window.vtopDownload.toString().replace("window.open(urlText + '?' + params);", "return urlText + '?' + params;").replace("$.unblockUI();", "")));`);
	}
};

export default {
	async main(vtop: Page, semester: Semester, course: Course): Promise<Course> {
		logger("Starting!");
		directory.course.create(semester, course);
		logger(`Starting downloading assignments for ${semester.name} - ${course.courseCode} - ${course.courseTitle}!`);
		await internal.navigateTo(vtop, course);
		await internal.modifyVtopDownload(vtop);
		course.assignments = await internal.extractAssignments(vtop, course);
		for (let i = 0; i < course.assignments.length; i++) {
			course.assignments[i] = await assignment.main(vtop, semester, course, course.assignments[i]);
		}
		await internal.goBack(vtop, semester);
		logger(`Downloaded assignments for ${semester.name} - ${course.courseCode} - ${course.courseTitle}!`);
		await directory.course.write(semester, course);
		logger("Done!");
		return course;
	}
};
