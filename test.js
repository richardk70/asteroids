const canvas = document.getElementById('space'); // space canvas
const BG = document.getElementById('BG'); // space canvas
const ctx = canvas.getContext('2d');
const ctxBG = BG.getContext('2d');
const canW = canvas.offsetWidth; // 800
const canH = canvas.offsetHeight; // 600

let roSpeed = 0.0,
    maxRoSpd = 0.033,
    angle = 0,
    shotAngle = 0;
let speedX = 0,
    speedY = 0;
let maxX = 2,
    maxY = 2;
let thrusting = false;
let braking = false;
let firing = false;
let dead = false;
const shots = [];

// draw stars
function drawStars(){
    const starColors = ['yellow', 'orange', '#e77471', '#57feff', 'white', '#4b0082', '#ffdb58'];
    const STARS = 250;
    const len = starColors.length; 

    for (var i = 0; i < STARS; i++){
        let x = Math.round(Math.random() * canW );
        let y = Math.round(Math.random() * canH );
        let color = Math.round(Math.random() * len);
        let radii = Math.random() * 2;
        ctxBG.beginPath();
        ctxBG.arc(x,y, radii, 0, Math.PI*2, true);
        ctxBG.closePath();
        ctxBG.fillStyle = starColors[color];
        ctxBG.fill();
    }
}

drawStars();

// CONTROLS ////////////////////////////////////////////////
document.addEventListener('keydown', (e) => {
    switch (e.key){
        case 'ArrowLeft': left();
        break;
        case 'ArrowRight': right();
        break;
        case 'ArrowUp': thrusting = true;
                        go();
        break;
        case 'ArrowDown':   braking = true;
                            brake();
        break;
        case 'Control': createShot();
        break;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key == 'ArrowUp' || e.key == 'ArrowDown'){
        thrusting = false;
        braking = false;
    }
});

function left(){
    if (roSpeed > -maxRoSpd)
        roSpeed = roSpeed - .0174533; // 1 degree
    if (roSpeed > 0)
        roSpeed = 0;
    }
    function right(){
        if (roSpeed < maxRoSpd)
            roSpeed = roSpeed + .0174533; // 1 degree
        if (roSpeed < 0)
            roSpeed = 0;
}

function go(){
    // slow rotation speed
    roSpeed *= .5;
    speedX += 0.25 * Math.cos(angle);
    if (speedX > 2)
        speedX = 2;
    if (speedX < -2)
        speedX = -2;
    speedY += 0.25 * Math.sin(angle);
    if (speedY > 2)
        speedY = 2;
    if (speedY < -2)
        speedY = -2;
}

function brake(){
    speedX /= 2;
    speedY /= 2;
    roSpeed /= 2;
}

// vector graphics //////////////////////////////////////
const roid1 = [0,20, 10,30, 20,20, 30,10, 30,0, 30,-10, 20,-20, 10,-30, 0,-20, -10,-30, -20,-20, -30,-10, -30,0, -30,10, -20,20, -10,30, 0,20];
let shipX = canW/2, 
    shipY = canH/2;
const shipInit = [20,0, -10,-15, 0,0, -10,15, 20,0];
let shipShape = [20,0, -10,-15, 0,0, -10,15, 20,0];
const flameShape = [-5,0, -15,-10, -35,0, -15,10, -5,0];


function wrap(obj){
    if (obj.x > canW + 10)
    obj.x = 0;
    if (obj.x < -10)
    obj.x = canW;
    if (obj.y > canH + 10)
    obj.y = 0;
    if (obj.y < -10)
    obj.y = canH;
}

// SHIP /////////////////////////////////////////////////
const ship = {
    x: canW/2,
    y: canH/2,
    points: shipShape,
    color: 'grey' 
};

const flame = {
    points: flameShape,
    color: 'yellow'
}

function move(obj){
    var c = Math.cos(roSpeed);
    var s = Math.sin(roSpeed);

    ship.x += speedX;
    ship.y += speedY;

    //wrap
    wrap(ship);

    // rotation
    for (var i = 0; i < obj.length; i+=2){
        var x = obj[i];
        var y = obj[i+1];

        obj[i] = x*c - s*y;
        obj[i+1] = x*s + y*c;
    }
}

