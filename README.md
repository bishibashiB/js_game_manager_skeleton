# Multi Game Control Architecture in JS

written by [Reimund Koenig](https://github.com/ReimundKoenig) (so this is a fork while I did not find the original project on bitbucket anymore :) )
Offers a virtual joystick on port 3001 for multiple players and manages these players for several possible running apps.
Game selection is done via a web interface on port 3003.
Game screen is offered optional on port 3002. (IP from your local system hw. See log of app start.)

Currently there is only a single app implemented which forwards 'player' joystick commands to a serial port. Usually you'd expect a microcontroller to read the serial (joystick) commands and e.g. run another game display 'of sorts' aka a [cubic snake game](https://github.com/bishibashiB/led_cube_snake).
