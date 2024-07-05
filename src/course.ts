import { Page } from "puppeteer";
import { Assignment, Course, Semester } from "./types.js";
import utils from "./utils.js";
import { Context } from "./enums.js";

const logger = utils.log.bind(null, Context.Course);

async function navigateTo(vtop: Page, course: Course): Promise<void> {
	logger(`Navigating to ${course.courseCode} - ${course.courseTitle}!`);
	await vtop.waitForNetworkIdle();
	await vtop.evaluate(`myFunction('${course.classNumber}');`);
}

async function extractAssignments(vtop: Page, course: Course): Promise<Assignment[]> {
	logger(`Downloading assignments for ${course.courseCode} - ${course.courseTitle}!`);
	await vtop.waitForNetworkIdle();
	return await vtop.evaluate(() => {
		const assignments: Assignment[] = [];
		document.querySelectorAll("#fixedTableContainer:nth-of-type(2) tr.tableContent").forEach((row) => {
			const tds = row.querySelectorAll("td");
			assignments.push({
				title: tds[1].innerText.trim(),
				maxMark: Number(tds[2].innerText.trim()),
				weightage: Number(tds[3].innerText.trim()),
				questionPaper: tds[5]?.querySelector("a")?.href,
				dueDate: tds[4]?.querySelector("span")?.innerText.trim(),
				lastUpdatedOn: tds[6]?.querySelector("span")?.innerText.trim(),
				solutionPaper: tds[7]?.querySelector("a")?.href
			});
		});
		return assignments;
	});
}

async function goBack(vtop: Page, semester: Semester): Promise<void> {
	logger(`Going back to ${semester.name}!`);
	await vtop.waitForNetworkIdle();
	await vtop.evaluate(`reload('${semester.value}');`);
}

export default {
	async main(vtop: Page, semester: Semester, course: Course): Promise<Course> {
		logger(`Starting downloading assignments for ${semester.name} - ${course.courseCode} - ${course.courseTitle}!`);
		await navigateTo(vtop, course);
		course.assignments = await extractAssignments(vtop, course);
		console.log(course.assignments);
		await goBack(vtop, semester);
		logger(`Done downloading assignments for ${semester.name} - ${course.courseCode} - ${course.courseTitle}!`);
		return course;
	}
};
