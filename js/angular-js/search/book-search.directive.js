class BookSearch {

    constructor ($rootScope, $scope, $state, bookSearch, $element, $timeout, $window, debounce) {
        // Services
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.$window = $window;
        this.bookSearch = bookSearch;
        this.$element = $element;
        this.$timeout = $timeout;
        this.debounce = debounce;

        // Bind
        this.refreshContentSearch = this.refreshContentSearch.bind(this);
        this.setResults = this.setResults.bind(this);
        this.setDefaults = this.setDefaults.bind(this);
        this.resize = this.resize.bind(this);
    }

    $onInit ()
    {
        this.searchInput = this.$element[0].querySelector('.form-control');

        this.setDefaults();
        this.focus();

        if (this.scrollbar) {

            //Need to keep those in separate variables,
            //Because on destroy function does not have this. variables anymore.
            var window = angular.element(this.$window);
            var debounced = this.debounce(this.resize, 300);

            this.$element.addClass('search-scrollbar');

            window.on('resize', debounced);

            this.$scope.$on('$destroy', function()
            {
                window.off('resize', debounced);
            });
        }
    }

    resize()
    {
        var elements = {
            body: this.$element[0].querySelector('.module-body'),
            footer: this.$element[0].querySelector('.module-footer')
        };

        if (!elements.body || !elements.footer) {
            return;
        }

        var bounds = {
            'body': elements.body.getBoundingClientRect(),
            'footer': elements.footer.getBoundingClientRect()
        };

        var height = this.$window.innerHeight - bounds.body.top - bounds.footer.height;

        angular.element(elements.body).css('max-height', height + 'px');
    }

    setDefaults ()
    {
        this.searchResults = null;
        this.searchCurrPage = 0;
        this.minKeywordLength = 3;
        this.searchResultsTotal = 0;

        // Set default count per page
        this.countPerPage = Number(this.countPerPage) || 6;
    }

    focus ()
    {
        var self = this;

        this.$timeout(function()
        {
            self.searchInput.focus();
        });
    }

    refreshContentSearch ()
    {
        if (this.scrollbar) {
            this.$timeout(this.resize);
        }

        if (!this.searchTxt || this.searchTxt.length < this.minKeywordLength) {
            return;
        }

        this.setDefaults();

        var bookId = this.$rootScope.offline ? null : this.book.id;
        var results = this.bookSearch
            .search(this.searchTxt, {book_id: bookId});

        this.setResults(results);
    }

    setResults (data)
    {
        // divide to pages
        var counter;
        var countPerPage = this.countPerPage;
        var dataGroup = [];

        for (counter = 0; counter < data.length; counter+=countPerPage) {
            var page = data.slice(counter, counter + countPerPage);
            dataGroup.push(page);

            this.searchResultsTotal += page.length;
        }

        this.searchResults = dataGroup;
    }

    switchToSearchPage (pageNumber)
    {
        this.searchCurrPage = pageNumber;
    }
}

angular.module('komondor.book')

    .directive('bookSearch', function ()
    {
        return {
            restrict: 'AE',
            scope: {
                book: '=book',
                countPerPage: '@',
                scrollbar: '@'
            },
            templateUrl: 'book/search/book-search.html',
            controller: 'BookSearch',
            controllerAs: '$ctrl',
            bindToController: true
        };
    })

    .controller('BookSearch', BookSearch);