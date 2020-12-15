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
import WiFi from "wifi";
import Net from "net";
import Preference from "preference";

const TextStyle = Style.template({
    font: "24px Open Sans",
    color: "black",
});

class AppBehavior extends Behavior {
	onCreate(app) {
		const ssid = Preference.get("wifi", "ssid");
		const password = Preference.get("wifi", "password");

		if (!LoadMod.has("check") || !LoadMod.has("example")) {
			app.first.string = "App running. Ready to install mod.";
			return;
		}

		if (!ssid) {
			app.first.string = "Wi-Fi SSID not set.";
			return;
		}

		(LoadMod.load("check"))();

		app.first.string =  `Connecting to "${ssid}"`;
		let monitor = new WiFi({ssid, password}, function(msg, code) {
			switch (msg) {
				case "gotIP":
					app.first.string = `IP address ${Net.get("IP")}`;
					monitor.close();
					LoadMod.load("example");
					break;

				case "connect":
					app.first.string = `Wi-Fi connected to "${Net.get("SSID")}"`;
					break;

				case "disconnect":
					app.first.string = (-1 === code) ? "Wi-Fi password rejected\n" : "Wi-Fi disconnected\n";
					break;
			}
		});
		}
}

export default function() {
	return new Application(null, {
		displayListLength: 5632, commandListLength: 3072,
		skin: new Skin({ fill: "white" }),
		contents: [
			Text(null, {
				top: 80, left: 20, right: 20,
				Style: TextStyle
			})
		],
		Behavior: AppBehavior
	});
}
