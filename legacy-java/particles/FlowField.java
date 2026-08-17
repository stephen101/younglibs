package particles;

import core.Object2D;
import processing.core.PApplet;
import processing.core.PVector;

import static processing.core.PApplet.constrain;
import static processing.core.PApplet.cos;
import static processing.core.PApplet.sin;
import static processing.core.PConstants.TWO_PI;

/**
 * Created by stephenyo on 2017/01/16.
 */
public class FlowField extends Object2D {

    // A flow field is a two dimensional array of PVectors
    private PVector[][] field;
    private int cols, rows; // Columns and Rows
    private int resolution; // How large is each "cell" of the flow field
    private float zoff = 0;
    private double zoffVelocity = (float) 0.001; //How fast the flow field moves through the z exis of the perlin noise space

    public void step() {
        // Move along the z axis in the noise space
        zoff += zoffVelocity;
        float xoff = 0;
        for (int i = 0; i < cols; i++) {
            float yoff = 0;
            for (int j = 0; j < rows; j++) {
                float theta = PApplet.map(pa.noise(xoff,yoff, zoff),0,1,0,TWO_PI*2);
                // Polar to cartesian coordinate transformation to get x and y components of the vector
                field[i][j] = new PVector(cos(theta),sin(theta));
                yoff += 0.1;
            }
            xoff += 0.1;
        }
    }

    // Draw every vector
    public void display() {
        for (int i = 0; i < cols; i++) {
            for (int j = 0; j < rows; j++) {
                drawVector(field[i][j],i*resolution,j*resolution,resolution-2);
            }
        }

    }

    PVector lookup(PVector lookup) {
        int column = (int) constrain(lookup.x/resolution,0,cols-1);
        int row = (int) constrain(lookup.y/resolution,0,rows-1);
        return field[column][row].copy();
    }

    public FlowField(PApplet pa, int res, double fieldVelocity) {
        super(pa); {
            zoffVelocity = fieldVelocity;
            resolution = res;
            // Determine the number of columns and rows based on sketch's width and height
            cols = pa.width/resolution;
            rows = pa.height/resolution;
            field = new PVector[cols][rows];
            step();
        }
    }
}
