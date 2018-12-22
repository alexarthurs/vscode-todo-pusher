var open = require('open');

export function createJiraTokenCmd(): void {
	open("https://id.atlassian.com/manage/api-tokens");	
}
