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


$retret = "<p><p><a href='../PICARA.htm'>Return to PICARA submission page</a>";

if($cntrl eq "")
{
	print "Content-type: text/html\n\n";
	print $config{table_top} . "\n";
	print "ERROR 1: invalid link parameters!$retret";
	print $config{table_bottom} . "\n";
	exit;
}
if($jobid eq "")
{
	print "Content-type: text/html\n\n";
	print $config{table_top} . "\n";
	print "ERROR 2: invalid link parameters!$retret";
	print $config{table_bottom} . "\n";
	exit;
}

my $dsn = "dbi:mysql:" . $config{database} . ":" . $config{dbhost} . ":3306";
my $dbh = DBI->connect($dsn, $config{dblogin}, $config{dbpassword},{'RaiseError' => 1});
$emailok=0;
$sth = $dbh->prepare("SELECT * FROM jobs where id='$jobid' and rid='$cntrl'");
$sth->execute();
$email="";
if(@rs=$sth->fetchrow_array()) 
{
	$email = $rs[2];
	$file = $rs[4];
	$sth->finish();
	if($email eq "" || $file eq "")
	{
		print "Content-type: text/html\n\n";
		print $config{table_top} . "\n";
		print "ERROR 4: database error!$retret";
		print $config{table_bottom} . "\n";
		exit;
	}
}
else
{
	$sth->finish();
	print "Content-type: text/html\n\n";
	print $config{table_top} . "\n";
	print "ERROR 3: invalid link parameters!$retret";
	print $config{table_bottom} . "\n";
	exit;
}

open in, "/jobs/$jobid/$file.out";
print $cgi->header( -type => 'application/octet-stream', -attachment => "$file.out" ); 
while($txt=<in>)
{
	print $txt;
}
close(in);

