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

import { Request } from "http";

const BACKGROUND_COLOR = "#1932ab";
const TEXT_COLOR = "white";

const backgroundSkin = new Skin({ fill:BACKGROUND_COLOR });
const largeTextStyle = new Style({ font: "52px Open Sans", color: TEXT_COLOR });

class ClockBehavior extends Behavior {
	onDisplaying(label) {
		this.update(label);
		label.interval = 1000;
		this.state = 0;
		label.start();
	}
	onTimeChanged(label) {
		this.update(label);
	}
	update(label) {
		this.state = !this.state;
		let d = new Date();
		let hours = d.getHours();
		if (hours < 0) hours += 24;
		let minutes = d.getMinutes();
		if (hours == 0) {
			hours = 12;
		} else if (hours > 12) {
			hours -= 12;
		}
	  	let string = hours.toString();
	  	if (this.state) 
	  		string += ":";
	  	else
	  		string += " ";
	  	if (minutes < 10) string += "0";
	  	string += minutes.toString();
		label.string = string;
	}
}

const Clock = Label.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0,
	skin: backgroundSkin, style: largeTextStyle,
	Behavior: ClockBehavior
}));

application.add(new Clock);