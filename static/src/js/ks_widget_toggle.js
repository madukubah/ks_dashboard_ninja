odoo.define('ks_dashboard_ninja_list.ks_widget_toggle', function (require) {
    "use strict";

     // var registry = require('web.field_registry');
    // var AbstractField = require('web.AbstractField');
    var Widget = require('web.Widget');

    var core = require('web.core');
    // var field_utils = require('web.field_utils');
    var session = require('web.session');
    var utils = require('web.utils');
    var form_common = require('web.form_common');
    var AbstractField = form_common.AbstractField;
    
    var QWeb = core.qweb;

    var KsWidgetToggle = AbstractField.extend({
        supportedFieldTypes: ['char'],

        events: _.extend({}, AbstractField.prototype.events, {
            'change .ks_toggle_icon_input': 'ks_toggle_icon_input_click',
        }),

        init: function(field_manager, node) {
            this._super(field_manager, node);
            // console.log( "KsWidgetToggle" );
        },
        render_value: function () {
            var self = this;
            self.$el.empty();


            var $view = $(QWeb.render('ks_widget_toggle'));
            if (self.get_value()) {
                $view.find("input[value='" + self.get_value() + "']").prop("checked", true);
            }
            this.$el.append($view)

            if (this.mode === 'readonly') {
                this.$el.find('.ks_select_dashboard_item_toggle').addClass('ks_not_click');
            }
        },

        ks_toggle_icon_input_click: function (e) {
            var self = this;
            self.set_value(e.currentTarget.value);
        }
        
    });
    core.form_widget_registry.add('ks_widget_toggle', KsWidgetToggle);

    return KsWidgetToggle
});