var centerOfMass : Vector3 ;
var path : Array ;
var pathGroup : Transform;
var maxSteer : float = 15.0;
var wheel_FL : WheelCollider;
var wheel_FR : WheelCollider;
var wheel_BL : WheelCollider;
var wheel_BR : WheelCollider;
var currentPathObj : int;
var disanceFromPath : float = 20;
var maxTorque : float;
var destination : int;
var currentSpeed : float;
var topSpeed : float = 150;
var decellarationSpeed : float = 10;
var stoping:boolean;
//sensor attributes
var frontSensorStartPoint : float = 5;
var frontSensorSideDist : float = 1.47;
var avoidSpeed : float = 10;
var longSensorLength : float = 5 ;
private var midSensorLength : float =longSensorLength/3 *2 ;
private var shortSensorLength : float = longSensorLength/3;
private var firstAngleSensor :float = 90/4;
private var secondAngleSensor : float = 90/4 *2;
private var thirdAngleSensor : float = 90/4 * 3;
var predictionSensorLength :float = 8;
private var flag : int =0;

// To add Break light effects...
/*		
		var breakingMesh : Renderer;
		var idleBreakLight : Material;
		var activeBreakLight : Material;
		
*/
public var brakeFlag : boolean = false;
var isBreaking : boolean = false;
// reversing;
var reversing : boolean = false;
var reveseConuter : float = 0.0;
var waitToReverse : float = 3.0;
var reverseFor : float = 1.5;


function Start () {

	rigidbody.centerOfMass=centerOfMass;
	GetPath();
	
}

function GetPath()
{
	var path_objs : Array = pathGroup.GetComponentsInChildren(Transform);
	path = new Array();
	for (var path_obj : Transform in path_objs)
	{
		if(path_obj != transform)
		path [path.length] = path_obj; 
	}
//	Debug.Log(path.length);
}



function Update () {
	//maxTorque = wheel_FL.steerAngle<0 ? -wheel_FL.steerAngle - 10 : wheel_FL.steerAngle- 10  ;
	isBreaking=false;
	stoping=false;
	if(brakeFlag) isBreaking=true;
	Sensor(predictionSensor());
	//if(flag==0)
	GetSteer();
	
	move();

	if(destination == currentPathObj || stoping)
	stop();
	else noStop();
	braking(isBreaking);
}

function GetSteer() {
	
	
	var steerVector : Vector3 = transform.InverseTransformPoint(Vector3(path[currentPathObj].position.x,transform.position.y,path[currentPathObj].position.z));
	var newSteer : float = maxSteer * (steerVector.x / steerVector.magnitude);
	if(flag==0){
	
	wheel_FL.steerAngle = newSteer;
	wheel_FR.steerAngle = newSteer;
}
	if(steerVector.magnitude <= disanceFromPath)
	{
		currentPathObj++;
	}
	if(currentPathObj >= path.length)
	{
		currentPathObj = 0;
	}
}

function move()
{
	currentSpeed = 2 *(22/7) * wheel_BL.radius*wheel_BL.rpm*60/1000;
	currentSpeed = Mathf.Round(currentSpeed);
	if(currentSpeed <= topSpeed)
	{
		if(!reversing)
		{
		wheel_BL.motorTorque=maxTorque;
		wheel_BR.motorTorque=maxTorque;
		}
		else
		{
		wheel_BL.motorTorque= -maxTorque;
		wheel_BR.motorTorque= -maxTorque;
		}
	}
	else
	{
		wheel_BL.brakeTorque=decellarationSpeed;
		wheel_BR.brakeTorque=decellarationSpeed;
		wheel_BL.motorTorque=0;
		wheel_BR.motorTorque=0;
	}
	
	
}

