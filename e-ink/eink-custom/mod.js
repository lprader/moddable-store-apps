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

const whiteSkin = new Skin({ fill: "white" })
const blackSkin = new Skin({ fill: "black" })
const OpenSans18 = new Style({ font: "open-sans-18-reg", color: "black" });
const OpenSans24 = new Style({ font: "open-sans-24-reg", color: "black" });
const OpenSans44 = new Style({ font: "open-sans-44-reg", color: "white" });

const logoTexture = new Texture("top-left-disc.png");
const logoSkin = new Skin({ texture: logoTexture, width: 91, height: 80 });

class CountdownBehavior extends Behavior {
	onCreate(application, data) {
		this.data = data;
		let string = data.date;
		if (string[0] == "D") {
			const date = new Date();
			string = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + (date.getDate() + 1);
			data.title = "Tomorrow";
		}
		data.date = new Date(string);
		application.interval = 5000;
		application.start();
	}
	onDisplaying(application) {
		const data = this.data;
		data["TITLE"].string = data.title;
		this.update(application);
	}
	onTimeChanged(application) {
		this.update(application);
	}
	update(application) {
		const data = this.data;
		const diff = (data.date.valueOf() - Date.now()) / (24 * 60 * 60 * 1000);
		data["COUNTDOWN"].string = (diff < 0) ? 0 : Math.ceil(diff);
	}
}

const CountdownApplication = Container.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0, skin: whiteSkin,
	contents: [
		Column($, { 
			top: 0, bottom: 0, left: 0, right: 0,
			contents: [
				Container($, {
					top: 0, bottom: 0, left: 0, right: 0,
					contents: [
						Content($, { top: 0, left: 0, skin: logoSkin }),
						Label($, {
							anchor: "COUNTDOWN", top: 5, height: 44, left: 0, width: 85,
							skin: blackSkin, style: OpenSans44, string: "",
						}),
						Label($, {
							top: 7, left: 97,
							style: OpenSans18, string: "days",
						}),
					]
				}),
				Text($, { 
					anchor: "TITLE", height: 36, left: 0, right: 0,
					style: OpenSans24
				}),
			]
		}),
	],
	Behavior: CountdownBehavior
}));


export default new CountdownApplication({"date":"DATE","title":"EVENT"});
