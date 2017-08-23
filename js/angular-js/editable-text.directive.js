class EditableText {

    constructor ($element, $timeout, $document, $window)
    {
        this.element = $element;
        this.ngModel = this.element.controller('ngModel');
        this.$timeout = $timeout;
        this.$document = $document;
        this.$window = $window;

        // Bindings
        this.focus = this.focus.bind(this);
        this.blur = this.blur.bind(this);
        this.select = this.select.bind(this);
        this.render = this.render.bind(this);
        this.read = this.read.bind(this);
        this.change = this.change.bind(this);
        this.paste = this.paste.bind(this);
    }

    $onInit ()
    {
        this.element.addClass('editable-text');

        this.element.on('dblclick', this.select);
        this.element.on('blur', this.blur);
        this.element.on('keyup', this.change);
        this.element.on('focus', this.focus);

        // Handle paste separately
        this.element.on('paste', this.paste);

        this.ngModel.$render = this.render;
    }

    render ()
    {
        this.element.text(this.ngModel.$viewValue);
    }

    paste (event)
    {
        event.preventDefault();

        // Get pasted data via clipboard API
        var clipboardData = event.clipboardData || this.$window.clipboardData;
        var pastedText = clipboardData.getData('Text');

        // Insert text manually
        this.$document[0].execCommand("insertHTML", false, pastedText);

        var text = this.element.text();

        this.setValue(text);
    }

    focus ()
    {
        this.ngModel.$setTouched();
    }

    select ()
    {
        this.$timeout(() => {
            this.editable = true;
        this.setEditable();
        this.element[0].focus();
    });
    }

    blur ()
    {
        this.editable = false;
        this.setEditable();

        this.$timeout(this.render);
    }

    change()
    {
        this.$timeout(this.read);
    }

    read ()
    {
        var text = this.element.text();

        // Skip if nothing's been changed
        if (this.ngModel.$viewValue === text ) {

            return;
        }

        this.setValue(text);
    }

    setValue (value)
    {
        this.ngModel.$setDirty();
        this.ngModel.$setViewValue(value);
    }

    setEditable ()
    {
        if (this.editable) {
            this.element.attr('contenteditable', 'true');
        } else {
            this.element.removeAttr('contenteditable');
        }
    }
}

angular.module('komondor.book')

    .directive('editableText', function ()
    {
        return {
            restrict: 'A',
            controller: 'EditableText',
            bindToController: true,
            scope: {
                editable: '=isEditing',
            },
        };
    })

    .controller('EditableText', EditableText);