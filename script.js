// Globale Variablen
let deckId;
let talonCards = [];
let wasteCards = [];
let tableauPiles = [[], [], [], [], [], [], []];
let foundationPiles = [[], [], [], []];
let draggedCard = null;
let draggedFrom = null;
let draggedStack = [];
const rankOrder = ['ACE', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING'];

// Spiel initialisieren
async function initGame() {
    const res = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
    const data = await res.json();
    deckId = data.deck_id;

    const drawRes = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=52`);
    const deck = await drawRes.json();
    const cards = deck.cards;

    let cardIndex = 0;
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
            const card = cards[cardIndex++];
            card.faceUp = j === i;
            tableauPiles[i].push(card);
        }
        renderPile(`tableau-${i}`, tableauPiles[i]);
    }

    talonCards = cards.slice(cardIndex);
    renderTalon();

    document.getElementById('talon').addEventListener('click', drawFromTalon);
    addDragListeners();
    document.getElementById('new-game-win').addEventListener('click', resetGame);
    document.getElementById('new-game-restart').addEventListener('click', resetGame);
    checkWin();
    checkGameState();
}

// Talon rendern
function renderTalon() {
    const talon = document.getElementById('talon');
    talon.innerHTML = talonCards.length > 0 ? '<div class="card face-down"></div>' : '';
}

// Ablagestapel rendern
function renderWaste() {
    const waste = document.getElementById('waste');
    waste.innerHTML = '';
    if (wasteCards.length > 0) {
        const card = wasteCards[wasteCards.length - 1];
        const img = createCardElement(card);
        waste.appendChild(img);
    }
}

// Stapel rendern
function renderPile(pileId, cards) {
    const pile = document.getElementById(pileId);
    pile.innerHTML = '';
    cards.forEach((card, index) => {
        const img = createCardElement(card);
        if (pileId.includes('foundation')) {
            img.style.top = '0';
        } else {
            img.style.top = `${index * 20}px`;
        }
        pile.appendChild(img);
    });
}

// Kartenelement erstellen
function createCardElement(card) {
    const img = document.createElement('img');
    img.src = card.faceUp ? card.image : 'https://deckofcardsapi.com/static/img/back.png';
    img.classList.add('card');
    if (card.faceUp) img.classList.add('draggable');
    img.dataset.code = card.code;
    img.draggable = card.faceUp;
    return img;
}

// Karten vom Talon ziehen
function drawFromTalon() {
    if (talonCards.length === 0 && wasteCards.length > 0) {
        talonCards = wasteCards.reverse();
        wasteCards = [];
    } else if (talonCards.length > 0) {
        const card = talonCards.pop();
        card.faceUp = true;
        wasteCards.push(card);
    }
    renderTalon();
    renderWaste();
    addDragListeners();
    checkWin();
    checkGameState();
}

// Drag-and-Drop-Logik
function addDragListeners() {
    document.querySelectorAll('.pile').forEach(pile => {
        pile.removeEventListener('dragover', handleDragOver);
        pile.removeEventListener('drop', handleDrop);
        pile.addEventListener('dragover', handleDragOver);
        pile.addEventListener('drop', handleDrop);
    });

    document.querySelectorAll('.draggable').forEach(card => {
        card.removeEventListener('dragstart', handleDragStart);
        card.removeEventListener('dblclick', handleDoubleClick);
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dblclick', handleDoubleClick);
    });
}

function handleDragStart(e) {
    draggedCard = e.target.dataset.code;
    draggedFrom = e.target.parentElement.id;
    e.dataTransfer.setData('text/plain', draggedCard);

    if (draggedFrom.includes('tableau')) {
        const pileIndex = draggedFrom.split('-')[1];
        const pile = tableauPiles[pileIndex];
        const cardIndex = pile.findIndex(c => c.code === draggedCard);
        draggedStack = pile.slice(cardIndex);
    } else if (draggedFrom === 'waste') {
        draggedStack = [wasteCards[wasteCards.length - 1]];
    } else {
        draggedStack = [getCardByCode(draggedCard)];
    }
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const toPileId = e.currentTarget.id;
    const cardCode = e.dataTransfer.getData('text/plain');

    let fromPile;
    if (draggedFrom === 'waste') fromPile = wasteCards;
    else if (draggedFrom.includes('tableau')) fromPile = tableauPiles[draggedFrom.split('-')[1]];
    else if (draggedFrom.includes('foundation')) fromPile = foundationPiles[draggedFrom.split('-')[1]];
    else return;

    let toPile;
    if (toPileId.includes('tableau')) toPile = tableauPiles[toPileId.split('-')[1]];
    else if (toPileId.includes('foundation')) {
        toPile = foundationPiles[toPileId.split('-')[1]];
        if (draggedStack.length > 1) return; // Nur einzelne Karten auf Foundation
    } else return;

    const baseCard = draggedStack[0];
    if (baseCard && canMoveCard(baseCard, toPileId, toPile)) {
        if (draggedFrom === 'waste') {
            wasteCards.pop();
        } else if (draggedFrom.includes('foundation')) {
            fromPile.pop();
        } else if (draggedFrom.includes('tableau')) {
            const pileIndex = draggedFrom.split('-')[1];
            const cardIndex = tableauPiles[pileIndex].findIndex(c => c.code === cardCode);
            tableauPiles[pileIndex].splice(cardIndex, tableauPiles[pileIndex].length - cardIndex);
        }

        if (toPileId.includes('foundation')) toPile.push(draggedStack[0]);
        else toPile.push(...draggedStack);

        if (fromPile.length > 0 && !fromPile[fromPile.length - 1].faceUp && draggedFrom.includes('tableau')) {
            fromPile[fromPile.length - 1].faceUp = true;
        }

        updateDisplay();
        checkWin();
        checkGameState();
    }
    draggedCard = null;
    draggedFrom = null;
    draggedStack = [];
}

// Doppelklick-Handler: Alle Karten automatisch sortieren
function handleDoubleClick(e) {
    autoSortToFoundations();
}

// Alle Karten automatisch auf Foundation-Stapel sortieren
function autoSortToFoundations() {
    let moved;
    do {
        moved = false;
        if (wasteCards.length > 0) {
            const card = wasteCards[wasteCards.length - 1];
            const suit = card.suit.toLowerCase();
            const foundationIndex = ['hearts', 'diamonds', 'clubs', 'spades'].indexOf(suit);
            const toPile = foundationPiles[foundationIndex];
            const toPileId = `foundation-${foundationIndex}`;

            if (canMoveCard(card, toPileId, toPile)) {
                wasteCards.pop();
                toPile.push(card);
                moved = true;
            }
        }

        for (let i = 0; i < tableauPiles.length; i++) {
            const pile = tableauPiles[i];
            if (pile.length > 0 && pile[pile.length - 1].faceUp) {
                const card = pile[pile.length - 1];
                const suit = card.suit.toLowerCase();
                const foundationIndex = ['hearts', 'diamonds', 'clubs', 'spades'].indexOf(suit);
                const toPile = foundationPiles[foundationIndex];
                const toPileId = `foundation-${foundationIndex}`;

                if (canMoveCard(card, toPileId, toPile)) {
                    pile.pop();
                    toPile.push(card);
                    if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
                        pile[pile.length - 1].faceUp = true;
                    }
                    moved = true;
                }
            }
        }

        if (moved) {
            updateDisplay();
            checkWin();
            checkGameState();
        }
    } while (moved);
}

// Prüfen, ob das Spiel gewonnen wurde
function hasWon() {
    return foundationPiles.every(pile => pile.length === 13);
}

// Gewinn-Bildschirm anzeigen
function checkWin() {
    if (hasWon()) {
        document.getElementById('win-screen').classList.remove('hidden');
        document.getElementById('restart-screen').classList.add('hidden'); // Sicherstellen, dass der Restart-Screen nicht angezeigt wird
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

// Prüfen, ob Züge möglich sind
function canMakeMove() {
    if (talonCards.length > 0) return true;

    if (wasteCards.length > 0) {
        const card = wasteCards[wasteCards.length - 1];
        for (let i = 0; i < 4; i++) {
            if (canMoveCard(card, `foundation-${i}`, foundationPiles[i])) return true;
        }
        for (let i = 0; i < 7; i++) {
            if (canMoveCard(card, `tableau-${i}`, tableauPiles[i])) return true;
        }
    }

    for (let i = 0; i < 7; i++) {
        const pile = tableauPiles[i];
        if (pile.length > 0 && pile[pile.length - 1].faceUp) {
            const card = pile[pile.length - 1];
            for (let j = 0; j < 4; j++) {
                if (canMoveCard(card, `foundation-${j}`, foundationPiles[j])) return true;
            }
            for (let j = 0; j < 7; j++) {
                if (j !== i && canMoveCard(card, `tableau-${j}`, tableauPiles[j])) return true;
            }
        }
    }

    return false;
}

// Hilfsfunktion: Karte anhand von Code finden
function getCardByCode(code) {
    return [].concat(...tableauPiles, ...foundationPiles, wasteCards).find(c => c.code === code);
}

// Bewegungsregeln prüfen
function canMoveCard(card, toPileId, toPile) {
    if (toPileId === 'waste' || toPileId === 'talon') return false;

    if (toPileId.includes('foundation')) {
        const suit = document.getElementById(toPileId).dataset.suit || card.suit.toLowerCase();
        if (toPile.length === 0) {
            return card.value === 'ACE' && card.suit.toLowerCase() === suit;
        }
        const topCard = toPile[toPile.length - 1];
        return card.suit === topCard.suit && rankOrder.indexOf(card.value) === rankOrder.indexOf(topCard.value) + 1;
    }

    if (toPileId.includes('tableau')) {
        if (toPile.length === 0) return card.value === 'KING';
        const topCard = toPile[toPile.length - 1];
        const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
        const topIsRed = topCard.suit === 'HEARTS' || topCard.suit === 'DIAMONDS';
        const cardRank = rankOrder.indexOf(card.value);
        const topCardRank = rankOrder.indexOf(topCard.value);
        return isRed !== topIsRed && cardRank === topCardRank - 1;
    }
    return false;
}

// Display aktualisieren
function updateDisplay() {
    renderTalon();
    renderWaste();
    for (let i = 0; i < 7; i++) renderPile(`tableau-${i}`, tableauPiles[i]);
    for (let i = 0; i < 4; i++) renderPile(`foundation-${i}`, foundationPiles[i]);
    addDragListeners();
}

// Spielzustand prüfen (Restart-Screen anzeigen nur wenn kein Gewinn)
function checkGameState() {
    if (!canMakeMove() && !hasWon()) {
        document.getElementById('restart-screen').classList.remove('hidden');
    } else {
        document.getElementById('restart-screen').classList.add('hidden');
    }
}

// Spiel komplett zurücksetzen und neu starten
function resetGame() {
    // Alle Karten und Stapel vollständig leeren
    talonCards = [];
    wasteCards = [];
    tableauPiles = [[], [], [], [], [], [], []];
    foundationPiles = [[], [], [], []];
    draggedCard = null;
    draggedFrom = null;
    draggedStack = [];

    // Alle visuellen Elemente zurücksetzen
    document.getElementById('win-screen').classList.add('hidden');
    document.getElementById('restart-screen').classList.add('hidden');
    for (let i = 0; i < 7; i++) {
        document.getElementById(`tableau-${i}`).innerHTML = '';
    }
    for (let i = 0; i < 4; i++) {
        document.getElementById(`foundation-${i}`).innerHTML = '';
    }
    document.getElementById('waste').innerHTML = '';
    document.getElementById('talon').innerHTML = '';

    // Neues Spiel starten
    initGame();
}

// Spiel starten
initGame();