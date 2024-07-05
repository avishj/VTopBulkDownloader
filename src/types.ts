export type Semester = {
	name: string;
	value: string;
	courses: Course[];
};

export type Course = {
	classNumber: string;
	courseCode: string;
	courseTitle: string;
	courseType: string;
	facultyName: string;
};

export type Assignment = {
	title: string;
	maxMark: number;
	weightage: number;
	dueDate: string;
	questionPaper?: string;
	lastUpdatedOn?: string;
	solutionPaper?: string;
};
