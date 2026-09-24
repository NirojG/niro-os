<?php
// Database
// Setting up the database connection using environment variables or safe local placeholders
$host   = getenv('DB_HOST') ?: "localhost";
$user   = getenv('DB_USER') ?: "your_db_user"; 
$pass   = getenv('DB_PASS') ?: "your_db_password"; 
$dbname = getenv('DB_NAME') ?: "your_db_name";

$db = new mysqli($host, $user, $pass, $dbname);

// If the connection fails, tell the website it has failed
if ($db->connect_error) {
    die(json_encode(["error" => "Database connection failed"]));
}

//  Assigning a temporary guest name
session_start();
if(!isset($_SESSION['username'])) {
    $_SESSION['username'] = "Guest_" . rand(100, 999);
}
$current_user = $_SESSION['username'];

// 3. update status, which tells DB about the current status
$db->query("INSERT INTO live_visitors (username) VALUES ('$current_user') 
            ON DUPLICATE KEY UPDATE last_seen = NOW()");

// Remove users who haven't pinged in 30 seconds in the live status
$db->query("DELETE FROM live_visitors WHERE last_seen < (NOW() - INTERVAL 30 SECOND)");

// FETCH ONLINE USERS
$result = $db->query("SELECT username FROM live_visitors");
$online_users = [];
while($row = $result->fetch_assoc()) {
    $online_users[] = $row['username'];
}

// 6. SEND DATA TO WEBSITE
header('Content-Type: application/json');
echo json_encode($online_users);
?>
