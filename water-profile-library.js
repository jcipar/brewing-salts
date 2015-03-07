"use strict";

/**
The MIT License (MIT)

Copyright (c) 2015 James Cipar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
**/


var standard_initial_profiles = {
    "Distilled": {
        "calcium": 0,
        "magnesium": 0,
        "sodium": 0,
        "sulfate": 0,
        "chloride": 0,
        "bicarbonate": 0
    },
    "Boston, Dec. 2014":  {
        "calcium": 4.0,
        "magnesium": 0.9,
        "sodium": 32.6,
        "sulfate": 5.5,
        "chloride": 23.2,
        "bicarbonate": 49.2
    },
    "Cambridge, MA, 2013": {
        "calcium": 20.8,
        "magnesium": 4.0,
        "sodium": 79.0,
        "sulfate": 28.0,
        "chloride": 120.0,
        "bicarbonate": 60.5
    },
    // "Ocean": {
    //     "calcium": 412,
    //     "magnesium": 1284,
    //     "sodium": 10781,
    //     "sulfate": 2712,
    //     "chloride": 19353,
    //     "bicarbonate": 126
    // }
}

var standard_target_profiles = {
    "Balanced": {
        "calcium": 80.0,
        "magnesium": 5.0,
        "sodium": 25.0,
        "sulfate": 80.0,
        "chloride": 75.0,
        "bicarbonate": 100.0
    },
    "Balanced, high mineral": {
        "calcium": 150.0,
        "magnesium": 10.0,
        "sodium": 80.0,
        "sulfate": 160.0,
        "chloride": 150.0,
        "bicarbonate": 220.0
    },
    "Yellow Malty": {
        "calcium": 50.0,
        "magnesium": 5.0,
        "sodium": 5.0,
        "sulfate": 55.0,
        "chloride": 70.0,
        "bicarbonate": 0.0,
        "residual_alkalinity": -95.0
    },
    "Yellow Hoppy": {
        "calcium": 75.0,
        "magnesium": 5.0,
        "sodium": 10.0,
        "sulfate": 150.0,
        "chloride": 50.0,
        "bicarbonate": 0.0
    },
    "Amber Balanced": {
        "calcium": 55.0,
        "magnesium": 10.0,
        "sodium": 10.0,
        "sulfate": 75.0,
        "chloride": 63.0,
        "bicarbonate": 40.0
    },
    // "Ocean": {
    //     "calcium": 412,
    //     "magnesium": 1284,
    //     "sodium": 10781,
    //     "sulfate": 2712,
    //     "chloride": 19353,
    //     "bicarbonate": 126
    // }
}