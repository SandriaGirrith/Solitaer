<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solitaire</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #2a7d2a;
            color: white;
            text-align: center;
            padding: 20px;
            margin: 0;
        }
        
        .game-container {
            max-width: 900px;
            margin: 0 auto;
        }
        
        .top-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        
        .stock-waste {
            display: flex;
            gap: 20px;
        }
        
        .foundations {
            display: flex;
            gap: 10px;
        }
        
        .tableau {
            display: flex;
            justify-content: space-between;
            gap: 10px;
        }
        
        .pile {
            position: relative;
            width: 80px;
            height: 120px;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 5px;
            border: 1px dashed rgba(255, 255, 255, 0.3);
        }
        
        .card {
            position: absolute;
            width: 80px;
            height: 120px;
            border-radius: 5px;
            background-color: white;
            color: black;
            box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
            user-select: none;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;
            padding: 5px;
        }
        
        .card.red {
            color: red;
        }
        
        .card-top, .card-bottom {
            display: flex;
            align-items: center;
        }
        
        .card-bottom {
            transform: rotate(180deg);
        }
        
        .card-center {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-grow: 1;
            font-size: 24px;
        }
        
        .card.face-down {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: transparent;
        }
        
        .draggable {
            cursor: move;
            z-index: 10;
        }
        
        .tableau .card {
            transition: top 0.2s;
        }
        
        .hidden {
            display: none !important;
        }
        
        .win-screen, .no-moves-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 100;
        }
        
        .win-screen h1, .no-moves-screen h1 {
            font-size: 48px;
            margin-bottom: 30px;
            text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
        }
        
        button {
            padding: 10px 20px;
            font-size: 16px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 10px;
            transition: background-color 0.3s;
        }
        
        button:hover {
            background-color: #45a049;
        }
        
        .shuffle-btn {
            background-color: #FF9800;
        }
        
        .auto-btn {
            background-color: #9C27B0;
        }
        
        .auto-btn:hover {
            background-color: #7B1FA2;
        }
        
        .hint-btn {
            background-color: #2196F3;
        }
        
        .hint-btn:hover {
            background-color: #0b7dda;
        }
        
        .controls {
            margin-bottom: 20px;
        }
        
        .message {
            margin-top: 10px;
            padding: 10px;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 5px;
            font-size: 18px;
        }
        
        .highlight {
            animation: pulse 1.5s infinite;
            box-shadow: 0 0 0 2px yellow;
            z-index: 20;
        }
        
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(255, 255, 0, 0.7);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(255, 255, 0, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(255, 255, 0, 0);
            }
        }
        
        .deadend-message {
            margin-top: 10px;
            padding: 10px;
            background-color: rgba(220, 53, 69, 0.7);
            border-radius: 5px;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div class="game-container">
        <h1>Solitaire</h1>
        <div class="controls">
            <button id="new-game">Neues Spiel</button>
            <button id="hint" class="hint-btn">Hinweis</button>
            <button id="auto-complete-btn" class="auto-btn">Auto-Vervollständigen</button>
        </div>
        
        <div class="top-row">
            <div class="stock-waste">
                <div id="talon" class="pile"></div>
                <div id="waste" class="pile"></div>
            </div>
            <div class="foundations">
                <div id="foundation-0" class="pile" data-suit="hearts"></div>
                <div id="foundation-1" class="pile" data-suit="diamonds"></div>
                <div id="foundation-2" class="pile" data-suit="clubs"></div>
                <div id="foundation-3" class="pile" data-suit="spades"></div>
            </div>
        </div>
        
        <div class="tableau">
            <div id="tableau-0" class="pile"></div>
            <div id="tableau-1" class="pile"></div>
            <div id="tableau-2" class="pile"></div>
            <div id="tableau-3" class="pile"></div>
            <div id="tableau-4" class="pile"></div>
            <div id="tableau-5" class="pile"></div>
            <div id="tableau-6" class="pile"></div>
        </div>
        
        <div id="message" class="message hidden">
            Keine Züge mehr möglich! <button id="shuffle-cards" class="shuffle-btn">Karten mischen</button>
        </div>
        
        <div id="deadend-message" class="deadend-message hidden">
            Dieses Spiel ist nicht lösbar! Sie können ein neues Spiel starten.
        </div>
    </div>
    
    <div id="win-screen" class="win-screen hidden">
        <h1>Gewonnen!</h1>
        <button id="new-game-win">Neues Spiel</button>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Globale Variablen
            let talonCards = [];
            let wasteCards = [];
            let tableauPiles = [[], [], [], [], [], [], []];
            let foundationPiles = [[], [], [], []];
            let draggedCard = null;
            let draggedFrom = null;
            let draggedStack = [];
            let highlightedCards = [];
            let shuffleCount = 0;
            
            // Konstanten für Kartenwerte und Farben
            const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
            const suitSymbols = {'hearts': '♥', 'diamonds': '♦', 'clubs': '♣', 'spades': '♠'};
            const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
            const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
            
            // Hilfsfunktion zum Erstellen einer neuen Karte
            function createCard(suit, value) {
                const isRed = suit === 'hearts' || suit === 'diamonds';
                return {
                    suit: suit,
                    value: value,
                    code: value + suit.charAt(0).toUpperCase(),
                    faceUp: false,
                    isRed: isRed
                };
            }
            
            // Hilfsfunktion zum Erstellen eines neuen Kartendecks
            function createDeck() {
                let deck = [];
                for (const suit of suits) {
                    for (const value of values) {
                        deck.push(createCard(suit, value));
                    }
                }
                return deck;
            }
            
            // Hilfsfunktion zum Mischen eines Kartendecks
            function shuffleDeck(deck) {
                for (let i = deck.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [deck[i], deck[j]] = [deck[j], deck[i]];
                }
                return deck;
            }
            
            // Spiel initialisieren
            function initGame() {
                // Verstecken der Bildschirme/Nachrichten sicherstellen
                document.getElementById('win-screen').classList.add('hidden');
                document.getElementById('message').classList.add('hidden');
                document.getElementById('deadend-message').classList.add('hidden');
                
                // Alle Arrays leeren
                talonCards = [];
                wasteCards = [];
                tableauPiles = [[], [], [], [], [], [], []];
                foundationPiles = [[], [], [], []];
                shuffleCount = 0;
                
                // Entferne alle Highlights
                clearHighlights();
                
                // Neues gemischtes Deck erstellen
                const deck = shuffleDeck(createDeck());
                
                // Karten auf die Tableau-Stapel verteilen
                let cardIndex = 0;
                for (let i = 0; i < 7; i++) {
                    for (let j = 0; j <= i; j++) {
                        const card = deck[cardIndex++];
                        card.faceUp = j === i; // Nur die oberste Karte ist sichtbar
                        tableauPiles[i].push(card);
                    }
                }
                
                // Verbleibende Karten dem Talon hinzufügen
                talonCards = deck.slice(cardIndex);
                
                // Alles rendern
                updateDisplay();
            }
            
            // Kartenelement erstellen
            function createCardElement(card) {
                const cardElement = document.createElement('div');
                cardElement.classList.add('card');
                cardElement.id = card.code;
                
                if (card.faceUp) {
                    cardElement.classList.add('draggable');
                    
                    // Rote Farbe für Herz und Karo
                    if (card.isRed) {
                        cardElement.classList.add('red');
                    }
                    
                    const suitSymbol = suitSymbols[card.suit];
                    
                    // Oberer Teil der Karte
                    const cardTop = document.createElement('div');
                    cardTop.classList.add('card-top');
                    cardTop.innerHTML = `${card.value} ${suitSymbol}`;
                    cardElement.appendChild(cardTop);
                    
                    // Mittelteil der Karte
                    const cardCenter = document.createElement('div');
                    cardCenter.classList.add('card-center');
                    cardCenter.innerHTML = suitSymbol;
                    cardElement.appendChild(cardCenter);
                    
                    // Unterer Teil der Karte
                    const cardBottom = document.createElement('div');
                    cardBottom.classList.add('card-bottom');
                    cardBottom.innerHTML = `${card.value} ${suitSymbol}`;
                    cardElement.appendChild(cardBottom);
                    
                    // Datenattribute für Drag & Drop
                    cardElement.draggable = true;
                    cardElement.dataset.code = card.code;
                    cardElement.dataset.suit = card.suit;
                    cardElement.dataset.value = card.value;
                } else {
                    cardElement.classList.add('face-down');
                }
                
                return cardElement;
            }
            
            // Talon rendern
            function renderTalon() {
                const talon = document.getElementById('talon');
                talon.innerHTML = '';
                
                if (talonCards.length > 0) {
                    const cardBack = document.createElement('div');
                    cardBack.classList.add('card', 'face-down');
                    talon.appendChild(cardBack);
                }
            }
            
            // Ablagestapel rendern
            function renderWaste() {
                const waste = document.getElementById('waste');
                waste.innerHTML = '';
                
                if (wasteCards.length > 0) {
                    const card = wasteCards[wasteCards.length - 1];
                    card.faceUp = true;
                    const cardElement = createCardElement(card);
                    waste.appendChild(cardElement);
                }
            }
            
            // Stapel rendern
            function renderPile(pileId, cards) {
                const pile = document.getElementById(pileId);
                pile.innerHTML = '';
                
                cards.forEach((card, index) => {
                    const cardElement = createCardElement(card);
                    
                    if (pileId.includes('foundation')) {
                        // Foundation-Karten nicht überlappen
                        cardElement.style.top = '0';
                        cardElement.style.left = '0';
                    } else if (pileId.includes('tableau')) {
                        // Tableau-Karten überlappen
                        cardElement.style.top = `${index * 20}px`;
                        cardElement.style.left = '0';
                    }
                    
                    pile.appendChild(cardElement);
                });
            }
            
            // Karten vom Talon ziehen
            function drawFromTalon() {
                if (talonCards.length === 0 && wasteCards.length > 0) {
                    // Karten vom Waste zurück zum Talon legen
                    talonCards = wasteCards.slice().reverse();
                    talonCards.forEach(card => card.faceUp = false);
                    wasteCards = [];
                } else if (talonCards.length > 0) {
                    // Eine Karte vom Talon ziehen
                    const card = talonCards.pop();
                    card.faceUp = true;
                    wasteCards.push(card);
                }
                
                // Entferne alle Highlights
                clearHighlights();
                
                updateDisplay();
            }
            
            // Karten mischen - wenn keine Züge mehr möglich sind
            function shuffleCards() {
                // Zähler erhöhen
                shuffleCount++;
                
                // Sammle alle Karten ein
                let allCards = [];
                
                // Karten vom Talon
                allCards = allCards.concat(talonCards);
                talonCards = [];
                
                // Karten vom Waste
                allCards = allCards.concat(wasteCards);
                wasteCards = [];
                
                // Karten vom Tableau (nur nicht aufgedeckte Karten)
                for (let i = 0; i < tableauPiles.length; i++) {
                    const pile = tableauPiles[i];
                    const faceUpCards = pile.filter(card => card.faceUp);
                    const faceDownCards = pile.filter(card => !card.faceUp);
                    
                    allCards = allCards.concat(faceDownCards);
                    tableauPiles[i] = faceUpCards;
                }
                
                // Karten mischen und wieder verteilen
                allCards = shuffleDeck(allCards);
                
                // Verteile gemischte Karten auf Talon und fehlende Tableau-Plätze
                talonCards = allCards;
                
                // Entferne alle Highlights
                clearHighlights();
                
                // Nachricht ausblenden
                document.getElementById('message').classList.add('hidden');
                document.getElementById('deadend-message').classList.add('hidden');
                
                // Prüfen auf Deadend-Situation nach zu vielen Shuffles
                if (shuffleCount >= 3 && isUnwinnable()) {
                    document.getElementById('deadend-message').classList.remove('hidden');
                }
                
                // Alles rendern
                updateDisplay();
            }
            
            // Prüfen ob das Spiel nicht lösbar ist (Deadend-Erkennung)
            function isUnwinnable() {
                // Prüfe, ob wichtige Karten unter anderen Karten blockiert sind
                
                // 1. Prüfe, ob ein Ass unter einer verdeckten Karte liegt
                for (let i = 0; i < tableauPiles.length; i++) {
                    const pile = tableauPiles[i];
                    for (let j = 0; j < pile.length; j++) {
                        const card = pile[j];
                        if (!card.faceUp && card.value === 'A') {
                            // Ein Ass ist unter verdeckten Karten
                            return true;
                        }
                    }
                }
                
                // 2. Prüfe auf verdeckte Karten, die eine andere Karte blockieren
                let hasBlockedSequence = false;
                
                // Für jede Farbe, prüfe ob eine Sequenz blockiert ist
                for (const suit of suits) {
                    const suitCards = [];
                    
                    // Sammle alle Karten dieser Farbe
                    for (const pile of tableauPiles) {
                        for (const card of pile) {
                            if (card.suit === suit) {
                                suitCards.push(card);
                            }
                        }
                    }
                    
                    // Prüfe auf blockierte Sequenzen
                    for (let i = 0; i < suitCards.length; i++) {
                        const card = suitCards[i];
                        if (!card.faceUp) {
                            // Finde höhere Karten dieser Farbe
                            const higherCards = suitCards.filter(c => 
                                rankOrder.indexOf(c.value) > rankOrder.indexOf(card.value)
                            );
                            
                            // Wenn eine höhere Karte aufgedeckt ist, aber eine niedrigere blockiert ist
                            if (higherCards.some(c => c.faceUp)) {
                                hasBlockedSequence = true;
                                break;
                            }
                        }
                    }
                    
                    if (hasBlockedSequence) break;
                }
                
                return hasBlockedSequence;
            }
            
            // Hinweis-Funktion (Zeigt einen möglichen Zug an)
            function showHint() {
                // Entferne zuerst alle bisherigen Highlights
                clearHighlights();
                
                // Finde und speichere mögliche Züge
                const moves = findPossibleMoves();
                
                if (moves.length > 0) {
                    // Wähle einen zufälligen Zug aus
                    const move = moves[Math.floor(Math.random() * moves.length)];
                    
                    // Hervorhebe die Quell- und Zielkarte
                    if (move.fromCard) {
                        const sourceCardElement = document.getElementById(move.fromCard.code);
                        if (sourceCardElement) {
                            sourceCardElement.classList.add('highlight');
                            highlightedCards.push(sourceCardElement);
                        }
                    }
                    
                    if (move.toCard) {
                        const targetCardElement = document.getElementById(move.toCard.code);
                        if (targetCardElement) {
                            targetCardElement.classList.add('highlight');
                            highlightedCards.push(targetCardElement);
                        } else if (move.toPile.includes('foundation')) {
                            // Leere Foundation hervorheben
                            const pileElement = document.getElementById(move.toPile);
                            pileElement.classList.add('highlight');
                            highlightedCards.push(pileElement);
                        }
                    }
                    
                    // Wenn es ein Talon-Zug ist, hervorhebe den Talon
                    if (move.action === 'drawTalon') {
                        const talonElement = document.getElementById('talon');
                        talonElement.classList.add('highlight');
                        highlightedCards.push(talonElement);
                    }
                    
                    // Nach 3 Sekunden Highlight entfernen
                    setTimeout(clearHighlights, 3000);
                }
            }
            
            // Alle Highlights entfernen
            function clearHighlights() {
                highlightedCards.forEach(element => {
                    element.classList.remove('highlight');
                });
                highlightedCards = [];
            }
            
            // Finde alle möglichen Züge
            function findPossibleMoves() {
                const moves = [];
                
                // 1. Prüfe Talon-Zug
                if (talonCards.length > 0 || (talonCards.length === 0 && wasteCards.length > 0)) {
                    moves.push({
                        action: 'drawTalon',
                        fromCard: null,
                        toCard: null,
                        toPile: 'talon'
                    });
                }
                
                // 2. Prüfe Waste zu Foundation oder Tableau
                if (wasteCards.length > 0) {
                    const wasteCard = wasteCards[wasteCards.length - 1];
                    
                    // Waste zu Foundation
                    for (let i = 0; i < foundationPiles.length; i++) {
                        const foundationPile = foundationPiles[i];
                        if (canMoveCard(wasteCard, `foundation-${i}`, foundationPile)) {
                            moves.push({
                                action: 'moveCard',
                                fromCard: wasteCard,
                                fromPile: 'waste',
                                toCard: foundationPile.length > 0 ? foundationPile[foundationPile.length - 1] : null,
                                toPile: `foundation-${i}`
                            });
                        }
                    }
                    
                    // Waste zu Tableau
                    for (let i = 0; i < tableauPiles.length; i++) {
                        const tableauPile = tableauPiles[i];
                        if (canMoveCard(wasteCard, `tableau-${i}`, tableauPile)) {
                            moves.push({
                                action: 'moveCard',
                                fromCard: wasteCard,
                                fromPile: 'waste',
                                toCard: tableauPile.length > 0 ? tableauPile[tableauPile.length - 1] : null,
                                toPile: `tableau-${i}`
                            });
                        }
                    }
                }
                
                // 3. Prüfe Tableau zu Foundation oder anderem Tableau
                for (let i = 0; i < tableauPiles.length; i++) {
                    const tableauPile = tableauPiles[i];
                    if (tableauPile.length === 0) continue;
                    
                    // Oberste Karte des Stapels
                    const tableauCard = tableauPile[tableauPile.length - 1];
                    if (!tableauCard.faceUp) continue;
                    
                    // Tableau zu Foundation
                    for (let j = 0; j < foundationPiles.length; j++) {
                        const foundationPile = foundationPiles[j];
                        if (canMoveCard(tableauCard, `foundation-${j}`, foundationPile)) {
                            moves.push({
                                action: 'moveCard',
                                fromCard: tableauCard,
                                fromPile: `tableau-${i}`,
                                toCard: foundationPile.length > 0 ? foundationPile[foundationPile.length - 1] : null,
                                toPile: `foundation-${j}`
                            });
                        }
                    }
                    
                    // Tableau zu Tableau
                    for (let j = 0; j < tableauPiles.length; j++) {
                        if (i === j) continue;
                        
                        const targetTableauPile = tableauPiles[j];
                        if (canMoveCard(tableauCard, `tableau-${j}`, targetTableauPile)) {
                            moves.push({
                                action: 'moveCard',
                                fromCard: tableauCard,
                                fromPile: `tableau-${i}`,
                                toCard: targetTableauPile.length > 0 ? targetTableauPile[targetTableauPile.length - 1] : null,
                                toPile: `tableau-${j}`
                            });
                        }
                    }
                    
                    // Prüfe auch Teilstapel von Tableau zu Tableau
                    for (let k = 0; k < tableauPile.length; k++) {
                        const card = tableauPile[k];
                        if (!card.faceUp) continue;
                        
                        for (let j = 0; j < tableauPiles.length; j++) {
                            if (i === j) continue;
                            
                            const targetTableauPile = tableauPiles[j];
                            if (canMoveCard(card, `tableau-${j}`, targetTableauPile)) {
                                moves.push({
                                    action: 'moveStack',
                                    fromCard: card,
                                    fromPile: `tableau-${i}`,
                                    toCard: targetTableauPile.length > 0 ? targetTableauPile[targetTableauPile.length - 1] : null,
                                    toPile: `tableau-${j}`
                                });
                            }
                        }
                    }
                }
                
                // 4. Prüfe Foundation zu Tableau (selten sinnvoll, aber möglich)
                for (let i = 0; i < foundationPiles.length; i++) {
                    const foundationPile = foundationPiles[i];
                    if (foundationPile.length === 0) continue;
                    
                    const foundationCard = foundationPile[foundationPile.length - 1];
                    
                    for (let j = 0; j < tableauPiles.length; j++) {
                        const tableauPile = tableauPiles[j];
                        if (canMoveCard(foundationCard, `tableau-${j}`, tableauPile)) {
                            moves.push({
                                action: 'moveCard',
                                fromCard: foundationCard,
                                fromPile: `foundation-${i}`,
                                toCard: tableauPile.length > 0 ? tableauPile[tableauPile.length - 1] : null,
                                toPile: `tableau-${j}`
                            });
                        }
                    }
                }
                
                return moves;
            }
            
            // Drag-and-Drop-Logik
            function addDragListeners() {
                // Event-Listener für Zielstapel
                document.querySelectorAll('.pile').forEach(pile => {
                    pile.addEventListener('dragover', handleDragOver);
                    pile.addEventListener('drop', handleDrop);
                });
                
                // Event-Listener für draggable Karten
                document.querySelectorAll('.card.draggable').forEach(card => {
                    card.addEventListener('dragstart', handleDragStart);
                    card.addEventListener('dblclick', handleDoubleClick);
                });
            }
            
            function handleDragStart(e) {
                const card = e.target;
                draggedCard = card.dataset.code;
                draggedFrom = card.closest('.pile').id;
                
                e.dataTransfer.setData('text/plain', draggedCard);
                
                // Entferne alle Highlights
                clearHighlights();
                
                // Stapel von Karten für Tableau-Bewegung vorbereiten
                if (draggedFrom.includes('tableau')) {
                    const pileIndex = parseInt(draggedFrom.split('-')[1]);
                    const pile = tableauPiles[pileIndex];
                    const cardIndex = pile.findIndex(c => c.code === draggedCard);
                    draggedStack = pile.slice(cardIndex);
                } else if (draggedFrom === 'waste') {
                    draggedStack = [wasteCards[wasteCards.length - 1]];
                } else if (draggedFrom.includes('foundation')) {
                    const pileIndex = parseInt(draggedFrom.split('-')[1]);
                    draggedStack = [foundationPiles[pileIndex][foundationPiles[pileIndex].length - 1]];
                }
            }
            
            function handleDragOver(e) {
                e.preventDefault();
            }
            
            function handleDrop(e) {
                e.preventDefault();
                const toPileId = e.currentTarget.id;
                
                if (!draggedCard || !draggedFrom || draggedFrom === toPileId) return;
                
                // Quellstapel und Zielstapel bestimmen
                let fromPile;
                if (draggedFrom === 'waste') {
                    fromPile = wasteCards;
                } else if (draggedFrom.includes('tableau')) {
                    const pileIndex = parseInt(draggedFrom.split('-')[1]);
                    fromPile = tableauPiles[pileIndex];
                } else if (draggedFrom.includes('foundation')) {
                    const pileIndex = parseInt(draggedFrom.split('-')[1]);
                    fromPile = foundationPiles[pileIndex];
                } else {
                    return;
                }
                
                let toPile;
                if (toPileId.includes('tableau')) {
                    const pileIndex = parseInt(toPileId.split('-')[1]);
                    toPile = tableauPiles[pileIndex];
                } else if (toPileId.includes('foundation')) {
                    const pileIndex = parseInt(toPileId.split('-')[1]);
                    toPile = foundationPiles[pileIndex];
                    
                    // Nur einzelne Karten auf Foundation erlauben
                    if (draggedStack.length > 1) return;
                } else {
                    return;
                }
                
                // Bewegungsregeln prüfen
                const baseCard = draggedStack[0];
                if (baseCard && canMoveCard(baseCard, toPileId, toPile)) {
                    // Karten von Quellstapel entfernen
                    if (draggedFrom === 'waste') {
                        wasteCards.pop();
                    } else if (draggedFrom.includes('foundation')) {
                        const pileIndex = parseInt(draggedFrom.split('-')[1]);
                        foundationPiles[pileIndex].pop();
                    } else if (draggedFrom.includes('tableau')) {
                        const pileIndex = parseInt(draggedFrom.split('-')[1]);
                        const cardIndex = tableauPiles[pileIndex].findIndex(c => c.code === draggedCard);
                        tableauPiles[pileIndex].splice(cardIndex, tableauPiles[pileIndex].length - cardIndex);
                        
                        // Unterste Karte aufdecken, falls vorhanden
                        if (tableauPiles[pileIndex].length > 0 && !tableauPiles[pileIndex][tableauPiles[pileIndex].length - 1].faceUp) {
                            tableauPiles[pileIndex][tableauPiles[pileIndex].length - 1].faceUp = true;
                        }
                    }
                    
                    // Karten zum Zielstapel hinzufügen
                    if (toPileId.includes('foundation')) {
                        foundationPiles[parseInt(toPileId.split('-')[1])].push(draggedStack[0]);
                    } else {
                        tableauPiles[parseInt(toPileId.split('-')[1])].push(...draggedStack);
                    }
                    
                    // Display aktualisieren
                    updateDisplay();
                }
                
                // Drag-Variablen zurücksetzen
                draggedCard = null;
                draggedFrom = null;
                draggedStack = [];
            }
            
            // Doppelklick-Handler: Automatische Bewegung zum Foundation
            function handleDoubleClick(e) {
                const card = e.target.closest('.card');
                const pileId = card.closest('.pile').id;
                
                if (!card.dataset.code) return;
                
                let sourceCard;
                let pileIndex;
                
                if (pileId === 'waste') {
                    if (wasteCards.length === 0) return;
                    sourceCard = wasteCards[wasteCards.length - 1];
                } else if (pileId.includes('tableau')) {
                    pileIndex = parseInt(pileId.split('-')[1]);
                    const tableauPile = tableauPiles[pileIndex];
                    if (tableauPile.length === 0) return;
                    
                    const cardIndex = tableauPile.findIndex(c => c.code === card.dataset.code);
                    if (cardIndex !== tableauPile.length - 1) return; // Nur oberste Karte
                    
                    sourceCard = tableauPile[cardIndex];
                } else if (pileId.includes('foundation')) {
                    return; // Von Foundation nicht erlaubt
                } else {
                    return;
                }
                
                // Passenden Foundation-Stapel finden
                const suit = sourceCard.suit;
                const foundationIndex = suits.indexOf(suit);
                const foundationPile = foundationPiles[foundationIndex];
                
                if (canMoveCard(sourceCard, `foundation-${foundationIndex}`, foundationPile)) {
                    // Karte bewegen
                    if (pileId === 'waste') {
                        wasteCards.pop();
                    } else if (pileId.includes('tableau')) {
                        tableauPiles[pileIndex].pop();
                        
                        // Oberste Karte aufdecken, falls vorhanden
                        if (tableauPiles[pileIndex].length > 0 && !tableauPiles[pileIndex][tableauPiles[pileIndex].length - 1].faceUp) {
                            tableauPiles[pileIndex][tableauPiles[pileIndex].length - 1].faceUp = true;
                        }
                    }
                    
                    foundationPile.push(sourceCard);
                    
                    // Entferne alle Highlights
                    clearHighlights();
                    
                    updateDisplay();
                }
            }
            
            // Bewegungsregeln prüfen
            function canMoveCard(card, toPileId, toPile) {
                if (toPileId === 'waste' || toPileId === 'talon') return false;
                
                if (toPileId.includes('foundation')) {
                    const pileIndex = parseInt(toPileId.split('-')[1]);
                    const suit = suits[pileIndex];
                    
                    // Auf Foundation muss Karte gleiche Farbe haben und in aufsteigender Reihenfolge sein
                    if (card.suit !== suit) return false;
                    
                    if (toPile.length === 0) {
                        return card.value === 'A'; // Auf leere Foundation nur Asse
                    } else {
                        const topCard = toPile[toPile.length - 1];
                        return rankOrder.indexOf(card.value) === rankOrder.indexOf(topCard.value) + 1;
                    }
                }
                
                if (toPileId.includes('tableau')) {
                    if (toPile.length === 0) {
                        return card.value === 'K'; // Auf leeren Tableau-Stapel nur Könige
                    } else {
                        const topCard = toPile[toPile.length - 1];
                        
                        // Auf Tableau abwechselnde Farben und absteigende Reihenfolge
                        return card.isRed !== topCard.isRed && 
                               rankOrder.indexOf(card.value) === rankOrder.indexOf(topCard.value) - 1;
                    }
                }
                
                return false;
            }
            
            // Display aktualisieren
            function updateDisplay() {
                renderTalon();
                renderWaste();
                
                for (let i = 0; i < 7; i++) {
                    renderPile(`tableau-${i}`, tableauPiles[i]);
                }
                
                for (let i = 0; i < 4; i++) {
                    renderPile(`foundation-${i}`, foundationPiles[i]);
                }
                
                addDragListeners();
                checkWin();
                checkGameState();
                checkAutoComplete(); // Prüfe, ob Auto-Complete möglich ist
            }
            
            // Prüfen, ob das Spiel gewonnen wurde
            function hasWon() {
                return foundationPiles.every(pile => pile.length === 13);
            }
            
            // Gewinn-Bildschirm anzeigen
            function checkWin() {
                if (hasWon()) {
                    document.getElementById('win-screen').classList.remove('hidden');
                    document.getElementById('message').classList.add('hidden');
                    document.getElementById('deadend-message').classList.add('hidden');
                    
                    // Konfetti-Animation starten
                    confetti({
                        particleCount: 200,
                        spread: 160,
                        origin: { y: 0.6 }
                    });
                    
                    // Wiederholtes Konfetti für einen schöneren Effekt
                    setTimeout(() => {
                        confetti({
                            particleCount: 100,
                            angle: 60,
                            spread: 70,
                            origin: { x: 0 }
                        });
                    }, 500);
                    
                    setTimeout(() => {
                        confetti({
                            particleCount: 100,
                            angle: 120,
                            spread: 70,
                            origin: { x: 1 }
                        });
                    }, 1000);
                } else {
                    document.getElementById('win-screen').classList.add('hidden');
                }
            }
            
            // Prüfen, ob keine Züge mehr möglich sind
            function checkGameState() {
                if (!hasWon()) {
                    const moves = findPossibleMoves();
                    if (moves.length === 0) {
                        document.getElementById('message').classList.remove('hidden');
                        
                        // Prüfen auf Deadend-Situation nach zu vielen Shuffles
                        if (shuffleCount >= 3 && isUnwinnable()) {
                            document.getElementById('deadend-message').classList.remove('hidden');
                            document.getElementById('message').classList.add('hidden');
                        }
                    } else {
                        document.getElementById('message').classList.add('hidden');
                    }
                }
            }
            
            // Auto-Complete-Funktion (alle aufgedeckten Karten automatisch sortieren)
            function autoComplete() {
                // Prüfe, ob alle Karten aufgedeckt sind
                if (!allCardsVisible()) {
                    alert("Auto-Vervollständigen nicht möglich. Es müssen zuerst alle Karten aufgedeckt sein.");
                    return;
                }
                
                // Entferne alle Highlights
                clearHighlights();
                
                // Schrittweise Vervollständigung mit Animation
                completeStep();
            }
            
            // Führt die Auto-Complete-Funktion schrittweise aus
            function completeStep() {
                // Suche nach dem nächsten Zug
                let cardMoved = false;
                
                // 1. Versuche, Asse auf die Foundation zu legen
                for (let i = 0; i < tableauPiles.length; i++) {
                    if (tableauPiles[i].length > 0) {
                        const card = tableauPiles[i][tableauPiles[i].length - 1];
                        if (card.value === 'A') {
                            const foundationIndex = suits.indexOf(card.suit);
                            if (foundationPiles[foundationIndex].length === 0) {
                                // Bewege das Ass auf den Foundation-Stapel
                                tableauPiles[i].pop();
                                foundationPiles[foundationIndex].push(card);
                                cardMoved = true;
                                break;
                            }
                        }
                    }
                }
                
                // 2. Versuche auch, Asse vom Waste zu bewegen
                if (!cardMoved && wasteCards.length > 0) {
                    const card = wasteCards[wasteCards.length - 1];
                    if (card.value === 'A') {
                        const foundationIndex = suits.indexOf(card.suit);
                        if (foundationPiles[foundationIndex].length === 0) {
                            // Bewege das Ass auf den Foundation-Stapel
                            wasteCards.pop();
                            foundationPiles[foundationIndex].push(card);
                            cardMoved = true;
                        }
                    }
                }
                
                // 3. Versuche, Karten auf die Foundation zu legen (in aufsteigender Reihenfolge)
                if (!cardMoved) {
                    // Überprüfe zuerst Waste
                    if (wasteCards.length > 0) {
                        const card = wasteCards[wasteCards.length - 1];
                        const foundationIndex = suits.indexOf(card.suit);
                        const foundationPile = foundationPiles[foundationIndex];
                        
                        if (foundationPile.length > 0) {
                            const topFoundationCard = foundationPile[foundationPile.length - 1];
                            
                            if (rankOrder.indexOf(card.value) === rankOrder.indexOf(topFoundationCard.value) + 1) {
                                // Bewege die Karte auf den Foundation-Stapel
                                wasteCards.pop();
                                foundationPiles[foundationIndex].push(card);
                                cardMoved = true;
                            }
                        }
                    }
                }
                
                // 4. Dann Tableau überprüfen
                if (!cardMoved) {
                    for (let i = 0; i < tableauPiles.length; i++) {
                        if (tableauPiles[i].length > 0) {
                            const card = tableauPiles[i][tableauPiles[i].length - 1];
                            const foundationIndex = suits.indexOf(card.suit);
                            const foundationPile = foundationPiles[foundationIndex];
                            
                            if (foundationPile.length > 0) {
                                const topFoundationCard = foundationPile[foundationPile.length - 1];
                                
                                if (rankOrder.indexOf(card.value) === rankOrder.indexOf(topFoundationCard.value) + 1) {
                                    // Bewege die Karte auf den Foundation-Stapel
                                    tableauPiles[i].pop();
                                    foundationPiles[foundationIndex].push(card);
                                    cardMoved = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                
                // 5. Wenn nötig, Karten vom Talon ziehen
                if (!cardMoved && talonCards.length > 0) {
                    drawFromTalon();
                    cardMoved = true;
                }
                
                // Aktualisiere die Anzeige
                updateDisplay();
                
                // Wenn das Spiel gewonnen ist, oder keine Karten mehr bewegt wurden
                if (hasWon()) {
                    return;
                }
                
                // Wenn eine Karte bewegt wurde, führe den nächsten Schritt aus
                if (cardMoved) {
                    setTimeout(completeStep, 100); // Kurze Verzögerung für Animation
                }
            }
            
            // Prüft, ob alle Karten sichtbar/aufgedeckt sind
            function allCardsVisible() {
                // Prüfe Tableau-Stapel auf verdeckte Karten
                for (const pile of tableauPiles) {
                    for (const card of pile) {
                        if (!card.faceUp) {
                            return false;
                        }
                    }
                }
                
                // Alle Karten sind sichtbar
                return true;
            }
            
            // Prüft, ob es sinnvoll ist, automatisch zu vervollständigen
            function canAutoComplete() {
                // Prüfe, ob alle Karten sichtbar sind
                if (!allCardsVisible()) {
                    return false;
                }
                
                // Prüfe, ob es keine "Deadlocks" gibt (z.B. eine rote 5 auf einer schwarzen 6, aber beide werden benötigt)
                let isSafe = true;
                
                // Für jede Farbe, prüfe ob alle Karten in der richtigen Reihenfolge sind
                for (const suit of suits) {
                    const foundationIndex = suits.indexOf(suit);
                    const foundationPile = foundationPiles[foundationIndex];
                    
                    // Bestimme die höchste Karte dieser Farbe auf der Foundation
                    const highestCardIndex = foundationPile.length > 0 ? 
                        rankOrder.indexOf(foundationPile[foundationPile.length - 1].value) : -1;
                    
                    // Sammle alle verbleibenden Karten dieser Farbe
                    const remainingCards = [];
                    
                    // Suche in Waste
                    for (const card of wasteCards) {
                        if (card.suit === suit && rankOrder.indexOf(card.value) > highestCardIndex) {
                            remainingCards.push(card);
                        }
                    }
                    
                    // Suche in Tableau
                    for (const pile of tableauPiles) {
                        for (const card of pile) {
                            if (card.suit === suit && rankOrder.indexOf(card.value) > highestCardIndex) {
                                remainingCards.push(card);
                            }
                        }
                    }
                    
                    // Sortiere die verbleibenden Karten nach Wert
                    remainingCards.sort((a, b) => rankOrder.indexOf(a.value) - rankOrder.indexOf(b.value));
                    
                    // Prüfe, ob die Reihenfolge stimmt
                    let nextExpectedRank = highestCardIndex + 1;
                    for (const card of remainingCards) {
                        const cardRank = rankOrder.indexOf(card.value);
                        if (cardRank !== nextExpectedRank) {
                            isSafe = false;
                            break;
                        }
                        nextExpectedRank++;
                    }
                    
                    if (!isSafe) break;
                }
                
                return isSafe;
            }
            
            // Wird nach jedem Zug aufgerufen, um zu prüfen ob Auto-Complete möglich ist
            function checkAutoComplete() {
                // Nur prüfen, wenn alle Karten aufgedeckt sind
                if (allCardsVisible() && canAutoComplete()) {
                    // Kurze Verzögerung, um die UI zu aktualisieren
                    setTimeout(() => {
                        if (confirm("Alle Karten sind aufgedeckt. Möchten Sie das Spiel automatisch vervollständigen?")) {
                            autoComplete();
                        }
                    }, 300);
                }
            }
            
            // Event-Listener für Buttons
            document.getElementById('talon').addEventListener('click', drawFromTalon);
            document.getElementById('new-game').addEventListener('click', resetGame);
            document.getElementById('new-game-win').addEventListener('click', resetGame);
            document.getElementById('shuffle-cards').addEventListener('click', shuffleCards);
            document.getElementById('hint').addEventListener('click', showHint);
            document.getElementById('auto-complete-btn').addEventListener('click', autoComplete);
            
            // Spiel zurücksetzen
            function resetGame() {
                initGame();
            }
            
            // Spiel starten
            initGame();
        });
    </script>
</body>
</html>
