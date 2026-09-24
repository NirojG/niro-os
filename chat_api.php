<?php
session_start();
header('Content-Type: application/json');

// Setting up the database connection using credentials. 
// Using environment variables or fallback placeholders so credentials stay safe on GitHub.
$host   = getenv('DB_HOST') ?: "localhost";
$user   = getenv('DB_USER') ?: "your_db_user";     
$pass   = getenv('DB_PASS') ?: "your_db_password"; 
$dbname = getenv('DB_NAME') ?: "your_db_name";     

$db = new mysqli($host, $user, $pass, $dbname);

if ($db->connect_error) {
    echo json_encode(["error" => "Database link severed."]);
    exit;
}

// Identifying the sender of the message. If the user is not logged in, they will be identified as "Ghost_Node" in the system.
$sender = isset($_SESSION['username']) ? $_SESSION['username'] : "Ghost_Node";

// This step is done to Save a sent message in the db
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (isset($data['message']) && !empty(trim($data['message']))) {
        $msg = trim($data['message']);
        
        $stmt = $db->prepare("INSERT INTO global_chat (sender, message) VALUES (?, ?)");
        if ($stmt) {
            $stmt->bind_param("ss", $sender, $msg);
            $stmt->execute();
            $stmt->close();
            echo json_encode(["status" => "Message routed successfully."]);
        } else {
            echo json_encode(["error" => "Failed to prepare SQL statement."]);
        }
        exit;
    } else {
        echo json_encode(["error" => "Message cannot be empty."]);
        exit;
    }
}

// Fetching the chat history (getting the latest 50 messages)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = "SELECT sender, message, DATE_FORMAT(timestamp, '%H:%i') as time FROM (SELECT * FROM global_chat ORDER BY id DESC LIMIT 50) sub ORDER BY id ASC";
    $result = $db->query($query);
    
    if (!$result) {
        echo json_encode(["error" => "Query failed. Ensure the 'global_chat' table exists."]);
        exit;
    }
    
    $messages = [];
    while($row = $result->fetch_assoc()) {
        $messages[] = [
            "sender" => $row['sender'],
            "message" => htmlspecialchars($row['message']),
            "time" => $row['time'] ?? '00:00',
            "isMe" => ($row['sender'] === $sender)
        ];
    }
    
    echo json_encode($messages);
    exit;
}
?>
