<?php
session_start();

$item = $_REQUEST['item'];

if ( $item ) {
	$_SESSION['items'] .= "<li>$item</li>";
}

if ( $_REQUEST['action'] == 'reset' ) {
	$_SESSION['items'] = '';
	header("Location: ?");
	exit();
}
?>
<html>
<head>
	<title>TODO List</title>
	<script src="jquery.js"></script>
	<script src="jquery.form.js"></script>
	<script>
	$(document).ready(function(){
		$("form").ajaxForm(function(html){
			$("ul").html( $(html).find("li") );
			$("input:first").val('');
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
