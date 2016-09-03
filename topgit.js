$(function () {
    var dataDiv = $('#data');
    var itemsDiv = $('#items');
    var languageInput = $('#language');
    var minStarsInput = $('#stars');
    var maximumRepoCountToFetchInput = $('#maximumRepoCountToFetch');
    var totalResultsDiv = $('#totalResults');
    var repoCountSpan = $('#repoCount');
    var starCountSpan = $('#starCount');
    var languageNameSpan = $('#languageName');
    var lastAPICallDurationSpan = $('span#lastAPICallDuration');
    var lastAPICallAtSpan = $('span#lastAPICallAt');
    var maxRepoReturnedByGitHubPerPage = 100;


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
    function createItems(allItems) {
        itemsDiv.html('');
        function createItem(item) {
            function createAnchor(href, name) {
                return $('<a href="' + href + '">' + name + '</a>');
            }
            function createHeader(item) {
                var headerContainer = $('<h4></h4>');
                headerContainer.append(createAnchor(item.html_url, item.full_name));
                return headerContainer;
            }
            function createDescription(desc) {
                var descriptionContainer = $('<div class="description"></div>');
                descriptionContainer.html(desc);
                return descriptionContainer
            }
            console.log('createItem', item);
            var itemContainer = $('<div class="col-md-4 repo"></div>');
            var header = createHeader(item);
            itemContainer.html(header);
            itemContainer.append(createDescription(item.description));
            return itemContainer;    
        }
        function creatItemsForPage(items) {
            console.log('creatItemsForPage', items);
            var pageContainer = $('<div></div>');
            items.forEach(function(item) {
                createItem(item).appendTo(pageContainer);
            });
            return pageContainer;
        }
        dataDiv.pagination({
            dataSource: allItems,
            pageSize: maxRepoReturnedByGitHubPerPage,
            callback: function(data, pagination) {
                var page = creatItemsForPage(data);
                console.log('page', page);
                itemsDiv.html(page);
            }
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
        var maximumRepoCountToFetch = maximumRepoCountToFetchInput.val();
        var numberOfPages = Math.floor(maximumRepoCountToFetch / maxRepoReturnedByGitHubPerPage);
        var URI = 'https://api.github.com/search/repositories?q=stars:>='
            + minStars
            + '+language:'
            + encodeURIComponent(language)
            + '&sort=stars&order=desc&page='
            + numberOfPages
            + '&per_page='
            + maximumRepoCountToFetch;

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