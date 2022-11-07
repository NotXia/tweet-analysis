export function removeEmojis(sentence, replace_string=" ") {
    return sentence.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, replace_string);
}

export function removeURLs(sentence, replace_string=" ") {
    return sentence.replace(/(?:https?|ftp|http):\/\/[\n\S]+/g, replace_string);
}

export function removeNewLine(sentence, replace_string=" ") {
    return sentence.replace(/(\r\n|\n|\r)/gm, replace_string);
}

export function removeMultipleSpaces(sentence, replace_string=" ") {
    return sentence.replace( /\s\s+/g, replace_string);
}