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
    "acids": {
        "sauermalz": 125.0,
        "lactic": 153.1,
        "phosphoric": 14.88
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
        "calcium": 1.0,
        "magnesium": 10.0,
        "sodium": 10.0,
        "sulfate": 100.0,
        "chloride": 100.0,
        "bicarbonate": 1.0,
    },
    "max_ions": {
        "calcium": 150.0,
        "magnesium": 30.0,
        "sodium": 150.0,
        "sulfate": 150.0,
        "chloride": 250.0,
        "bicarbonate": 250.0,
    },
    "residual_alkalinity_contributions": {
        "bicarbonate": 0.8197,
        "calcium": -0.7143,
        "magnesium": -0.5882,
        "acid": -1.0
    }
}

var example_input = {
    "mash_gallons": 5.5,
    "sparge_gallons": 0.0,
    "target_residual_alkalinity": -95.0,
    "target_profile": {  // Map from ion->ppm. Only list ions you care about.
        "calcium": 50.0,
        "magnesium": 5.0,
        "sodium": 5.0,
        "sulfate": 55.0,
        "chloride": 70.0,
        "bicarbonate": 0.0,
    },
    "initial_profile": { // Map from ion->ppm
        "calcium": 20.8,
        "magnesium": 4.0,
        "sodium": 79.0,
        "sulfate": 28.0,
        "chloride": 120.0,
        "bicarbonate": 60.5
    },
    "max_salts": {  // Map from ion->(g/gal). Only list salts you want to use.
        "gypsum": 1000.0,
        "epsom": 1000.0,
        "table": 1000.0,
        "baking_soda": 1000.0,
        "calcium_chloride": 1000.0,
        "pickling_lime": 1000.0,
        "magnesium_chloride": 1000.0,
        "chalk": 1000.0
    },
    "max_acids": {
        "sauermalz": 1000.0,
        "lactic": 1000.0,
        "phosphoric": 1000.0
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
    //input.target_profile.acid = 0.0;
    var problem = {"i_constraints": [], "e_constraints": []};
    problem["objective"] = problem_objective(parameters, input);
    problem.i_constraints = problem.i_constraints.concat(
        abs_constraints(parameters, input));
    problem.i_constraints = problem.i_constraints.concat(
        limit_constraints(parameters, input));

    problem.e_constraints = problem.e_constraints.concat(
        ion_e_constraints(parameters, input));
    problem.e_constraints = problem.e_constraints.concat(
        acid_e_constraints(parameters, input));
    problem.e_constraints = problem.e_constraints.concat(
        ra_e_constraints(parameters, input));
    return problem;
}

function problem_objective(parameters, input)
{
    var objective = {}
    objective['abse_residual_alkalinity'] = 1000.0;
    for (var ion in input.target_profile) {
        var vname = "abse_" + ion;
        objective[vname] = parameters.ions[ion];
    }
    // L1 regularizer to encourage sparse solutions.
    // These regularizer terms need to be pretty high, but
    // that won't interfere with the solution, since all of
    // the coefficients that use the variables are at least
    // 14.
    for (var salt in input.max_salts) {
        objective[salt] = 1.0;
        if (input.sparge_gallons && input.sparge_gallons > 0){
            objective["sparge_" + salt] = 1.0;
        }
    }
    for (var acid in input.max_acids) {
        objective[acid] = 1.0;
    }
    return objective;
}

function abs_constraints(parameters, input)
{
    var constraints = [];
    constraints = constraints.concat(abs_constraint('residual_alkalinity'));
    for (var ion in input.target_profile) {
        constraints = constraints.concat(abs_constraint(ion));
    }
    return constraints;
}


function abs_constraint(ion)
{
    var constraints = [];
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
    
    return constraints;
}


function limit_constraints(parameters, input)
{
    var constraints = []
    for (var salt in input.max_salts) {
        constraints.push(non_negative(salt));

        var cons = {"rhs": input.max_salts[salt], "lhs": {}};
        cons.lhs[salt] = 1.0;
        if (input.sparge_gallons && input.sparge_gallons > 0) {
            constraints.push(non_negative("sparge_" + salt));
            cons.lhs["sparge_" + salt] = 1.0;
        }
        constraints.push(cons);
    }
    for (var acid in input.max_acids) {

        constraints.push(non_negative(acid));

        cons = {"rhs": input.max_acids[acid], "lhs": {}};
        cons.lhs[acid] = 1.0;
        constraints.push(cons);
    }
    return constraints;
}


function non_negative(variable)
{
    var cons = {"rhs": 0.0, "lhs": {}};
    cons.lhs[variable] = -1.0;
    return cons;
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


function ion_e_constraints(parameters, input) 
{
    var constraints = []
    var ion_map = ion_salt_map(parameters);
    var sparge_gallons = 0.0;
    if (input.sparge_gallons) {
        sparge_gallons = input.sparge_gallons;
    }
    var total_gallons = input.mash_gallons + sparge_gallons;

    for (var ion in input.target_profile) {
        var cons = {"rhs": -input.initial_profile[ion], "lhs": {}};
        cons.lhs["mash_" + ion] = -1.0;

        var sparge_cons = {"rhs": -input.initial_profile[ion], "lhs": {}};
        sparge_cons.lhs["sparge_" + ion] = -1.0;

        for (var salt in input.max_salts) {
            if (salt in ion_map[ion]) {
                cons.lhs[salt] = ion_map[ion][salt];
                if (input.sparge_gallons) {
                    sparge_cons.lhs["sparge_" + salt] = ion_map[ion][salt];
                }
            } else {
            }
        }
        constraints.push(cons);
        if (input.sparge_gallons) {
            constraints.push(sparge_cons);
        }

        cons = {"rhs": input.target_profile[ion], "lhs": {}};
        cons.lhs["mash_" + ion] = input.mash_gallons / total_gallons;
        cons.lhs["e_"+ion] = 1.0;
        if (input.sparge_gallons) {
            cons.lhs["sparge_" + ion] = sparge_gallons / total_gallons;
        }
        constraints.push(cons);
    }
    return constraints;
}


function acid_e_constraints(parameters, input)
{
    var cons = {"rhs": 0.0, "lhs": {"mash_acid":-1}};
    for (var acid in input.max_acids) {
        cons.lhs[acid] = parameters.acids[acid];
    }
    return [cons];
}


function ra_e_constraints(parameters, input)
{
    var constraints = []
    var cons = {"rhs": 0.0, "lhs": {}};
    cons.lhs["residual_alkalinity"] = -1;
    for (var ion in parameters.residual_alkalinity_contributions) {
        cons.lhs["mash_" + ion] = parameters.residual_alkalinity_contributions[ion];
    }
    constraints.push(cons);
    cons = {"rhs": input.target_residual_alkalinity, "lhs": {}};
    cons.lhs["residual_alkalinity"] = 1.0;
    cons.lhs["e_residual_alkalinity"] = 1.0;
    constraints.push(cons);
    return constraints;
}


/////////////
// Converting problem to matrix form
/////////////


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
    var jsolution = {"additions_per_gallon": {},
        "additions_total": {},
        "additions_tsp": {},
        "ions" : {},
        "ions_added": {},
        "ion_errors": {}};

    // Extract salt additions
    for (var salt in input.max_salts) {
        var gals = input.mash_gallons;

        jsolution.additions_per_gallon[salt] = get_value(mproblem, solution, salt);
        jsolution.additions_total[salt] = get_value(mproblem, solution, salt)
            * gals;
        jsolution.additions_tsp[salt] = get_value(mproblem, solution, salt) 
            * gals / parameters.salts_g_tsp[salt];

        if (input.sparge_gallons) {
            var name = "sparge_"+salt;
            gals = input.sparge_gallons;

            jsolution.additions_per_gallon[name] = get_value(mproblem, solution, name);
            jsolution.additions_total[name] = get_value(mproblem, solution, name)
                * gals;
            jsolution.additions_tsp[name] = get_value(mproblem, solution, name) 
                * gals / parameters.salts_g_tsp[salt];
        }

    }
    // Extract acid additions
    for (var acid in input.max_acids) {
        var snr = mproblem.variables.name_number[acid];
        jsolution.additions_per_gallon[acid] = solution[snr];
        var gals = input.mash_gallons;

        jsolution.additions_total[acid] = solution[snr] 
            * gals;
        jsolution.additions_tsp[acid] = solution[snr] 
            * gals / parameters.salts_g_tsp[acid];
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
    // Extract residual alkalinity
    var ra_nr = mproblem.variables.name_number["residual_alkalinity"];
    jsolution.residual_alkalinity = solution[ra_nr];
    var era_nr =mproblem.variables.name_number["e_residual_alkalinity"];
    jsolution.residual_alkalinity_error = solution[era_nr];
    return jsolution;
}


function get_value(mproblem, solution, name)
{
    var snr = mproblem.variables.name_number[name];
    return solution[snr];
}


function optimize_salts(parameters, input)
{
    var problem = setup_problem(parameters, input);
    $('#problem').html(JSON.stringify(problem, null, 2));
    //console.log("problem: " + JSON.stringify(problem, null,2) + "<br><br>"); 
    
    var mproblem = problem_to_matrix(problem);
    // document.write("mproblem: " + JSON.stringify(mproblem) + "<br><br>"); 


    var x = numeric.solveLP(mproblem.objective, 
        mproblem.i_constraints,
        mproblem.i_limits,
        mproblem.e_constraints,
        mproblem.e_limits
        );
    //console.log("raw problem: " + JSON.stringify(mproblem));


    //console.log("raw solution: " + JSON.stringify(x) +"<br><br>");
    $('#raw-solution').html(JSON.stringify(x, null, 2));
    var solution =   numeric.trunc(x.solution,1e-4);


    // document.write(JSON.stringify(solution));

    // document.write("<br><br>JSON Solution: " + JSON.stringify(solution_to_json(parameters, example_input, mproblem, solution)) + "<br>");
    return solution_to_json(parameters, example_input, mproblem, solution);
}


