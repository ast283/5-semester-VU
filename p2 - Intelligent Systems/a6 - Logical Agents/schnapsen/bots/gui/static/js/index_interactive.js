// TODO

// Implement one-hot encoding in ml.py

// Edge case of two possible marriages at the same time, can use getMoveTypes but need to change move format.

// Maybe gray out submit button when no valid move is chosen

// Important if this will be deployed online: CLIENT SIDE STORAGE OF STATES
// Could do some sort of ID system, generated by JS on each tab randomly

// Add top bar to bot v bot version

// Solve license





// TODO Michael:

// derive stock content from card_state, rather than assuming it is given
// add pending points to the interface


// Removes all cards that are not needed to play Schnapsen
function schnapsenDeck() {
    var fullDeck = Deck();
    fullDeck.cards.forEach(function (card) {
        if (card.rank < 10 && card.rank > 1) {
            card.unmount();
        }
    });
    return syncCardIndices(fullDeck);
}

// I feel disgusted with myself
function syncCardIndices(visualDeck) {
    var card_indices = [];

    card_indices.push(visualDeck.cards[26]);
    card_indices.push(visualDeck.cards[35]);
    card_indices.push(visualDeck.cards[38]);
    card_indices.push(visualDeck.cards[37]);
    card_indices.push(visualDeck.cards[36]);

    card_indices.push(visualDeck.cards[39]);
    card_indices.push(visualDeck.cards[48]);
    card_indices.push(visualDeck.cards[51]);
    card_indices.push(visualDeck.cards[50]);
    card_indices.push(visualDeck.cards[49]);

    card_indices.push(visualDeck.cards[13]);
    card_indices.push(visualDeck.cards[22]);
    card_indices.push(visualDeck.cards[25]);
    card_indices.push(visualDeck.cards[24]);
    card_indices.push(visualDeck.cards[23]);

    card_indices.push(visualDeck.cards[0]);
    card_indices.push(visualDeck.cards[9]);
    card_indices.push(visualDeck.cards[12]);
    card_indices.push(visualDeck.cards[11]);
    card_indices.push(visualDeck.cards[10]);

    visualDeck.backEndIndices = card_indices;

    return visualDeck;
}

function moveCard(card, xc, yc, rotc = 0) {
    card.animateTo({
        delay: 100,
        duration: 500,
        ease: 'quartOut',

        x: xc, //Math.random() * window.innerWidth - window.innerWidth / 2,
        y: yc, //Math.random() * window.innerHeight - window.innerHeight / 2
        rot: rotc
    });
}

function dealStock(visualDeck, stock) {

    stock.forEach(function (cardIndex, stockIndex) {
        var card = visualDeck.backEndIndices[cardIndex];

        if (stockIndex == 0) {
            card.setSide('front');
            moveCard(card, -3 * width / 8, -cardWidth / 2, 0);
        } else {
            card.setSide('back');
            moveCard(card, -3 * width / 8, 0);
        }
    });
}

function arrIsNull(arr) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] != null) {
            return false;
        }
    }
    return true;
}

function arrElemFreq(arr, elem) {
    var ct = 0;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == elem) {
            ct++;
        }
    }
    return ct;
}

function orderCards(visualDeck, stock, trump_suit) {
    var new_cards_array = [];
    var trump_jack_index;

    visualDeck.cards.forEach(function (card) {
        card.setSide("front");
    });

    if (trump_suit == "C") {
        trump_jack_index = 4;
    } else if (trump_suit == "D") {
        trump_jack_index = 9;
    } else if (trump_suit == "H") {
        trump_jack_index = 14;
    } else if (trump_suit == "S") {
        trump_jack_index = 19;
    }

    new_cards_array.push(visualDeck.backEndIndices[trump_jack_index]);

    stock.forEach(function (stockIndex) {
        if (new_cards_array.map(x => x.i).indexOf(visualDeck.backEndIndices[stockIndex].i) < 0) {
            new_cards_array.push(visualDeck.backEndIndices[stockIndex]);
        }
    })

    visualDeck.cards.forEach(function (card, index) {
        if (new_cards_array.map(x => x.i).indexOf(card.i) < 0) {
            new_cards_array.push(card);
        }
    });

    if (new_cards_array.length == visualDeck.cards.length) {
        visualDeck.cards = new_cards_array;
    } else {
        var arr = [];
        new_cards_array.forEach(function (card) {
            if (typeof (arr[card.i]) == 'undefined') {
                arr[card.i] = 1;
            } else arr[card.i]++;
        });
        console.log(arr);

        alert("Card ordering error" + new_cards_array.length + " " + visualDeck.cards.length);
    }

    visualDeck.cards.forEach(function (card, index) {
        card.pos = index;
        card.$el.style.zIndex = card.pos;
    });

}

