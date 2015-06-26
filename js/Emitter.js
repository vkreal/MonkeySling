/*
* Copyright 2012, Vorun Kreal
* Licensed under the MIT License.
*/

VK.Particle = function () {
};

VK.Emitter = function (
		x, y,
		width, height,
		vx, vy,
		vxRandom, vyRandom,
		ax, ay,
		axRandom, ayRandom,
		vr, vrRandom,
		physical,
		maxAge,
		emissionRate,
		fadeOut,
		maxParticles,
		startR, startG, startB,
		endR, endG, endB,
		startS, endS, radius) {

    this.radius = radius || 5;
    // To accomodate pulses as well as continuous particle emission,
    // this emitter has to be aware of whether it is currently active.
    this.active = false;

    // When the emitter is pulsed it counts down for the pulse duration.
    this.remainingDuration = 0;

    // Each particle object will be kept in an array.
    this.particles = new Array();

    // --- Where the particles are emitted from ---

    // The emitter has a location in space
    this.x = x;
    this.y = y;

    // The emitter can also spawn particles over a volume
    // centered around the position. If the width and height
    // are 0 the particles will be emitted from a single point.
    this.width = width;
    this.height = height;

    // --- Speed and movement for particles ---

    // Velocity params for the particles.
    this.vx = vx;
    this.vy = vy;

    // The velocity may be perturbed by adding a
    // number between [-vxRandom, vxRandom]
    this.vxRandom = vxRandom;
    this.vyRandom = vyRandom;

    // Acceleration to be applied to the particles each frame.
    this.ax = ax;
    this.ay = ay;

    // Random factor to apply to the acceleration each frame.
    this.axRandom = axRandom;
    this.ayRandom = ayRandom;

    // Rotational velocity.
    this.vr = vr;
    this.vrRandom = vrRandom;

    // Defines whether the particles should respond to gravity
    // and bounce off the walls.
    this.physical = physical;

    // --- How many particles are around at once ---

    // How long particles live (in ms).
    this.maxAge = maxAge;

    // How quickly particles are emitted (in particles / ms)
    this.emissionRate = emissionRate;

    // How long the fade out lasts at the end of a particle's life,
    // in ms. If 0 then particles disappear abruptly.
    this.fadeOut = fadeOut;

    // Hard limit on the number of particles.
    this.maxParticles = maxParticles;

    // --- Particle color and scale ---

    // Start color for the particles, values [0-255]
    this.startR = startR;
    this.startG = startG;
    this.startB = startB;

    // End color for the particles, values [0-255]
    this.endR = endR;
    this.endG = endG;
    this.endB = endB;

    // Start and end scale for the particles.
    this.startS = startS;
    this.endS = endS;

    /* 
    * Used to start the emitter. A null active duration means to
    * continue emitting indefinitely.
    */
    this.noActiveParticles = false;
    this.activate = function (durationActive) {
        this.remainingDuration = durationActive;
        this.active = true;
        this.noActiveParticles = false;
        this.timeSinceEmission = 0;
    };

    this.initParticle = function (p) {
        p.x = this.x + ((Math.random() * 2) - 1) * (this.width / 2);
        p.y = this.y + ((Math.random() * 2) - 1) * (this.height / 2);
        p.vx = this.vx + ((Math.random() * 2) - 1) * this.vxRandom;
        p.vy = this.vy + ((Math.random() * 2) - 1) * this.vyRandom;
        p.ax = this.ax + ((Math.random() * 2) - 1) * this.axRandom;
        p.ay = this.ay + ((Math.random() * 2) - 1) * this.ayRandom;
        p.age = 0;
        p.active = true;
        p.r = 0;
        p.vr = this.vr + ((Math.random() * 2) - 1) * this.vrRandom;
        p.alpha = 1.0;
        p.red = this.startR;
        p.green = this.startG;
        p.blue = this.startB;
        p.s = this.startS;
        return p;
    };

    this.timeSinceEmission = 0;
    this.update = function (timeDelta) {

        // A null remainingDuration means to keep the emitter on indefinitely.
        if (this.remainingDuration != null) {
            this.remainingDuration = Math.max(0, this.remainingDuration - timeDelta);
            this.active = this.remainingDuration > 0;
        }

        if (this.noActiveParticles && !this.active) {
            return;
        }

        // Update all particles.
        this.noActiveParticles = true;
        for (var i = 0; i < this.particles.length; i++) {
            var p = this.particles[i];

            if (!p.active) {
                continue;
            }
            this.noActiveParticles = false;

            // Acceleration into velocity.
            p.vx += p.ax;
            p.vy += p.ay;

            // Velocity into position.
            p.x += p.vx;
            p.y += p.vy;
            p.r += p.vr;

            // Percentage of max age for this particle.
            // Used for interpolation variables.
            var pct = p.age / this.maxAge;

            // Scale.
            p.s = this.startS + ((this.endS - this.startS) * pct);

            // Colors.
            p.red = Math.round(this.startR + ((this.endR - this.startR) * pct));
            p.green = Math.round(this.startG + ((this.endG - this.startG) * pct));
            p.blue = Math.round(this.startB + ((this.endB - this.startB) * pct));

            // Alpha.
            if (this.maxAge - p.age < this.fadeOut) {
                p.alpha = (this.maxAge - p.age) / this.fadeOut;
            }

            // Compute physics constraints if necessary.
            if (this.physical) {
                p.vy += .5; // gravity
                if (p.x < 0 || p.x > 320) {
                    p.vx *= -.8;
                    p.x = Math.max(0, p.x);
                    p.x = Math.min(320, p.x);
                }
                if (p.y < 0 || p.y > 240) {
                    p.vy *= -.8;
                    p.y = Math.max(0, p.y);
                    p.y = Math.min(240, p.y);
                }
            }

            // Kill the particle if it's too old.
            p.age += timeDelta;
            if (p.age > this.maxAge) {
                p.active = false;
            }
        }

        // Update old particles always, but don't spawn new ones if inactive.
        if (!this.active) {
            return;
        }

        // Emit new particles if necessary.
        this.timeSinceEmission += timeDelta;
        if (this.timeSinceEmission < this.emissionRate) {
            return;
        }
        this.noActiveParticles = false;

        // Try to re-use particle objects if possible.
        for (var i = 0; i < this.particles.length; i++) {

            // Quit updating once the correct number have been
            // spawned.
            if (this.timeSinceEmission < this.emissionRate) {
                return;
            }

            var p = this.particles[i];
            if (!p.active) {
                this.initParticle(p);
                this.timeSinceEmission -= this.emissionRate;
            }
        }

        // Can't reuse existing de-spawned particles, so add new ones.
        while (this.timeSinceEmission > this.emissionRate &&
				this.particles.length < this.maxParticles) {

            // Maintain the particle cap.
            if (this.particles.length >= this.maxParticles) {
                return;
            }

            this.particles.push(this.initParticle(new VK.Particle()));
            this.timeSinceEmission -= this.emissionRate;
        }
    };

    this.draw = function (drawingContext) {
        if (this.noActiveParticles) {
            return;
        }
        var r = this.radius;
        var particles = this.particles;
        var len = particles.length;
        for (var i = 0; i < len; i++) {
            var p = particles[i];
            if (p.active) {
                // Color and alpha.
                // drawingContext.globalAlpha = p.alpha;
                drawingContext.fillStyle = "rgb(" + p.red + "," + p.green + "," + p.blue + ")";

                // Transform.
                drawingContext.translate(p.x, p.y);
                drawingContext.rotate(p.r * Math.PI / 180);
                drawingContext.scale(p.s, p.s);

                drawingContext.beginPath();
                drawingContext.arc(0, 0, r, 0, Math.PI * 2, true);
                drawingContext.closePath();
                drawingContext.fill();

                drawingContext.scale(1 / p.s, 1 / p.s);
                drawingContext.rotate(-1 * p.r * Math.PI / 180);
                drawingContext.translate(-1 * p.x, -1 * p.y);
            }
        }
    };
};

