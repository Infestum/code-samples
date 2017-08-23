class BookWhatsNew {

    constructor(book, editable, $scope, Notification, $q, Section)
    {
        this.close = $scope.$close;
        this.$scope = $scope;
        this.book = book;
        this.editable = editable;
        this.Notification = Notification;
        this.$q = $q;
        this.Section = Section;
        this.highlighted = {};
        this.sectionTypes = ['preface', 'chapter', 'appendix'];
        this.highlightedLabel = 'new';

        // Used in edit mode only
        this.changedSections = {};
        this.saved = false;

        // Bindings
        this.fetchHighlighted = this.fetchHighlighted.bind(this);

        // These functions used if editable is true
        this.save = this.save.bind(this);
        this.error = this.error.bind(this);
        this.success = this.success.bind(this);
        this.revertChanges = this.revertChanges.bind(this);
        this.onToggle = this.onToggle.bind(this);
    }

    $onInit()
    {
        this.fetchHighlighted();
        /*
        * In edit mode show ALL sections
        * And in view mode only highlighted
         */

        for (var typeIndex in this.sectionTypes) {
            var type =  this.sectionTypes[typeIndex];

            this[type] = this.sectionFilter(type);
        }

        if (this.editable) {
            this.$scope.$on('book-section:selected', this.onToggle);
            this.$scope.$on('$destroy', this.revertChanges);
        }
    }

    onToggle(event, id, selected)
    {
        event.stopPropagation();

        var section = this.Section.get(id);

        if (this.changedSections[id]) {
            delete this.changedSections[id];
            section.DSRevert();
        } else {
            this.changedSections[id] = true;
            section.highlighted = selected ? this.highlightedLabel : '';
        }
    }

    sectionFilter(type)
    {
        var filter = {
            book_id: this.book.id,
            parent_id: 0,
            type: type,
            sort: ['order'],
        };

        // Filter highlighted parent sections for a view mode
        if (!this.editable) {
            filter.highlighted = this.highlightedLabel;
        }

        return this.Section.filter(filter);
    }

    fetchHighlighted()
    {
        var highlightTypes = angular.copy(this.sectionTypes);

        // Filter children
        highlightTypes.push('section');

        var highlightedSections = this.Section.filter({
            book_id: this.book.id,
            where: {
                type: {
                    in: highlightTypes
                }
            },
            highlighted: this.highlightedLabel
        });

        var section;

        for (var index in highlightedSections) {
            section = highlightedSections[index];

            // Push our highlighted to check checkboxes
            this.highlighted[section.id] = true;
        }
    }

    save()
    {
        var promises = [];

        // Saving book notes
        promises.push(this.book.DSSave({
            cacheResponse: false
        }));

        // Save highlighted sections
        var section;

        for (var id in this.changedSections) {
            section = this.Section.get(id);
            promises.push(section.DSSave());
        }

        this.$q.all(promises).then(this.success, this.error);
    }

    success()
    {
        this.Notification.success('Saved successfully.');
        this.saved = true;
        this.close();
    }

    error()
    {
        this.Notification.error('Failed to save.');
    }

    revertChanges()
    {
        if (this.saved) {
            return;
        }

        this.book.DSRevert();

        var section;

        for (var id in this.changedSections) {
            section = this.Section.get(id);
            section.DSRevert();
        }
    }
}

angular.module('komondor.book')

    .controller('BookWhatsNew', BookWhatsNew);