function Sensor(prediction){
flag=0;
var avoidSensitivity : float = 0;
var pos : Vector3;
var hit : RaycastHit;
var firstAngleRight = Quaternion.AngleAxis(firstAngleSensor,transform.up) * transform.forward;
var firstAngleLeft =Quaternion.AngleAxis(-firstAngleSensor,transform.up) * transform.forward;
var secondAngleRight = Quaternion.AngleAxis(secondAngleSensor,transform.up) * transform.forward;
var secondAngleLeft =Quaternion.AngleAxis(-secondAngleSensor,transform.up) * transform.forward;
var thirdAngleRight = Quaternion.AngleAxis(thirdAngleSensor,transform.up) * transform.forward;
var thirdAngleLeft =Quaternion.AngleAxis(-thirdAngleSensor,transform.up) * transform.forward;




pos = transform.position;
pos += transform.forward * frontSensorStartPoint;

// braking sensor	
/*if(Physics.Raycast(pos,transform.forward,hit,sensorLength)){
if(hit.transform.tag != "Terrain" )
	{
	flag++;
	wheel_BL.brakeTorque=decellarationSpeed;
	wheel_BR.brakeTorque=decellarationSpeed;
	Debug.DrawLine(pos,hit.point,Color.red);
	}
	}
else {wheel_BL.brakeTorque=decellarationSpeed;
		wheel_BR.brakeTorque=0;
		}	
	
*/
//====================================================================
//=======================================================================
pos += transform.right * frontSensorSideDist;

// front straight right short range sensor
if(Physics.Raycast(pos,transform.forward,hit,shortSensorLength)){
	if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;Debug.DrawLine(pos,hit.point,Color.red);
	//stop();
	stoping=true;
	} else
	if(hit.transform.tag != "Terrain"  && hit.transform.tag != "AI_Car")
	{
	flag++;
	Debug.DrawLine(pos,hit.point,Color.red);
	avoidSensitivity -= 1;
	}
	}

// front straight right mid range sensor
else if(Physics.Raycast(pos,transform.forward,hit,midSensorLength)){
	if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	//flag++;
	Debug.DrawLine(pos,hit.point,Color.yellow);
	//stop();
	stoping=true;
	} else
	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car" )
	{
	flag++;
	Debug.DrawLine(pos,hit.point,Color.yellow);
	avoidSensitivity -= 0.5;
	}
	}

// front straight right Long range sensor
else if(Physics.Raycast(pos,transform.forward,hit,longSensorLength)){
	
	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
	{
	flag++;
	avoidSensitivity -= 0.25;
	Debug.DrawLine(pos,hit.point,Color.white);
	}
	}
//========================================================================	
// front 1st angled right sensor short Range sensor
		if(Physics.Raycast(pos,firstAngleRight,hit,shortSensorLength)){
		if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;Debug.DrawLine(pos,hit.point,Color.red);
	//stop();
	stoping=true;
	
	} else
		if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
		{
		flag++;
		avoidSensitivity -= 0.6;
		Debug.DrawLine(pos,hit.point,Color.red);
		}
		}
//front 1st angled right mid range sensor
else if(Physics.Raycast(pos,firstAngleRight,hit,midSensorLength)){
if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;Debug.DrawLine(pos,hit.point,Color.yellow);
	//stop();
	//stoping=true; isBreaking=true;
	
	} else
		if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
		{
		flag++;
		avoidSensitivity -= 0.4;
		Debug.DrawLine(pos,hit.point,Color.yellow);
		}
		}
		
//front 1st angled right long range sensor
else if(Physics.Raycast(pos,firstAngleRight,hit,longSensorLength)){
	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
	{
	flag++;
	avoidSensitivity -= 0.2;
	Debug.DrawLine(pos,hit.point,Color.white);
	}
	}
//========================================================================	
// front 2nd angled right sensor short Range sensor
		if(Physics.Raycast(pos,secondAngleRight,hit,shortSensorLength)){
		if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;Debug.DrawLine(pos,hit.point,Color.red);
	//stop();
	stoping=true;
	
	} else
		if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
		{
		flag++;
		avoidSensitivity -= 0.6;
		Debug.DrawLine(pos,hit.point,Color.red);
		}
		}
//front 2nd angled right mid range sensor
else if(Physics.Raycast(pos,secondAngleRight,hit,midSensorLength)){
if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;Debug.DrawLine(pos,hit.point,Color.yellow);
	//stop();
	//stoping=true;
	 isBreaking=true;
	
	} else
		if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
		{
		flag++;
		avoidSensitivity -= 0.4;
		Debug.DrawLine(pos,hit.point,Color.yellow);
		}
		}
		
//front 2nd angled right long range sensor
else if(Physics.Raycast(pos,secondAngleRight,hit,longSensorLength)){

	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
	{
	flag++;
	avoidSensitivity -= 0.2;
	Debug.DrawLine(pos,hit.point,Color.white);
	}
	}
