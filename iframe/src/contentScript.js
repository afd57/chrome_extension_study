'use strict';
import { log } from './common/utils'
// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page

function addIframe() {
    const iframe = document.createElement('iframe');
    iframe.addEventListener('load', () => {
        iframe.contentWindow.postMessage({
            eventName: 'init',
            iframeSrc: 'https://stackoverflow.com/questions/6570363/chrome-extension-content-scripts-and-iframe' // whatever url you want. Probably will be a URL to your own domain in practice
        }, '*');
    }, false);
    iframe.src = chrome.runtime.getURL('iframe.html');

    function messageHandler(event) {
        if (event.source !== iframe) return;
        console.log('got message from iframe', event.data);
    }
    // If you remove the iframe from the page later, make sure you remove this listener too! Otherwise if this function is
    // called many times over a session, you'll have a memory leak of more and more listeners being added to the page.
    window.addEventListener('message', messageHandler);

    document.body.appendChild(iframe);
}
const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
log(
    `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

// Communicate with background file by sending a message
chrome.runtime.sendMessage({
        type: 'GREETINGS',
        payload: {
            message: 'Hello, my name is Con. I am from ContentScript.',
        },
    },
    response => {
        log(response.message);
    }
);

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'COUNT') {
        log(`Current count is ${request.payload.count}`);
        addIframe();
    }

    // Send an empty response
    // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
    sendResponse({});
    return true;
});