
function printTag(tag, padding = 0) {
    outputResult(padding, tag);

    Array.from(tag.childNodes)
        .forEach(el => printTag(el, padding + 1));

}

function printTag1(tag, padding = 0) {
    outputResult(padding, tag);

    let child = tag.firstChild;

    if (child) {
        printTag1(child, padding + 1);
    }

    let sibling = tag.nextSibling

    if (sibling) {
        printTag1(sibling, padding);
    }
}

function printTag2(tag, padding = 0) {
    outputResult(padding, tag);

    let child = tag.lastChild;

    if (child) {
        printTag2(child, padding + 1);
    }

    let sibling = tag.previousSibling

    if (sibling) {
        printTag2(sibling, padding);
    }
}



function outputResult(padding, tag) {
    let pad = "   ".repeat(padding);
    console.log(`${pad} ${tag.nodeType} ${tag.nodeName} ${tag.nodeValue}`);
}

function logTree() {
    printTag(document.documentElement);
}

function logTree1() {
    printTag1(document.documentElement);
}

function logTree2() {
    printTag1(document.documentElement);
}
