describe('bookSearch', function()
{
    var bookSearch;
    var Book;
    var Section;
    var bookId = 1;

    beforeEach(module('app'));

    beforeEach(function() {
        angular.module('config', []).constant('config', {});
    });

    beforeEach(inject(function($injector) {
        Book = $injector.get('Book');
        Section = $injector.get('Section');
        bookSearch = $injector.get('bookSearch');
    }));


    beforeEach(function(){

        var sections = [
            {
                id: 1,
                type: 'preface',
                slug: 'general-message',
                title: 'General message',
                parent_id: 0,
                book_id: 1,
                html: '<div class="component-list">Preface section</div>'
            },
            {
                id: 2,
                type: 'chapter',
                slug: 'first-chapter',
                title: 'First chapter',
                parent_id: 0,
                order: 1,
                book_id: 1,
                html: '<div class="component-list">' +
                '<p>The 2015/16 season brought a raft of new superlatives for Real madrid CF.</p>' +
                '</div>'
            },
            {
                id: 3,
                type: 'section',
                parent_id: 2,
                order: 2,
                slug: 'first-section',
                title: 'First section',
                book_id: 1,
                html: '<div class="component-list">' +
                '<p>You will need to study this manual with great attention.</p>' +
                '<p>And text going after.</p>' +
                '</div>'
            },
            {
                id: 4,
                type: 'section',
                parent_id: 2,
                order: 3,
                slug: 'second-section',
                title: 'Second section',
                book_id: 1,
                html: '<div class="component-list">' +
                '<p>Word "content" repeated more than 5 times in this section.</p>' +
                '<p>Content is a subject or topic covered in a book or document.</p>' +
                '<p>Content is something that is to be expressed through some medium.</p>' +
                '<p>Content is king.</p>' +
                '<p>Content is a noun.</p>' +
                '<p>Content is power of containing.</p>' +
                '</div>'
            },
            {
                id: 5,
                type: 'section',
                parent_id: 2,
                order: 4,
                slug: 'section-with-S-V-G',
                // There is a separate test for title so keep it like S-V-G
                title: 'Section with S-V-G',
                book_id: 1,
                html: '<div class="component-list">' +
                '<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit SVG.</p>' +
                '<p> <svg> <circle cx="50" cy="50" r="40" stroke="green" /> SVG text</svg></p>' +
                '</div>'
            },
            {
                id: 6,
                type: 'section',
                parent_id: 2,
                order: 5,
                slug: 'searchable-title',
                title: 'Searchable title',
                book_id: 1,
                html: '<div class="component-list">' +
                '<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</p>' +
                '</div>'
            },
            {
                id: 7,
                type: 'section',
                parent_id: 2,
                order: 6,
                slug: 'identical-1',
                title: 'Identical#1',
                book_id: 1,
                html: '<div class="component-list"></div>'
            },
            {
                id: 8,
                type: 'section',
                parent_id: 2,
                order: 7,
                slug: 'identical-2',
                title: 'Identical#2',
                book_id: 1,
                html: '<div class="component-list"></div>'
            }
        ];

        for (var key in sections) {

            Section.inject(sections[key]);
        }

        Book.inject({
            id: bookId
        });
    });

    function getResults(query)
    {
        return bookSearch.search(query, {book_id: bookId});
    }


    it('should throw an Error if keyword is blank', function()
    {
        expect(function () {
            getResults('');
        }).toThrow(new Error("Keyword cannot be empty"));
    });

    it('should not find any results by existing CSS class', function(){
        var results = getResults('component-list');

        expect(results.length).toEqual(0);
    });

    it('should return results with id, title, body and href attributes set', function()
    {
        var results = getResults(2015);
        var found = results[0];

        expect(found.id).toEqual(2);
        expect(found.title).toEqual('First chapter');
        expect(found.type).toEqual('chapter');
        expect(found.slug).toEqual('first-chapter');
        expect(found.body).toEqual('The <b>2015</b>/16 season brought a raft of new superlatives for Real madrid CF.');
        expect(found.href).toEqual('#!/book/1/chapter/first-chapter/content?keyword=2015');
    });

    it('should find one result by keyword "preface"', function()
    {
        var results = getResults('preface');

        expect(results.length).toEqual(1);
        expect(results[0].id).toEqual(1);
        expect(results[0].body).toEqual('<b>preface</b> section');
    });

    it('should correctly format result white spaces', function()
    {
        var results = getResults('attention');

        expect(results.length).toEqual(1);
        expect(results[0].id).toEqual(3);
        expect(results[0].body).toEqual('You will need to study this manual with great <b>attention</b>. And text going after.');
    });

    it('should find maximum 5 results by keyword "content" per section', function()
    {
        var results = getResults('content');

        expect(results.length).toEqual(5);
        expect(results[0].id).toEqual(4);
    });

    it('should hide SVG tag(s) and its content', function()
    {
        var results = getResults('svg');

        expect(results.length).toEqual(1);
        expect(results[0].body).toEqual('Lorem ipsum dolor sit amet, consectetuer adipiscing elit <b>svg</b>.');
    });

    it('should include title', function()
    {
        var results = getResults('searchable');

        expect(results.length).toEqual(1);
        expect(results[0].id).toEqual(6);
        expect(results[0].title).toEqual('<b>searchable</b> title');
        expect(results[0].body).toEqual('');
    });

    it('should find different sections', function()
    {
        var results = getResults('identical');

        expect(results.length).toEqual(2);

        expect(results[0].id).toEqual(7);
        expect(results[1].id).toEqual(8);
    });

});