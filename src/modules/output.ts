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
import { Context } from "../utils/enums.js";
import { Output, Semester } from "../utils/types.js";
import log from "../utils/log.js";
import directory from "../utils/directory.js";
import helpers from "../utils/helpers.js";
import semester from "./semester.js";

const logger = log.logger.bind(null, Context.Output);

const internal = {
	async extractSemesters(vtop: Page): Promise<Semester[]> {
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
		await vtop.waitForNetworkIdle();
		return semesters;
	},
	async selectSemester(vtop: Page, semester: Semester): Promise<void> {
		await vtop.waitForNetworkIdle();
		logger(`${semester.name} - ${semester.value} is being selected!`);
		await vtop.select('select[id="semesterSubId"]', semester.value);
		logger(`${semester.name} - ${semester.value} has been selected!`);
		await vtop.waitForNetworkIdle();
	}
};

export default {
	async main(timestamp: string, vtop: Page) {
		logger("Starting!");
		directory.output.create();
		const output: Output = {
			timestamp: timestamp,
			semesters: []
		};
		output.semesters = await internal.extractSemesters(vtop);
		for (let i = 0; i < output.semesters.length; i++) {
			await internal.selectSemester(vtop, output.semesters[i]);
			output.semesters[i] = await semester.main(vtop, output.semesters[i], i === output.semesters.length - 1);
			await helpers.sleep(1000);
		}
		await directory.output.write(output);
		logger("Done!");
	}
};