//========================================================================	
// front 3rd angled right sensor short Range sensor
		if(Physics.Raycast(pos,thirdAngleRight,hit,shortSensorLength)){
		if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;Debug.DrawLine(pos,hit.point,Color.red);
	//stop();
	stoping=true;
	
	} else
		if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
		{
		flag++;
		avoidSensitivity -= 0.6;
		Debug.DrawLine(pos,hit.point,Color.red);
		}
		}
//front 3rd angled right mid range sensor
else if(Physics.Raycast(pos,thirdAngleRight,hit,midSensorLength)){
		if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;Debug.DrawLine(pos,hit.point,Color.yellow);
	//stop();
	//stoping=true;
	 isBreaking=true;
	
	} else
		if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
		{
		flag++;
		avoidSensitivity -= 0.4;
		Debug.DrawLine(pos,hit.point,Color.yellow);
		}
		}
		
//front 3rd angled right long range sensor
else if(Physics.Raycast(pos,thirdAngleRight,hit,longSensorLength)){
	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
	{
	flag++;
	avoidSensitivity -= 0.2;
	Debug.DrawLine(pos,hit.point,Color.white);
	}
	}
		
	
//=========================================================================
pos -= transform.right * frontSensorSideDist;
pos -= transform.right * frontSensorSideDist;
// front straight left short range sensor
if(Physics.Raycast(pos,transform.forward,hit,shortSensorLength)){
if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;Debug.DrawLine(pos,hit.point,Color.red);
	//stop();
	stoping=true;
	
	} else
	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car" )
	{
	flag++;
	Debug.DrawLine(pos,hit.point,Color.red);
	avoidSensitivity += 1;
	}
	}
// front straight left mid range sensor
else if(Physics.Raycast(pos,transform.forward,hit,midSensorLength)){
if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;Debug.DrawLine(pos,hit.point,Color.yellow);
	//stop();
	stoping=true;
	
	} else
	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
	{
	flag++;
	Debug.DrawLine(pos,hit.point,Color.yellow);
	avoidSensitivity += 0.5;
	}
	}
// front straight left long range sensor
else if(Physics.Raycast(pos,transform.forward,hit,longSensorLength)){

	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
	{
	flag++;
	avoidSensitivity += 0.25;
	Debug.DrawLine(pos,hit.point,Color.white);
	}
	}
//========================================================================	
// front 1st angled left sensor short Range sensor
		if(Physics.Raycast(pos,firstAngleLeft,hit,shortSensorLength)){
		if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;Debug.DrawLine(pos,hit.point,Color.red);
	//stop();
	stoping=true;
	
	} else
		if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car" )
		{
		flag++;
		avoidSensitivity += 0.6;
		Debug.DrawLine(pos,hit.point,Color.red);
		}
		}
//front 1st angled left mid range sensor
else if(Physics.Raycast(pos,firstAngleLeft,hit,midSensorLength)){
if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;Debug.DrawLine(pos,hit.point,Color.yellow);
	//stop();
	//stoping=true; 
	isBreaking=true;
	
	} else
		if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
		{
		flag++;
		avoidSensitivity += 0.4;
		Debug.DrawLine(pos,hit.point,Color.yellow);
		}
		}
		
//front 1st angled left long range sensor
else if(Physics.Raycast(pos,firstAngleLeft,hit,longSensorLength)){

	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
	{
	flag++;
	avoidSensitivity += 0.2;
	Debug.DrawLine(pos,hit.point,Color.white);
	}
	
	}
//========================================================================	
// front 2nd angled left sensor short Range sensor
		if(Physics.Raycast(pos,secondAngleLeft,hit,shortSensorLength)){
		if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;Debug.DrawLine(pos,hit.point,Color.red);
	//stop();
	stoping=true;
	
	} else
	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
		{
		flag++;
		avoidSensitivity += 0.6;
		Debug.DrawLine(pos,hit.point,Color.red);
		}
		}
//front 2nd angled left mid range sensor
else if(Physics.Raycast(pos,secondAngleLeft,hit,midSensorLength)){
if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;Debug.DrawLine(pos,hit.point,Color.yellow);
	//stop();
	//stoping=true; 
	isBreaking=true;
	
	} else
		if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
		{
		flag++;
		avoidSensitivity +=0.4;
		Debug.DrawLine(pos,hit.point,Color.yellow);
		}
		}
		
