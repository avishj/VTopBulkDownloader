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

import puppeteer, { Browser, Page } from "puppeteer";
import { Context } from "./enums.js";
import log from "./log.js";
import helpers from "./helpers.js";

const logger = log.logger.bind(null, Context.Setup);

let browser: Browser;

const internal = {
	async init() {
		logger("Launching the browser!");
		browser = await puppeteer.launch({
			headless: false,
			args: [`--start-maximized`]
		});
		logger("Creating a new page!");
		const vtop = await browser.newPage();
		logger("Setting the viewport!");
		await vtop.setViewport({
			width: await vtop.evaluate(() => window.screen.width),
			height: await vtop.evaluate(() => window.screen.height)
		});
		logger("Exposing functions!");
		vtop.exposeFunction("sanitize", helpers.sanitize);
		return vtop;
	},
	async navigateToLoginPage(vtop: Page) {
		logger("Navigating to VTop!");
		await vtop.goto("https://vtop.vit.ac.in/vtop/");
		await vtop.waitForNetworkIdle();
		logger("Navigating to Student Login!");
		await vtop.evaluate(`submitForm('stdForm');`); // String Literal as a workaround for the fact that the function is only available in the browser
	},
	async login(vtop: Page, username: string, password: string) {
		logger("Entering login details!");
		await vtop.waitForNetworkIdle();
		await vtop.waitForSelector("#username");
		await vtop.type("#username", username);
		await helpers.sleep(500);
		await vtop.waitForSelector("#password");
		await vtop.type("#password", password);
		await helpers.sleep(500);
		await vtop.evaluate(() => {
			alert("Please solve the captcha and submit the login form. The script will continue once the login request is detected.");
		});
		logger("Waiting for the captcha to be solved!");
		await new Promise<void>((resolve) =>
			vtop.on("requestfinished", (request) => {
				if (/\/login/.test(request.url())) resolve();
			})
		);
		await vtop.waitForNetworkIdle();
	},
	async navigateToDAPage(vtop: Page) {
		await vtop.waitForSelector('button[data-bs-target="#expandedSideBar"');
		await vtop.click('button[data-bs-target="#expandedSideBar"');
		logger("Navigating to the DA page!");
		await vtop.waitForSelector("i.fa-graduation-cap");
		await vtop.click("i.fa-graduation-cap");
		await vtop.waitForSelector('a[data-url="examinations/StudentDA"]');
		await helpers.sleep(1000);
		await vtop.click('a[data-url="examinations/StudentDA"]');
		await vtop.waitForNetworkIdle();
	}
};

export default {
	async main() {
		logger("Starting!");
		const vtop = await internal.init();
		await internal.navigateToLoginPage(vtop);
		await internal.login(vtop, process.env.VTOP_USERNAME!, process.env.VTOP_PASSWORD!);
		await internal.navigateToDAPage(vtop);
		logger("Done!");
		return vtop;
	},
	async destroy() {
		logger("Closing the browser!");
		await browser.close();
	}
};
