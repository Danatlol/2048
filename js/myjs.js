


$(function () {
    function GameField() {

        //CHECKING LOCAL STORAGE
        if (localStorage.recordScore === undefined) {
            localStorage.recordScore = "0";
        }

        //PROPERTIES

        //field
        this.field = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]];

        //game statistic
        this.score = 0;
        this.maxScore = 0;
        this.turnCount = 0;

        //size
        this.height = 4;
        this.width = 4;


        //inner variables(private)
        this.chanceDoubledToken = 9;
        this.isPlaying = false;
        this.lastTurnDataChange = {
            faded: [],
            moved: [],
            raised: [],
            appeared: [],
            generated: []
        };



        //CALLBACK FUNCTIONS(EVENTS)

        //occur when field is changed after calling the makeTurn("<some direction>.str")
        this.onFieldChanged = null;
        //occur when new token is appear on game field
        this.onTokenGenerated = null;
        //occur when game is over because there are no left moves
        this.onGameEnded = null;
        //occur when the game is started
        this.onGameStarted = null;



        //FUNCTIONS

        //generate the token on the game field(quantity -- quantity of the token that generated)
        this.generateToken = function (startGen) {
            var qEmptyTokens = 0;
            for (var i = 0; i < this.field.length; ++i) {
                for (var j = 0; j < this.field[i].length; ++j) {
                    if (this.field[i][j] === 0) {
                        ++qEmptyTokens;
                    }
                }
            }

            //var newTokenValue = (this.randomInt(0,99) < this.chanceDoubledToken)? 65536 : 65536;
            //var newTokenValue = (this.randomInt(0,99) < this.chanceDoubledToken)? 2048 : 2048;
            var newTokenValue = (this.randomInt(0, 99) < this.chanceDoubledToken) ? 4 : 2;
            var newTokenNumber = this.randomInt(0, (qEmptyTokens - 1));

            for (var i = 0; i < this.field.length; ++i) {
                for (var j = 0; j < this.field[i].length; ++j) {
                    if (this.field[i][j] === 0) {
                        if (newTokenNumber === 0) {
                            this.field[i][j] = newTokenValue;
                            //write to the statistic arrays
                            this.lastTurnDataChange.generated.push({ x: j, y: i, value: newTokenValue });
                            //callback function(event)
                            if (typeof this.onTokenGenerated === "function" && !startGen) {
                                this.onTokenGenerated();
                            }
                            return;
                        }
                        else {
                            --newTokenNumber;
                        }
                    }
                }
            }
        };



        //generate the random number(integer) beetween min and max
        this.randomInt = function (min, max) {
            var rand = min + Math.random() * (max - min + 1);
            return Math.floor(rand);
        }



        //clear the last turn data history
        this.clearLastDataHistory = function () {
            this.lastTurnDataChange = {
                faded: [],
                moved: [],
                raised: [],
                appeared: [],
                generated: []
            };
        };



        //making turn main function(public)
        this.makeTurn = function (direction) {

            if (!this.isPlaying) {
                return;
            }

            this.clearLastDataHistory();
            switch (direction.toLowerCase()) {
                case "up":
                    this.up();
                    break;
                case "down":
                    this.down();
                    break;
                case "left":
                    this.left();
                    break;
                case "right":
                    this.right();
                    break;
                default:
                    return;
                    break;
            }

            //if field not changed than no new token
            if (this.lastTurnDataChange.moved.length !== 0) {

                if (typeof this.onFieldChanged === "function") {
                    this.onFieldChanged();
                }
                ++this.turnCount;
                this.generateToken();

            }

            if (this.isEnd()) {
                this.isPlaying = false;
                if (localStorage.recordScore < this.score) {
                    localStorage.recordScore = this.score.toString();
                }
                //RECORD SCORE
                if (typeof this.onGameEnded === "function") {
                    this.onGameEnded();
                }
            }
        };



        //function that find and save the empty token
        this.saveFaded = function () {

            //write to the statistic array
            //faded
            for (var i = 0; i < this.field.length; ++i) {
                for (var j = 0; j < this.field[i].length; ++j) {
                    if (this.field[i][j] === 0) {
                        this.lastTurnDataChange.faded.push({ x: j, y: i });
                    }
                }
            }
        };


        //making turn functions(private)
        this.up = function () {
            //write to the statistic array
            //faded
            this.saveFaded();
            //for all columns
            for (var colNum = 0; colNum < this.field[0].length; ++colNum) {
                //place for tokens
                var to = { x: colNum, y: 0 };
                for (var i = 0; i < this.field.length; ++i) {
                    if (this.field[i][colNum] === 0) {
                        continue;
                    }
                    else {
                        if (to.y !== i) {

                            if (this.field[i][colNum] === this.field[to.y][colNum]) {
                                //raising and moving
                                this.lastTurnDataChange.moved.push({ fromx: colNum, fromy: i, tox: colNum, toy: to.y });
                                //this.lastTurnDataChange.raised.push({x:to.x,y:to.y});
                                this.field[to.y][to.x] *= 2;
                                this.lastTurnDataChange.raised.push({ x: to.x, y: to.y, value: this.field[to.y][to.x] });
                                this.score += this.field[to.y][to.x]
                                this.field[i][colNum] = 0;
                                ++to.y;
                            }
                            else if (this.field[to.y][to.x] === 0) {
                                //moving on empty place
                                this.lastTurnDataChange.moved.push({ fromx: colNum, fromy: i, tox: to.x, toy: to.y });
                                this.field[to.y][to.x] = this.field[i][colNum];
                                this.field[i][colNum] = 0;
                            }
                            else {
                                //moving near another token(not equal)
                                ++to.y;
                                if (to.y !== i) {
                                    //moving on empty place
                                    this.lastTurnDataChange.moved.push({ fromx: colNum, fromy: i, tox: to.x, toy: to.y });
                                    this.field[to.y][to.x] = this.field[i][colNum];
                                    this.field[i][colNum] = 0;
                                }
                            }

                        }
                    }
                }
            }
            //write to statistic array
            //appeared
            for (var rn = 0; rn < this.field.length; ++rn) {
                for (var cn = (this.field.length - 1); cn >= 0; --cn) {
                    if (this.field[cn][rn] !== 0) {
                        break;
                    }
                    else {
                        this.lastTurnDataChange.appeared.push({ x: rn, y: cn });
                    }
                }
            }
        };

        this.down = function () {

            //write to the statistic array
            //faded
            this.saveFaded();

            //for all columns
            for (var colNum = 0; colNum < this.field[0].length; ++colNum) {
                //place for tokens
                var to = { x: colNum, y: (this.field.length - 1) };
                for (var i = (this.field.length - 1); i >= 0; --i) {
                    if (this.field[i][colNum] === 0) {
                        continue;
                    }
                    else {
                        if (to.y !== i) {

                            if (this.field[i][colNum] === this.field[to.y][colNum]) {
                                //raising and moving
                                this.lastTurnDataChange.moved.push({ fromx: colNum, fromy: i, tox: colNum, toy: to.y });
                                //this.lastTurnDataChange.raised.push({x:to.x,y:to.y});
                                this.field[to.y][to.x] *= 2;
                                this.lastTurnDataChange.raised.push({ x: to.x, y: to.y, value: this.field[to.y][to.x] });
                                this.score += this.field[to.y][to.x]
                                this.field[i][colNum] = 0;
                                --to.y;
                            }
                            else if (this.field[to.y][to.x] === 0) {
                                //moving on empty place
                                this.lastTurnDataChange.moved.push({ fromx: colNum, fromy: i, tox: to.x, toy: to.y });
                                this.field[to.y][to.x] = this.field[i][colNum];
                                this.field[i][colNum] = 0;
                            }
                            else {
                                //moving near another token(not equal)
                                --to.y;
                                if (to.y !== i) {
                                    //moving on empty place
                                    this.lastTurnDataChange.moved.push({ fromx: colNum, fromy: i, tox: to.x, toy: to.y });
                                    this.field[to.y][to.x] = this.field[i][colNum];
                                    this.field[i][colNum] = 0;
                                }
                            }

                        }
                    }
                }
            }
            //write to statistic array
            //appeared
            for (var rn = 0; rn < this.field.length; ++rn) {
                for (var cn = 0; cn < this.field.length; ++cn) {
                    if (this.field[cn][rn] !== 0) {
                        break;
                    }
                    else {
                        this.lastTurnDataChange.appeared.push({ x: rn, y: cn });
                    }
                }
            }
        };

        this.left = function () {

            //write to the statistic array
            //faded
            this.saveFaded();

            //for all rows
            for (var rowNum = 0; rowNum < this.field.length; ++rowNum) {
                //place for tokens
                var to = { x: 0, y: rowNum };
                for (var i = 0; i < this.field[rowNum].length; ++i) {
                    if (this.field[rowNum][i] === 0) {
                        continue;
                    }
                    else {
                        if (to.x !== i) {

                            if (this.field[rowNum][i] === this.field[rowNum][to.x]) {
                                //raising and moving
                                this.lastTurnDataChange.moved.push({ fromx: i, fromy: rowNum, tox: to.x, toy: rowNum });
                                //this.lastTurnDataChange.raised.push({x:to.x,y:to.y});
                                this.field[to.y][to.x] *= 2;
                                this.lastTurnDataChange.raised.push({ x: to.x, y: to.y, value: this.field[to.y][to.x] });
                                this.score += this.field[to.y][to.x]
                                this.field[rowNum][i] = 0;
                                ++to.x;
                            }
                            else if (this.field[to.y][to.x] === 0) {
                                //moving on empty place
                                this.lastTurnDataChange.moved.push({ fromx: i, fromy: rowNum, tox: to.x, toy: to.y });
                                this.field[to.y][to.x] = this.field[rowNum][i];
                                this.field[rowNum][i] = 0;
                            }
                            else {
                                //moving near another token(not equal)
                                ++to.x;
                                if (to.x !== i) {
                                    //moving on empty place
                                    this.lastTurnDataChange.moved.push({ fromx: i, fromy: rowNum, tox: to.x, toy: to.y });
                                    this.field[to.y][to.x] = this.field[rowNum][i];
                                    this.field[rowNum][i] = 0;
                                }
                            }

                        }
                    }
                }
            }
            //write to statistic array
            //appeared
            for (var rn = 0; rn < this.field.length; ++rn) {
                for (var cn = (this.field[rn].length - 1); cn >= 0; --cn) {
                    if (this.field[rn][cn] !== 0) {
                        break;
                    }
                    else {
                        this.lastTurnDataChange.appeared.push({ x: cn, y: rn });
                    }
                }
            }
        };

        this.right = function () {

            //write to the statistic array
            //faded
            this.saveFaded();

            //for all rows
            for (var rowNum = 0; rowNum < this.field.length; ++rowNum) {
                //place for tokens
                var to = { x: (this.field[rowNum].length - 1), y: rowNum };
                for (var i = (this.field[rowNum].length - 1); i >= 0; --i) {
                    if (this.field[rowNum][i] === 0) {
                        continue;
                    }
                    else {
                        if (to.x !== i) {

                            if (this.field[rowNum][i] === this.field[rowNum][to.x]) {
                                //raising and moving
                                this.lastTurnDataChange.moved.push({ fromx: i, fromy: rowNum, tox: to.x, toy: rowNum });
                                //this.lastTurnDataChange.raised.push({x:to.x,y:to.y});
                                this.field[to.y][to.x] *= 2;
                                this.lastTurnDataChange.raised.push({ x: to.x, y: to.y, value: this.field[to.y][to.x] });
                                this.score += this.field[to.y][to.x]
                                this.field[rowNum][i] = 0;
                                --to.x;
                            }
                            else if (this.field[to.y][to.x] === 0) {
                                //moving on empty place
                                this.lastTurnDataChange.moved.push({ fromx: i, fromy: rowNum, tox: to.x, toy: to.y });
                                this.field[to.y][to.x] = this.field[rowNum][i];
                                this.field[rowNum][i] = 0;
                            }
                            else {
                                //moving near another token(not equal)
                                --to.x;
                                if (to.x !== i) {
                                    //moving on empty place
                                    this.lastTurnDataChange.moved.push({ fromx: i, fromy: rowNum, tox: to.x, toy: to.y });
                                    this.field[to.y][to.x] = this.field[rowNum][i];
                                    this.field[rowNum][i] = 0;
                                }
                            }

                        }
                    }
                }
            }
            //write to statistic array
            //appeared
            for (var rn = 0; rn < this.field.length; ++rn) {
                for (var cn = 0; cn < this.field[rn].length; ++cn) {
                    if (this.field[rn][cn] !== 0) {
                        break;
                    }
                    else {
                        this.lastTurnDataChange.appeared.push({ x: cn, y: rn });
                    }
                }
            }
        };



        //start new game function(public)
        this.startNewGame = function () {
            this.field = [];
            for (var i = 0; i < this.height; ++i) {
                this.field.push([]);
                for (var j = 0; j < this.width; ++j) {
                    this.field[i].push(0);
                }
            }
            this.score = 0;
            this.turnCount = 0;
            this.clearLastDataHistory();
            this.generateToken(true);
            this.generateToken(true);
            this.isPlaying = true;
            if (typeof this.onGameStarted === "function") {
                this.onGameStarted();
            }
        };



        //indicated whether the game is ending(private)
        this.isEnd = function () {
            if ([this.field[0].some(this.isRowSomeZero),
            this.field[1].some(this.isRowSomeZero),
            this.field[2].some(this.isRowSomeZero),
            this.field[3].some(this.isRowSomeZero)
            ].some(this.isRowsSomeZero)) {
                return false;
            }
            else {
                //checking rows
                for (var n = 0; n < this.field.length; ++n) {
                    for (var i = 0; i < (this.field[n].length - 1); ++i) {
                        if (this.field[n][i] === this.field[n][i + 1]) {
                            return false;
                        }
                    }
                }
                //checking columns
                for (var n = 0; n < this.field[0].length; ++n) {
                    for (var i = 0; i < (this.field.length - 1); ++i) {
                        if (this.field[i][n] === this.field[i + 1][n]) {
                            return false;
                        }
                    }
                }
                return true;
            }
        };

        //helping functions(private) for detection whether the game is ending
        this.isRowSomeZero = function (x) {
            return x === 0;
        };
        this.isRowsSomeZero = function (x) {
            return x === true;
        };


        //end of the class(GameField)
    }









    var test = new GameField();
    var place = $("#placeOrient");
    var tokenCol = [];
    var speed = 100;
    var tokenSide = 70;
    var tokenMargin = 10;


    var audioRange = $("#audioRange");

    // use localStorage to set audio volume
    if (localStorage.audioVol === undefined) {
        localStorage.audioVol = "0.25";
    }
    audioRange.val(localStorage.audioVol);

    /*
    // use localStorage to set music volume
    if(localStorage.musicVol === undefined){
        localStorage.musicVol = "0.25";
    }
    $("#musicRange").val(localStorage.musicVol);
    
    
    var musicSound = new Audio("sounds/music.wav");
    musicSound.volume = localStorage.musicVol;
    musicSound.loop = true;
    musicSound.play();
    */

    function playSound(filename) {
        if (filename === undefined) {
            return;
        }
        var temp = new Audio("sounds/" + filename);
        temp.volume = audioRange.val();
        temp.play();
    }





    var genSoundFileName = "";
    var moveSoundFileName = "move.mp3";
    var startGameSoundFileName = "start.mp3";
    var endGameSoundFileName = "end.mp3";
    var raiseSoundFileName = "";

    var strColors = [
        "rgb(250, 200, 0)", "rgb(200, 100, 100)", "rgb(100, 100, 200)",
        "rgb(0, 170, 250)", "rgb(100, 200, 100)",
        "rgb(180, 140, 70)", "rgb(250, 100, 200)",
        "rgb(200, 250, 100)", "rgb(100, 200, 250)", "rgb(200, 100, 250)",
        "rgb(100, 100, 0)", "rgb(150, 100, 50)", "rgb(250, 150, 50)",
        "rgb(50, 100, 250)", "rgb(150, 75, 75)", "rgb(100, 130, 110)",
        "rgb(170, 210, 170)", "rgb(150, 150, 150)", "rgb(255, 255, 255)"
    ];
    var colors = [];
    for (var i = 0, j = 4; i < strColors.length; ++i, j *= 2) {
        colors[j] = strColors[i];
    }

    test.onTokenGenerated = function () {

        //draw the generating token
        appendToken(0, speed);
        //new Audio(genSoundFileName).play();
        playSound(genSoundFileName);
    };

    test.onGameEnded = function () {
        $("#record").text(localStorage.recordScore);
        var temp = $("<div><br><h3>GAME OVER</h3><h3>Your score:<br>" + this.score + "</h3></div>").addClass("popUpFinalWindow");
        place.append(temp);
        setTimeout(function () { temp.css("opacity", "0.7") }, 10);
        playSound(endGameSoundFileName);
    };

    test.onFieldChanged = function () {
        //start moving
        var mov = this.lastTurnDataChange.moved;
        var rais = this.lastTurnDataChange.raised;
        var findTokens;
        var workToken;
        var tox;
        var toy;
        var toxpx;
        var toypx;
        var indTokens = [];
        for (var i = 0; i < mov.length; ++i) {

            //find the tokens
            findTokens = tokenCol.filter(function (el, ind) {
                if (el.x == mov[i].fromx && mov[i].fromy == el.y) {
                    indTokens.push(ind);
                    return true;
                }
                return false;
            });

            tox = mov[i].tox;
            toy = mov[i].toy;

            findTokens.forEach(function (el) {
                if (!el.ismoved) {
                    workToken = el;
                }
            });

            //write data "in" token
            workToken.x = tox;
            workToken.y = toy;
            workToken.ismoved = true;

            if ((mov[i].fromx - tox) === 0) {
                toypx = (toy * tokenSide) + ((toy + 1) * tokenMargin);
                workToken.tok.animate({ top: toypx }, speed, "linear");
            }
            else {
                toxpx = (tox * tokenSide) + ((tox + 1) * tokenMargin);
                workToken.tok.animate({ left: toxpx }, speed, "linear");
            }
        }
        //audio moving
        playSound(moveSoundFileName);

        //raising
        for (var i = 0; i < rais.length; ++i) {

            //refresh the array
            indTokens = [];
            //find the tokens in the same place
            tokenCol.filter(function (el, ind) {
                if ((el.x == rais[i].x) && (el.y == rais[i].y)) {
                    indTokens.push(ind);
                    return true;
                }
                return false;
            });

            //first token we raise
            tokenCol[indTokens[0]].tok.text(rais[i].value);
            tokenCol[indTokens[0]].tok.toggleClass("animtoken");
            tokenCol[indTokens[0]].tok.css("background-color", colors[rais[i].value]);

            //if-block for font-size
            if (rais[i].value > 524288) {
                tokenCol[indTokens[0]].tok.css("font-size", "1rem");
            }
            else if (rais[i].value > 65536) {
                tokenCol[indTokens[0]].tok.css("font-size", "1.1rem");
            }
            else if (rais[i].value > 8192) {
                tokenCol[indTokens[0]].tok.css("font-size", "1.3rem");
            }
            else if (rais[i].value > 512) {
                tokenCol[indTokens[0]].tok.css("font-size", "1.6rem");
            }
            else if (rais[i].value > 64) {
                tokenCol[indTokens[0]].tok.css("font-size", "2rem");
            }
            else if (rais[i].value > 8) {
                tokenCol[indTokens[0]].tok.css("font-size", "2.9rem");
            }


            //second token we delete
            tokenCol[indTokens[1]].tok.remove();
            tokenCol.splice(indTokens[1], 1);
        }
        //audio raising
        playSound(raiseSoundFileName);


        tokenCol.forEach(function (el) {
            el.ismoved = false;
        });

        //renew score
        $("#score").text(test.score);

    };

    test.onGameStarted = function () {
        tokenCol = [];
        $("#score").text(0);
        $("#record").text(localStorage.recordScore);
        $("#placeOrient").html("");
        for (var i = 0; i < this.lastTurnDataChange.generated.length; ++i) {
            appendToken(i, 0);
        }
        //audio
        playSound(startGameSoundFileName);
    };

    function appendToken(ind, delay) {
        var top = test.lastTurnDataChange.generated[ind].y;
        var toppx = (top * tokenSide) + (tokenMargin * (top + 1));
        var left = test.lastTurnDataChange.generated[ind].x;
        var leftpx = (left * tokenSide) + (tokenMargin * (left + 1));
        var temp = $("<div></div>").addClass("token");
        temp.text(test.lastTurnDataChange.generated[ind].value);
        temp.css("background-color", colors[test.lastTurnDataChange.generated[ind].value]);

        temp.addClass("gentoken");

        temp.css("top", toppx + "px");
        temp.css("left", leftpx + "px");

        place.append(temp);

        tokenCol.push({ tok: temp, x: left, y: top, ismoved: false });
    }



    $("body").on("keydown", function (eve) {
        //eve.preventDefault();
        if (eve.key === "Enter" && !test.isPlaying) {
            test.startNewGame();
        }
        else {
            test.makeTurn(eve.key.substring(5));
        }
    });

    $("#start").on("click", function (eve) {
        test.startNewGame();
    });

    $("#musicRange").on("change", function (eve) {
        musicSound.volume = eve.target.value;
        localStorage.musicVol = eve.target.value;
    });

    $("#musicRange").on("mouseup", function (eve) {
        eve.target.blur();
    });

    audioRange.on("mouseup", function (eve) {
        eve.target.blur();
        localStorage.audioVol = eve.target.value;
    });


    //end programm


    // experiment for touch event

    var initialPoint;
    var finalPoint;
    document.getElementById("field").addEventListener('touchstart', function (event) {
        event.preventDefault();
        event.stopPropagation();
        initialPoint = event.changedTouches[0];
    }, false);
    document.getElementById("field").addEventListener('touchend', function (event) {
        event.preventDefault();
        event.stopPropagation();
        finalPoint = event.changedTouches[0];
        var xAbs = Math.abs(initialPoint.pageX - finalPoint.pageX);
        var yAbs = Math.abs(initialPoint.pageY - finalPoint.pageY);
        if (xAbs > 20 || yAbs > 20) {
            if (xAbs > yAbs) {
                if (finalPoint.pageX < initialPoint.pageX) {
                    // console.log("left");
                    test.makeTurn("left");
                }
                else {
                    // console.log("right");
                    test.makeTurn("right");
                }
            }
            else {
                if (finalPoint.pageY < initialPoint.pageY) {
                    // console.log("up");
                    test.makeTurn("up");
                }
                else {
                    // console.log("down");
                    test.makeTurn("down");
                }
            }
        }
    }, false);
});















