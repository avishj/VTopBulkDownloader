# VTop Bulk Downloader

An easy way to download your VTop DA's in bulk. Downloads all your semesters' question papers, uploaded assignments, and all associated metadata, neatly organized in a tree like folder structure.

## Usage

1. Clone this repository to your computer.
2. Run `npm install` to install all dependencies.
3. Create a `.env` file in the root directory of the project with the following contents:

```
VTOP_USERNAME=<your VTop username>
VTOP_PASSWORD=<your VTop password>
```
4. Run `npm run start` to compile the TypeScript code and start the program.
5. An automated browser window will open, prompting you to log in to your VTop account.
6. The credentials you entered in the `.env` file will be used to log in.
7. You will be prompted to solve a CAPTCHA. (Optional)
8. After logging in, you can let the program run for a while to download all your data.
9. You can monitor the progress of the download in the `$ console` or via the `output/*.log` file.
10. The program will automatically exit once it has finished downloading all your data.

## Output

Below is an example of the output folder structure:

```
output
├── semester_1
│   ├── course_1
│   │   ├── <Index> - Question - <DA Name>.<File Extension>
│   │   ├── <Index> - Solution - <DA Name>.<File Extension>
│   │   └── course.json
│   │   └── ...
│   ├── course_2
│   │   ├── <Index> - Question - <DA Name>.<File Extension>
│   │   ├── <Index> - Solution - <DA Name>.<File Extension>
│   │   └── course.json
│   │   └── ...
│   ├── semester.json
│   └── ...
├── semester_2
│   ├── course_1
│   │   ├── <Index> - Question - <DA Name>.<File Extension>
│   │   ├── <Index> - Solution - <DA Name>.<File Extension>
│   │   └── course.json
│   │   └── ...
│   ├── semester.json
│   └── ...
├── <DateTime>.log
└── output.json

- Question papers are named as <Index> - Question - <DA Name>.<File Extension>.
- Solution papers are named as <Index> - Solution - <DA Name>.<File Extension>.
- Course.json holds the metadata of the course.
    - serialNumber: The serial number of the course. (eg. 1)
    - classNumber: The class number of the course. (eg. VL2020210106391)
    - courseCode: The course code of the course. (eg. CHY1701)
    - courseTitle: The title of the course. (eg. Environmental Sciences)
    - courseType: The type of the course. (eg. TH)
    - facultyName: The name of the faculty teaching the course. (eg. AMIT KUMAR TIWARI - SAS)
    - assignments: The list of assignments in the course.
        - serialNumber: The serial number of the assignment. (eg. 1)
        - title: The title of the assignment. (eg. Assignment 1)
        - maxMark: The maximum mark of the course. (eg. 10)
        - weightage: The weightage of the assignment. (eg. 10 (%))
        - questionPaper: The path to the question paper. (eg. output/Fall Semester 2020-21/CHY1002 - Environmental Sciences - TH/2 - Question - Digital Assignment - II.pdf)
        - dueDate: The due date of the assignment. (eg. 04-Dec-2020)
        - lastUpdatedOn: The last updated date of the assignment. (eg. 04 Dec 2020 02:03 PM)
        - solutionPaper: The path to the solution paper. (eg. output/Fall Semester 2020-21/CHY1002 - Environmental Sciences - TH/2 - Solution - Digital Assignment - II.pdf)
- Semester.json hold the metadata of the semester.
- DateTime.log is the log file of the program.
- Output.json is the metadata of all the semesters.

```