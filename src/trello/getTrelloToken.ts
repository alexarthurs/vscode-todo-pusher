import { Constants } from "../shared/constants";
var open = require('open');

export function getTrelloTokenCmd(): void {
	let authUrl = `${Constants.TRELLO_BASE_URL}/authorize?expiration=never&name=${Constants.APP_NAME}&scope=read,write&response_type=token&key=${Constants.TRELLO_API_KEY}`;
	open(authUrl);	
}
