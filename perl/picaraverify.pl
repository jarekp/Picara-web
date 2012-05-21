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

$cntrl = $params{'cntrl'};
$cntrl = 1*$cntrl;
$jobid = $params{'jobid'};
$jobid = 1*$jobid;

print "Content-type: text/html\n\n";
print $config{table_top} . "\n";

$retret = "<p><p><a href='../form.htm'>Return to PICARA submission page</a>";

if($cntrl eq "")
{
	print "ERROR 1: invalid link parameters!$retret";
	exit;
}
if($jobid eq "")
{
	print "ERROR 2: invalid link parameters!$retret";
	exit;
}

my $dsn = "dbi:mysql:" . $config{database} . ":" . $config{dbhost} . ":3306";
my $dbh = DBI->connect($dsn, $config{dblogin}, $config{dbpassword},{'RaiseError' => 1});
$emailok=0;
$sth = $dbh->prepare("SELECT * FROM jobs where id='$jobid' and rid='$cntrl'");
$sth->execute();
$email="";
$jobdir="";
if(@rs=$sth->fetchrow_array()) 
{
	$email = $rs[2];
	$sth->finish();
	if($email eq "")
	{
		print "ERROR 4: database error!$retret";
		exit;
	}
}
else
{
	$sth->finish();
	print "ERROR 3: invalid link parameters!$retret";
	exit;
}
$dbh->do("update emails set verified=1 where email='$email'");

#submit job right away
chdir("/jobs/$jobid/");
system("source /etc/profile.d/sge.sh ; qsub  -e /jobs/$jobid  -o /jobs/$jobid run.bat 1> qsub.out 2> qsub.err");
#read scheduler job id and update database

print "Your e-mail has been succefully verified.";
print "<P><P><B> You have successfully started your PICARA calculations. PICARA job id is $jobid. You will receive an e-mail at $email with a link to download your results once the job is finished.</B>$retret";
print $config{table_bottom} . "\n";

