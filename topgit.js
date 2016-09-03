$(function () {
    var sortByStarsContainer = $('#sortByStars');
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
    var sortByStarsValue;

    (function () {
        var descClass = 'glyphicon-sort-by-order-alt';
        var ascClass = 'glyphicon-sort-by-order';
        var enabledClass = descClass;
        var disabledClass = ascClass;
        sortByStarsValue = 'desc';
        sortByStarsContainer.children().filter('.order').addClass(enabledClass);
        sortByStarsContainer.children().filter('.order').on('click', function () {
            sortByStarsValue = sortByStarsValue === 'desc' ? 'asc' : 'desc';
            $(this).toggleClass(enabledClass).toggleClass(disabledClass);
            var tmp = disabledClass;
            disabledClass = enabledClass;
            enabledClass = tmp;
        });

    })();

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
                return $('<a href="' + href + '" target="_blank">' + name + '</a>');
            }
            function createHeader(item) {
                var headerContainer = $('<h4></h4>');
                headerContainer.append(createAnchor(item.html_url, item.full_name));
                return headerContainer;
            }
            function createDescription(desc) {
                var descriptionContainer = $('<div class="detail description"></div>');
                descriptionContainer.html(desc);
                return descriptionContainer
            }
            function createCreatedXDaysAgo(date) {
                var then = moment(date);
                var days = moment().diff(then, 'days');
                var container = $('<span class="detail stat created" title="started ' + days + ' days ago" data-toggle="tooltip" data-placement="top"></span>');
                var image = $('<span class="glyphicon glyphicon-triangle-right"></span>');
                container.append(image);
                container.append(days);
                return container;
            }
            function crateStars(starCount) {
                var container = $('<span class="detail stat starCount" title="Number of stars" data-toggle="tooltip" data-placement="top"></span>');
                var image = $('<span class="glyphicon glyphicon-star"></span>');
                container.append(image);
                container.append('<span>' + starCount + '</span>');
                return container;
            }
            function crateWatchers(watchersCount) {
                var container = $('<span class="detail stat watchersCount" title="Number of watchers" data-toggle="tooltip" data-placement="top"></span>');
                var image = $('<span class="glyphicon glyphicon-eye-open"></span>');
                container.append(image);
                container.append('<span>' + watchersCount + '</span>');
                return container;
            }
            function createDownloadSize(size) {
                var container = $('<span class="detail stat downloadSize" title="Size of repo in KiB" data-toggle="tooltip" data-placement="top"></span>');
                var image = $('<span class="glyphicon glyphicon-floppy-save"></span>');
                container.append(image);
                container.append('<span>' + size + '</span>');
                return container;
            }
            function createUpdatedXDaysAgo(date) {
                var then = moment(date);
                var title = 'days';
                var time = moment().diff(then, title);
                if(time < 1) {
                    title = 'hours';
                    time = moment().diff(then, title);
                    if(time < 1) {
                        title = 'minutes';
                        time = moment().diff(then, title);
                            if(time < 1) {
                            title = 'seconds';
                            time = moment().diff(then, title);
                        }
                    }
                }
                title = time === 1 ? title.substr(0, title.length-1) : title;
                var container = $('<span class="detail stat created" title="updated ' + time + ' ' + title + ' ago" data-toggle="tooltip" data-placement="top"></span>');
                var image = $('<span class="glyphicon glyphicon-edit"></span>');
                container.append(image);
                container.append(time);
                return container;
            }
            function createOpenIssues(count) {
                var container = $('<span class="detail stat openIssues" title="Open issues" data-toggle="tooltip" data-placement="top"></span>');
                var image = $('<span class="glyphicon glyphicon-fire"></span>');
                container.append(image);
                container.append('<span>' + count + '</span>');
                return container;
            }
            function createHomepage(homepageURL) {
                var container = $('<span class="detail stat homepage" title="Homepage" data-toggle="tooltip" data-placement="top"></span>');
                container.append('<span><a href="' + homepageURL + '" target="_blank"><span class="glyphicon glyphicon-home"></span></a></span>');
                return container;
            }
            console.log('createItem', item);
            var itemContainer = $('<div class="col-md-4 repo"></div>');
            var header = createHeader(item);
            itemContainer.append(header);
            itemContainer.append(createDescription(item.description));
            itemContainer.append(createCreatedXDaysAgo(item.created_at));
            itemContainer.append(crateStars(item.stargazers_count));
            itemContainer.append(crateWatchers(item.watchers_count));
            itemContainer.append(createDownloadSize(item.size));
            itemContainer.append(createUpdatedXDaysAgo(item.updated_at));
            itemContainer.append(createHomepage(item.homepage));
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
        $('[data-toggle="tooltip"]').tooltip();
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
            + '&sort=stars&order='
            + sortByStarsValue
            + '&page='
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