function draw(obj){    
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';
    ctx.fillStyle = obj.color;
    ctx.beginPath();
    ctx.moveTo(obj.points[0] + ship.x, obj.points[1] + ship.y);
    for (var i = 0; i < obj.points.length; i+=2){
        ctx.lineTo(obj.points[i+2] + ship.x, obj.points[i+3] + ship.y);
    }
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}

// SHOTS //////////////////////////////////////////////
const LIMIT = 4;

function Shot(x,y,angle){
    this.x = x;
    this.y = y;
    this.angle = angle;
}

function createShot(){
    if (shots.length < LIMIT){
    firing = true;
    //setInterval( ()=> {
    shotAngle = angle;
    // puts the shot right at tip of spaceship
    shotX = ship.x + (20 * Math.cos(shotAngle));
    shotY = ship.y + (20 * Math.sin(shotAngle));
        shots.push(new Shot(shotX, shotY, shotAngle));
         
    //}, 500);
} else ;
}

function edge(obj){
    if (obj.x > canW || obj.x < 0 || obj.y > canH || obj.y < 0)
        shots.shift(obj);
}

function moveShot(){
    for (var i = 0; i < shots.length; i++){
        shots[i].x += Math.cos(shots[i].angle) * 4;
        shots[i].y += Math.sin(shots[i].angle) * 4;
    }

    // edge detection
    for (let i = 0; i < shots.length; i++)
        edge(shots[i]);

    // draw the shots
    for (var i = 0; i < shots.length; i++)
        drawShots(shots[i]);
}

function drawShots(obj){
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(obj.x, obj.y);
    ctx.lineTo(obj.x + 2, obj.y);
    ctx.lineTo(obj.x + 2, obj.y + 2);
    ctx.lineTo(obj.x, obj.y + 2);
    ctx.lineTo(obj.x, obj.y);
    ctx.stroke();
    ctx.closePath();
}

// ASTEROIDS ///////////////////////////////////////////////////
let ROIDCOUNT = 2;
let roids = [];

function Roid(x,y, velX, velY, spin, points, size){
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.spin = spin;
    this.points = points;
    this.size = size;
}

function smallRoids(x,y, size){
    for (var i = 0; i < 3; i++){
        let velX = Math.random() * 2 - 1;
        let velY = Math.random() * 2 - 1;
        let spin = (Math.random() * 2 - 1.5)/30;
        let points = genPoints();
        roids.push(new Roid(x, y, velX, velY, spin, points, size));
    }
}

function initRoids(){
    roids = [];
    for (var i = 0; i < ROIDCOUNT; i++){
        let roidX = Math.round(Math.random() * 100 - 150);
        let roidY = Math.round(Math.random() * 600);
        let velX = Math.random() - 0.5;
        let velY = Math.random() - 0.5;
        let spin = (Math.random() * 2 - 1.5)/30;
        let points = genPoints();
        let size = 1.5;
        roids.push(new Roid(roidX, roidY, velX, velY, spin, points, size));
    }
}

function checkRoidCount(){
    if (roids.length < 1){
        ROIDCOUNT+=1;
        initRoids();
    }
}

function genPoints(){
    let roid2 = [];
    for (var i = 1; i < roid1.length-1; i++){
        let ran = Math.round(Math.random() * 10 - 5);
        roid2.push(roid1[i] + ran);
    }
    return roid2;
}

function drawRoids(){
    for (var i = 0; i < roids.length; i++)
        drawRoid(roids[i]);
}

function drawRoid(obj){
    const MULT = obj.size;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'grey';
    ctx.beginPath();
    ctx.moveTo(obj.points[0]*MULT+obj.x, obj.points[1]*MULT+obj.y);
    for (var i = 0; i < obj.points.length; i+=2){
        if (i === obj.points.length - 2)
            ctx.lineTo(obj.points[0]*MULT+obj.x,obj.points[1]*MULT+obj.y);
        else
            ctx.lineTo(obj.points[i+2]*MULT+obj.x, obj.points[i+3]*MULT+obj.y);
            
            ctx.stroke();
            ctx.fill();
    }
    ctx.closePath();
}

function moveRoids(){
    for (var i = 0; i < roids.length; i++)
        moveRoid(roids[i]);
}

