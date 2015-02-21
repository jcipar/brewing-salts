# brewing-salts
Automatically determine salt additions for brewing water.

This is a web-based tool to determine what minerals to add to brewing water to achieve a particular target water profile. It is currently a work in progress. In addition to the rough user interface, it does not try to model maximum solubility (especially relevant for chalk), or mash vs. kettle adjustments.


## Using in Your Site
To install this calculator, you will need a copy of [numeric.js](http://numericjs.com/). The example user interface in `index.html` assumes a particular version of numeric.js. Ensure that the version loaded by `index.html` matches the version you are using.


## Credits
This software uses the Linear Programming solver from [numeric.js](http://numericjs.com/).


## Licence
This software is released under the MIT Licence. Details in file `LICENCE`.