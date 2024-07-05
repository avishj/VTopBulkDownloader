import { Page } from "puppeteer";
import utils from "./utils.js";
import { Course, Semester } from "./types.js";
import { Context } from "./enums.js";
import course from "./course.js";

const logger = utils.log.bind(null, Context.Semester);

async function extractSemesters(vtop: Page): Promise<Semester[]> {
	logger("Extracting semesters!");
	return await vtop.evaluate(() => {
		const elements: HTMLOptionElement[] = Array.from(document.querySelectorAll('select[id="semesterSubId"] option[value*="VL"]'));
		return elements.map((e) => {
			return {
				name: e.innerText,
				value: e.value,
				courses: []
			};
		});
	});
}

async function selectSemester(vtop: Page, semester: Semester): Promise<void> {
	logger(`Selecting semester ${semester.name}!`);
	await vtop.select('select[id="semesterSubId"]', semester.value);
	await vtop.waitForNetworkIdle();
}

async function hasCourses(vtop: Page): Promise<boolean> {
	logger("Checking if the semester has courses!");
	return await vtop.evaluate(() => {
		return document.querySelectorAll("#fixedTableContainer").length > 0;
	});
}

async function extractCourses(vtop: Page): Promise<Course[]> {
	logger("Extracting courses!");
	return await vtop.evaluate(() => {
		const assignments: Course[] = [];
		document.querySelectorAll("#fixedTableContainer tr.tableContent").forEach((row) => {
			const tds = row.querySelectorAll("td");
			assignments.push({
				classNumber: tds[1].innerText.trim(),
				courseCode: tds[2].innerText.trim(),
				courseTitle: tds[3].innerText.trim(),
				courseType: tds[4].innerText.trim(),
				facultyName: tds[5].innerText.trim(),
				assignments: []
			});
		});
		return assignments;
	});
}

export default {
	async main(vtop: Page) {
		logger("Starting!");
		const semesters = await extractSemesters(vtop);
		for (let i = 0; i < semesters.length; i++) {
			await selectSemester(vtop, semesters[i]);
			await vtop.waitForNetworkIdle();
			if (await hasCourses(vtop)) {
				logger(`${semesters[i].name} has courses!`);
				await utils.sleep(1000);
				semesters[i].courses = await extractCourses(vtop);
				for (let j = 0; j < semesters[i].courses.length; j++) {
					semesters[i].courses[j] = await course.main(vtop, semesters[i], semesters[i].courses[j]);
				}
				console.log(semesters[i]);
			} else {
				logger(`${semesters[i].name} has no courses!`);
			}
			await utils.sleep(1000);
		}
		logger("Done!");
	}
};
