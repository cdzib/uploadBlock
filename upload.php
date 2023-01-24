<?php
include_once "FileManager.php";
$request = $_SERVER['PATH_INFO'];

if($request){
    $response = FileManager::upload($dir = "");
    // Output the directory listing as JSON
    header('Content-type: application/json');
    echo json_encode($response);
}