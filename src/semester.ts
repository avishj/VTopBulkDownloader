import { Page } from "puppeteer";
import { Course, Semester } from "./utils/types.js";
import { Context } from "./utils/enums.js";
import course from "./course.js";
import log from "./utils/log.js";
import directory from "./directory.js";

const logger = log.logger.bind(null, Context.Semester);

const internal = {
	async extractCourses(vtop: Page, semester: Semester): Promise<Course[]> {
		logger(`${semester.name}'s courses are being extracted!`);
		const courses = await vtop.evaluate(() => {
			const courses: Course[] = [];
			document.querySelectorAll("#fixedTableContainer tr.tableContent").forEach((row) => {
				const tds = row.querySelectorAll("td");
				courses.push({
					serialNumber: Number(tds[0].innerText.trim()),
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
	},
	async hasCourses(vtop: Page, semester: Semester): Promise<boolean> {
		logger(`${semester.name} is being checked for courses!`);
		const hasCourses = await vtop.evaluate(() => {
			return document.querySelectorAll("#fixedTableContainer").length > 0;
		});
		logger(`${semester.name} has ${hasCourses ? "" : "no "}courses!`);
		return hasCourses;
	}
};

export default {
	async main(vtop: Page, semester: Semester, isLast: boolean) {
		logger("Starting!");
		if (await internal.hasCourses(vtop, semester)) {
			directory.semester.create(semester);
			semester.courses = await internal.extractCourses(vtop, semester);
			for (let j = 0; j < semester.courses.length; j++) {
				semester.courses[j] = await course.main(vtop, semester, semester.courses[j]);
			}
		} else if (!isLast) {
			logger("Moving on to the next semester!");
		}
		await directory.semester.write(semester);
		logger("Done!");
		return semester;
	}
};
