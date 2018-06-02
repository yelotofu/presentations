<?php
session_start();

$item = $_REQUEST['item'];

if ( $item ) {
	$add = "<li>$item</li>";

	$_SESSION['items'] .= $add;

	if ( $_SERVER['HTTP_X_REQUESTED_WITH'] ) {
		echo $add;
		exit();
	}
}

if ( $_REQUEST['action'] == 'reset' ) {
	$_SESSION['items'] = '';
	header("Location: done3.php");
	exit();
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-us">
<head>
	<title>TODO List</title>
	<script src="jquery.js"></script>
	<script src="jquery.form.js"></script>
	<script>
	$(document).ready(function(){
		
		$("form").ajaxForm(function(html){
			// Gets executed when the submission is complete
			$("#list").append(html);
		});
	
	});
	</script>
	<style>
	body { font-family: Arial; font-size: 16px; }
	ul { list-style: none; margin: 10px; padding: 0; }
	li { border-left: 10px solid #F39; padding-left: 10px; margin: 5px; }
	</style>

</head>
<body>
<form action="" method="POST">
<h2>Add Todo Item:</h2>
<input id="item" type="text" name="item"/>
<input type="submit" value="Add"/>
</form>

<ul id="list"><?php echo $_SESSION['items'] ?></ul>
</body>
</html>
