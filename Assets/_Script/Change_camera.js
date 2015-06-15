#pragma strict
var hoodCamera : Camera;
var followCamera : Camera;
function Start () {
followCamera.enabled = true;
hoodCamera.enabled=false;
}

function Update () {
if(Input.GetKeyDown(KeyCode.C))
{
hoodCamera.enabled = !hoodCamera.enabled;
followCamera.enabled = !hoodCamera.enabled;
}
}