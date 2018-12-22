type TrelloToDo = {
	title: string;
	description: string;
	boards: Array<PickerItem>;
	selectedBoard: PickerItem;	
	lists: Array<PickerItem>;
	selectedList: PickerItem;
	labels: Array<PickerItem>;
	selectedLabels: Array<PickerItem>;
	url: string;
};
