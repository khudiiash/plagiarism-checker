export const sentenceRE = /(?<!\()[A-Z0-9]([a-z0-9]+)?\s.*?(?=(?:\.”|\s\(.*\)\.|\.\s?[A-Z0-9]\s?[a-z0-9]|\.{3}|!|\?|$))/g;
export const snippetRE = /[A-Z][a-z].*(?=\s\.{3})/