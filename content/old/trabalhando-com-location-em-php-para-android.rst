Trabalhando com Location em php para Android
############################################
:date: 2010-07-15 22:10
:author: avelino
:category: Avelino
:slug: trabalhando-com-location-em-php-para-android

Veja como trabalhar com PHP + Android + Location

.. code:: brush:php

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

by Anton
