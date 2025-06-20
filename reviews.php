<?php

/**
 * Returns the user IP
 */
function getUserIP()
{
    $ip = $_SERVER['REMOTE_ADDR'];  // Get the user's ip

    // Check if the ip comes from a proxy server
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        // Changes the proxy ip by the user ip (the first in the header)
        $ipList = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $ip = trim($ipList[0]);  // Just in case proxies added white spaces
    }

    return $ip;
}

/**
 * Returns a mysql db conection
 */
function getDbConnection()
{
    $host = '127.0.0.1';
    $dbname = 'memory_game';
    $user = 'root';
    $pass = '';

    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    } catch (PDOException) {
        $conn = false;
    }

    return $conn;
}

/**
 * Gets the average of the reviews
 */
function getAverage($conn)
{
    // Get the total reviews
    $query = "SELECT COUNT(*) FROM reviews;";
    $stmt = $conn->query($query);
    $total = $stmt->fetchColumn();

    // Check the total is bigger than zero
    if ($total == 0) return 0;

    // Get the summary of the reviews
    $query = "SELECT SUM(`value`) FROM reviews;";
    $stmt = $conn->query($query);
    $sum = $stmt->fetchColumn();

    return round($sum / $total, 1);
}

/**
 * Returns one http code and exits
 */
function returnHttp($code, $data = [])
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Makes a response according to the data sumission and the database conection
 */
function response()
{
    // Get and validate the data submission
    $data = $_POST;
    if (empty($data)) returnHttp(400);
    if (empty($data['type'])) returnHttp(400);

    // Get and validate the database conection
    $conn = getDbConnection();
    if (!$conn) returnHttp(500);

    // Check if the user already has a review
    $userIp = getUserIP();
    $query = $conn->query("SELECT * FROM reviews WHERE (ip = '$userIp');");
    $hasReview = $query->fetch(PDO::FETCH_ASSOC);

    // Create the data response
    $dataResponse = [];

    // Makes the action according to the type
    switch ($data['type']) {
        case 'get':
            // Get the current review of the IP
            $query = "SELECT `value` FROM reviews WHERE ip = '$userIp';";
            $stmt = $conn->query($query);

            // Add the value to the data response
            $dataResponse['value'] = (int)$stmt->fetchColumn();
            break;
        case 'post':
            // Check the 'value' sumission and type
            if (empty($data['value'])) returnHttp(400);
            if (!is_numeric($data['value'])) returnHttp(400);

            // Validate the value range
            $value = (int)$data['value'];
            if ($value < 1 || $value > 5) returnHttp(400);

            // Check if the user already has a review
            if ($hasReview) {  // Then update
                $query = "UPDATE reviews SET `value` = :value WHERE ip = '$userIp';";
            } else {  // Then create
                $query = "INSERT INTO reviews(ip, `value`) VALUES('$userIp', :value);";
            }

            // Try to execute the statement
            try {
                $stmt = $conn->prepare($query);
                $stmt->execute(['value' => $value]);
            } catch (PDOException) {
                returnHttp(400);
            }

            break;
        default:
            returnHttp(400);
    }

    // Put the average in the data response
    $dataResponse['average'] = getAverage($conn);

    // Return status code 200 with the data response
    returnHttp(200, $dataResponse);
}

response();
