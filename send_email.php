<?php
if(isset($_POST['email'])) {

  // Collect the data from the form
  $name = $_POST['name'];
  $email = $_POST['email'];
  $subject = $_POST['subject'];
  $message = $_POST['message'];

  // Set the recipient email address
  $to = 'kylersaiki@gmail.com';

  // Set the email headers
  $headers = 'From: '.$name.' <'.$email.'>' . "\r\n" .
             'Reply-To: '.$email . "\r\n" .
             'X-Mailer: PHP/' . phpversion();

  // Send the email
  mail($to, $subject, $message, $headers);

  // Redirect the user to a confirmation page
  header('Location: index.html');
}
?>