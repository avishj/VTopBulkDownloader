import { Page } from "puppeteer";

export default {
	semester: {
		async extractAllSemesters(vtop: Page) {
			return await vtop.evaluate(() => {
				return (Array.from(document.querySelectorAll('select[id="semesterSubId"] option[value*="VL"]')) as HTMLOptionElement[]).map((e) => e.value);
			});
		},
		async selectSemester(vtop: Page, value: string) {
			await vtop.select('select[id="semesterSubId"]', value);
			await vtop.waitForNetworkIdle();
		},
		async hasAssignments(vtop: Page) {
			return await vtop.evaluate(() => {
				return document.querySelectorAll("#fixedTableContainer").length > 0;
			});
		},
		async extractAllAssignments(vtop: Page) {
			return await vtop.evaluate(() => {
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
				return assignments;
			});
		}
	}
	// assignment: {
	// 	aysnc
	// }
};
