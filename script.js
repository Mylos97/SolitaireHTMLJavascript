const gameArea = document.getElementById('game-area');
const deck = makeCardDeck();
let draggedCards = null;
let draggedColumn = null;

startGame();

function startGame() {
    prepareUpper();
    prepareLower();
    putCardsInColumns(deck);
    putCardsInDeck(deck);
    placeCardsInColumms();    
}

function prepareLower() {
    const lowerArea = document.createElement('div');
    const columns = document.createElement('div');
    lowerArea.className = 'lower-game-area';
    columns.className = 'lower-columns';

    for (let i = 0 ; i < 7 ; i++) {
        const column = document.createElement('div');
        column.className = 'card-column'
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDropLowerColumn);
        columns.append(column)
    }

    lowerArea.append(columns);
    gameArea.append(lowerArea);
}

function prepareUpper(){
    const upperArea = document.createElement('div');
    const deckPlacement = document.createElement('div');
    const deckPlaceholder = document.createElement('div');
    const river = document.createElement('div');

    upperArea.className = 'uper-game-area';
    deckPlacement.className = 'deck-placement';
    deckPlaceholder.className = 'deck-placeholder';
    river.className = 'deck-river';



    for(let i = 0; i < 4; i++) {
        const gather = document.createElement('div');
        gather.className = 'gather-column';
        upperArea.append(gather);
        gather.addEventListener('dragover', handleDragOver);
        gather.addEventListener('drop', handleDropUpperColumn);
    }

    upperArea.appendChild(river);
    upperArea.appendChild(deckPlaceholder);
    upperArea.appendChild(deckPlacement);

    gameArea.append(upperArea);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
}

function flipCard(card) {
    const upperArea = card.querySelector('.upper-area');
    const isBack = (upperArea.style.display !== 'none')
    upperArea.style.display = isBack ? 'none' : 'flex';
    card.draggable = !isBack;
    card.classList.toggle('card-back');
}

function flipLastCardInColum() {
    console.log('draggin from ', draggedColumn);
    if (draggedColumn.classList.contains('deck-river')) {
        console.log('i am here wtf')
        return;
    }
    const card = draggedColumn.lastElementChild;
    if(!card) return;
    flipCard(card);
}

function drawCard(card) {
    const cardDiv = document.createElement('div');
    const upperCardDiv = document.createElement('div');
    const suitImage = drawSuit(card.suit);
    const number = document.createElement('p');

    number.textContent = `${card.rank}`;
    
    upperCardDiv.appendChild(number);
    upperCardDiv.appendChild(suitImage);
    
    cardDiv.className = 'card';
    cardDiv.id = card.id;
    cardDiv.setAttribute('isRed', card.isRed);
    cardDiv.setAttribute('suit', card.suit);
    cardDiv.setAttribute('rankIndex', card.rankIndex)
    upperCardDiv.className = 'upper-area';
    cardDiv.appendChild(upperCardDiv);

    return cardDiv;
}

function createCard(cardObject) {
    const card = drawCard(cardObject);
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    return card;
}

function makeCardDeck() {
    function getRank(i) {
        if (i === 1) return 'A';
        if (i === 11) return 'J';
        if (i === 12) return 'Q';
        if (i === 13) return 'K';
        return i;
    }

    const suits = ['heart', 'spade', 'ace', 'diamond'];
    const deck = [];
    for(let i = 1 ; i <= 13; i++) {
        for (const j in suits) {
            const rank = getRank(i);
            const suit = suits[j]
            const isRed = (suit === 'heart' || suit === 'diamond') ? true : false;
            deck.push({suit: suit, rank : rank, shown: false, id: `${rank}-${suit}`, isRed: isRed, rankIndex: i})
        }
    }
    return shuffleArray(deck);
}

function putCardsInColumns(deck) {
    const columns = document.querySelector('.lower-columns')
    for(let i in columns.children) {
        const currentCol = columns.children[i];
        for(let j = 0; j <= i; j++) {
            const cardObject = deck.shift();
            cardObject.pos = j;
            cardObject.col = i;
            const card = createCard(cardObject);
            if (j != i) flipCard(card);
            if(j == i) card.draggable = true;
            currentCol.append(card);
        }
    }
}

function putCardsInDeck(deck) {
    const deckColumn = document.querySelector('.deck-placement');
    const length = deck.length;
    deckColumn.addEventListener('click', deckClicked);
    for(let i = 0; i < length; i++) {
        const cardObject = deck.shift();
        const card = createCard(cardObject);
        flipCard(card);
        deckColumn.appendChild(card);
    }
}

function deckClicked(e) {
    const target = e.target;
    const river = document.querySelector('.deck-river');
    if(target.classList.contains('card')) {
        flipCard(target);
        river.appendChild(target);
        
        return;
    }
    if(target.children.length !== 0) return;
    const deckPlacement = document.querySelector('.deck-placement');

    Array.from(river.children).reverse().forEach(card => {
        flipCard(card);
        deckPlacement.appendChild(card);
    });

}

