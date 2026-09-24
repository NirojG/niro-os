<?php
// Niro_OS Secure API Bridge for orchestration of the LLM 
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// --- YOUR SECRET KEY ---
$GROQ_API_KEY = "api_Key_here"; // this is where actual API key should be placed. Keeping it secret ;)

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['messages'])) {
    http_response_code(400);
    echo json_encode(["error" => ["message" => "No data received."]]);
    exit;
}

$ch = curl_init("https://api.groq.com/openai/v1/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $GROQ_API_KEY",
    "Content-Type: application/json"
]);

// UPDATED: Using the standard 2026 free teir modle
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "model" => "openai/gpt-oss-20b",
    "messages" => $data['messages'],
    "temperature" => 0.7
]));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(["error" => ["message" => "Uplink failed: " . curl_error($ch)]]);
} else {
    http_response_code($httpCode);
    echo $response;
}

curl_close($ch);
?>
