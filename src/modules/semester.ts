/**
 *
 * @author Avish Jha <avish.j@protonmail.com>
 * @copyright Copyright (c) 2024 Avish Jha <avish.j@protonmail.com>
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { Page } from "puppeteer";
import { Course, Semester } from "../utils/types.js";
import { Context } from "../utils/enums.js";
import course from "./course.js";
import log from "../utils/log.js";
import directory from "../utils/directory.js";
import helpers from "../utils/helpers.js";

const logger = log.logger.bind(null, Context.Semester);

const internal = {
	async extractCourses(vtop: Page, semester: Semester): Promise<Course[]> {
		logger(`${semester.name}'s courses are being extracted!`);
		const courses = await vtop.evaluate(async () => {
			const courses: Course[] = [];
			const rows = document.querySelectorAll("#fixedTableContainer tr.tableContent");
			for (let i = 0; i < rows.length; i++) {
				const tds = rows[i].querySelectorAll("td");
				courses.push({
					serialNumber: Number(tds[0].innerText.trim()),
					// @ts-ignore
					classNumber: await sanitize(tds[1].innerText.trim()),
					// @ts-ignore
					courseCode: await sanitize(tds[2].innerText.trim()),
					// @ts-ignore
					courseTitle: await sanitize(tds[3].innerText.trim()),
					// @ts-ignore
					courseType: await sanitize(tds[4].innerText.trim()),
					// @ts-ignore
					facultyName: await sanitize(tds[5].innerText.trim()),
					assignments: []
				});
			}
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
			console.log(semester.courses);
			for (let j = 0; j < semester.courses.length; j++) {
				semester.courses[j] = await course.main(vtop, semester, semester.courses[j]);
			}
			await directory.semester.write(semester);
		} else if (!isLast) {
			logger("Moving on to the next semester!");
		}
		logger("Done!");
		return semester;
	}
};
