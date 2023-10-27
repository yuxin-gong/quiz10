var song
var fft

var particles = []
let rectangles = []
let stars = []

let lerpAmount

let squareSize;
let t = 0.5;


function preload() {
    //user upload button
    inputbtn = createFileInput((file)=>{
        song = loadSound(file)
        document.getElementsByTagName("input")[0].setAttribute("type","hidden");
        alert("Click on the screen to play or pause")
    }); 
    var inputELE = document.getElementsByTagName("input")[0]
    inputbtn.position(windowWidth/2 -120,15)
    inputELE.style.backgroundColor = 'lightgreen';
    inputELE.style.height = '42px';
    inputELE.style.padding = '10px';

    song = loadSound("audio/sample-visualisation.mp3")
    
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES)
    imageMode(CENTER)
    rectMode(CENTER)

    squareSize = random(height);
    squareSizeTarget=random(height);

    fft = new p5.FFT(0.8, 512)
    noLoop()

    //create rectangles in an array (1 for each frequency band)
    for (let i = 0; i < 16; i++) {
        //create a random colour
        let alpha = random(0, 20);
        let colour = color(0, 0, random(240,250), alpha);
        rectangles.push(
          new Rectangle(random(100, width - 200), random(100, height - 200), colour)
    );
  }

    //create stars in an array (1 for each frequency band)
    for (let i = 0; i < 8; i++) {
        //create a random colour
        let colour = color(255,255,200,150);
        stars.push(
          new Star(random(windowWidth), random(windowHeight), colour)
        );
    }
}

function draw() {

    //start page
    // Give the user a hint on how to interact with the sketch
    if (getAudioContext().state !== 'running') {
    background(20);

    push()
    textSize(20);
    translate(width/2,height/2);
    textAlign(CENTER,CENTER);
    fill(255)
    text('TAP TO PLAY SOUND',10,10);
    pop()

    return;
    }

    //playback page
    background(255, 180, 180, 15)
    background(50, 5)

    push()
    textSize(20);
    translate(width/2,height/2);
    translate(random(5),random(5));
    textAlign(CENTER,CENTER);
    text('TAP TO PLAY or STOP THE SOUND',0,0);
    pop()

    //analyze the spectrum and amplitude of the song
    let spectrum = fft.analyze();
    let amp = fft.getEnergy(20, 200)

    stroke(random(0,255), random(20,255), random(20,255))
    strokeWeight(3)
    noFill()

    push()
    //get data from fft waveform
    var wave = fft.waveform()

    //create linear shape
    translate(0,height/4)
    beginShape()
    for(var i=0; i<width; i+=0.5) {
        var index = floor(map(i,0,width,0,wave.length))
        var x = i
        var y = wave[index] * 100 + height /2
        vertex(x,y)
    }
    endShape()

    //create circular shape
    translate(width/2, height/4)
    for(var t = -1; t <= 1; t += 2) {
        beginShape()
        for(var i = 0; i <= 180; i += 0.5) {
            var index = floor(map(i,0,180,0,wave.length-1))
            var r = map(wave[index], -1, 1, 90, 350)
            var x = r * sin(i) * t
            var y = r * cos(i)
            vertex(x,y)
        }
        endShape()
    }


    //create particles swarm
    var p = new Particle()
    particles.push(p)

    for(var i = particles.length - 1; i >= 0; i--) {
        if(!particles[i].edges()) {
            particles[i].update(amp > 230)
            particles[i].show()
        } else {
            particles.splice(i, 1)
        }  
    }
    pop()

    //set the lerp amount from the mouse position
    lerpAmount = map(mouseX, 0, width, 0, 0.5);

    //link shapes to separate spectrum data
    for (let i = 0; i < rectangles.length; i++) {
        rectangles[i].display(spectrum[i]);
    }

    
    for (let i = 0; i < stars.length; i++) {
        stars[i].display(spectrum[i*2]);
    }

}

//user interaction
function mouseClicked() {
    if(song.isPlaying()) {
        song.pause()
        noLoop()
    } else {
        song.play()
        loop()
    }
}

// class to draw particles and create effects
class Particle{
    constructor() {
        this.pos = p5.Vector.random2D().mult(250)
        this.vel = createVector(0,0)
        this.acc = this.pos.copy().mult(random(0.0001, 0.00001))

        this.w = random(5, 10)
        this.color = [0, random(0,255), random(100,255)]
    }
    update(cond) {
        this.vel.add(this.acc)
        this.pos.add(this.vel)
        if(cond) {
            this.pos.add(this.vel)
            this.pos.add(this.vel)
            this.pos.add(this.vel)
        }
    }
    edges() {
        if(this.pos.x < -width/2 || this.pos.x > width/2 || this.pos.y < -height/2 || this.pos.y > height/2) {
            return true
        } else {
            return false
        }
    }
    show() {
        noStroke()
        fill(this.color)
        ellipse(this.pos.x, this.pos.y, this.w)
    }
}

// class to draw rectangles and manipulate their size
class Rectangle {
    constructor(x, y, colour) {
      this.x = x;
      this.y = y;
      this.currentSize = 0;
      this.colour = colour;
    }
  
    display(amp) {
      //the target size is defined by the amplitude of the frequency band with a max of 50
      let targetSize = map(amp, 0, 255, 0, 50);
      this.currentSize = lerp(this.currentSize, targetSize, lerpAmount);
      stroke(0, random(0,255), random(100,255));
      strokeWeight(1)
      fill(this.colour);
      rect(this.x, this.y, this.currentSize, this.currentSize*random(4,6));
    }
  }

  //

    //define drawstar funtion for star class
    function drawStar(xPos, yPos, rotation, ratio) {
        push()
        // use xPos and yPos to make it move.
        translate(xPos,yPos);
        
        //use rotation to make it spin.
        angleMode(DEGREES);
        rotate(rotation);
        
        //use ratio to make it grow
        scale(ratio);
        
        //draw star shape
        stroke(255,255,255);
        strokeWeight(2);
        beginShape();
        vertex(-10, 10);
        vertex(0, 35);
        vertex(10, 10);
        vertex(35, 0);
        vertex(10, -8);
        vertex(0, -35);
        vertex(-10, -8);
        vertex(-35, 0);
        endShape();
        pop()
    }

// class to draw stars and manipulate their effects
class Star {
    constructor(x, y, colour) {
      this.x = x;
      this.y = y;
      this.currentSize = 0;
      this.colour = colour;
    }
    //react to audio by the amplitude parameter
    display(amp) {
      //the target size is defined by the amplitude of the frequency band with a max of 100
      let targetSize = map(amp, 0, 255, 0, 100);
      this.currentSize = lerp(this.currentSize, targetSize, lerpAmount);
      fill(this.colour);
      drawStar(this.x, this.y,this.currentSize*2, this.currentSize/85);
    }
  }