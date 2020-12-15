/*
 * Copyright (c) 2016-2020  Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK Runtime.
 * 
 *   The Moddable SDK Runtime is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Lesser General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 * 
 *   The Moddable SDK Runtime is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Lesser General Public License for more details.
 * 
 *   You should have received a copy of the GNU Lesser General Public License
 *   along with the Moddable SDK Runtime.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import config from "mc/config";
import Time from "time";
import WiFi from "wifi";
import Net from "net";
import SNTP from "sntp";
import Preference from "preference";

export default function (done) {
	if (Date.now() >= 1_587_250_153_000)		// time already set
		return done();

	if (1 !== WiFi.mode)
		WiFi.mode = 1;

	if (Net.get("IP"))						// network already connected
		return getTime(done);

	const ssid = Preference.get("config", "ssid") ?? config.ssid;
	if (!ssid) {
		trace("No Wi-Fi SSID\n");
		return done();
	}

	const password = Preference.get("config", "password") ?? config.password;
	let monitor = new WiFi({ssid, password}, function(msg, code) {
	   switch (msg) {
		   case WiFi.gotIP:
				trace(`Wi-Fi: got IP\n`);

				monitor = monitor.close();
				getTime(done);
				break;

			case WiFi.connected:
				trace(`Wi-Fi: connected\n`);
				break;

			case WiFi.disconnected:
				trace((-1 === code) ? "Wi-Fi: password rejected\n" : "Wi-Fi: disconnected\n");
				break;
		}
	});
}

function getTime(done) {
	const host = Preference.get("config", "sntp") ?? config.sntp;
	if (!host)
		return done();

	new SNTP({host}, function(message, value) {
		if (1 === message)
			Time.set(value);
		else if (message < 0)
			trace("can't get time\n");
		else
			return;
		done();
	});
}
