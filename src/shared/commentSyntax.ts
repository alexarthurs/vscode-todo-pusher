export abstract class CommentSyntax {
	public static doubleSlash: string = "//";
	public static htmlComment: Array<string> = ["<!--", "-->"];
	public static cssComment: Array<string> = ["/*", "*/"];
	public static hashChar: string = "#";
	public static doubleDash: string = "--";
	public static default: Array<string> = [CommentSyntax.doubleSlash];

	public static mappings: { [key: string]: Array<string> } = {
		apex: [CommentSyntax.doubleSlash],
		cls: [CommentSyntax.doubleSlash],
		cs: [CommentSyntax.doubleSlash],
		cshtml: CommentSyntax.htmlComment,
		css: CommentSyntax.cssComment,
		ejs: CommentSyntax.htmlComment,
		html: CommentSyntax.htmlComment,
		java: [CommentSyntax.doubleSlash],
		js: [CommentSyntax.doubleSlash],
		jsx: [CommentSyntax.doubleSlash],
		less: [CommentSyntax.doubleSlash],
		page: CommentSyntax.htmlComment,
		php: [CommentSyntax.doubleSlash],
		py: [CommentSyntax.hashChar],
		sass: CommentSyntax.cssComment,
		scss: [CommentSyntax.doubleDash],
		sql: [CommentSyntax.doubleDash],
		sshtml: CommentSyntax.htmlComment,
		swift: [CommentSyntax.doubleSlash],
		tgr: [CommentSyntax.doubleSlash],
		ts: [CommentSyntax.doubleSlash],
		tsx: [CommentSyntax.doubleSlash],
		xml: CommentSyntax.htmlComment,
		yml: [CommentSyntax.hashChar]
	};
}
