'use strict';
// This file and iframe.html must be listed in the extension's manifest.json under the web_accessible_resources section

let parentOrigin;
let iframe;

window.addEventListener('message', function(event) {
    if (iframe && event.source === iframe.contentWindow) {
        const message = { innerFrameData: event.data };
        const transferableList = event.data && event.data.transferableList;
        window.parent.postMessage(message, parentOrigin, transferableList);
    } else if (event.origin.match(/^https:\/\/\w+\.stackoverflow\.com$/)) { // needs to match url of the site your extension puts the iframe in
        if (event.data.eventName === 'init') {
            parentOrigin = event.origin;
            setupIFrame(event.data.iframeSrc);
        } else {
            iframe.contentWindow.postMessage({ parentOrigin, parentData: event.data }, '*', event.data.transferableList);
        }
    } else {
        throw new Error('Message from unknown source');
    }
});

function setupIFrame(src) {
    iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.setAttribute('style', 'height: 100%; width: 100%; border: 0; margin: 0;');
    iframe.addEventListener('load', () => {
        window.parent.postMessage({ eventName: 'innerFrameLoaded' }, parentOrigin);
    }, false);
    document.body.appendChild(iframe);
}