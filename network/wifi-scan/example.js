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


import WiFi from "wifi";

const accessPoints = [];

WiFi.mode = 1;

function scan() {
	WiFi.scan({}, accessPoint => {
		if (accessPoint) {
			if (!accessPoints.find(value => accessPoint.ssid == value)) {
				accessPoints.push(accessPoint.ssid);
				trace(` "${accessPoint.ssid}", channel ${accessPoint.channel}, RSSI ${accessPoint.rssi}\n`);
			}
		}
		else
			scan();
	});
}

trace("Start scan\n");
scan();
