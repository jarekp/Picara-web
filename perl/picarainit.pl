#!/usr/local/bin/perl
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use LWP;
use POSIX qw(strftime);
use DBI;
use File::Basename;

my $safe_filename_characters = "a-zA-Z0-9_.-";

chdir('/var/www/html/gramene');

%config = do 'perl/config.pl';

my $cgi= new CGI;
%params = $cgi->Vars;

$email = $params{'email'};
$emailstr = lc($email);
$emailstr =~ s/'/''/g;
$gwasfile = $params{'gwasfile'};
( $fname, $fpath, $fextension ) = fileparse ( $gwasfile, '\..*' ); 
$filename = $fname . $fextension;
$filename =~ tr/ /_/; $filename =~ s/[^$safe_filename_characters]//g;

print "Content-type: text/html\n\n";
print $config{table_top} . "\n";

if($email ne "" and $gwasfile ne "")
{
	srand(time*$$);
	$cntrl = rand(1000000000) + 1;
	my $dsn = "dbi:mysql:" . $config{database} . ":" . $config{dbhost} . ":3306";
	my $dbh = DBI->connect($dsn, $config{dblogin}, $config{dbpassword},{'RaiseError' => 1});
	$emailok=0;
	$sth = $dbh->prepare("SELECT * FROM emails where email='$emailstr'");
	$sth->execute();
	if(@rs=$sth->fetchrow_array()) 
	{
		$verified = $rs[2];
		if($verified ne "0")
		{
			$emailok=1;
		}
		else
		{
			$emailok=0;
		}	
		$sth->finish();
	}
	else
	{
		$emailok=0;
		$sth->finish();
		$dbh->do("insert into emails (email, verified, updated) values ('$emailstr', 0, NOW());");
	}

	#create the job on cbsuss06 exported dir
	$dbh->do("insert into jobs (rid, email, filename, created) values ('$cntrl', '$emailstr', '$filename', NOW());");

	$sth = $dbh->prepare("select LAST_INSERT_ID();");
	$sth->execute();
	($jobid)=$sth->fetchrow_array(); 
	$sth->finish();

	mkdir("/jobs/$jobid");
	open out, ">/jobs/$jobid/run.bat";
	print out<<ENDFILE;
#!/bin/sh	
cd /jobs/$jobid
#some dummy run emulation here
cat $filename > $filename.out
echo DONE > DONE
../mail.pl $emailstr $jobid
ENDFILE

	close(out);
	system("chmod u+x /jobs/$jobid/run.bat");
	open out, ">/jobs/$jobid/message";
	print out<<ENDFILE1;
Your PICARA job $jobid is finished.<br>
Please use the link below to retrieve the results.<p>
<a href='http://cbsuss05.tc.cornell.edu/gramene/perl/picaraget.pl?jobid=$jobid&cntrl=$cntrl'>
http://cbsuss05.tc.cornell.edu/gramene/perl/picaraget.pl?jobid=$jobid&cntrl=$cntrl</a>
ENDFILE1

	close(out);
	#upload file
	$in = $cgi->upload('gwasfile');
	open out, ">/jobs/$jobid/$filename";
	while($txt=<$in>)
	{
		print out $txt;
	}
	close(out);

	$retret = "<a href='../form.htm'>Return to PICARA submission page</a>";
	if($emailok == 0)
	{
		#initiate verification


		use Mail::Sendmail;
		$message = "<html><body>Please click on the following link to start your PICARA calculations<p><p>";
		$message.="<a href='http://cbsuss05.tc.cornell.edu/gramene/PICARA.htm?action=start&jobid=$jobid&cntrl=$cntrl'>http://cbsuss05.tc.cornell.edu/gramene/PICARA.htm?action=start&jobid=$jobid&cntrl=$cntrl</a></html></body>";
		%mail = (To => $email, 'Content-type' => 'text/html; charset="iso-8859-1"' , From => 'cbsu@cornell.edu', subject=>"PICARA submission", Message=>$message, smtp=>'appsmtp.mail.cornell.edu');

		sendmail(%mail);

		print "<P><P><B> You have successfully initiated your PICARA calculations. An e-mail has been sent to $email with a link to start your PICARA calculations.</B><p>$retret";
	}
	else
	{
		#submit job right away
		chdir("/jobs/$jobid/");
		system("source /etc/profile.d/sge.sh ; qsub -e /jobs/$jobid  -o /jobs/$jobid run.bat 1> qsub.out 2> qsub.err");
		#read scheduler job id and update database
		print "<P><P><B> You have successfully started your PICARA calculations. PICARA job id is $jobid. You will receive an e-mail at $email with a link to download your results once the job is finished.</B><p>$retret";
	}
}
elsif($email eq "")
{
	print "ERROR: empty e-mail!";
}
elsif($gwasfile eq "")
{
	print "ERROR: problem uploading file!";
}
print $config{table_bottom} . "\n";

