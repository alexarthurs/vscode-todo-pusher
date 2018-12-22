interface JiraToDo {
	selectedIssueType: PickerItem;
	issueTypes: Array<PickerItem>;
	summary: string;
	description: string;
	projects: Array<IProject>;
	selectedProject: IProject;
	url: string;
}

interface IProject {
	key: string;
	expand: string;
	self: string;
	id: string;
	name: string;
}

interface CreateIssue {
	fields: Fields;
}

interface Fields {
	project: Project;
	summary: string;
	description: string;
	issuetype: Issuetype;
}

interface Issuetype {
	name: string;
}

interface Project {
	key: string;
}

interface CreateIssueResponse {
	id: string;
	key: string;
	self: string;
}
