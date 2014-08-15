'use strict';

chrome.browserAction.onClicked.addListener(function (tab) {
	if (tab.url === 'chrome://newtab/') {
		chrome.tabs.update({url : 'http://www.writeurl.com/new'});
	} else {
		chrome.tabs.create({url : 'http://www.writeurl.com/new'});
	}
});