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
const blackSkin = new Skin({ fill: "black" })

const OpenSans18 = new Style({ font: "open-sans-18-reg", color: "white" });
const OpenSans32 = new Style({ font: "open-sans-32-reg", color: "white" });

const iconSkin = new Skin({ texture: new Texture("holiday.png"), width: 130, height: 122 });

class CountdownBehavior extends Behavior {
	computeDate(data) {
		const now = new Date();
		let year = now.getFullYear();
		let date;
		switch (data.holiday[0]) {
		case "c":
			do {
				date = new Date(year, 11, 25, 23, 59, 59);
				year++;
			}
			while (date.valueOf() < now.valueOf());
			break;
		case "f":
			do {
				date = new Date(year, 6, 5, 23, 59, 59);
				year++;
			}
			while (date.valueOf() < now.valueOf());
			break;
		case "l":
			do {
				date = new Date(year, 8, 1);
				let day = date.getDay();
				date = new Date(year, 8, 1 + (8 - day) % 7, 23, 59, 59);
				year++;
			}
			while (date.valueOf() < now.valueOf());
			break;
		case "m":
			do {
				date = new Date(year, 4, 31);
				let day = date.getDay();
				date = new Date(year, 4, 31 - (6 + day) % 7, 23, 59, 59);
				year++;
			}
			while (date.valueOf() < now.valueOf());
			break;
		case "t":
			do {
				date = new Date(year, 10, 1);
				let day = date.getDay();
				date = new Date(year, 10, 22 + (11 - day) % 7, 23, 59, 59);
				year++;
			}
			while (date.valueOf() < now.valueOf());
			break;
		default:
			date = now;
			break;
		}
		data.date = date;
	}
	onCreate(column, data) {
		this.data = data;
		this.computeDate(data);
		column.interval = 5000;
		column.start();
	}
	onDisplaying(column) {
		this.update(column);
	}
	onTimeChanged(column) {
		this.update(column);
	}
	update(column) {
		const data = this.data;
		const now = Date.now();
		if (data.date.valueOf() < now)
			this.computeDate(data);
		data["COUNTDOWN"].string = Math.ceil((data.date.valueOf() - now) / (24 * 60 * 60 * 1000));
	}
}

let HolidayApplication = Container.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0, skin: blackSkin,
	contents: [
		Content($, { top: 0, left: 0, skin: iconSkin }),
		Column($, {
			left: 130, right: 0,
			contents: [
				Text($, {
					left: 10, right: 10,
					style: OpenSans18, string: $.title,
				}),
				Row($, {
					top: 8,
					contents: [
						Label($, {
							anchor: "COUNTDOWN", left: 0,
							style: OpenSans32, string: "",
						}),
						Label($, {
							left: 7, top: 0,
							style: OpenSans18, string: "days",
						}),
					]
				}),
			],
			Behavior: CountdownBehavior
		})
	],
}));

export default new HolidayApplication({ holiday:'christmas', title:"Christmas" });
