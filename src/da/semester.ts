import { Page } from "puppeteer";
import utils from "../utils.js";

async function extractAllSemesters(vtop: Page) {
	return await vtop.evaluate(() => {
		return (Array.from(document.querySelectorAll('select[id="semesterSubId"] option[value*="VL"]')) as HTMLOptionElement[]).map((e) => e.value);
	});
}
async function selectSemester(vtop: Page, value: string) {
	await vtop.select('select[id="semesterSubId"]', value);
	await vtop.waitForNetworkIdle();
}
async function hasAssignments(vtop: Page) {
	return await vtop.evaluate(() => {
		return document.querySelectorAll("#fixedTableContainer").length > 0;
	});
}
async function extractAllAssignments(vtop: Page) {
	const e = await vtop.evaluate(() => {
		const assignments = new Map();
		document.querySelectorAll("#fixedTableContainer tr.tableContent").forEach((row) => {
			const tds = row.querySelectorAll("td");
			assignments.set(tds[0].innerText.trim(), {
				classNumber: tds[1].innerText.trim(),
				courseCode: tds[2].innerText.trim(),
				courseTitle: tds[3].innerText.trim(),
				courseType: tds[4].innerText.trim(),
				facultyName: tds[5].innerText.trim()
			});
		});
		console.log(assignments);
		return assignments;
	});
	console.log(e);
	return e;
}

export default {
	async main(vtop: Page) {
		const semesters = await extractAllSemesters(vtop);
		console.log(semesters);

		for (const semester of semesters) {
			await selectSemester(vtop, semester);
			if (await hasAssignments(vtop)) {
				console.log(semester + " has assignments");
				await vtop.waitForNetworkIdle();
				await utils.sleep(1000);
				const assignments = await extractAllAssignments(vtop);
				console.log(assignments);
			} else {
				console.log(semester + " has no assignments");
			}
			await utils.sleep(3000);
		}
	}
};
