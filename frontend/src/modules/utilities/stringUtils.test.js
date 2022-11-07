import { removeEmojis, removeURLs, removeNewLine, removeMultipleSpaces } from "./stringUtils";


describe("Rimozione emoji", function () {
    test("Frase con emoji", async function () {
        expect( removeEmojis("Ciao 😃‍").includes("😃") ).toBeFalsy();
    });

    test("Frase senza emoji", async function () {
        expect( removeEmojis("Dove sono le emoji?") ).toEqual("Dove sono le emoji?");
    });
});

describe("Rimozione URL", function () {
    test("URL HTTP", async function () {
        expect( removeURLs("Ecco il link http://localhost:8080") ).toEqual("Ecco il link  ");
    });

    test("URL HTTPS", async function () {
        expect( removeURLs("Ecco il link https://localhost:8080") ).toEqual("Ecco il link  ");
    });
});

describe("Rimozione new line", function () {
    test("", async function () {
        expect( removeNewLine(`Mattina\nM'illumino\nd'immenso`) ).toEqual("Mattina M'illumino d'immenso");
    });

});

describe("Rimozione spazi multipli", function () {
    test("URL HTTP", async function () {
        expect( removeMultipleSpaces("C  i     a o") ).toEqual("C i a o");
    });
});