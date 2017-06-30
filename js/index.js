import Kefir from 'kefir';
import cookie from 'js-cookie';
import { rusLetters, pagesRules } from './rules.js';
import 'whatwg-fetch';

const _s = selector => document.querySelector(selector);
const pageSize = 20;
const pageEl = _s(".page");
const prevButton = _s(".prev");
const nextButton = _s(".next");
const bookRequest = fetch('./book.txt').then(r => r.text());
var book = [];

const getPageNum = () => parseInt(cookie.get("synPageNum")) || 0;

const setPageNum = num => cookie.set("synPageNum", num);

const getPageSentences = () =>
    book.slice(getPageNum() * pageSize, getPageNum() * pageSize + pageSize);

const getLetterColor = letter => rusLetters[letter.toLowerCase()];

const getLetterElement = letter => {
    if( (/\r?\n|\r/).test(letter) ) return document.createElement("br");

    const letterColor = getLetterColor(letter);
    if(!letterColor) return letter;

    const element = document.createElement("span");
    const coloredElement = document.createElement("div");

    element.innerHTML = letter;
    element.classList.add("letter");

    coloredElement.style.backgroundColor = letterColor;
    coloredElement.classList.add("paint");

    element.appendChild(coloredElement);
    return element;
};

const applyLetter = letter => {
    const element = getLetterElement(letter);
    typeof element === "object" ?
        pageEl.appendChild(getLetterElement(letter)) :
        pageEl.append(letter);
};

const renderPage = () => {
    const sentences = getPageSentences().map(sentence => {
        sentence = sentence.split("");
        sentence.push(".");
        return sentence;
    });
    const letters = [].concat.apply([], sentences);
    letters.map(applyLetter);
};

Kefir.fromPromise(bookRequest)
    .map(res => {
        book = res.split(".");
        return book;
    })
    .onValue(renderPage);

const prevEvent = Kefir.fromEvents(prevButton, "click").map(()=>-1);
const nextEvent = Kefir.fromEvents(nextButton, "click").map(()=> 1);

const switchPage = modificator => {
    const pageNum = getPageNum();
    const newPageNum = pageNum + modificator;
    setPageNum( (newPageNum < 0 || newPageNum >= (book.length / pageSize) ) ?
        pageNum :
        newPageNum );
    pageEl.innerHTML = "";
    renderPage();
}

Kefir.merge([prevEvent, nextEvent]).onValue(switchPage);