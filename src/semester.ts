import { Page } from "puppeteer";
import utils from "./utils.js";
import { Course, Semester } from "./types.js";
import { Context } from "./enums.js";
import course from "./course.js";

const logger = utils.log.bind(null, Context.Semester);

async function extractSemesters(vtop: Page): Promise<Semester[]> {
	logger("Extracting semesters!");
	const semesters = await vtop.evaluate(() => {
		const elements: HTMLOptionElement[] = Array.from(document.querySelectorAll('select[id="semesterSubId"] option[value*="VL"]'));
		return elements.map((e) => {
			return {
				name: e.innerText,
				value: e.value,
				courses: []
			};
		});
	});
	logger(`Found ${semesters.length} semesters!`);
	return semesters;
}

async function selectSemester(vtop: Page, semester: Semester): Promise<void> {
	logger(`${semester.name} is being selected!`);
	await vtop.select('select[id="semesterSubId"]', semester.value);
	logger(`${semester.name} has been selected!`);
	await vtop.waitForNetworkIdle();
}

async function hasCourses(vtop: Page, semester: Semester): Promise<boolean> {
	logger(`${semester.name} is being checked for courses!`);
	const hasCourses = await vtop.evaluate(() => {
		return document.querySelectorAll("#fixedTableContainer").length > 0;
	});
	logger(`${semester.name} has ${hasCourses ? "" : "no "}courses!`);
	return hasCourses;
}

async function extractCourses(vtop: Page, semester: Semester): Promise<Course[]> {
	logger(`${semester.name}s' courses are being extracted!`);
	const courses = await vtop.evaluate(() => {
		const courses: Course[] = [];
		document.querySelectorAll("#fixedTableContainer tr.tableContent").forEach((row) => {
			const tds = row.querySelectorAll("td");
			courses.push({
				classNumber: tds[1].innerText.trim(),
				courseCode: tds[2].innerText.trim(),
				courseTitle: tds[3].innerText.trim(),
				courseType: tds[4].innerText.trim(),
				facultyName: tds[5].innerText.trim(),
				assignments: []
			});
		});
		return courses;
	});
	logger(`${semester.name} has ${courses.length} courses!`);
	return courses;
}

export default {
	async main(vtop: Page) {
		logger("Starting!");
		const semesters = await extractSemesters(vtop);
		for (let i = 0; i < semesters.length; i++) {
			await selectSemester(vtop, semesters[i]);
			await vtop.waitForNetworkIdle();
			if (await hasCourses(vtop, semesters[i])) {
				await utils.sleep(1000);
				semesters[i].courses = await extractCourses(vtop, semesters[i]);
				for (let j = 0; j < semesters[i].courses.length; j++) {
					semesters[i].courses[j] = await course.main(vtop, semesters[i], semesters[i].courses[j]);
				}
				console.log(semesters[i]);
			} else if (i < semesters.length - 1) {
				logger("Moving on to the next semester!");
			}
			await utils.sleep(1000);
		}
		logger("Done!");
	}
};
