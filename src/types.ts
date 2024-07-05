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