//front 2nd angled left long range sensor
else if(Physics.Raycast(pos,secondAngleLeft,hit,longSensorLength)){
	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
	{
	flag++;
	avoidSensitivity += 0.2;
	Debug.DrawLine(pos,hit.point,Color.white);
	}
	}
//========================================================================	
// front 3rd angled left sensor short Range sensor
		if(Physics.Raycast(pos,thirdAngleLeft,hit,shortSensorLength)){
	if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;Debug.DrawLine(pos,hit.point,Color.red);
	//stop();
	stoping=true;
	
	} else
		if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car" )
		{
		flag++;
		avoidSensitivity += 0.6;
		Debug.DrawLine(pos,hit.point,Color.red);
		}
		}
//front 3rd angled left mid range sensor
else if(Physics.Raycast(pos,thirdAngleLeft,hit,midSensorLength)){
if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;Debug.DrawLine(pos,hit.point,Color.yellow);
	//stop();
	//stoping=true; 
	isBreaking=true;
	
	} else
		if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
		{
		flag++;
		avoidSensitivity +=0.4;
		Debug.DrawLine(pos,hit.point,Color.yellow);
		}
		}
		
//front 3rd angled left long range sensor
else if(Physics.Raycast(pos,thirdAngleLeft,hit,longSensorLength)){
	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car") 
	{
	flag++;
	avoidSensitivity += 0.2;
	Debug.DrawLine(pos,hit.point,Color.white);
	}
	}

//===========================================================================	
var sidewayStart : Vector3;
sidewayStart = transform.position;
sidewayStart += transform.forward * frontSensorStartPoint;
//==========================================================================
//SideWay Right short range Sensor
//SideWay Right mid range Sensor
//SideWay Right long range Sensor
if(Physics.Raycast(transform.position,transform.right,hit,longSensorLength)){

	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
	{
	flag++;
	Debug.DrawLine(transform.position,hit.point,Color.white);
	}
	}	
//========================================================================
// right sideway front
	if(Physics.Raycast(sidewayStart,transform.right,hit,longSensorLength)){
	if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;
	//stop();
	//stoping=true; 
	isBreaking=true;
	
	} else
	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car") 
	{
	flag++;
	avoidSensitivity -= 0.1;
	Debug.DrawLine(sidewayStart,hit.point,Color.white);
	}
	}	
//===========================================================================
//SideWay Left Sensor	
if(Physics.Raycast(transform.position,-transform.right,hit,longSensorLength)){
if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;
	//stop();
	//stoping=true;
	 isBreaking=true;
	
	} else
	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
	{
	flag++;
	//avoidSensitivity += 0.1;
	Debug.DrawLine(transform.position,hit.point,Color.white);
	 }
	}
//===========================================================================		
// left side way front
if(Physics.Raycast(sidewayStart,-transform.right,hit,longSensorLength)){
if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{flag++;
	//stop();
	//stoping=true; 
	isBreaking=true;
	
	}
	else
	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
	{
	flag++;
	avoidSensitivity += 0.1;
	Debug.DrawLine(sidewayStart,hit.point,Color.white);
	 }
	}	


// front angled left sensor	
else if(Physics.Raycast(pos,firstAngleLeft,hit,longSensorLength)){
if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;
	//stop();
	//stoping=true;
	 isBreaking=true;
	
	} else
	if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
	{
	flag++;
	avoidSensitivity += 0.1;
	Debug.DrawLine(pos,hit.point,Color.white);
	}
	}	
//==============================================================================
//front mid sensor short range sensor
if(avoidSensitivity==0)
{if(Physics.Raycast(pos,transform.forward,hit,shortSensorLength)){
if(hit.transform.tag != "Terrain" )
	{
	flag++;
	if(hit.normal.x < 0)	avoidSensitivity=-1;
	else avoidSensitivity=1;
	Debug.DrawLine(pos,hit.point,Color.red);
	}
	}

//front mid sensor mid range sensor
else if(Physics.Raycast(pos,transform.forward,hit,midSensorLength)){
if(hit.transform.tag != "Terrain" && hit.transform.tag == "AI_Car")
	{
	flag++;Debug.DrawLine(pos,hit.point,Color.yellow);
	//stop();
	stoping=true;
	
	} else
if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
	{
	if(hit.normal.x < 0)	avoidSensitivity=-1;
	else avoidSensitivity=1;
	flag++;
	Debug.DrawLine(pos,hit.point,Color.yellow);
	}
	}

//front mid sensor long range sensor
else if(Physics.Raycast(pos,transform.forward,hit,longSensorLength)){

if(hit.transform.tag != "Terrain" && hit.transform.tag != "AI_Car")
	{
	if(hit.normal.x < 0)	avoidSensitivity=-1;
	else avoidSensitivity=1;
	flag++;
	Debug.DrawLine(pos,hit.point,Color.white);
	}
	}
}
//=============================================================================	
	