//VK.ParticleCircle = Class.extend({
//    WIDTH: 0,
//    HEIGHT: 0,
//    isActive: function () { return true; },
//    init: function (options) {
//        this.set(options);
//    },
//    s: { ttl: 8000, xmax: 5, ymax: 2, rmax: 10, rt: 1, xdef: 960, ydef: 540, xdrift: 4, ydrift: 4, random: true, blink: true },
//    reset: function () {
//        var rint = 60;
//        this.x = (this.s.random ? this.WIDTH * Math.random() : this.s.xdef);
//        this.y = (this.s.random ? this.HEIGHT * Math.random() : this.s.ydef);
//        this.r = ((this.s.rmax - 1) * Math.random()) + 1;
//        this.dx = (Math.random() * this.s.xmax) * (Math.random() < .5 ? -1 : 1);
//        this.dy = (Math.random() * this.s.ymax) * (Math.random() < .5 ? -1 : 1);
//        this.hl = (this.s.ttl / rint) * (this.r / this.s.rmax);
//        this.rt = Math.random() * this.hl;
//        this.s.rt = Math.random() + 1;
//        this.stop = Math.random() * .2 + .4;
//        this.s.xdrift *= Math.random() * (Math.random() < .5 ? -1 : 1);
//        this.s.ydrift *= Math.random() * (Math.random() < .5 ? -1 : 1);
//    },
//    update: function () { },
//    fade: function () {
//        this.rt += this.s.rt;
//    },
//    draw: function (con) {
//        if (this.s.blink && (this.rt <= 0 || this.rt >= this.hl)) this.s.rt = this.s.rt * -1;
//        else if (this.rt >= this.hl) this.reset();
//        var newo = 1 - (this.rt / this.hl);
//        con.beginPath();
//        con.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
//        con.closePath();
//        var cr = this.r * newo;
//        g = con.createRadialGradient(this.x, this.y, 0, this.x, this.y, (cr <= 0 ? 1 : cr));
//        g.addColorStop(0.0, 'rgba(255,255,255,' + newo + ')');
//        g.addColorStop(this.stop, 'rgba(77,101,181,' + (newo * .6) + ')');
//        g.addColorStop(1.0, 'rgba(77,101,181,0)');
//        con.fillStyle = g;
//        con.fill();
//    },
//    move: function () {
//        this.x += (this.rt / this.hl) * this.dx;
//        this.y += (this.rt / this.hl) * this.dy;
//        if (this.x > this.WIDTH || this.x < 0) this.dx *= -1;
//        if (this.y > this.HEIGHT || this.y < 0) this.dy *= -1;
//    }
//});


