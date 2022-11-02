import { removeStopwords } from "../../modules/analysis/stopwords";

async function wordCountOccurrencies(sentence) {
    sentence = await removeStopwords(sentence);

    const res = {};

    const words = sentence.split(" ");

    for(const word of words) {
        if(res[word]) { res[word]++; }
        else { res[word] = 1; }
    }

    return res;
}