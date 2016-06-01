<?php
/* =================================================================================
 * PHP RemAuth library
 * AUTHOR: guillaume@auvercloud.fr
 * VERSION: 1.1
 *
 * Copyright 2016 AuverCloud SAS
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * --------------------------------------------------------------------------------- */

class RemAuth {
	// API server domain
	const API_DOMAIN = "https://api.remauth.com";

	/* ---------------------------------------------------------------------------------
	 * Method:  __construct
	 * Purpose:	To construct an instance
	 * Parameters:	- $key = Service Key
	 * 				- $secret = Service secret
	 * Return: new object
	 */
	function __construct($key, $secret) {
		$this -> service_key = $key;
		$this -> service_secret = $secret;
	}

	/* ---------------------------------------------------------------------------------
	 * Method:  key
	 * Purpose:	To get the current application key for test purpose
	 * Return: Application key
	 */
	function key() {
		return $this -> service_key;
	}

	/* ---------------------------------------------------------------------------------
	 * Method:  post
	 * Purpose:	Simple post client
	 * Parameters:	- $url = Server url
	 * 				- $params = Associative array of parameters
	 * Return: response
	 */
	function post($url, $params) {

		// Init call
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($params));

		// Call
		$json_response = curl_exec($curl);
		$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
		curl_close($curl);

		// Response: Same format for either the API response or an HTTP error
		if ($status == "200")
			return json_decode($json_response, true);
		else
			return array("code" => $status, "msg" => "HTTP error", "data" => "");
	}

	/* ---------------------------------------------------------------------------------
	 * Method:  post_with_secret
	 * Purpose:	Send POST request to RemAuth API server prefilled with RemAuth
	 * 			service key and service secret
	 * Parameters:	- $path = Path of the API url e.g. "/access" or "/authenticate"
	 * 				- $params = Associative array of parameters. Service key and secret are not required
	 * Return: Associative array:
	 * 				'code' = response code
	 * 				'msg'  = response message
	 * 				'data' = response data
	 */
	function post_with_secret($path, $params) {

		// Define complete url with path
		$url = self::API_DOMAIN . $path;

		// Add or overwrite params with key and secret
		$params["key"] = $this -> service_key;
		$params["secret"] = $this -> service_secret;

		return $this -> post($url, $params);
	}

	/* ---------------------------------------------------------------------------------
	 * Method:  post_with_token
	 * Purpose:	Send POST request to RemAuth API server prefilled with RemAuth
	 * 			service key and service token renewed for each request
	 * Parameters:	- $path = Path of the API url e.g. "/access" or "/authenticate"
	 * 				- $params = Associative array of parameters. Service key and secret are not required
	 * Return: Associative array:
	 * 				'code' = response code
	 * 				'msg'  = response message
	 * 				'data' = response data
	 */
	function post_with_token($path, $params, $expire = 10) {

		// Define complete url with path
		$url = self::API_DOMAIN . $path;

		// Obtain token from server
		$res_token = $this -> post_with_secret("/access", array("expire" => $expire));

		// Stop on error
		if ($res_token["code"] != "200")
			return false;

		// Add or overwrite params with key and token
		$params["key"] = $this -> service_key;
		$params["token"] = $res_token["data"]["token"];

		return $this -> post($url, $params);
	}

	/* ---------------------------------------------------------------------------------
	 * Method:  meta_with_token
	 * Purpose:	Return a META HTML tag named 'RemAuth-token' and the following content:
	 * 				. either the application key + an access token + expiration date
	 * 				. or an error message
	 * Parameters:	- $expire = Expiration time in minutes. Optional. Default value: 10 minutes.
	 * Return: String
	 */
	function meta_with_token($expire = 10) {

		// Define tag
		$tag = '<META name="RemAuth-token" content="%content%">';

		// Obtain token from server
		$res_token = $this -> post_with_secret("/access", array("expire" => $expire));

		// Define meta content depending on error code
		if ($res_token["code"] != "200")
			return str_replace("%content%", "ERROR " . $res_token["code"] . ": " . $res_token["msg"], $tag);
		else
			return str_replace("%content%", $content = $this -> service_key . ", " . $res_token["data"]["token"] . ", " . $res_token["data"]["expire"], $tag);
	}

}

// Create instance
$remauth = new RemAuth("d090dfb17ba24d7bb580eab029d09fb5", "63492fb17ba24d7bb580eab029d63492");

// Echo META tag with application key and access token
echo $remauth -> meta_with_token(); 
/* =================================================================================
 * EoF
 * =================================================================================
 */
?>