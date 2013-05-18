Title: Trabalhando com Location em php para Android
Date: 2010-07-15 22:10
Author: avelino
Category: Avelino
Slug: trabalhando-com-location-em-php-para-android

Veja como trabalhar com PHP + Android + Location

~~~~ {.brush:php}
include("Android.php");
$droid = new Android();

$droid->dialogCreateAlert();

$result = array();

$latitude = $droid->getInput("Location", "Latitude: ");
$longitude= $droid->getInput("Location", "Longitude: ");

$locations = $droid->geocode($latitude['result'], $longitude['result']);

foreach ($locations['result'] as $location)
{
  $location = get_object_vars($location);
  foreach ($location as $key => $value)
  {
    $result[] = ucfirst(str_replace('_', ' ', $key)).': '.$value;
  }
}
$droid->dialogSetItems($result);

//displays the box
$droid->dialogShow();
~~~~

<span class="Apple-style-span" style="font-size: x-small;">by
Anton</span>
