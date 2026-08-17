package core;

import processing.core.PApplet;
import processing.core.PVector;

/**
 * Created by stephenyo on 2017/01/16.
 */
public class Object2D extends ProcessingObject {
    public Object2D(PApplet pa) {
        super(pa);
    }

    // Renders a vector object 'v' as an arrow and a location 'x,y'
    protected void drawVector(PVector v, float x, float y, float scayl) {
        pa.pushMatrix();
        // Translate to location to render vector
        pa.translate(x,y);
        pa.stroke(0,100);
        // Call vector heading function to get direction (note that pointing to the right is a heading of 0) and rotate
        pa.rotate(v.heading());
        // Calculate length of vector & scale it to be bigger or smaller if necessary
        float len = v.mag()*scayl;
        // Draw three lines to make an arrow (draw pointing up since we've rotate to the proper direction)
        pa.line(0,0,len,0);
        pa.popMatrix();
    }
}
