package particles;

import core.ProcessingObject;
import processing.core.PApplet;
import processing.core.PVector;

import java.util.ArrayList;

import static processing.core.PApplet.radians;
import static processing.core.PConstants.TRIANGLES;

interface ParticleBehaviour {
    void apply(Particle p);
}

class ParticleBehaviours extends ProcessingObject {
    ParticleBehaviour WRAP_AROUND = (p) -> {
        if (p.location.x < -p.r) p.location.x = pa.width + p.r;
        if (p.location.y < -p.r) p.location.y = pa.height + p.r;
        if (p.location.x > pa.width + p.r) p.location.x = - p.r;
        if (p.location.y > pa.height + p.r) p.location.y = - p.r;
    };

    ParticleBehaviour RANDOM_TELEPORT = (p) -> {
        if (p.location.x < -p.r) p.location.x = pa.random(pa.width);
        if (p.location.y < -p.r) p.location.y = pa.height + pa.random(pa.height);
        if (p.location.x > pa.width + p.r) p.location.x = pa.random(pa.width);
        if (p.location.y > pa.height + p.r) p.location.y = pa.random(pa.height);
    };


    ParticleBehaviours(PApplet pa) {
        super(pa);
    }
}

class Particle extends ProcessingObject {
    // The usual stuff
    PVector location;
    PVector velocity;
    private PVector acceleration;
    float r;
    float maxforce;    // Maximum steering force
    float maxspeed;    // Maximum speed

    private ParticleBehaviours particleBehaviours;
    private ArrayList<ParticleBehaviour> behaviours;

    Particle(PApplet applet, PVector l, float ms, float mf) {
        super(applet);
        particleBehaviours = new ParticleBehaviours(pa);
        behaviours = new ArrayList<>();
        behaviours.add(particleBehaviours.RANDOM_TELEPORT);
        location = l.copy();
        r = 1;
        maxspeed = ms;
        maxforce = mf;
        acceleration = new PVector(0,0);
        velocity = new PVector(0,0);
    }

    public void run() {
        update();
        for (ParticleBehaviour b: behaviours) {
            b.apply(this);
        }
        display();
    }

    void applyForce(PVector force) {
        // We could add mass here if we want A = F / M
        acceleration.add(force);
    }

    // Method to update location
    private void update() {
        // Update velocity
        velocity.add(acceleration);
        // Limit speed
        velocity.limit(maxspeed);
        location.add(velocity);
        // Reset accelertion to 0 each cycle
        acceleration.mult(0);
    }

    private void display() {
        // Draw a triangle rotated in the direction of velocity
        float theta = velocity.heading() + radians(90);
        pa.fill(75);
        pa.stroke(75);
        pa.pushMatrix();
        pa.translate(location.x,location.y);
        pa.rotate(theta);
        pa.beginShape(TRIANGLES);
        pa.vertex(0, -r*2);
        pa.vertex(-r, r*2);
        pa.vertex(r, r*2);
        pa.endShape();
        pa.popMatrix();
    }
}
