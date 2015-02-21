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


var parameters = {
    "salts": { // Map from salt->ion->(ppm/g/gal)
        "gypsum": {
            "calcium": 61.5,
            "sulfate": 147.4
        },
        "epsom": {
            "magnesium": 26.0,
            "sulfate": 103.0
        },
        "table": {
            "sodium": 104.0,
            "chloride": 160.3
        },
        "baking_soda": {
            "sodium": 73.2,
            "bicarbonate": 191.9,
        },
        "calcium_chloride": {
            "calcium": 72.0,
            "chloride": 127.0
        },
        "chalk": {
            "calcium": 105.7,
            "bicarbonate": 322.3,
        },
        "pickling_lime": {
            "calcium": 142.8,
            "bicarbonate": 434.8
        },
        "magnesium_chloride": {
            "magnesium": 31.6,
            "chloride": 92.2
        }
    },
    "salts_g_tsp": {
        "gypsum": 4.0,
        "epsom": 4.5,
        "table": 5.7,
        "baking_soda":4.4,
        "calcium_chloride": 3.4,
        "chalk": 4.4,
        "pickling_lime": 4.4,
        "magnesium_chloride": 3.2
    },
    "ions": {  // Map ion->relative_importance
        "calcium": 10.0,
        "magnesium": 1.0,
        "sodium": 1.0,
        "sulfate": 100.0,
        "chloride": 100.0,
        "bicarbonate": 1.0
    }
}

var example_input = {
    "water_gallons": 6.0,
    "target_profile": {  // Map from ion->ppm. Only list ions you care about.
        "calcium": 55.0,
        "magnesium": 10.0,
        "sodium": 10.0,
        "sulfate": 75.0,
        "chloride": 63.0,
        "bicarbonate": 40.0
    },
    "initial_profile": { // Map from ion->ppm
        "calcium": 4.0,
        "magnesium": 0.9,
        "sodium": 32.6,
        "sulfate": 5.5,
        "chloride": 23.2,
        "bicarbonate": 49.2
    },
    "max_salts": {  // Map from ion->(g/gal). Only list salts you want to use.
        "gypsum": 1000.0,
        "epsom": 1000.0,
        "table": 1000.0,
        "baking_soda": 1000.0,
        "calcium_chloride": 1000.0,
        "pickling_lime": 1000.0,
        "magnesium_chloride": 1000.0,
        "chalk": 1.0
    }
}


var example_output = {
  "salts_g_gal": {
    "gypsum": 0.39390000000000003,
    "epsom": 0.1645,
    "table": 0,
    "baking_soda": 0.1366,
    "calcium_chloride": 0.36460000000000004,
    "pickling_lime": 0.0317,
    "magnesium_chloride": 0.1811
  },
  "salts_g": {
    "gypsum": 1.9695,
    "epsom": 0.8225,
    "table": 0,
    "baking_soda": 0.683,
    "calcium_chloride": 1.8230000000000002,
    "pickling_lime": 0.1585,
    "magnesium_chloride": 0.9055000000000001
  },
  "salts_tsp": {
    "gypsum": 0.492375,
    "epsom": 0.1827777777777778,
    "table": 0,
    "baking_soda": 0.1552272727272727,
    "calcium_chloride": 0.5361764705882354,
    "pickling_lime": 0.03602272727272727,
    "magnesium_chloride": 0.28296875
  },
  "ions": {
    "calcium": 55,
    "magnesium": 10,
    "sodium": 10,
    "sulfate": 75,
    "chloride": 63,
    "bicarbonate": 40
  },
  "ions_added": {
    "calcium": 55,
    "magnesium": 10,
    "sodium": 10,
    "sulfate": 75,
    "chloride": 63,
    "bicarbonate": 40
  },
  "ion_errors": {
    "calcium": 0,
    "magnesium": 0,
    "sodium": 0,
    "sulfate": 0,
    "chloride": 0,
    "bicarbonate": 0
  }
};


function setup_problem(parameters, input)
{
    var problem = {"i_constraints": [], "e_constraints": []};
    problem["objective"] = problem_objective(parameters, input);
    problem.i_constraints = problem.i_constraints.concat(
        abs_constraints(parameters, input));
    problem.i_constraints = problem.i_constraints.concat(
        limit_constraints(parameters, input));

    problem.e_constraints = problem.e_constraints.concat(
        ion_constraints(parameters, input));
    return problem;
}

function problem_objective(parameters, input)
{
    var objective = {}
    for (var ion in input.target_profile) {
        var vname = "abse_" + ion;
        objective[vname] = parameters.ions[ion];
    }
    // L1 regularizer to encourage sparse solutions.
    for (var salt in input.max_salts) {
        objective[salt] = 0.001;
    }
    return objective;
}

function abs_constraints(parameters, input)
{
    var constraints = [];
    for (var ion in input.target_profile) {
        var vna = "abse_" + ion;
        var vne = "e_" + ion;

        var cons = {"rhs": 0.0, "lhs": {}}
        cons.lhs[vna] = -1.0;
        cons.lhs[vne] = 1.0;
        constraints.push(cons);

        cons = {"rhs": 0.0, "lhs": {}}
        cons.lhs[vna] = -1.0;
        cons.lhs[vne] = -1.0;
        constraints.push(cons);
    }
    return constraints;
}


function limit_constraints(parameters, input)
{
    var constraints = []
    for (var salt in input.max_salts) {
        var cons = {"rhs": 0.0, "lhs": {}};
        cons.lhs[salt] = -1.0;
        constraints.push(cons);

        cons = {"rhs": input.max_salts[salt], "lhs": {}};
        cons.lhs[salt] = 1.0;
        constraints.push(cons);
    }
    return constraints;
}


