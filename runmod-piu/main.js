/*
 * Copyright (c) 2016-2020 Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK.
 * 
 *   This work is licensed under the
 *       Creative Commons Attribution 4.0 International License.
 *   To view a copy of this license, visit
 *       <http://creativecommons.org/licenses/by/4.0>
 *   or send a letter to Creative Commons, PO Box 1866,
 *   Mountain View, CA 94042, USA.
 *
 */
 
import LoadMod from "loadmod";

const TextStyle = Style.template({
    font: "24px Open Sans",
    color: "black"
});
const ReadyText = Label.template($ => ({ 
	top: 20, bottom: 20, left: 20, right: 20, 
	Style: TextStyle, string: "Ready to install apps!"
}));

class AppBehavior extends Behavior {
	onCreate(app) {
		if (LoadMod.has("check")) {
			let check = LoadMod.load("check");
			check();
			if (LoadMod.has("example"))
				LoadMod.load("example");
		} else {
			app.add(new ReadyText());
		}
	}
}

export default function() {
	return new Application(null, {
		displayListLength: 8192,
		commandListLength: 4096,
		skin: new Skin({
			fill: "white"
		}),
		Behavior: AppBehavior
	});
}