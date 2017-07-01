import Kefir from 'kefir';
import cookie from 'js-cookie';
import { rusLetters, pagesRules } from './rules.js';
import 'whatwg-fetch';

const settings = {
    pageSize: 30,
    learnSpeed: 10,
};

const _s = selector => document.querySelector(selector);
const pageEl = _s(".page");
const prevButton = _s(".prev");
const nextButton = _s(".next");
const bookRequest = fetch('./book.txt').then(r => r.text());
var book = [];
var pageNum;

const getPageNum = () => {
    if (pageNum) return pageNum;
    pageNum = parseInt(cookie.get("synPageNum")) || 0;
    return pageNum;
};

const setPageNum = num => {
    pageNum = num;
    cookie.set("synPageNum", num)
};

const getPageSentences = () =>
    book.slice(getPageNum() * settings.pageSize, getPageNum() * settings.pageSize + settings.pageSize);

const getLetterColor = letter => rusLetters[letter.toLowerCase()];

const isLetterVisible = letter => {
    return getPageNum() <= (pagesRules[letter.toLowerCase()] * settings.learnSpeed);
}

const getLetterElement = letter => {
    if( (/\r?\n|\r/).test(letter) ) return document.createElement("br");

    const letterColor = getLetterColor(letter);
    if(!letterColor) return letter;

    const element = document.createElement("span");
    const coloredElement = document.createElement("div");

    element.innerHTML = isLetterVisible(letter) ? letter : "&nbsp;";
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
    pageEl.innerHTML = "";
    const sentences = getPageSentences().map(sentence => {
        sentence = sentence.split("");
        sentence.push(".");
        return sentence;
    });
    const letters = [].concat.apply([], sentences);
    letters.map(applyLetter);
    updateInfo();
    window.scrollTo(0, 0);
};

const switchPage = modificator => {
    const pageNum = getPageNum();
    const newPageNum = pageNum + modificator;
    setPageNum( (newPageNum < 0 || newPageNum >= (book.length / settings.pageSize) ) ?
        pageNum :
        newPageNum );
    renderPage();
}

const getPageNumNode = i => {
    const el = document.createElement("div");
    el.innerHTML = i;
    return el;
};

const renderPaginator = book => {
    const pagesNum = Math.floor( book.length / settings.pageSize );
    Array(pagesNum).fill(0).map( (v, i) => {
        _s(".paginator").appendChild(getPageNumNode(i));
    });
};

const updateInfo = () => {
    _s(".pageNum").innerHTML = getPageNum();
    _s(".totalPages").innerHTML = Math.floor( book.length / settings.pageSize );
}

const prevEvent = Kefir.fromEvents(prevButton, "click").map(()=>-1);
const nextEvent = Kefir.fromEvents(nextButton, "click").map(()=> 1);

Kefir.fromPromise(bookRequest)
    .map(res => {
        book = res.split(".");
        return book;
    })
    .map(renderPaginator)
    .onValue(renderPage);

Kefir.merge([prevEvent, nextEvent]).onValue(switchPage);

Kefir.fromEvents(_s(".paginator"), "click")
    .map(event => event.target.innerHTML)
    .map(parseInt)
    .filter(val => !isNaN(val))
    .map(setPageNum)
    .onValue(renderPage);