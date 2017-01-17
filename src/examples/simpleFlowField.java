package examples;

/**
 * Created by stephenyo on 2017/01/16.
 */
import particles.FlowField;
import particles.FlowFieldFollower;
import processing.core.PApplet;
import processing.core.PVector;

import java.util.ArrayList;

public class simpleFlowField extends PApplet{

    // Using this variable to decide whether to draw all the stuff
    private boolean debug = false;

    // Flowfield object
    private FlowField flowfield;

    // An ArrayList of vehicles
    private ArrayList<FlowFieldFollower> particles;

    public void setup() {
        background(200);
        // Make a new flow field with "resolution" of 20
        flowfield = new FlowField(this, 20, 0.01);
        particles = new ArrayList<>();
        // Make a whole bunch of vehicles with random maxspeed and maxforce values
        int particleCount = 150;
        for (int i = 0; i < particleCount; i++) {
            particles.add(new FlowFieldFollower(this, new PVector(random(width), random(height)), random(2, 5), random((float)0.1, (float)0.5)));
        }
    }

    public void draw() {
        background(200);
        flowfield.step();
        // Display the flowfield in "debug" mode
        if (debug) flowfield.display();
        // Tell all the vehicles to follow the flow field
        for (FlowFieldFollower p : particles) {
            p.follow(flowfield);
            p.run();
        }
    }


    public void keyPressed() {
        if (key == ' ') {
            debug = !debug;
        }
        if (key == 's') {
            saveFrame("~/Desktop/processing.png");
        }
    }

    // Make a new flowfield
    public void mousePressed() {
        flowfield.step();
    }

    public void settings() {
        fullScreen();
    }
}



