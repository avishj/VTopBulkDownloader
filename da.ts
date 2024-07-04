import { Page } from "puppeteer";

export default {
	semester: {
		async extractAll(vtop: Page) {
			return await vtop.evaluate(() => {
				return (Array.from(document.querySelectorAll('select[id="semesterSubId"] option[value*="VL"]')) as HTMLOptionElement[]).map((e) => e.value);
			});
		},
		async select(vtop: Page, value: string) {
			await vtop.select('select[id="semesterSubId"]', value);
			await vtop.waitForNetworkIdle();
		},
		async hasAssignments(vtop: Page) {}
	}
};
