#pragma strict
var wheel_FL : WheelCollider;
var wheel_FR : WheelCollider;
var wheel_BL : WheelCollider;
var wheel_BR : WheelCollider;

var maxTorque=5;
var steering_angle=0.0;
var maxSteer=35.0;
var brake=0.0;
var power=0.0;
function Start () {
rigidbody.centerOfMass.y=-0.9;
}
function FixedUpdate () {
power = maxTorque * Input.GetAxis("Vertical");
steering_angle= maxSteer * Input.GetAxis("Horizontal");
wheel_FR.steerAngle= maxSteer * Input.GetAxis("Horizontal");
wheel_FL.steerAngle= maxSteer * Input.GetAxis("Horizontal");
brake=Input.GetKey("space") ? rigidbody.mass *0.1:0.0;

if(brake>0.0)
{
wheel_FL.brakeTorque= brake;
wheel_FR.brakeTorque= brake;
wheel_BL.brakeTorque= brake;
wheel_BR.brakeTorque= brake;
wheel_BL.motorTorque=0.0;
wheel_BR.motorTorque=0.0;
}
else
{
wheel_FL.brakeTorque= 0.0;
wheel_FR.brakeTorque= 0.0;
wheel_BL.brakeTorque= 0.0;
wheel_BR.brakeTorque= 0.0;
wheel_BL.motorTorque=power;
wheel_BR.motorTorque=power;
}
}