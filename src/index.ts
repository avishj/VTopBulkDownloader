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

import dotenv from "dotenv";
import setup from "./utils/setup.js";
import log from "./utils/log.js";
import output from "./modules/output.js";
import directory from "./utils/directory.js";

// Loading the environment variables
dotenv.config();

async function main() {
	const timestamp = new Date().toISOString();
	log.init(timestamp);
	directory.init();
	const vtop = await setup.main();
	await output.main(timestamp, vtop);
	await setup.destroy();
}

await main();
