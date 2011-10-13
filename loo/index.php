<!DOCTYPE HTML>
<html>
<head>
<title></title>


<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.js"></script> 
<script type="text/javascript" src="/loo/popcorn-js/popcorn.js"></script> 
<script type="text/javascript" src="/loo/js/video-controls.js"></script> 

<style type="text/css" media="all">
	@import url("/loo/css/video-controls.css?lsv0t0");
</style>

</head>
<body style='text-align: center;'>

<div id="video-container"> 
	    <video width="720" height="486" class="video-js" id="main-player" preload="true"> 
	    <source src='/loo/video/LOP%20PH%20INTRO%20.mp4' type='video/mp4' /><source src='/loo/video/LOP%20PH%20INTRO%20.theora.ogv' type='video/ogg' /><source src='/loo/video/LOP%20PH%20INTRO%20.webm' type='application/octet-stream' />	    </video> 
	    <div id='playerControls'> 
	      <div id='playerPlay' title='Play'>&#x25BA;</div> 
        <div id='playerProgress'><div id='progressBar'><div id='progressPosition'></div></div></div> 
	      <div id='playerVolume'>Vol
	       <div id='volumeControl'> 
	         <div id='volumeBar'> 
	           <div id='volumePosition'></div> 
	         </div> 
	       </div> 
	      </div> 
	    </div> 
	    <canvas id='theCanvas' height='30' width='720'></canvas> 
	  </div> 

</body>
</html>


<!--
AddType video/ogg .ogv
AddType video/mp4 .mp4
AddType video/webm .webm
-->
