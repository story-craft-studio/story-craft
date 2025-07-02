
import { HtmlValidate } from "html-validate";
import _ from "lodash";

export async function replaceDom(html: string) {
	// Blast JS globals.

	delete (window as any).CodeMirror;
	delete (window as any).SVG;
	delete (window as any).Store;
	delete (window as any).StoryFormat;
	delete (window as any).amdDefine;
	delete (window as any).app;
	delete (window as any).jQuery;

	// Rewrite the document.


	const htmlvalidate = new HtmlValidate();
	let result = await htmlvalidate.validateString(html, "my-file.html")
	const toIgnore = ['element-permitted-content', 'element-required-attributes', 'no-trailing-whitespace', 'empty-heading', 'no-inline-style', 'script-type', 'void-style'];
	if (!result.valid) {
		let messages = result.results[0]?.messages;
		messages = messages?.filter(anyM => !_.includes(toIgnore, anyM.ruleId));
		if (messages.length)
			console.warn('html to write ', html, 'has problem', messages);
	}

	document.open();
	try {
		document.write(html);
	}
	catch (e) {
		console.log('write DOM error', e, JSON.stringify(e));
	}
	document.close();
}
