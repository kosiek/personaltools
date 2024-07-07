// ==UserScript==
// @name         Pogomapy IV filtr custom
// @namespace    http://tampermonkey.net/
// @version      2024-06-30
// @description  try to take over the world!
// @author       You
// @match        https://pogomapy.pl/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pogomapy.pl
// @grant        none
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

$.noConflict();
jQuery(document).ready(function($) {
    $("#pokemonFilter").append(`
        <div class="form-check">
            <input class="form-check-input" type="checkbox" id="isFilterIvAttDefStaEnabled" />
            <label class="form-check-label" for="showFilterIvAttDefSta">
                Filtr zakresu IV (Att-Sta-Def)
            </label>
            <i id="showFilterIvAttDefStaPlus" class="fa fa-plus" style="display: inline-block;"></i>
            <i id="showFilterIvAttDefStaMinus" class="fa fa-minus" style="display: none;"></i>
        </div>`);

	var val = localStorage.getItem('isFilterIvAttDefStaEnabled') == 'true';
	if (val == null) {
		isFilterIvAttDefStaEnabled = false;
	} else {
        console.log("Loading isFilterIvAttDefStaEnabled (" + val + ") from localStorage");
		isFilterIvAttDefStaEnabled = val;
	}
	$('#isFilterIvAttDefStaEnabled').prop('checked', isFilterIvAttDefStaEnabled);
	$('#isFilterIvAttDefStaEnabled').click(function () {
        console.log("Updating isFilterIvAttDefStaEnabled");
		var val = $(this).prop('checked');
		isFilterIvAttDefStaEnabled = val;
		localStorage.setItem('isFilterIvAttDefStaEnabled', val);
		loadDataForMap(true);
	});
    $('#showFilterIvAttDefStaPlus').click(function() {
        $(this).hide();
        $('#showFilterIvAttDefStaMinus').show();
        $('#showFilterOptionsIvAttDefSta').show();
    });
    $('#showFilterIvAttDefStaMinus').click(function() {
        $(this).hide();
        $('#showFilterIvAttDefStaPlus').show();
        $('#showFilterOptionsIvAttDefSta').hide();
    });

    // Pokemon filtering: define variables and HTML DOM elements:
    var pokemonFilterIvRangeInputAttMin = 0;
    var pokemonFilterIvRangeInputAttMax = 15;
    var pokemonFilterIvRangeInputDefMin = 0;
    var pokemonFilterIvRangeInputDefMax = 15;
    var pokemonFilterIvRangeInputStaMin = 0;
    var pokemonFilterIvRangeInputStaMax = 15;
    $('#pokemonFilter').append(`
        <div id="showFilterOptionsIvAttDefSta" style="display: inline-block;">
            <label class="control-label">Zakres IV: Attack</label>
            <div class="form-group" style="display: flex; justify-content: space-between">
                <label class="control-label" for="pokemonFilterIvRangeInputAttMin">min:</label>
                <input type="text" class="form-control" id="pokemonFilterIvRangeInputAttMin" value="0" style="width: 3em;">
                <label class="control-label" for="pokemonFilterIvRangeInputAttMax">max:</label>
                <input type="text" class="form-control" id="pokemonFilterIvRangeInputAttMax" value="15" style="width: 3em;">
            </div>
            <label id="pokemonFilterIvRangeInputAttError" class="control-label" style="color: red;"></label>
            <br/>
            <label class="control-label">Zakres IV: Defense</label>
            <div class="form-group" style="display: flex; justify-content: space-between">
                <label class="control-label" for="pokemonFilterIvRangeInputDefMin">min:</label>
                <input type="text" class="form-control" id="pokemonFilterIvRangeInputDefMin" value="0" style="width: 3em;">
                <label class="control-label" for="pokemonFilterIvRangeInputDefMax">max:</label>
                <input type="text" class="form-control" id="pokemonFilterIvRangeInputDefMax" value="15" style="width: 3em;">
            </div>
            <label id="pokemonFilterIvRangeInputDefError" class="control-label" style="color: red;"></label>
            <br/>
            <label class="control-label">Zakres IV: Stamina</label>
            <div class="form-group" style="display: flex; justify-content: space-between">
                <label class="control-label" for="pokemonFilterIvRangeInputStaMin">min:</label>
                <input type="text" class="form-control" id="pokemonFilterIvRangeInputStaMin" value="0" style="width: 3em;">
                <label class="control-label" for="pokemonFilterIvRangeInputStaMax">max:</label>
                <input type="text" class="form-control" id="pokemonFilterIvRangeInputStaMax" value="15" style="width: 3em;">
            </div>
            <label id="pokemonFilterIvRangeInputStaError" class="control-label" style="color: red;"></label>
            <br/>
        </div>
    `);

    function parseAndCheckIv(inputElement, onSuccess, onFailure) {
        const parsedIv = parseInt(inputElement.value, 10);
        if (isNaN(parsedIv)) {
            var errorMsg = "Invalid value '" + inputElement.value + "' - must be a number";
            inputElement.value = inputElement.defaultValue;
            inputElement.focus();
            if (typeof onFailure === 'function') {
                onFailure(errorMsg);
            }
            return;
        }
        if (parsedIv < 0 || parsedIv > 15) {
            var errorMsg = "Value '" + inputElement.value + "' not an IV - IV  is between 0 and 15";
            inputElement.value = inputElement.defaultValue;
            inputElement.focus();
            if (typeof onFailure === 'function') {
                onFailure(errorMsg);
            }
            return;
        }
        if (typeof onSuccess === 'function') {
            onSuccess(parsedIv);
        }
    }
    function getFromLocalStorage(key, defaultValue, onValueFromLocalStorage) {
        var val = localStorage.getItem(key);
        if (val !== null) {
            if (typeof onValueFromLocalStorage === 'function') {
                onValueFromLocalStorage(val);
            }
            return val;
        }
        return defaultValue;
    }

    //
    // pokemonFilterIvRangeInputAttMin:
    $('#pokemonFilterIvRangeInputAttMin').val(
        getFromLocalStorage(
            'pokemonFilterIvRangeInputAttMin',
            $('#pokemonFilterIvRangeInputAttMin').val(),
            (localStorageValue) => {
                pokemonFilterIvRangeInputAttMin = parseInt(localStorageValue, 10);
            }
        )
    );
    $('#pokemonFilterIvRangeInputAttMin').change(function(event) {
        parseAndCheckIv(
            event.target,
            (iv) => {
                console.log('Setting pokemonFilterIvRangeInputAttMin to:', iv)
                pokemonFilterIvRangeInputAttMin = iv;
                localStorage.setItem('pokemonFilterIvRangeInputAttMin', iv);
                $('#pokemonFilterIvRangeInputAttError').text(''); // Clear error messages.
            },
            (errorMsg) => {
                $('#pokemonFilterIvRangeInputAttError').text(errorMsg);
            });
    });

    //
    // pokemonFilterIvRangeInputAttMax:
    $('#pokemonFilterIvRangeInputAttMax').val(
        getFromLocalStorage(
            'pokemonFilterIvRangeInputAttMax',
            $('#pokemonFilterIvRangeInputAttMax').val(),
            (localStorageValue) => {
                pokemonFilterIvRangeInputAttMax = parseInt(localStorageValue, 10);
            }
        )
    );
    $('#pokemonFilterIvRangeInputAttMax').change(function(event) {
        parseAndCheckIv(
            event.target,
            (iv) => {
                pokemonFilterIvRangeInputAttMax = iv;
                localStorage.setItem('pokemonFilterIvRangeInputAttMax', iv);
                $('#pokemonFilterIvRangeInputAttError').text(''); // Clear error messages.
            },
            (errorMsg) => {
                $('#pokemonFilterIvRangeInputAttError').text(errorMsg);
            });
    });

    //
    // pokemonFilterIvRangeInputDefMin:
    $('#pokemonFilterIvRangeInputDefMin').val(
        getFromLocalStorage(
            'pokemonFilterIvRangeInputDefMin',
            $('#pokemonFilterIvRangeInputDefMin').val(),
            (localStorageValue) => {
                pokemonFilterIvRangeInputDefMin = parseInt(localStorageValue, 10);
            }
        )
    );
    $('#pokemonFilterIvRangeInputDefMin').change(function(event) {
        parseAndCheckIv(
            event.target,
            (iv) => {
                pokemonFilterIvRangeInputDefMin = iv;
                localStorage.setItem('pokemonFilterIvRangeInputDefMin', iv);
                $('#pokemonFilterIvRangeInputDefError').text(''); // Clear error messages.
            },
            (errorMsg) => {
                $('#pokemonFilterIvRangeInputDefError').text(errorMsg);
            });
    });

    //
    // pokemonFilterIvRangeInputDefMax:
    $('#pokemonFilterIvRangeInputDefMax').val(
        getFromLocalStorage(
            'pokemonFilterIvRangeInputDefMax',
            $('#pokemonFilterIvRangeInputDefMax').val(),
            (localStorageValue) => {
                pokemonFilterIvRangeInputDefMax = parseInt(localStorageValue, 10);
            }
        )
    );
    $('#pokemonFilterIvRangeInputDefMax').change(function(event) {
        parseAndCheckIv(
            event.target,
            (iv) => {
                pokemonFilterIvRangeInputDefMax = iv;
                localStorage.setItem('pokemonFilterIvRangeInputDefMax', iv);
                $('#pokemonFilterIvRangeInputDefError').text(''); // Clear error messages.
            },
            (errorMsg) => {
                $('#pokemonFilterIvRangeInputDefError').text(errorMsg);
            });
    });

    //
    // pokemonFilterIvRangeInputDefMax:
    $('#pokemonFilterIvRangeInputStaMin').val(
        getFromLocalStorage(
            'pokemonFilterIvRangeInputStaMin',
            $('#pokemonFilterIvRangeInputStaMin').val(),
            (localStorageValue) => {
                pokemonFilterIvRangeInputStaMin = parseInt(localStorageValue, 10);
            }
        )
    );
    $('#pokemonFilterIvRangeInputStaMin').change(function(event) {
        parseAndCheckIv(
            event.target,
            (iv) => {
                pokemonFilterIvRangeInputStaMin = iv;
                localStorage.setItem('pokemonFilterIvRangeInputStaMin', iv);
                $('#pokemonFilterIvRangeInputStaError').text(''); // Clear error messages.
            },
            (errorMsg) => {
                $('#pokemonFilterIvRangeInputStaError').text(errorMsg);
            });
    });

    //
    // pokemonFilterIvRangeInputStaMax:
    $('#pokemonFilterIvRangeInputStaMax').val(
        getFromLocalStorage(
            'pokemonFilterIvRangeInputStaMax',
            $('#pokemonFilterIvRangeInputStaMax').val(),
            (localStorageValue) => {
                pokemonFilterIvRangeInputStaMax = parseInt(localStorageValue, 10);
            }
        )
    );
    $('#pokemonFilterIvRangeInputStaMax').change(function(event) {
        parseAndCheckIv(
            event.target,
            (iv) => {
                pokemonFilterIvRangeInputStaMax = iv;
                localStorage.setItem('pokemonFilterIvRangeInputStaMax', iv);
                $('#pokemonFilterIvRangeInputStaError').text(''); // Clear error messages.
            },
            (errorMsg) => {
                $('#pokemonFilterIvRangeInputStaError').text(errorMsg);
            });
    });

    // Override processPokemons() to allow custom IV filtering:
    window.processPokemonsSuper = processPokemons;
    function processPokemonWithIvFilter(pokemonData) {
        var ivFilteredPokemon = pokemonData;
        console.debug('--- processPokemonWithIvFilter() configuration: ---');
        console.log('Is IV filtering enabled:', isFilterIvAttDefStaEnabled);
        console.debug('  with min Attack:', pokemonFilterIvRangeInputAttMin);
        console.debug('  with max Attack:', pokemonFilterIvRangeInputAttMax);
        console.debug('  with min Defense:', pokemonFilterIvRangeInputDefMin);
        console.debug('  with max Defense:', pokemonFilterIvRangeInputDefMax);
        console.debug('  with min Stamina:', pokemonFilterIvRangeInputStaMin);
        console.debug('  with max Stamina:', pokemonFilterIvRangeInputStaMax);
        if (isFilterIvAttDefStaEnabled) {
            // console.debug('Starting data:', pokemonData);
            ivFilteredPokemon = pokemonData.filter(function(pokemon) {
                return pokemon.atk_iv >= pokemonFilterIvRangeInputAttMin
                    && pokemon.atk_iv <= pokemonFilterIvRangeInputAttMax
                    && pokemon.def_iv >= pokemonFilterIvRangeInputDefMin
                    && pokemon.def_iv <= pokemonFilterIvRangeInputDefMax
                    && pokemon.sta_iv >= pokemonFilterIvRangeInputStaMin
                    && pokemon.sta_iv <= pokemonFilterIvRangeInputStaMax;
            });
            console.log("Found " + ivFilteredPokemon.length + " pokemon with IV in range.")
            // console.debug('Filtered data:', ivFilteredPokemon);
        }
        processPokemonsSuper(ivFilteredPokemon);
        console.debug('--- processPokemonWithIvFilter() end ---');
    };
    if (typeof processPokemons === 'function') { // Override:
        window.processPokemons = processPokemonWithIvFilter;
    }
} );
