import { Page } from "puppeteer";
import utils from "./utils.js";
import { Course, Semester } from "./types.js";

async function extractSemesters(vtop: Page): Promise<Semester[]> {
	return await vtop.evaluate(() => {
		const elements: HTMLOptionElement[] = Array.from(document.querySelectorAll('select[id="semesterSubId"] option[value*="VL"]'));
		return elements.map((e) => {
			return {
				name: e.innerText,
				hasAssignments: null,
				value: e.value,
				courses: []
			};
		});
	});
}
async function selectSemester(vtop: Page, semester: Semester): Promise<void> {
	await vtop.select('select[id="semesterSubId"]', semester.value);
	await vtop.waitForNetworkIdle();
}
async function hasCourses(vtop: Page): Promise<boolean> {
	return await vtop.evaluate(() => {
		return document.querySelectorAll("#fixedTableContainer").length > 0;
	});
}
async function extractCourses(vtop: Page): Promise<Course[]> {
	return await vtop.evaluate(() => {
		const assignments: Course[] = [];
		document.querySelectorAll("#fixedTableContainer tr.tableContent").forEach((row) => {
			const tds = row.querySelectorAll("td");
			assignments.push({
				classNumber: tds[1].innerText.trim(),
				courseCode: tds[2].innerText.trim(),
				courseTitle: tds[3].innerText.trim(),
				courseType: tds[4].innerText.trim(),
				facultyName: tds[5].innerText.trim()
			});
		});
		return assignments;
	});
}

export default {
	async main(vtop: Page) {
		const semesters = await extractSemesters(vtop);
		for (const semester of semesters) {
			await selectSemester(vtop, semester);
			if (await hasCourses(vtop)) {
				console.log(semester + " has assignments");
				await vtop.waitForNetworkIdle();
				await utils.sleep(1000);
				const assignments = await extractCourses(vtop);
				console.log(assignments);
			} else {
				console.log(semester + " has no assignments");
			}
			await utils.sleep(1000);
		}
	}
};