function arrangeCards(visualDeck, backEndState) {
    var p1placed = 0;
    var p2placed = 0;
    var p1wonCount = 0;
    var p2wonCount = 0;

    var x = null;
    var y = null;

    var card_states = getCardStateArray(backEndState);
    var perspective = getCardStateArray(backEndState, true);

    if (backEndState.phase == 2) {
        $("#trump").show();
        $("#trump").text("Trump suit: " + properTrumpSuitName(backEndState.deck.trump_suit));
    }

    card_states.forEach(function (card_state, card_index) {

        if (perspective[card_index] == "U") {
            visualDeck.backEndIndices[card_index].setSide('back');
        } else {
            visualDeck.backEndIndices[card_index].setSide('front');
        }

        if (card_state == "P1H") {


            x = (-2 + p1placed) * cardWidth;
            y = height / 4;

            p1placed++;

        } else if (card_state == "P2H") {

            x = (-2 + p2placed) * cardWidth;
            y = -height / 4;

            p2placed++;

        } else if (card_state == "P1D") {

            x = cardWidth;
            y = 0;

            p1placed++;

        } else if (card_state == "P2D") {

            x = -cardWidth;
            y = 0;

            p2placed++;

        } else if (card_state == "P1W") {

            x = width / 2 - cardWidth * (1 / 2 + p1wonCount);
            y = height / 2 - cardHeight / 4;

            p1wonCount++;

        } else if (card_state == "P2W") {

            x = width / 2 - cardWidth * (1 / 2 + p2wonCount);
            y = -height / 2;

            p2wonCount++;
        }

        if (x != null && y != null) {
            moveCard(visualDeck.backEndIndices[card_index], x, y);
            x = null;
            y = null;

        }


    });
}

function setUpCards(visualDeck, backEndState) {

    height = window.innerHeight;
    width = window.innerWidth;

    font_size = window.getComputedStyle(document.body).getPropertyValue('font-size').slice(0, -2);

    cardWidth = font_size * 4;
    cardHeight = cardWidth * 1.41;

    //STOCK
    if (!ordered) {
        orderCards(visualDeck, backEndState.deck.stock, backEndState.deck.trump_suit);
        ordered = true;
    }

    dealStock(visualDeck, backEndState.deck.stock);
    arrangeCards(visualDeck, backEndState)
}

function getCardStateArray(backEndState, perspective = false) {

    // Since perspectives stop being updated once the 2nd phase of the game starts, take the
    // full card state directly because that is the extend of both player's information in phase 2
    var card_state = (perspective && backEndState.phase == 1) ? backEndState.deck.p1_perspective : backEndState.deck.card_state;

    return card_state;
}

function properTrumpSuitName(suit) {
    const suits = {
        c: 'Clubs',
        d: 'Diamonds',
        h: 'Hearts',
        s: 'Spades',
    };
    return suits[suit.toLowerCase()];
}

function getMoveTypes(moves) {

    var regular_moves = [];
    var marr = [];
    var trump_exchange = [];

    moves.forEach(function (legalMove) {
        if (legalMove[1] === null && legalMove[0] !== null) {
            regular_moves.push(legalMove);
        } else if (legalMove[1] !== null && legalMove[0] !== null) {
            marr.push(legalMove);
        } else if (legalMove[0] === null) {
            trump_exchange.push(legalMove);
        }
    });

    return [regular_moves, marr, trump_exchange];

}

function getMarriage(moves) {

    var marr = null;

    moves.forEach(function (legalMove) {

        //Reverse order so we can take advantage of lazy evaluation
        if (legalMove[1] !== null && legalMove[0] !== null) {
            marr = legalMove;
        }
    });

    return marr;
}

function getTrumpExchange(moves) {

    var trump_exchange = null;

    moves.forEach(function (legalMove) {
        if (legalMove[0] === null) {
            trump_exchange = legalMove;
        }
    });

    return trump_exchange;
}

function putTrickAway(deck, state) {

    var prev = state.deck.previous_trick;

    deck.backEndIndices[prev[0]].setSide('front');
    moveCard(deck.backEndIndices[prev[0]], cardWidth, 0);

    deck.backEndIndices[prev[1]].setSide('front');
    moveCard(deck.backEndIndices[prev[1]], -cardWidth, 0);

}

function disableCardClickable() {
    $(".card").unbind("click");
    $(".card").css('cursor', 'default');
}

function disableClickable() {
    $("button").prop("disabled", true);
    disableCardClickable();


}

function enableClickable(deck, state) {
    $("button").prop("disabled", false);

    var card_state = getCardStateArray(state);

    var moves = state.moves;
    // simple_marriage_exchange = getMoveTypes(state.moves);
    marriage = getMarriage(moves);
    exchange = getTrumpExchange(moves)

    if (marriage === null) {
        $("#marriage").prop("disabled", true);
    }

    if (exchange === null) {
        $("#exchange").prop("disabled", true);
    }

    moves.forEach(function (legalMove) {
        if (legalMove[0] !== null && legalMove[1] === null) {
            $(deck.backEndIndices[legalMove[0]].$el).css('cursor', 'pointer');

            $(deck.backEndIndices[legalMove[0]].$el).click(function () {

                moveCard(deck.backEndIndices[legalMove[0]], cardWidth, 0);
                move = legalMove;

                disableCardClickable();
            });

        }
    });
}

