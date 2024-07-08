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

export type Output = {
	timestamp: string;
	semesters: Semester[];
};

export type Semester = {
	name: string;
	value: string;
	courses: Course[];
};

export type Course = {
	serialNumber: number;
	classNumber: string;
	courseCode: string;
	courseTitle: string;
	courseType: string;
	facultyName: string;
	assignments: Assignment[];
};

export type Assignment = {
	serialNumber: number;
	title: string;
	maxMark: number;
	weightage: number;
	dueDate?: string;
	questionPaper?: string;
	lastUpdatedOn?: string;
	solutionPaper?: string;
};
