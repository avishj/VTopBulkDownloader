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
import log from "../../utils/log.js";
import { Context } from "../../utils/enums.js";
import { Assignment, Course, Semester } from "../../utils/types.js";
import directory from "../../utils/directory.js";

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
		await directory.assignment.download(vtop, semester, course, assignment);
		logger("Done!");
		return assignment;
	}
};