// front straight left long range sensor// front straight left long range sensor// front straight left long range sensor// front straight left sensor
		
//=============================================================================
/*if(rigidbody.velocity.magnitude < 2 && !reversing && flag != 0)
{
reveseConuter += Time.deltaTime;
if(reveseConuter >= waitToReverse)
{
reveseConuter=0;
reversing = true;
}
}	
else if (!reversing)
{
reveseConuter = 0;
}
if(reversing)	
{
avoidSensitivity *= -1;
prediction *= -1;
reveseConuter += Time.deltaTime;
if(reveseConuter > reverseFor)
{
reveseConuter = 0;
reversing = false;
}
} 
*/
  
	   
	Debug.Log(prediction +" "+ avoidSensitivity );
    
	             
	 	 if(flag!=0 && flag > 1 && !stoping)
	{
	Debug.Log("flag" + flag) ;       

/*	if(prediction==0 && avoidSensitivity == 0 && !stoping)
	{
	//stop();
	stoping=true;
	
	Debug.Log(" Cant determine where to go Stopping now. "+this.name);
	}
	
	else*/  if (prediction != 0 && avoidSensitivity == 0 && !stoping)
	{
	avoidSensitivity = prediction/10;
	Debug.Log(" Decsion block 2 "); 
	}
	else  if ((prediction> 0 && avoidSensitivity < 0) || (prediction < 0 && avoidSensitivity >0) && !stoping)
	{
	avoidSensitivity = avoidSensitivity * (-1);
	Debug.Log(" Decsion block 3 ");
	}
	else  {
	Debug.Log("des"+avoidSensitivity);
	}
	isBreaking= true;
	AvoidSteer(avoidSensitivity);
	}
	/*else if(flag==0 && prediction!=0)
	{
	flag++;
	avoidSensitivity= 0.5;
	AvoidSteer(avoidSensitivity);
	}*/
	
	
}

function AvoidSteer(sensitivity : float)
{
	Debug.Log("avoiding");
	if (sensitivity > 1 ) sensitivity=1;
	if (sensitivity < -1 ) sensitivity=-1;
	wheel_FL.steerAngle = maxSteer * sensitivity;
	wheel_FR.steerAngle = maxSteer * sensitivity;
	//Debug.Log("angle "+wheel_FR.steerAngle);
	wheel_BL.motorTorque=avoidSpeed;
	wheel_BR.motorTorque=avoidSpeed;
	if(flag > 1 || sensitivity < 0.3)
	braking(isBreaking);
}


