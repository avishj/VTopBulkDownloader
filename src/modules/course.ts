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
import { Assignment, Course, Semester } from "../utils/types.js";
import { Context } from "../utils/enums.js";
import log from "../utils/log.js";
import directory from "../utils/directory.js";
import assignment from "../modules/assignment.js";
import helpers from "../utils/helpers.js";

const logger = log.logger.bind(null, Context.Course);

const internal = {
	async navigateTo(vtop: Page, course: Course): Promise<void> {
		await vtop.waitForNetworkIdle();
		logger(`Navigating to ${course.courseCode} - ${course.courseTitle}!`);
		await vtop.evaluate(`myFunction('${course.classNumber}');`);
		await vtop.waitForNetworkIdle();
	},
	async extractAssignments(vtop: Page, course: Course): Promise<Assignment[]> {
		logger(`Downloading assignments for ${course.courseCode} - ${course.courseTitle}!`);
		await vtop.waitForNetworkIdle();
		return await vtop.evaluate(async () => {
			const assignments: Assignment[] = [];
			const rows = document.querySelectorAll(".fixedTableContainer tr.tableContent");
			for (let i = 1; i < rows.length; i++) {
				const tds = rows[i].querySelectorAll("td");
				assignments.push({
					serialNumber: Number(tds[0].innerText.trim()),
					// @ts-ignore
					title: await sanitize(tds[1].innerText.trim()),
					maxMark: Number(tds[2].innerText.trim()),
					weightage: Number(tds[3].innerText.trim()),
					questionPaper: tds[5]?.querySelector("a")?.href,
					dueDate: tds[4]?.querySelector("span")?.innerText.trim(),
					lastUpdatedOn: tds[6]?.querySelector("span")?.innerText.trim(),
					solutionPaper: tds[8]?.querySelector("a")?.href
				});
			}
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
		await helpers.sleep(1000);
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
