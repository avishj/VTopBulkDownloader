import { Page } from "puppeteer";
import { Context } from "./utils/enums.js";
import { Output, Semester } from "./utils/types.js";
import log from "./utils/log.js";
import directory from "./directory.js";
import helpers from "./utils/helpers.js";
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
