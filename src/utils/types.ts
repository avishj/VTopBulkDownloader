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