function stop()
{	stoping=true;
	isBreaking=true;
	wheel_BL.motorTorque=0;
	wheel_BR.motorTorque=0;
	wheel_BL.brakeTorque=300;
	wheel_BR.brakeTorque=300;
	wheel_FL.brakeTorque=300;
	wheel_FR.brakeTorque=300;
	
	Debug.Log("stoping "+ this.name );


}
function noStop()
{
wheel_BL.brakeTorque=0;
wheel_BR.brakeTorque=0;
wheel_FL.brakeTorque=0;
wheel_FR.brakeTorque=0;
		
}
function predictionSensor()
{
flag=0;
var avoidSensitivity : float = 0;
var pos : Vector3;
var hit : RaycastHit;
var firstAngleRight = Quaternion.AngleAxis(firstAngleSensor,transform.up) * transform.forward;
var firstAngleLeft =Quaternion.AngleAxis(-firstAngleSensor,transform.up) * transform.forward;
var secondAngleRight = Quaternion.AngleAxis(secondAngleSensor,transform.up) * transform.forward;
var secondAngleLeft =Quaternion.AngleAxis(-secondAngleSensor,transform.up) * transform.forward;
var thirdAngleRight = Quaternion.AngleAxis(thirdAngleSensor,transform.up) * transform.forward;
var thirdAngleLeft =Quaternion.AngleAxis(-thirdAngleSensor,transform.up) * transform.forward;




pos = transform.position;
pos += transform.forward * frontSensorStartPoint;

//====================================================================
//front mid sensor short range sensor
if(Physics.Raycast(pos,transform.forward,hit,predictionSensorLength)){
if(hit.transform.tag != "Terrain" )
	{
	Debug.DrawLine(pos,hit.point,Color.green);
	}
	}

//=======================================================================
pos += transform.right * frontSensorSideDist;

// front straight right short range sensor
if(Physics.Raycast(pos,transform.forward,hit,predictionSensorLength)){
	if(hit.transform.tag != "Terrain" )
	{
	flag++;
	Debug.DrawLine(pos,hit.point,Color.green);
	avoidSensitivity -= 1;
	}
	}
//========================================================================	
// front 1st angled right sensor short Range sensor
		if(Physics.Raycast(pos,firstAngleRight,hit,predictionSensorLength)){
		if(hit.transform.tag != "Terrain" )
		{
		flag++;
		avoidSensitivity -= 1;
		Debug.DrawLine(pos,hit.point,Color.green);
		}
		}
//========================================================================	
// front 2nd angled right sensor short Range sensor
		if(Physics.Raycast(pos,secondAngleRight,hit,predictionSensorLength)){
		if(hit.transform.tag != "Terrain" )
		{
		flag++;
		avoidSensitivity -= 1;
		Debug.DrawLine(pos,hit.point,Color.green);
		}
		}
//========================================================================	
// front 3rd angled right sensor short Range sensor
		if(Physics.Raycast(pos,thirdAngleRight,hit,predictionSensorLength)){
		if(hit.transform.tag != "Terrain" )
		{
		flag++;
		avoidSensitivity -= 1;
		Debug.DrawLine(pos,hit.point,Color.green);
		}
		}		
	
//=========================================================================
pos -= transform.right * frontSensorSideDist;
pos -= transform.right * frontSensorSideDist;
// front straight left short range sensor
if(Physics.Raycast(pos,transform.forward,hit,predictionSensorLength)){
	if(hit.transform.tag != "Terrain" )
	{
	flag++;
	Debug.DrawLine(pos,hit.point,Color.green);
	avoidSensitivity += 1;
	}
	}
//========================================================================	
// front 1st angled left sensor short Range sensor
		if(Physics.Raycast(pos,firstAngleLeft,hit,predictionSensorLength)){
		if(hit.transform.tag != "Terrain" )
		{
		flag++;
		avoidSensitivity += 1;
		Debug.DrawLine(pos,hit.point,Color.green);
		}
		}
//========================================================================	
// front 2nd angled left sensor short Range sensor
		if(Physics.Raycast(pos,secondAngleLeft,hit,predictionSensorLength)){
		if(hit.transform.tag != "Terrain" )
		{
		flag++;
		avoidSensitivity += 1;
		Debug.DrawLine(pos,hit.point,Color.green);
		}
		}
//========================================================================	
// front 3rd angled left sensor short Range sensor
		if(Physics.Raycast(pos,thirdAngleLeft,hit,predictionSensorLength)){
		if(hit.transform.tag != "Terrain" )
		{
		flag++;
		avoidSensitivity += 1;
		Debug.DrawLine(pos,hit.point,Color.green);
		}
		}
//===========================================================================	
var sidewayStart : Vector3;
sidewayStart = transform.position;
sidewayStart += transform.forward * frontSensorStartPoint;

return avoidSensitivity;
}

function braking(braking)
{
if(currentSpeed>1)
{
if(braking && !brakeFlag)
{
wheel_BR.brakeTorque = 10;
wheel_BL.brakeTorque = 10;
//Debug.Log("is braking");
}
else if(!brakeFlag && !braking){
wheel_BR.brakeTorque = 0;
wheel_BL.brakeTorque = 0;
//Debug.Log("not braking");
}
}
}
//To execute break light effect

/*	function BreakEffects()
	{
	if (isBreaking)
		{
		breakingMesh.material = activeBreakLight;
		}
	else
		{
		breakingMesh.material = idleBreakLight;
		}	
	}
*/