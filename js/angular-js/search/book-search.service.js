class bookSearch {

    constructor (Section)
    {
        this.Section = Section;
    }

    search (keyword, filterBy)
    {
        // Skip if keyword is empty
        if (!keyword) {
            throw new Error('Keyword cannot be empty');
        }

        this.keyword = keyword;
        this.filterBy = filterBy;

        this.setDefaults();
        this.fetchAllSections();

        return this.findMatchingSections();
    }

    setDefaults ()
    {
        this.matches = [];
        this.textCaptureOffsetLength = 100;
        this.maxNumberPerSection = 5;
        this.sectionMatches = {};
        this.highlightTag = 'b';
    }

    fetchAllSections ()
    {
        this.sections = this.Section.filter(this.filterBy);
    }

    getRegex ()
    {
        return new RegExp(this.keyword, 'gi');
    }

    highlightMatch (text)
    {
        var replaceBy = `<${this.highlightTag}>${this.keyword}</${this.highlightTag}>`;

        return text.replace(this.getRegex(), replaceBy);
    }

    searchByField (section, field)
    {
        var isTitle =  field === 'title';
        var text = section[field] || '';

        if (!text) {
            return;
        }

        if (!isTitle) {
            text = text
            // Remove SVG and its contents
                .replace(/<svg.+svg>/gi, '')
                // Remove open tags
                .replace(/(<([^\/>]+)>)/gi, '')
                // Replace close tags with white spaces
                .replace(/(<([^>]+)>)/gi, ' ')
                .trim();
        }

        var regex = this.getRegex();
        var found;

        while ((found = regex.exec(text)) !== null &&
        this.sectionMatches[section.id] < this.maxNumberPerSection) {

            var textFrom = found.index - this.textCaptureOffsetLength;
            var textTo = found.index + this.textCaptureOffsetLength;

            var highlight = this.highlightMatch(text.substring(textFrom, textTo));

            this.matches.push({
                id: section.id,
                type: section.type,
                slug: section.slug,
                title: isTitle ? highlight: section.title,
                body: isTitle ? '': highlight,
                href: section.getHref(this.keyword)
            });

            this.sectionMatches[section.id]++;
        }
    }

    findMatchingSections ()
    {
        for (var key in this.sections) {
            var section = this.sections[key];
            this.sectionMatches[section.id] = 0;

            // So now search would work with titles
            this.searchByField(section, 'title');
            this.searchByField(section, 'html');
        }

        return this.matches;
    }
}

angular.module('komondor.book')

    .service('bookSearch', bookSearch);