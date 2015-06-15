import UnityEngine.UI;  // IMPORTANT!!!!!!!!
private var speedValue : Text ;  // public if you want to drag your text object in there manually
private var mt : Text;
private var car ;    
    function Start () {
     	speedValue =GameObject.Find("Speed value").GetComponent("Text");  // if you want to reference it by code - tag it if you have several texts
   		car =  GameObject.Find("CC_ME_R4").GetComponent("Ai_car_Script");
   		}		
	function Update () {
		ShowSpeed();
//		ShowCars();
    		}

function ShowCars()
{
for(var cars : GameObject in GameObject.FindGameObjectsWithTag("AI_Car"))
{
Debug.Log(cars.name);
}
}

function ShowSpeed()
{
var speedCounter : float  = car.currentSpeed;
var isbraking :boolean = GameObject.Find("CC_ME_R4").GetComponent("Ai_car_Script").isBreaking;
// Debug.Log(speedCounter);
if(isbraking)
{
speedValue.color = Color.red; 
}
else
{
speedValue.color = Color.black; 
}
speedValue.text = speedCounter.ToString();  // make it a string to output to the Text object
}