function submitMove() {
    if (move === null || move.length != 2) {
        alert("INVALID move submitted: " + move);
        return;
    }

    $.ajax({
        url: '/sendmove/' + schnapsen_game_id,
        type: 'POST',
        data: JSON.stringify(move),
        dataType: "json",
        //since we mentioned dataType json, we don't have to parse the response
        success: function (newState) {
            gameLoop(deck, newState);
        },
        error: function (error) {
            console.log(error);
        }
    });


}

function other(player) {
    if (player == 1) {
        return 2;
    }
    return 1;
}

function highlightWinner(state) {
    if (state.won) {
        console.log("GUI Player wins!");
        $("#p1_points").css("color", "#55c68f");
        $("#p2_points").css("color", "#e34f51");
        $("#p1_points").html(state.p1_points + " points    &lt;---winner--");
    } else {
        console.log("Other Player wins!");
        $("#p1_points").css("color", "#e34f51");
        $("#p2_points").css("color", "#55c68f");
        $("#p2_points").html("---winner--&gt; " + state.p2_points + " points");
    }
    disableClickable();
}


// This function manages player turns
function gameLoop(deck, state) {

    baseState = state;

    $("#p1_points").html(state.p1_points + " points");
    $("#p2_points").html(state.p2_points + " points");

    setUpCards(deck, state);

    if (!state.finished) {
        if (state.player1s_turn == true) {

            move = marriage = exchange = null;
            disableCardClickable();
            enableClickable(deck, state);

        } else {

            disableClickable();

            $.ajax({
                url: '/next',
                type: 'GET',
                success: function (response) {

                    var newState = JSON.parse(response);

                    if (arrIsNull(newState.deck.trick) && !arrIsNull(newState.deck.previous_trick)) {

                        putTrickAway(deck, newState);

                        setTimeout(function () {
                            gameLoop(deck, newState);
                        }, INTERVAL);

                    } else {
                        gameLoop(deck, newState);
                    }
                },
                error: function (error) {
                    console.log(error);
                }
            });
        }

    } else {
        highlightWinner(state);
    }

}

function newGame(deck) {
    disableClickable();
    ordered = false;
    move = null;
    marriage = null;
    exchange = null;
    baseState = null;
    $("#p1_points").css("color", "#ffffff");
    $("#p2_points").css("color", "#ffffff");
    $.ajax({
        url: '/generate/' + schnapsen_game_id,
        type: 'GET',
        success: function (response) {
            var stateObject = JSON.parse(response);
            deck.shuffle();
            setTimeout(function () {
                gameLoop(deck, stateObject);
            }, 500);

        },
        error: function (error) {
            console.log(error);
        }
    });
}

var height, width, font_size, cardHeight, cardWidth;

var ordered = false;

const INTERVAL = 1000;

// Get container
var $container = document.getElementById('container');

// Create Deck
var deck = schnapsenDeck();

// Add container to DOM
deck.mount($container);

// var prefix = Deck.prefix;

// var transform = prefix('transform');

// var translate = Deck.translate;

// var $topbar = $('topbar');

var baseState = null;
var move = null;
var marriage = null;
var exchange = null;

$("#reset").click(function () {
    setUpCards(deck, baseState);
    enableClickable(deck, baseState);
    move = null;
});

$("#submit").click(function () {
    submitMove();
});

// This function might need some rewriting
$("#marriage").click(function () {
    // setUpCards(deck, baseState);
    if (marriage !== null) {
        if (move !== null) {
            if (move[0] == marriage[0] && move[1] === null) {

                moveCard(deck.backEndIndices[marriage[1]], 2 * cardWidth, 0);
                move = marriage;

            } else if (move[0] == marriage[1] && move[1] === null) {

                moveCard(deck.backEndIndices[marriage[0]], 2 * cardWidth, 0);
                move = [marriage[1], marriage[0]];

            } else {
                $("#reset").click();
                moveCard(deck.backEndIndices[marriage[0]], cardWidth, 0);
                moveCard(deck.backEndIndices[marriage[1]], 2 * cardWidth, 0);
                disableCardClickable();
                move = marriage;
            }
        } else {
            moveCard(deck.backEndIndices[marriage[0]], cardWidth, 0);
            moveCard(deck.backEndIndices[marriage[1]], 2 * cardWidth, 0);
            disableCardClickable();
            move = marriage;
        }
    }
});

$("#exchange").click(function () {
    if (exchange !== null) {
        if (move !== null) {
            $("#reset").click();
        }

        move = exchange;
        submitMove();
    }
});


newGame(deck);
