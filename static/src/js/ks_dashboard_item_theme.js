odoo.define('ks_dashboard_ninja_list.ks_dashboard_item_theme', function (require) {
    "use strict";

     // var registry = require('web.field_registry');
    // var AbstractField = require('web.AbstractField');
    var Widget = require('web.Widget');

    var core = require('web.core');
    // var field_utils = require('web.field_utils');
    var session = require('web.session');
    var utils = require('web.utils');
    var form_common = require('web.form_common');
    
    var QWeb = core.qweb;

    var KsDashboardTheme = form_common.AbstractField.extend({
        supportedFieldTypes: ['char'],

        events: _.extend({}, form_common.AbstractField.prototype.events, {
            'click .ks_dashboard_theme_input_container': 'ks_dashboard_theme_input_container_click',
        }),

        init: function(field_manager, node) {
            this._super(field_manager, node);
            // console.log( "KsDashboardTheme" );
        },
        render_value: function () {
            var self = this;
            //console.log( self.get_value() );

            self.$el.empty();
            var $view = $(QWeb.render('ks_dashboard_theme_view'));
            if (self.get_value()) {
                $view.find("input[value='" + self.get_value() + "']").prop("checked", true);
            }
            self.$el.append($view)

            if (this.mode === 'readonly') {
                this.$el.find('.ks_dashboard_theme_view_render').addClass('ks_not_click');
            }

        },

        ks_dashboard_theme_input_container_click: function (e) {
            var self = this;
            var $box = $(e.currentTarget).find(':input');
            //console.log( $box[0].value );

            if ($box.is(":checked")) {
                self.$el.find('.ks_dashboard_theme_input').prop('checked', false)
                $box.prop("checked", true);
            } else {
                $box.prop("checked", false);
            }
            self.set_value($box[0].value);
        },
    });
    core.form_widget_registry.add('ks_dashboard_item_theme', KsDashboardTheme);

    return KsDashboardTheme
});