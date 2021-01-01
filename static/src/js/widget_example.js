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
    var AbstractField = form_common.AbstractField;
    
    var QWeb = core.qweb;

    var KsDashboardTheme = AbstractField.extend({
        supportedFieldTypes: ['char'],

        events: _.extend({}, AbstractField.prototype.events, {
            'click .ks_dashboard_theme_input_container': 'ks_dashboard_theme_input_container_click',
        }),

        init: function(field_manager, node) {
            this._super(field_manager, node);
            console.log( "KsDashboardTheme" );
        },
        
    });
    core.form_widget_registry.add('ks_dashboard_item_theme', KsDashboardTheme);

    return KsDashboardTheme
});