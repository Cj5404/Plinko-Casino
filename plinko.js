//Module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Events = Matter.Events;

//Create an engine
var engine = Engine.create();

//Create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false, //Render solid shapes instead of wireframes
        background: '#CCCCCC',
    }
});

var ballTexture = new Image();
ballTexture.src = 'coin.png'; 


var ballRenderOptions = {
    sprite: {
        //Set the texture to the loaded image
        texture: ballTexture.src,
        xScale: 0.21, 
        yScale: 0.21, 
        xOffset: 0,
        yOffset: 0
    },
    //Sets fill style to transparent since sprite will be used
    fillStyle: 'transparent', 
    strokeStyle: 'black' 
};


//Event listener for image load success
ballTexture.onload = function() {
    console.log('Image loaded successfully:', ballTexture.src);

    var ball = Bodies.circle(window.innerWidth / 2, 0, 20, {
        restitution: 0,
        collisionFilter: { group: ballCollisionGroup },
        betAmount: betAmount, 
        render: ballRenderOptions
    });

    balls.push(ball);
    Composite.add(engine.world, ball);
};

//Event listener for image load error
ballTexture.onerror = function() {
    console.error('Error loading image:', ballTexture.src);
};




//Makes the ground
var ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight - 20, window.innerWidth, 40, { isStatic: true });

//An array to store each ball created 
var balls = [];

//Collision group for balls
var ballCollisionGroup = Matter.Body.nextGroup(true);

//Collision group for pegs
var pegsCollisionGroup = Matter.Body.nextGroup(true);

//Counter for ball hits
var ballHits = 0;

//Initialize user balance
var userBalance = 1000; 

//Creates the html element for user display and input field
var betInput = document.createElement('input');
betInput.id = 'betInput';
betInput.type = 'number';
betInput.placeholder = 'Enter bet amount';
betInput.style.position = 'absolute';
betInput.style.top = '50px';
betInput.style.left = '20px';
betInput.style.border = 'none'; 
betInput.style.borderBottom = '3px solid #000000'; 
betInput.style.borderRadius = '5px'; 
betInput.style.padding = '5px 10px'; 
betInput.style.fontSize = '16px'; 
betInput.style.fontFamily = 'Comic Sans MS, cursive';
betInput.style.color = '#333'; 
betInput.style.backgroundColor = '#FFF'; 


document.body.appendChild(betInput);

//Creates HTML element for user balance display
var userBalanceDisplay = document.createElement('div');
userBalanceDisplay.id = 'userBalanceDisplay';
userBalanceDisplay.style.position = 'absolute';
userBalanceDisplay.style.top = '95px';
userBalanceDisplay.style.left = '20px';
userBalanceDisplay.style.color = 'white';
userBalanceDisplay.style.fontFamily = 'Comic Sans MS, cursive';
userBalanceDisplay.style.fontSize = '18px';
userBalanceDisplay.style.color = '#4c7d4e';
userBalanceDisplay.innerText = 'Balance: $' + userBalance.toFixed(2);
document.body.appendChild(userBalanceDisplay);

//Function to update user balance display
function updateUserBalanceDisplay() {
    userBalanceDisplay.innerText = 'Balance: $' + userBalance.toFixed(2);
}

// Function to create a row of pegs
function createPegRow(x, y, row, count) {
    var pegs = [];
    var pegWidth = 15;
    var pegSpacing = 80;
    var startX = x - ((count - 1) * pegSpacing) / 2;
    for (var i = 0; i < count; i++) {
        //Generate unique ID for each peg
        var pegID = String.fromCharCode(65 + row) + (i + 1);
        //Create peg object with unique ID and properties
        var peg = {
            id: pegID,
            x: startX + i * pegSpacing,
            y: y,
            radius: pegWidth / 2,
            isStatic: true,
            restitution: 1,
            collisionFilter: { group: pegsCollisionGroup }
        };
        pegs.push(peg);
    }
    return pegs;
}