function ion_constraints(parameters, input)
{
    var constraints = []
    var ion_map = ion_salt_map(parameters);

    for (var ion in input.target_profile) {
        var error_ion = "e_" + ion;

        var cons = {"rhs": (input.target_profile[ion] - input.initial_profile[ion]),
            "lhs": {
            }};
        cons.lhs[error_ion] = 1.0;

        for (var salt in input.max_salts) {
            if (salt in ion_map[ion]) {
                cons.lhs[salt] = ion_map[ion][salt];
            } else {
                cons.lhs[salt] = 0.0;
            }
        }

        constraints.push(cons);
    }
    return constraints;
}


function ion_salt_map(parameters)
{
    var im = {};
    for (var salt in parameters.salts) {
        for (var ion in parameters.salts[salt]) {
            if (! (ion in im)) { im[ion] = {}; }
            im[ion][salt] = parameters.salts[salt][ion];
        }
    }
    return im;
}


function problem_to_matrix(problem)
{
    var variables = extract_variables(problem);
    var objective = fill_array(0.0, variables.number_name.length);
    var i_constraints = fill_matrix(0.0, 
        problem.i_constraints.length,
        variables.number_name.length);
    var i_limits = fill_array(0.0, problem.i_constraints.length);

    for (var v in problem.objective) {
        var vnr = variables.name_number[v];
        objective[vnr] = problem.objective[v];
    }

    for (var cnr in problem.i_constraints) {
        i_limits[cnr] = problem.i_constraints[cnr].rhs;
        for (var v in problem.i_constraints[cnr].lhs) {
            var vnr = variables.name_number[v];

            i_constraints[cnr][vnr] =
                problem.i_constraints[cnr].lhs[v];
        }
    }


    var e_constraints = fill_matrix(0.0, 
        problem.e_constraints.length,
        variables.number_name.length);
    var e_limits = fill_array(0.0, problem.e_constraints.length);

    for (var cnr in problem.e_constraints) {
        e_limits[cnr] = problem.e_constraints[cnr].rhs;
        for (var v in problem.e_constraints[cnr].lhs) {
            var vnr = variables.name_number[v];

            e_constraints[cnr][vnr] =
                problem.e_constraints[cnr].lhs[v];
        }
    }

    return {
        "variables": variables,
        "objective": objective,
        "i_constraints": i_constraints,
        "i_limits": i_limits,
        "e_constraints": e_constraints,
        "e_limits": e_limits
    }
}


function fill_array(val, nr)
{
    var ret = []
    for (var i = 0; i < nr; i++) {
        ret.push(val);
    }
    return ret;
}


function fill_matrix(val, m, n) {
    var ret = [];
    for (var i = 0; i< m; i++) {
        ret.push(fill_array(val, n));
    }
    return ret;
}



function extract_variables(problem)
{
    var variables = {"name_number": {}, "number_name": []}
    for (var v in problem["objective"]) {
        if (! (v in variables.name_number)) {
            var nr = variables.number_name.length;

            variables.name_number[v] = nr;
            variables.number_name.push(v);
        }
    }
    for (var cnr in problem.i_constraints) {
        for (var v in problem.i_constraints[cnr].lhs){
            if (! (v in variables.name_number)) {
                var nr = variables.number_name.length;

                variables.name_number[v] = nr;
                variables.number_name.push(v);
            }
        }
    }
    for (var cnr in problem.e_constraints) {
        for (var v in problem.e_constraints[cnr].lhs){
            if (! (v in variables.name_number)) {
                var nr = variables.number_name.length;

                variables.name_number[v] = nr;
                variables.number_name.push(v);
            }
        }
    }
    return variables;
}

function solution_to_json(parameters, input, mproblem, solution)
{
    var jsolution = {"salts_g_gal": {},
        "salts_g": {},
        "salts_tsp": {},
        "ions" : {},
        "ions_added": {},
        "ion_errors": {}};

    // Extract salt additions
    for (var salt in input.max_salts) {
        var snr = mproblem.variables.name_number[salt];
        jsolution.salts_g_gal[salt] = solution[snr];
        jsolution.salts_g[salt] = solution[snr] 
            * input.water_gallons;
        jsolution.salts_tsp[salt] = solution[snr] 
            * input.water_gallons / parameters.salts_g_tsp[salt];
    }

    // Extract ion errors
    for (var ion in input.target_profile) {
        var iname = "e_" + ion;
        var inr = mproblem.variables.name_number[iname];
        jsolution.ion_errors[ion] = solution[inr];
        jsolution.ions[ion] = input.target_profile[ion] - solution[inr];
        jsolution.ions_added[ion] = input.target_profile[ion] 
            - solution[inr]
            - input.initial_profile[ion];
    }
    return jsolution;
}


function optimize_salts(parameters, input)
{
    var problem = setup_problem(parameters, input);
    // document.write("problem: " + JSON.stringify(problem) + "<br><br>"); 
    
    var mproblem = problem_to_matrix(problem);
    // document.write("mproblem: " + JSON.stringify(mproblem) + "<br><br>"); 


    var x = numeric.solveLP(mproblem.objective, 
        mproblem.i_constraints,
        mproblem.i_limits,
        mproblem.e_constraints,
        mproblem.e_limits
        );       
    // alert("raw solution: " + JSON.stringify(x) +"<br><br>");
    var solution =   numeric.trunc(x.solution,1e-4);


    // document.write(JSON.stringify(solution));

    // document.write("<br><br>JSON Solution: " + JSON.stringify(solution_to_json(parameters, example_input, mproblem, solution)) + "<br>");
    return solution_to_json(parameters, example_input, mproblem, solution);
}


