#pragma strict

function OnTriggerEnter(other : Collider)
{
Debug.Log("Collided");
}
function OnTriggerExit(other : Collider)
{
Debug.Log("Collided escape");
}