//Create peg rows in pyramid like shape
var numRows = 10;
var startX = window.innerWidth / 2;
var startY = 100;
for (var row = 0; row < numRows; row++) {
    var numPegs = 3 + row;
    var pegs = createPegRow(startX, startY + row * 75, row, numPegs);
    //Create peg bodies and add them to the world
    pegs.forEach(function(peg) {
        var pegBody = Bodies.circle(peg.x, peg.y, peg.radius, {
            isStatic: peg.isStatic,
            restitution: peg.restitution,
            collisionFilter: peg.collisionFilter
        });
        Composite.add(engine.world, pegBody);
    });
}

//Create separate boxes for counting hits under each exit of the pegs
var exitBoxes = [];
var exitBoxWidth = 50;
var exitBoxHeight = 20;
var exitBoxCounters = []; 
var exitBoxMultipliers = [21, 7.5, 3, 0.9, 0.22, 0.16, 0.22, 0.9, 3, 7.5, 21]; //Multipliers for each exit box
var exitBoxPositions = [
    { x: startX - 400, y: startY + (numRows - 1) * 75 + 25 },
    { x: startX - 320, y: startY + (numRows - 1) * 75 + 25 },
    { x: startX - 240, y: startY + (numRows - 1) * 75 + 25 },
    { x: startX - 160, y: startY + (numRows - 1) * 75 + 25 },
    { x: startX - 80, y: startY + (numRows - 1) * 75 + 25 },
    { x: startX , y: startY + (numRows - 1) * 75 + 25 },
    { x: startX + 80, y: startY + (numRows - 1) * 75 + 25 },
    { x: startX + 160, y: startY + (numRows - 1) * 75 + 25 },
    { x: startX + 240, y: startY + (numRows - 1) * 75 + 25 },
    { x: startX + 320, y: startY + (numRows - 1) * 75 + 25 },
    { x: startX + 400, y: startY + (numRows - 1) * 75 + 25 }
];

exitBoxPositions.forEach(function(position, index) {
    var exitBox = Bodies.rectangle(position.x, position.y, exitBoxWidth, exitBoxHeight, { isStatic: true, label: 'ExitBox', multiplier: exitBoxMultipliers[index] });
    exitBoxes.push(exitBox);
    Composite.add(engine.world, exitBox);

    //Initialize counters for each exit box
    exitBoxCounters.push(0);

    //Text elemetn for displaying multiplier inside of each box
    var multiplierText = document.createElement('div');
    multiplierText.classList.add('multiplier-text');
    multiplierText.innerText = 'x' + exitBoxMultipliers[index];
    multiplierText.style.position = 'absolute';
    multiplierText.style.top = position.y + 'px';
    multiplierText.style.left = position.x + 'px';
    multiplierText.style.color = 'white';
    multiplierText.style.fontSize = '12px';
    multiplierText.style.transform = 'translate(-50%, -50%)'; 
    document.body.appendChild(multiplierText);
});

//Loop through each exit box and update its fill style based on multiplier
exitBoxes.forEach(function(exitBox, index) {
    var multiplier = exitBox.multiplier;
    if (multiplier === 21) {
        exitBox.render.fillStyle = '#FF5733';
    } else if (multiplier === 7.5 || multiplier === 3) {
        exitBox.render.fillStyle = '#FFA500';
    } else if (multiplier === 3 ) {
        exitBox.render.fillStyle = '#FAD02E';
    } else {
        exitBox.render.fillStyle = '#2ECC71';
    }
});

// Event listener for exit box collisions 
Events.on(engine, 'collisionStart', function(event) {
    var pairs = event.pairs;
    pairs.forEach(function(pair) {
        if (pair.bodyA.label === 'ExitBox' && balls.includes(pair.bodyB)) {
            userBalance += pair.bodyB.betAmount * pair.bodyA.multiplier;
            updateUserBalanceDisplayAnimated(); 
            removeBall(pair.bodyB);
            var exitBoxIndex = exitBoxes.indexOf(pair.bodyA);
            if (exitBoxIndex !== -1) {
                exitBoxCounters[exitBoxIndex]++;
                // Update the graph data and redraw the chart
                chart.data.datasets[0].data = exitBoxCounters;
                chart.update();
            }
        } else if (pair.bodyB.label === 'ExitBox' && balls.includes(pair.bodyA)) {
            userBalance += pair.bodyA.betAmount * pair.bodyB.multiplier;
            updateUserBalanceDisplayAnimated(); 
            removeBall(pair.bodyA);
            var exitBoxIndex = exitBoxes.indexOf(pair.bodyB);
            if (exitBoxIndex !== -1) {
                exitBoxCounters[exitBoxIndex]++;
                // Update the graph data and redraw the chart
                chart.data.datasets[0].data = exitBoxCounters;
                chart.update();
            }
        }
    });
    // Update all exit box counters after collision
    updateAllExitBoxCounters();
});


