$(function () {
    var dataDiv = $('#data');
    var itemsDiv = $('#items');
    var languageInput = $('#language');
    var minStarsInput = $('#stars');
    var totalResultsDiv = $('#totalResults');
    var repoCountSpan = $('#repoCount');
    var starCountSpan = $('#starCount');
    var languageNameSpan = $('#languageName');
    var lastAPICallDurationSpan = $('span#lastAPICallDuration');
    var lastAPICallAtSpan = $('span#lastAPICallAt');

    function sessionSaveName(name) {
        var savedNames = sessionStorage.getItem('saved-names') || '';
        var namesArray = savedNames.split('_');
        namesArray.push(name);
        sessionStorage.setItem('saved-names', namesArray.join('_'));
    }
    function sessionSave(name, value) {
        sessionStorage.setItem(name, value);
        sessionSaveName(name);
    }
    function sessionRetrieve(name, value) {
        sessionStorage.getItem(name);
    }
    function createItems(items) {
        itemsDiv.html('');
        function createItem() {
            return $('<div class="col-md-4 repo"></div>');
        }
        items.forEach(function (item) {
            console.log(item);
            var curr = createItem();
            curr.html(item.full_name);
            itemsDiv.append(curr);
        });
    };
    function postSuccess_stats(totalCount, minStars, languageName) {
        totalResultsDiv.addClass('displayB');
        dataDiv.addClass('displayB');
        repoCountSpan.html(totalCount);
        starCountSpan.html(minStars);
        languageNameSpan.html(languageName);
    }
    $('#search').on('click', function () {
        totalResultsDiv.removeClass('displayB');
        dataDiv.removeClass('displayB');
        var language = languageInput.val();
        var minStars = minStarsInput.val();
        var URI = 'https://api.github.com/search/repositories?q=stars:>='
            + minStars
            + '+language:'
            + encodeURIComponent(language)
            + '&sort=stars&order=desc&page=1&per_page=40';

        $('html, body').css('cursor', 'wait');
        var lastAPICallTime = moment();
        lastAPICallAtSpan.html(lastAPICallTime.format('hh:mm:ss'));
        sessionSave('lastAPICallTime', lastAPICallTime);
        $.getJSON(URI)
            .done(function (json) {
                postSuccess_stats(json.total_count, minStars, language);
                createItems(json.items);
                console.log(json);
            })
            .fail(function (jqxhr, textStatus, error) {
                $('#data').html();
                console.error("ERROR: " + textStatus + ", " + error);
                console.error("ERROR: " + URI);
            })
            .always(function () {
                console.log(URI + " loading finished.");
                $('html, body').css('cursor', 'auto');
                var now = moment();
                lastAPICallDurationSpan.html(now.diff(lastAPICallTime, 'seconds'));
            });

    });
        
});