<?php

$api_version = '2017-05-26';
$credentials = parse_ini_file('credentials.ini');
$url = $credentials['workspace'] . '?version=' . $api_version;

$body = file_get_contents('php://input');
$json = json_decode($body, /*assoc=*/true);
$api_request_body = json_encode(array(
    'input'   => $json['input'],
    'context' => empty($json['context']) ? new \stdClass() : $json['context']));

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($curl, CURLOPT_POSTFIELDS, $api_request_body);
curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
curl_setopt($curl, CURLOPT_USERPWD, $credentials['username'] . ':' . $credentials['password']);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

header('Content-Type: application/json');
echo $response;
