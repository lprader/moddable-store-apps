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
const whiteSkin = new Skin({ 
	fill: "white", stroke: ["white", "black"],
	borders: { top: 1, bottom: 1, right: 1, left: 1 },
})
const OpenSans24 = new Style({ font: "open-sans-24-reg", color: "black" });

const cookieTexture = new Texture("fortune-cookie.png");
const cookieSkin = new Skin({ texture: cookieTexture, width: 250, height: 118 });

const fortunes = [
	"Your resemblance to a muppet will prevent the world from taking you seriously",
	"You will be hungry again in one hour",
	"Next time order the shrimp",
	"What's that in your eye? Oh...it's a sparkle",
	"I cannot help you, I am just a cookie",
	"Cookie said: 'You crack me up.'",
	"The fortune you seek is in another cookie",
	"Ignore previous cookie",
	"Keep your goals away from the trolls",
	"When the moment comes take the last one from the left",
	"If your cookie is in 3 pieces the answer is no",
	"Error 404: Fortune not found",
	"Rizaeling you can raed this mepsislled fnurote wlil be the hgihgliht if yuor day.",
	"You seek to find meaning from a little slip of paper inside a little cookie. You are gullible.",
	"Don't play leap frog with a unicorn",
	"The road to riches is paved with homework",
]

class ScrollingBehavior extends Behavior {
	scroll(fortune) {
		fortune.position = { x:10, y:fortune.position.y };
		fortune.interval = 250;
		fortune.start();
	}
	onTimeChanged(fortune) {
		let currX = fortune.position.x;
		if (currX > -fortune.width) {
			fortune.position = { x: currX-50, y:fortune.position.y };
		} else {
			fortune.stop();
			fortune.first.delegate("newFortune");
		}
	}
}

class FortuneBehavior extends Behavior {
	onCreate(label, data) {
		this.data = data;
	}
	onDisplaying(label) {
		this.update(label);
	}
	newFortune(label) {
		label.duration = 2000;
		label.time = 0;
		label.start();
	}
	onFinished(label) {
		this.update(label);
	}
	update(label) {
		let index = Math.floor(Math.random() * fortunes.length-1);  
		label.string = fortunes[index];
		label.container.delegate("scroll");
	}
}

let FortuneCookieApplication = Container.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0, skin: whiteSkin,
	contents: [
		Content($, { top: 30, skin: cookieSkin }),
		Container($, {
			left: 10, top: 10, skin: whiteSkin, state: 1, 
			contents: [
				Label($, {
					top: 10, bottom: 10, left: 15, right: 15, 
					style: OpenSans24, string: "",
					Behavior: FortuneBehavior
				}),
			],
			Behavior: ScrollingBehavior
		}),
	],
}));


export default new FortuneCookieApplication({});