function moveRoid(obj){
    var c = Math.cos(obj.spin);
    var s = Math.sin(obj.spin);

    for (var i = 0; i < obj.points.length; i+=2){
        var x = obj.points[i];
        var y = obj.points[i+1];

        obj.points[i] = x*c - s*y;
        obj.points[i+1] = x*s + y*c;
    }

    obj.x += obj.velX;
    obj.y += obj.velY;

    wrap(obj);
    shipCollide(obj);
}

// COLLISION DETECTION ////////////////////////////////////////////////
function checkCollision(){
    for (var i = 0; i < shots.length; i++){
        for (var j = 0; j < roids.length; j++){
            let bound = roids[j].size * 35;
            if (shots[i].x > roids[j].x - bound && shots[i].x < roids[j].x + bound)
                if (shots[i].y > roids[j].y - bound && shots[i].y < roids[j].y + bound){
                    // the moment of impact!
                    // get the X, Y coords of explosion
                    let expX = Math.round(shots[i].x); 
                    let expY = Math.round(shots[i].y);
                    let roidX = Math.round(roids[j].x);
                    let roidY = Math.round(roids[j].y);
                    if (roids[j].size > 1)
                        smallRoids(roidX, roidY, .6);  
                    else if (roids[j].size > 0.4 )
                        smallRoids(roidX, roidY, 0.3);
                    shots.splice(i, 1);
                    roids.splice(j,1);
                    initExplode(expX, expY);

                    break;
                }
        }   
    }
}

function shipCollide(obj){
    // check ship collision too
    let x = Math.round(ship.x);
    let y = Math.round(ship.y);
    let Ax = Math.round(obj.x);
    let Ay = Math.round(obj.y);

    let bound = obj.size * 40;
        if ((x + 5 >= Ax - bound && x - 5 <= Ax + bound) &&
           (y + 5 >= Ay - bound && y - 5 <= Ay + bound))
        {
            // moment of impact!
            let expX = Math.round(ship.x);
            let expY = Math.round(ship.y);
            initExplode(expX, expY);
            dead = true;
            setTimeout( () =>{ 
                dead = false;
                ship.x = canW / 2;
                ship.y = canH / 2;
                roSpeed = 0;
                speedX = 0;
                speedY = 0;
            }, 1000);
        }
        
}

function Part(x,y,speed,angle, life){
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.angle = angle;
    this.life = life;
} 

let parts = [];

function initExplode(x, y){
    for (var i = 0; i < 20; i++){
        // vary angle
        let ranAngle = Math.round(Math.random() * 360);
        // vary speed
        let ranSpeed = Math.random() * 3 + .3;
        parts.push(new Part(x, y, ranSpeed, ranAngle, 60 + Math.random() * 90 - 30));
    }
    moveExplosion();
    
}

function moveExplosion(){
    for (var i = 0; i < parts.length; i++){
        // move out in random directions at random speeds
        parts[i].x += Math.cos(parts[i].angle) * parts[i].speed;
        parts[i].y += Math.sin(parts[i].angle) * parts[i].speed;
        //edge
        if (parts[i].x > canW || parts[i].x < 0 || parts[i].y > canH || parts[i].y < 0)
            parts.shift(parts[i]);
    }
}

function drawExplosion(){
    for (var i = 0; i < parts.length; i++){
        if (parts[i].life < 0)
            ;
        else {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(parts[i].x, parts[i].y);
            ctx.lineTo(parts[i].x + 2, parts[i].y);
            ctx.lineTo(parts[i].x + 2, parts[i].y + 2);
            ctx.lineTo(parts[i].x, parts[i].y + 2);
            ctx.lineTo(parts[i].x, parts[i].y);
            ctx.stroke();
            parts[i].life -= 1;
        }
    }
}

let reverseJet = [];

function initReverse(){

    moveReverse();
    drawReverse();
}

function forwardThrusters(){

}

// LOOP ///////////////////////////////////////////////////////////////
function loop(){
    angle = angle + roSpeed;
    ctx.clearRect(0,0, canW, canH);
    checkRoidCount();
    moveRoids();
    drawRoids();
    move(ship.points);
    move(flame.points);

    if (dead == false){
        draw(ship);
        if (thrusting === true)
            draw(flame); 
    }

    if (braking == true) {
//        initReverse();;
    }

    if (firing == true)
        moveShot();

    if (shots.length > 0)
        checkCollision();

    moveExplosion();
    drawExplosion();
    
    window.requestAnimationFrame(loop);
}

loop();
