#pragma strict

var myWheelCollider : WheelCollider;
function Start () {

}

function Update () {
transform.Rotate(myWheelCollider.rpm/60*360*Time.deltaTime,0,0);
transform.localEulerAngles.y=myWheelCollider.steerAngle - transform.localEulerAngles.z;

var hit : RaycastHit;
var wheelPosition : Vector3;
if(Physics.Raycast(myWheelCollider.transform.position,-myWheelCollider.transform.up,hit,myWheelCollider.radius + myWheelCollider.suspensionDistance))
wheelPosition = hit.point + myWheelCollider.transform.up * myWheelCollider.radius;
else
wheelPosition =myWheelCollider.transform.position - myWheelCollider.transform.up * myWheelCollider.suspensionDistance;


transform.position = wheelPosition;
}