VK.ParticleCircle = function (options) {
    this.s = { ttl: 8000, xmax: 5, ymax: 2, rmax: 10, rt: 1, xdef: 960, ydef: 540, xdrift: 4, ydrift: 4, random: true, blink: true };
    var rint = 20;
    var WIDTH = options.WIDTH;
    var HEIGHT = options.HEIGHT;

    this.reset = function () {
        this.x = (this.s.random ? WIDTH * Math.random() : this.s.xdef);
        this.y = (this.s.random ? HEIGHT * Math.random() : this.s.ydef);
        this.r = ((this.s.rmax - 1) * Math.random()) + 1;
        this.dx = (Math.random() * this.s.xmax) * (Math.random() < .5 ? -1 : 1);
        this.dy = (Math.random() * this.s.ymax) * (Math.random() < .5 ? -1 : 1);
        this.hl = (this.s.ttl / rint) * (this.r / this.s.rmax);
        this.rt = Math.random() * this.hl;
        this.s.rt = Math.random() + 1;
        this.stop = Math.random() * .2 + .4;
        this.s.xdrift *= Math.random() * (Math.random() < .5 ? -1 : 1);
        this.s.ydrift *= Math.random() * (Math.random() < .5 ? -1 : 1);
    }

    this.fade = function () {
        this.rt += this.s.rt;
    }

    this.draw = function (con) {
        try {
            if (this.s.blink && (this.rt <= 0 || this.rt >= this.hl)) this.s.rt = this.s.rt * -1;
            else if (this.rt >= this.hl) this.reset();
            var newo = 1 - (this.rt / this.hl);
            con.beginPath();
            con.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
            con.closePath();
            var cr = this.r * newo;
            g = con.createRadialGradient(this.x, this.y, 0, this.x, this.y, (cr <= 0 ? 1 : cr));
            g.addColorStop(0.0, 'rgba(255,255,255,' + newo + ')');
            g.addColorStop(this.stop, 'rgba(77,101,181,' + (newo * .6) + ')');
            g.addColorStop(1.0, 'rgba(77,101,181,0)');
            con.fillStyle = g;
            con.fill();
        }
        catch (e) { }
    }

    this.move = function () {
        this.x += (this.rt / this.hl) * this.dx;
        this.y += (this.rt / this.hl) * this.dy;
        if (this.x > WIDTH || this.x < 0) this.dx *= -1;
        if (this.y > HEIGHT || this.y < 0) this.dy *= -1;
    }

    this.getX = function () { return this.x; }
    this.getY = function () { return this.y; }
};