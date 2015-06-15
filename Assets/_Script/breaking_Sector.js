#pragma strict

var maxBreakTorque : float;
var minCarSpeed : float;
function OnTriggerStay (other : Collider)
	{
	
	if(other.tag == "AI_Car")
		{
		var controlCurrentSpeed : float = other.transform.root.GetComponent(Ai_car_Script).currentSpeed;
		if(controlCurrentSpeed >= minCarSpeed)
		{
		other.transform.root.GetComponent(Ai_car_Script).wheel_BR.brakeTorque = maxBreakTorque;
		other.transform.root.GetComponent(Ai_car_Script).wheel_BL.brakeTorque = maxBreakTorque;
		}
		else
		{
		other.transform.root.GetComponent(Ai_car_Script).wheel_BR.brakeTorque = 0;
		other.transform.root.GetComponent(Ai_car_Script).wheel_BL.brakeTorque = 0;
		
		}
		other.transform.root.GetComponent(Ai_car_Script).brakeFlag = true;
		}
	}
function OnTriggerExit (other : Collider)
	{
	if(other.tag == "AI_Car")
		{
		other.transform.root.GetComponent(Ai_car_Script).brakeFlag = false;
		other.transform.root.GetComponent(Ai_car_Script).wheel_BR.brakeTorque = 0;
		other.transform.root.GetComponent(Ai_car_Script).wheel_BL.brakeTorque = 0;
		
		}
	}	