//Function to remove a ball from the physics world and the array
function removeBall(ball) {
    var ballIndex = balls.indexOf(ball);
    if (ballIndex !== -1) {
        balls.splice(ballIndex, 1);
        Composite.remove(engine.world, ball);
        ballHits++;
        updateBallHitsCounter();
    }
}

//Function to update counter display for each exit box
function updateExitBoxCounter(index) {
    //Updates the element displaying the counter for the exit box
    var exitBoxCounterElem = document.getElementById('exitBoxCounter_' + index);
    exitBoxCounterElem.innerText = exitBoxCounters[index] + '\n (' + ((exitBoxCounters[index] / ballHits) * 100).toFixed(2) + '%)';
}

//Function to update all exit box counters
function updateAllExitBoxCounters() {
    exitBoxCounters.forEach(function(counter, index) {
        updateExitBoxCounter(index);
    });
}

//Create HTML elements for exit box counters
exitBoxCounters.forEach(function(counter, index) {
    var exitBoxCounter = document.createElement('div');
    exitBoxCounter.id = 'exitBoxCounter_' + index;
    exitBoxCounter.style.position = 'absolute';
    exitBoxCounter.style.top = (exitBoxPositions[index].y + exitBoxHeight / 2 + 5) + 'px';
    exitBoxCounter.style.left = (exitBoxPositions[index].x - exitBoxWidth / 2) + 'px';
    exitBoxCounter.style.color = 'white';
    exitBoxCounter.innerText = exitBoxCounters[index];
    document.body.appendChild(exitBoxCounter);

    //Create percentage display below the exit box counter
    var percentageDisplay = document.createElement('div');
    percentageDisplay.style.color = 'white';
    percentageDisplay.innerText = '(' + ((exitBoxCounters[index] / ballHits) * 100).toFixed(2) + '%)';
    exitBoxCounter.appendChild(percentageDisplay);
 });

//Add all bodies to the world
Composite.add(engine.world, [ground]);

//Run the renderer
Render.run(render);

//Create a runner
var runner = Runner.create();

//Run the engine
Runner.run(runner, engine);

//Apply gravity to the balls
engine.gravity.y = 0.5;

//Function to update gravity for each ball
function updateBallGravity() {
    balls.forEach(function(ball) {
        //Determine odds for the ball's gravity
        var odds = Math.random(); // Random value between 0 and 1

        //Strength of gravity
        var gravityStrength = 0.001; //Base strength
        if (odds < 0.9) {
            gravityStrength *= 0.5; //Increase strength for lower odds
        } else if (odds < 1) {
            gravityStrength *= 1; //Increase strength for moderate odds
        }

        //Direction of gravity
        var gravityX = 0; 
        if (Math.random() < 0.5) {
            //Applys rightward gravity, biased towards the lower multiplier areas
            gravityX = gravityStrength * (Math.random() * 0.02); 
        } else {
            //Applys leftward gravity, biased towards the lower multiplier areas
            gravityX = -gravityStrength * (Math.random() * 0.02); 
        }

        engine.gravity.x = gravityX;
    });
}

//Update gravity for each ball continuously
Events.on(runner, 'tick', function(event) {
    updateBallGravity();
});