function handleDragStart(e) {
    draggedCards = [];
    draggedColumn = e.target.parentElement;
    draggedCards.push(e.target);

    if (canDragMultiple(draggedColumn, e)) {
        let currentCard = e.target.nextElementSibling
        while (currentCard) {
            draggedCards.push(currentCard);
            currentCard = currentCard.nextElementSibling;
        }
    }

    draggedCards.forEach(card => card.classList.add('dragging-multiple'));
}

function handleDragEnd(e) {
    draggedCards.forEach(card => card.classList.remove('dragging-multiple'));
    draggedCards = null;
    draggedColumn = null;
}

function handleDragOver(e) {
    e.preventDefault();
}

function appendDraggedCards(col) {
    draggedCards.forEach(card => {
        col.appendChild(card);
    });
}

function isCardPlacementValid(currentCard, nextCard) {
    const currentRank = parseInt(currentCard.getAttribute('rankindex'));
    const nextRank = parseInt(nextCard.getAttribute('rankindex'));
    const currentIsRed = currentCard.getAttribute('isred') === 'true';
    const nextIsRed = nextCard.getAttribute('isred') === 'true';

    if (currentRank - nextRank !== 1) return false;
    if (currentIsRed === nextIsRed) return false;

    return true;
}

function canDragMultiple(col, e) {
    if (col.length === 1) return false;
    
    let currentCard = e.target;
    let nextCard = currentCard.nextElementSibling;

    while (nextCard) { 
        if(!isCardPlacementValid(currentCard, nextCard)) return false;
        currentCard = nextCard;
        nextCard = nextCard.nextElementSibling;
    }

    return true;
}

function handleDropLowerColumn(e) {
    e.preventDefault();
    const column = e.target.closest('.card-column');
    let isKing = false;
    if (!column) return;

    const lastCard = column.lastElementChild;
    const draggedRankIndex = draggedCards[0].getAttribute('rankindex');
    const draggedIsRed = draggedCards[0].getAttribute('isred');
    const lastCardRankIndex = lastCard?.getAttribute('rankindex');
    const lastCardIsRed = lastCard?.getAttribute('isred');

    console.log('before IFFF')
    if(column.children.length == 0 && parseInt(draggedRankIndex) === 13) isKing = true;
    if(draggedIsRed === lastCardIsRed && isKing === false) return;
    if(lastCardRankIndex - draggedRankIndex !== 1 && isKing === false) return;
    if(lastCard) lastCard.draggable = true;
    
    appendDraggedCards(column);
    placeCardInColumn(column);
    flipLastCardInColum();
    setDragableCards(draggedColumn);
    setDragableCards(column);
}

function handleDropUpperColumn(e) {
    e.preventDefault();
    const column = e.target.closest('.gather-column');
    if (!column) return;

    const lastCard = column.lastElementChild;
    const draggedRankIndex = draggedCards[0].getAttribute('rankindex');
    const draggedSuit = draggedCards[0].getAttribute('suit');
    const lastCardRankIndex = lastCard?.getAttribute('rankindex');
    const lastCardSuit = lastCard?.getAttribute('suit');
    
    if(lastCard === null && draggedRankIndex == 1) {
        draggedCards[0].style.removeProperty('top');
        column.appendChild(draggedCards[0]);
        flipLastCardInColum();
    }

    if(draggedSuit != lastCardSuit) return;
    if(draggedRankIndex != parseInt(lastCardRankIndex) + 1) return;
    
    draggedCards[0].style.removeProperty('top');
    lastCard.draggable = false;
    column.appendChild(draggedCards[0]);
    flipLastCardInColum();
}

function setDragableCards(col) {
    if (!col.children.length) return;

    const cards = Array.from(col.children);
    currentCard = cards[cards.length - 1];
    previousCard = currentCard?.previousSibling;
    currentCard.draggable = true;

    if(!previousCard) return;
    if(!isCardPlacementValid(previousCard, currentCard)) return;

    for(let i = 0; i < cards.length; i++) {
        if(isCardPlacementValid(previousCard, currentCard)) currentCard.draggable = true;
        currentCard = previousCard;
        previousCard = currentCard.previousSibling;
        if(!previousCard) break;
    }
}

function placeCardInColumn(col) {
    const firstCard = col.lastElementChild;
    if(!firstCard) return;
    const computedStyle = window.getComputedStyle(firstCard);
    const topPadding = Math.ceil(parseFloat(computedStyle.paddingTop));
    const height = firstCard.querySelector('.upper-area').offsetHeight + topPadding;
    console.log(height)
    let j = 0;
    const cards = Array.from(col.children);
    setDragableCards(col);

    for (const card of cards) {
        card.style.top = `${j*height}px`;
        j++;
    }
}

function placeCardsInColumms() {
    const columns = document.querySelector('.lower-columns');
    for (const currentCol of columns.children) {    
        placeCardInColumn(currentCol);
    }
}

function drawSuit(suit) {
    const img = document.createElement('img');
    img.src = `images/${suit}.png`;
    img.className = 'suit';
    img.draggable = false;
    return img;
}
