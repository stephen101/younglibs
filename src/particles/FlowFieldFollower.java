package particles;

import processing.core.PApplet;
import processing.core.PVector;

/**
 * Created by stephenyo on 2017/01/16.
 */
public class FlowFieldFollower extends Particle {

    public FlowFieldFollower(PApplet pa, PVector l, float ms, float mf) {
        super(pa, l, ms, mf);
    }

    // Implementing Reynolds' flow field following algorithm
    // http://www.red3d.com/cwr/steer/FlowFollow.html
    public void follow(FlowField flow) {
        // What is the vector at that spot in the flow field?
        PVector desired = flow.lookup(location);
        // Scale it up by maxspeed
        desired.mult(maxspeed);
        // Steering is desired minus velocity
        PVector steer = PVector.sub(desired, velocity);
        steer.limit(maxforce);  // Limit to maximum steering force
        applyForce(steer);
    }
}
