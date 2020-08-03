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
import Poco from "commodetto/Poco";
import Resource from "Resource";
import parseBMF from "commodetto/parseBMF";

export default function () {
	let poco = new Poco(screen);
	let regular16 = parseBMF(new Resource("OpenSans-Regular-16.bf4"));
	let white = poco.makeColor(255, 255, 255);
	let black = poco.makeColor(0, 0, 0);
	poco.begin();
		poco.fillRectangle(white, 0, 0, poco.width, poco.height);
		poco.drawText("Commodetto app running.", regular16, black, 19, 135);
		poco.drawText("Ready to install mod.", regular16, black, 38, 152);
	poco.end();

	if (LoadMod.has("check")) {
		let check = LoadMod.load("check");
		check();
		if (LoadMod.has("example"))
			LoadMod.load("example");
	} else {
		trace("Commodetto app running. Ready to install mod.\n");
	}
}