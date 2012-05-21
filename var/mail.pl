#!/usr/local/bin/perl

use Mail::Sendmail;

$email = $ARGV[0];
$jobid = $ARGV[1];

open in, "message";

while($txt=<in>)
{
	$message .= $txt;
}

close(in);

%mail = (To => $email, 'Content-type' => 'text/html; charset="iso-8859-1"' , From => 'cbsu@cornell.edu', subject=>"PICARA job $jobid results", Message=>$message, smtp=>'appsmtp.mail.cornell.edu');

sendmail(%mail);