function addBall() {
    var betAmount = parseFloat(betInput.value);
    if (!isNaN(betAmount) && betAmount > 0 && userBalance >= betAmount) {
        //Deduct the bet amount from user's balance
        userBalance -= betAmount;
        updateUserBalanceDisplayAnimated()

        //Spawn a new ball at the top center of the screen
        var ball = Bodies.circle(window.innerWidth / 2, 0, 20, {
            restitution: 0.5,
            collisionFilter: { group: ballCollisionGroup },
            betAmount: betAmount,
            render: ballRenderOptions //Applys common rendering options
        });
        balls.push(ball);
        Composite.add(engine.world, ball);
    } else {
        //Notifys user if bet amount is invalid or exceeds balance
        alert('Invalid bet amount or insufficient balance.');
    }
}


//Event listener for spacebar press
document.addEventListener('keydown', function (event) {
    if (event.code === 'Space') {
        addBall();
    }
});

// Auto button for adding balls automatically
document.getElementById('autoButton').addEventListener('click', function () {
    setInterval(function () {
        document.getElementById('betInput').value = 1;
        addBall();
    }, 1500);
});


//Function to update ball hits counter
function updateBallHitsCounter() {
    //Update the HTML element displaying the ball hits count
    document.getElementById('ballHitsCounter').innerText = 'Ball Hits: ' + ballHits;
}

//Function to update user balance display with animation
function updateUserBalanceDisplayAnimated() {
    var previousBalance = parseFloat(userBalanceDisplay.innerText.split('$')[1]);
    var currentBalance = userBalance;
    var difference = currentBalance - previousBalance;
    var increment = difference / 24;
    var frame = 0;
    
    var animationInterval = setInterval(function() {
        frame++;
        var newBalance;
        
        //Increment balance animation
        if (difference > 0) {
            newBalance = previousBalance + (increment * frame);
        } 
        //Decrement balance animation
        else {
            newBalance = previousBalance - (Math.abs(increment) * frame);
        }
        
        userBalanceDisplay.innerText = 'Balance: $' + newBalance.toFixed(2);
        
        if (frame >= 24) {
            clearInterval(animationInterval);
        }
    }, 16); 
}

//Creates and appends HTML element for ball hits counter
var ballHitsCounter = document.createElement('div');
ballHitsCounter.id = 'ballHitsCounter';
ballHitsCounter.style.position = 'absolute';
ballHitsCounter.style.top = '20px';
ballHitsCounter.style.left = '20px';
ballHitsCounter.style.color = 'white';
ballHitsCounter.innerText = 'Ball Hits: 0';
document.body.appendChild(ballHitsCounter);

//Creates HTML element for the option button
var toggleMetricsButton = document.createElement('button');
toggleMetricsButton.id = 'toggleMetricsButton';
toggleMetricsButton.innerText = 'Toggle Metrics';
toggleMetricsButton.style.position = 'absolute';
toggleMetricsButton.style.top = '140px'; 
toggleMetricsButton.style.left = '20px';
toggleMetricsButton.style.padding = '5px 10px';
toggleMetricsButton.style.fontSize = '14px';
toggleMetricsButton.style.fontFamily = 'Comic Sans MS, cursive';
toggleMetricsButton.style.color = '#333';
toggleMetricsButton.style.backgroundColor = '#FFF';
toggleMetricsButton.style.border = 'none';
toggleMetricsButton.style.borderRadius = '5px';
toggleMetricsButton.addEventListener('click', function() {
    var exitBoxGraph = document.getElementById('exitBoxGraph');
    if (exitBoxGraph.style.display === 'none') {
        exitBoxGraph.style.display = 'block';
    } else {
        exitBoxGraph.style.display = 'none';
    }
});
document.body.appendChild(toggleMetricsButton);

/////////////////////////////Graph//////////////////////////
var ctx = document.getElementById('exitBoxGraph').getContext('2d');

var chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Exit 1', 'Exit 2', 'Exit 3', 'Exit 4', 'Exit 5', 'Exit 6', 'Exit 7', 'Exit 8', 'Exit 9', 'Exit 10', 'Exit 11'],
        datasets: [{
            label: 'Ball Landings',
            data: exitBoxCounters,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    },
    options: {
        maintainAspectRatio: false,
        responsive: false,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
